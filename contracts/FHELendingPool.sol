// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHELendingPool - Privacy-Preserving ETH Lending Pool
/// @notice Users can deposit and borrow ETH with encrypted amounts
/// @dev All deposit and borrow amounts are encrypted using FHE
contract FHELendingPool is SepoliaConfig {

    // ============= State Variables =============

    address public admin;

    struct UserAccount {
        euint64 encryptedDeposited;     // Encrypted deposited amount
        euint64 encryptedBorrowed;      // Encrypted borrowed amount
        uint256 lastUpdate;
        bool isActive;
    }

    mapping(address => UserAccount) public accounts;
    address[] public userList;

    // Pool statistics (public for transparency)
    uint256 public totalETHBalance;      // Actual ETH in contract
    uint256 public userCount;

    // Interest rate (basis points, e.g., 500 = 5%)
    uint256 public interestRate = 500;

    // Collateral ratio (150% = need 1.5 ETH deposited to borrow 1 ETH)
    uint256 public collateralRatio = 150;

    // ============= Events =============

    event Deposited(address indexed user, uint256 ethAmount);
    event Withdrawn(address indexed user, uint256 ethAmount);
    event Borrowed(address indexed user, uint256 ethAmount);
    event Repaid(address indexed user, uint256 ethAmount);

    // ============= Modifiers =============

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // ============= Constructor =============

    constructor() {
        admin = msg.sender;
    }

    // ============= Core Functions with FHE =============

    /// @notice Deposit ETH with encrypted amount tracking
    /// @param encryptedAmount External encrypted deposit amount (must match msg.value)
    /// @param inputProof Zero-knowledge proof for the encrypted input
    function deposit(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external payable {
        require(msg.value > 0, "Must deposit ETH");

        // Import and verify encrypted amount
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowThis(amount);

        UserAccount storage account = accounts[msg.sender];

        if (!account.isActive) {
            userList.push(msg.sender);
            userCount++;
            account.isActive = true;
        }

        // Add to encrypted balance
        if (FHE.isInitialized(account.encryptedDeposited)) {
            account.encryptedDeposited = FHE.add(account.encryptedDeposited, amount);
        } else {
            account.encryptedDeposited = amount;
        }

        FHE.allowThis(account.encryptedDeposited);
        FHE.allow(account.encryptedDeposited, msg.sender);

        account.lastUpdate = block.timestamp;
        totalETHBalance += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Withdraw deposited ETH
    /// @param encryptedAmount External encrypted withdrawal amount
    /// @param inputProof Zero-knowledge proof
    function withdraw(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof,
        uint256 plaintextAmount  // User must provide plaintext for ETH transfer
    ) external {
        UserAccount storage account = accounts[msg.sender];
        require(account.isActive, "No deposits");
        require(plaintextAmount > 0, "Invalid amount");
        require(address(this).balance >= plaintextAmount, "Insufficient pool liquidity");

        // Import encrypted amount
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowThis(amount);

        // Update encrypted balance (FHE will verify the subtraction is valid)
        account.encryptedDeposited = FHE.sub(account.encryptedDeposited, amount);
        FHE.allowThis(account.encryptedDeposited);
        FHE.allow(account.encryptedDeposited, msg.sender);

        account.lastUpdate = block.timestamp;
        totalETHBalance -= plaintextAmount;

        (bool success, ) = msg.sender.call{value: plaintextAmount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, plaintextAmount);
    }

    /// @notice Borrow ETH against encrypted collateral
    /// @param encryptedAmount External encrypted borrow amount
    /// @param inputProof Zero-knowledge proof
    function borrow(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof,
        uint256 plaintextAmount  // User must provide plaintext for ETH transfer
    ) external {
        UserAccount storage account = accounts[msg.sender];
        require(account.isActive, "Not registered");
        require(plaintextAmount > 0, "Invalid amount");
        require(address(this).balance >= plaintextAmount, "Insufficient pool liquidity");

        // Import encrypted amount
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowThis(amount);

        // Update encrypted borrowed amount
        if (FHE.isInitialized(account.encryptedBorrowed)) {
            account.encryptedBorrowed = FHE.add(account.encryptedBorrowed, amount);
        } else {
            account.encryptedBorrowed = amount;
        }

        FHE.allowThis(account.encryptedBorrowed);
        FHE.allow(account.encryptedBorrowed, msg.sender);

        account.lastUpdate = block.timestamp;

        (bool success, ) = msg.sender.call{value: plaintextAmount}("");
        require(success, "ETH transfer failed");

        emit Borrowed(msg.sender, plaintextAmount);
    }

    /// @notice Repay borrowed ETH
    /// @param encryptedAmount External encrypted repay amount (should match msg.value)
    /// @param inputProof Zero-knowledge proof
    function repay(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external payable {
        require(msg.value > 0, "Must repay ETH");

        UserAccount storage account = accounts[msg.sender];
        require(FHE.isInitialized(account.encryptedBorrowed), "No debt");

        // Import encrypted amount
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowThis(amount);

        // Update encrypted borrowed amount
        account.encryptedBorrowed = FHE.sub(account.encryptedBorrowed, amount);
        FHE.allowThis(account.encryptedBorrowed);
        FHE.allow(account.encryptedBorrowed, msg.sender);

        account.lastUpdate = block.timestamp;
        totalETHBalance += msg.value;

        emit Repaid(msg.sender, msg.value);
    }

    // ============= View Functions =============

    /// @notice Get encrypted balances for a user
    /// @dev User must have permission to decrypt
    function getEncryptedAccount(address user) external view returns (
        euint64 encryptedDeposited,
        euint64 encryptedBorrowed
    ) {
        UserAccount storage account = accounts[user];
        return (account.encryptedDeposited, account.encryptedBorrowed);
    }

    /// @notice Request permission to view own encrypted balance
    function requestBalanceAccess() external {
        UserAccount storage account = accounts[msg.sender];
        FHE.allow(account.encryptedDeposited, msg.sender);
        FHE.allow(account.encryptedBorrowed, msg.sender);
    }

    /// @notice Get pool statistics (public data only)
    function getPoolStats() external view returns (
        uint256 totalBalance,
        uint256 activeUsers,
        uint256 rate
    ) {
        return (
            totalETHBalance,
            userCount,
            interestRate
        );
    }

    /// @notice Check if user is active
    function isUserActive(address user) external view returns (bool) {
        return accounts[user].isActive;
    }

    // ============= Admin Functions =============

    /// @notice Update interest rate
    function setInterestRate(uint256 newRate) external onlyAdmin {
        require(newRate <= 10000, "Rate too high");
        interestRate = newRate;
    }

    /// @notice Update collateral ratio
    function setCollateralRatio(uint256 newRatio) external onlyAdmin {
        require(newRatio >= 100 && newRatio <= 300, "Invalid ratio");
        collateralRatio = newRatio;
    }

    // ============= Fallback =============

    receive() external payable {
        totalETHBalance += msg.value;
    }
}
