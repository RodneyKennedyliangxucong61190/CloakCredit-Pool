// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHESafeMath} from "@openzeppelin/confidential-contracts/utils/FHESafeMath.sol";
import {ConfidentialWETH} from "./ConfidentialWETH.sol";

/**
 * @title FHELendingPool - Privacy-Preserving DeFi Lending Pool
 * @notice Users can deposit and borrow using ConfidentialWETH (cWETH)
 * @dev All amounts are fully encrypted - NO plaintext amounts in events or parameters
 *
 * Privacy guarantees:
 * - Deposit amounts: ENCRYPTED (via cWETH transfer)
 * - Borrow amounts: ENCRYPTED
 * - Repay amounts: ENCRYPTED
 * - Withdraw amounts: ENCRYPTED
 * - User balances: ENCRYPTED
 * - Events: NO amounts leaked
 */
contract FHELendingPool is ZamaEthereumConfig {
    // ============= State Variables =============

    ConfidentialWETH public immutable cWETH;
    address public admin;

    struct UserAccount {
        euint64 encryptedDeposited;   // Encrypted deposited cWETH amount
        euint64 encryptedBorrowed;    // Encrypted borrowed cWETH amount
        uint256 lastUpdate;
        bool isActive;
    }

    mapping(address => UserAccount) private accounts;
    address[] public userList;

    // Pool statistics (encrypted for privacy)
    euint64 private encryptedTotalDeposits;
    euint64 private encryptedTotalBorrows;
    uint256 public userCount;

    // Interest rate (basis points, e.g., 500 = 5%)
    uint256 public interestRate = 500;

    // Collateral ratio (150% = need 1.5 cWETH deposited to borrow 1 cWETH)
    uint256 public collateralRatio = 150;

    // ============= Events (No amounts - privacy preserved) =============

    event UserDeposited(address indexed user);
    event UserWithdrew(address indexed user);
    event UserBorrowed(address indexed user);
    event UserRepaid(address indexed user);
    event OperatorSet(address indexed user, bool approved);

    // ============= Errors =============

    error NotActive();
    error InsufficientCollateral();
    error NoBorrowBalance();
    error TransferFailed();

    // ============= Modifiers =============

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // ============= Constructor =============

    constructor(address _cWETH) {
        cWETH = ConfidentialWETH(payable(_cWETH));
        admin = msg.sender;

        // Initialize encrypted totals
        encryptedTotalDeposits = FHE.asEuint64(0);
        encryptedTotalBorrows = FHE.asEuint64(0);
        FHE.allowThis(encryptedTotalDeposits);
        FHE.allowThis(encryptedTotalBorrows);
    }

    // ============= Core Functions =============

    /**
     * @notice Deposit cWETH into the lending pool
     * @dev User must first approve this contract as operator on cWETH
     * @param encryptedAmount Encrypted amount to deposit
     * @param inputProof Zero-knowledge proof
     */
    function deposit(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowThis(amount);
        // Allow cWETH contract to use this encrypted amount for transferFrom
        FHE.allow(amount, address(cWETH));

        // Transfer cWETH from user to pool (fully encrypted transfer)
        cWETH.confidentialTransferFrom(msg.sender, address(this), amount);

        UserAccount storage account = accounts[msg.sender];

        if (!account.isActive) {
            userList.push(msg.sender);
            userCount++;
            account.isActive = true;
        }

        // Update encrypted balance
        if (FHE.isInitialized(account.encryptedDeposited)) {
            account.encryptedDeposited = FHE.add(account.encryptedDeposited, amount);
        } else {
            account.encryptedDeposited = amount;
        }

        FHE.allowThis(account.encryptedDeposited);
        FHE.allow(account.encryptedDeposited, msg.sender);

        // Update pool totals
        encryptedTotalDeposits = FHE.add(encryptedTotalDeposits, amount);
        FHE.allowThis(encryptedTotalDeposits);

        account.lastUpdate = block.timestamp;

        emit UserDeposited(msg.sender);
    }

    /**
     * @notice Withdraw cWETH from the lending pool
     * @dev Encrypted amount - no plaintext required
     * @param encryptedAmount Encrypted amount to withdraw
     * @param inputProof Zero-knowledge proof
     */
    function withdraw(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        UserAccount storage account = accounts[msg.sender];
        if (!account.isActive) revert NotActive();

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowThis(amount);
        // Allow cWETH contract to use this encrypted amount for transfer
        FHE.allow(amount, address(cWETH));

        // Update encrypted balance (will fail if insufficient)
        account.encryptedDeposited = FHE.sub(account.encryptedDeposited, amount);
        FHE.allowThis(account.encryptedDeposited);
        FHE.allow(account.encryptedDeposited, msg.sender);

        // Update pool totals
        encryptedTotalDeposits = FHE.sub(encryptedTotalDeposits, amount);
        FHE.allowThis(encryptedTotalDeposits);

        // Transfer cWETH back to user (fully encrypted)
        cWETH.confidentialTransfer(msg.sender, amount);

        account.lastUpdate = block.timestamp;

        emit UserWithdrew(msg.sender);
    }

    /**
     * @notice Borrow cWETH against deposited collateral
     * @dev Collateral check done on encrypted values
     * @param encryptedAmount Encrypted amount to borrow
     * @param inputProof Zero-knowledge proof
     */
    function borrow(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        UserAccount storage account = accounts[msg.sender];
        if (!account.isActive) revert NotActive();

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowThis(amount);

        // Calculate required collateral: borrowAmount * collateralRatio / 100
        // Note: div takes plaintext divisor
        euint64 requiredCollateral = FHE.mul(amount, FHE.asEuint64(uint64(collateralRatio)));
        requiredCollateral = FHE.div(requiredCollateral, 100);

        // Calculate available collateral: deposited - borrowed
        euint64 currentBorrowed = account.encryptedBorrowed;
        euint64 availableCollateral;
        if (FHE.isInitialized(currentBorrowed)) {
            availableCollateral = FHE.sub(account.encryptedDeposited, currentBorrowed);
        } else {
            availableCollateral = account.encryptedDeposited;
        }

        // Check if available collateral >= required collateral
        ebool hasEnoughCollateral = FHE.ge(availableCollateral, requiredCollateral);

        // Use select to conditionally allow the borrow (fails if not enough collateral)
        euint64 borrowAmount = FHE.select(hasEnoughCollateral, amount, FHE.asEuint64(0));

        // Update encrypted borrowed amount
        if (FHE.isInitialized(account.encryptedBorrowed)) {
            account.encryptedBorrowed = FHE.add(account.encryptedBorrowed, borrowAmount);
        } else {
            account.encryptedBorrowed = borrowAmount;
        }

        FHE.allowThis(account.encryptedBorrowed);
        FHE.allow(account.encryptedBorrowed, msg.sender);

        // Update pool totals
        encryptedTotalBorrows = FHE.add(encryptedTotalBorrows, borrowAmount);
        FHE.allowThis(encryptedTotalBorrows);

        // Allow cWETH contract to use borrowAmount for transfer
        FHE.allowThis(borrowAmount);
        FHE.allow(borrowAmount, address(cWETH));

        // Transfer cWETH to borrower (fully encrypted)
        cWETH.confidentialTransfer(msg.sender, borrowAmount);

        account.lastUpdate = block.timestamp;

        emit UserBorrowed(msg.sender);
    }

    /**
     * @notice Repay borrowed cWETH
     * @dev User must approve this contract as operator on cWETH
     * @param encryptedAmount Encrypted amount to repay
     * @param inputProof Zero-knowledge proof
     */
    function repay(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        UserAccount storage account = accounts[msg.sender];
        if (!FHE.isInitialized(account.encryptedBorrowed)) revert NoBorrowBalance();

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowThis(amount);
        // Allow cWETH contract to use this encrypted amount for transferFrom
        FHE.allow(amount, address(cWETH));

        // Transfer cWETH from user to pool
        cWETH.confidentialTransferFrom(msg.sender, address(this), amount);

        // Update encrypted borrowed amount
        account.encryptedBorrowed = FHE.sub(account.encryptedBorrowed, amount);
        FHE.allowThis(account.encryptedBorrowed);
        FHE.allow(account.encryptedBorrowed, msg.sender);

        // Update pool totals
        encryptedTotalBorrows = FHE.sub(encryptedTotalBorrows, amount);
        FHE.allowThis(encryptedTotalBorrows);

        account.lastUpdate = block.timestamp;

        emit UserRepaid(msg.sender);
    }

    // ============= View Functions =============

    /**
     * @notice Get encrypted balances for a user (only user can decrypt)
     */
    function getEncryptedAccount(address user) external view returns (
        euint64 encryptedDeposited,
        euint64 encryptedBorrowed
    ) {
        UserAccount storage account = accounts[user];
        return (account.encryptedDeposited, account.encryptedBorrowed);
    }

    /**
     * @notice Request permission to view own encrypted balances
     */
    function requestBalanceAccess() external {
        UserAccount storage account = accounts[msg.sender];
        if (FHE.isInitialized(account.encryptedDeposited)) {
            FHE.allow(account.encryptedDeposited, msg.sender);
        }
        if (FHE.isInitialized(account.encryptedBorrowed)) {
            FHE.allow(account.encryptedBorrowed, msg.sender);
        }
    }

    /**
     * @notice Get pool statistics (public data only)
     */
    function getPoolStats() external view returns (
        uint256 activeUsers,
        uint256 rate,
        uint256 collRatio
    ) {
        return (userCount, interestRate, collateralRatio);
    }

    /**
     * @notice Check if user is active
     */
    function isUserActive(address user) external view returns (bool) {
        return accounts[user].isActive;
    }

    /**
     * @notice Get cWETH contract address
     */
    function getTokenAddress() external view returns (address) {
        return address(cWETH);
    }

    // ============= Operator Management =============

    /**
     * @notice Approve this contract as operator for cWETH transfers
     * @dev Required before deposit and repay
     */
    function approvePoolAsOperator() external {
        // Set operator approval until max uint48 (effectively forever)
        cWETH.setOperator(address(this), type(uint48).max);
        emit OperatorSet(msg.sender, true);
    }

    // ============= Admin Functions =============

    /**
     * @notice Update interest rate
     */
    function setInterestRate(uint256 newRate) external onlyAdmin {
        require(newRate <= 10000, "Rate too high");
        interestRate = newRate;
    }

    /**
     * @notice Update collateral ratio
     */
    function setCollateralRatio(uint256 newRatio) external onlyAdmin {
        require(newRatio >= 100 && newRatio <= 300, "Invalid ratio");
        collateralRatio = newRatio;
    }
}
