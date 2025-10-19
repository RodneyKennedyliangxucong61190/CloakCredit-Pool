// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, euint128, euint32, euint8, ebool, externalEuint64, externalEuint128} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title PoolController - ETH-based Enterprise Privacy Credit Pool
/// @notice Enterprises deposit ETH as collateral and borrow ETH with encrypted credit limits
/// @dev All sensitive financial data is encrypted using FHE
contract PoolController is SepoliaConfig {

    // ============= State Variables =============

    address public admin;
    address public riskOracle;

    // Enterprise account
    struct EnterpriseAccount {
        euint128 encryptedAssets;      // Encrypted total assets value (in wei)
        euint128 encryptedLiabilities; // Encrypted liabilities
        euint128 encryptedRevenue;     // Encrypted annual revenue
        euint128 encryptedCreditLimit; // Encrypted credit limit
        euint128 encryptedBorrowed;    // Encrypted current borrowed amount
        euint8 encryptedRating;        // Encrypted credit rating (0-100)
        uint256 collateralETH;         // Public ETH collateral deposited
        uint256 publicBorrowed;        // Public borrowed amount (for liquidation)
        uint256 lastUpdate;
        bool isActive;
    }

    mapping(address => EnterpriseAccount) public enterprises;
    address[] public enterpriseList;

    // Pool state
    uint256 public totalPoolETH;
    uint256 public totalBorrowed;
    uint256 public totalCollateral;

    // Interest rate (basis points, e.g., 500 = 5%)
    uint256 public baseInterestRate = 500;

    // ============= Events =============

    event EnterpriseRegistered(address indexed enterprise);
    event CollateralDeposited(address indexed enterprise, uint256 amount);
    event ETHBorrowed(address indexed enterprise, uint256 amount);
    event LoanRepaid(address indexed enterprise, uint256 amount);
    event CreditLimitCalculated(address indexed enterprise);

    // ============= Modifiers =============

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == riskOracle, "Only oracle");
        _;
    }

    modifier onlyActive() {
        require(enterprises[msg.sender].isActive, "Not active");
        _;
    }

    // ============= Constructor =============

    constructor() payable {
        admin = msg.sender;
        totalPoolETH = msg.value;
    }

    // ============= Admin Functions =============

    /// @notice Fund the lending pool with ETH
    function fundPool() external payable onlyAdmin {
        totalPoolETH += msg.value;
    }

    /// @notice Withdraw excess funds
    function withdrawFunds(uint256 amount) external onlyAdmin {
        require(amount <= address(this).balance - totalBorrowed, "Insufficient liquidity");
        (bool success, ) = admin.call{value: amount}("");
        require(success, "Transfer failed");
        totalPoolETH -= amount;
    }

    /// @notice Set risk oracle address
    function setRiskOracle(address _oracle) external onlyAdmin {
        riskOracle = _oracle;
    }

    /// @notice Register a new enterprise
    function registerEnterprise(address enterprise) external onlyAdmin {
        require(!enterprises[enterprise].isActive, "Already registered");

        enterprises[enterprise] = EnterpriseAccount({
            encryptedAssets: FHE.asEuint128(0),
            encryptedLiabilities: FHE.asEuint128(0),
            encryptedRevenue: FHE.asEuint128(0),
            encryptedCreditLimit: FHE.asEuint128(0),
            encryptedBorrowed: FHE.asEuint128(0),
            encryptedRating: FHE.asEuint8(50), // Default 50/100
            collateralETH: 0,
            publicBorrowed: 0,
            lastUpdate: block.timestamp,
            isActive: true
        });

        enterpriseList.push(enterprise);
        emit EnterpriseRegistered(enterprise);
    }

    // ============= Enterprise Functions =============

    /// @notice Deposit ETH as collateral
    function depositCollateral() external payable onlyActive {
        require(msg.value > 0, "Must deposit ETH");

        enterprises[msg.sender].collateralETH += msg.value;
        totalCollateral += msg.value;
        totalPoolETH += msg.value;

        emit CollateralDeposited(msg.sender, msg.value);
    }

    /// @notice Submit encrypted financial data
    function submitFinancialData(
        externalEuint128 encAssets,
        bytes calldata assetsProof,
        externalEuint128 encLiabilities,
        bytes calldata liabilitiesProof,
        externalEuint128 encRevenue,
        bytes calldata revenueProof
    ) external onlyActive {
        EnterpriseAccount storage account = enterprises[msg.sender];

        // Import encrypted values with proof verification
        account.encryptedAssets = FHE.fromExternal(encAssets, assetsProof);
        account.encryptedLiabilities = FHE.fromExternal(encLiabilities, liabilitiesProof);
        account.encryptedRevenue = FHE.fromExternal(encRevenue, revenueProof);
        account.lastUpdate = block.timestamp;

        // Grant access permissions
        FHE.allowThis(account.encryptedAssets);
        FHE.allowThis(account.encryptedLiabilities);
        FHE.allowThis(account.encryptedRevenue);
    }

    /// @notice Calculate credit limit based on encrypted financials (Oracle only)
    function calculateCreditLimit(address enterprise) external onlyOracle {
        EnterpriseAccount storage account = enterprises[enterprise];
        require(account.isActive, "Not active");

        // Calculate encrypted net worth = assets - liabilities
        euint128 netWorth = FHE.sub(account.encryptedAssets, account.encryptedLiabilities);

        // Check solvency: assets > liabilities
        ebool isSolvent = FHE.gt(account.encryptedAssets, account.encryptedLiabilities);

        // Credit limit formula:
        // If solvent: min(collateral * 3, revenue * 2)
        // If insolvent: 0

        uint256 collateralBased = account.collateralETH * 3;
        euint128 revenueBased = FHE.mul(account.encryptedRevenue, FHE.asEuint128(2));

        // Use minimum of collateral-based and revenue-based limits
        euint128 potentialLimit = FHE.min(
            FHE.asEuint128(collateralBased),
            revenueBased
        );

        // Apply solvency check
        account.encryptedCreditLimit = FHE.select(
            isSolvent,
            potentialLimit,
            FHE.asEuint128(0)
        );

        FHE.allowThis(account.encryptedCreditLimit);
        FHE.allow(account.encryptedCreditLimit, enterprise);

        emit CreditLimitCalculated(enterprise);
    }

    /// @notice Borrow ETH (amount is encrypted on client-side)
    function borrow(uint256 amount) external onlyActive {
        require(amount > 0, "Amount must be > 0");
        EnterpriseAccount storage account = enterprises[msg.sender];

        // Get decrypted credit limit for this user
        uint256 creditLimit = FHE.decrypt(account.encryptedCreditLimit);
        uint256 currentBorrowed = account.publicBorrowed;

        require(currentBorrowed + amount <= creditLimit, "Exceeds credit limit");
        require(amount <= getAvailableLiquidity(), "Insufficient pool liquidity");

        // Update state
        account.publicBorrowed += amount;
        account.encryptedBorrowed = FHE.add(
            account.encryptedBorrowed,
            FHE.asEuint128(amount)
        );
        totalBorrowed += amount;

        // Transfer ETH to borrower
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        FHE.allowThis(account.encryptedBorrowed);
        FHE.allow(account.encryptedBorrowed, msg.sender);

        emit ETHBorrowed(msg.sender, amount);
    }

    /// @notice Repay loan with ETH
    function repay() external payable onlyActive {
        require(msg.value > 0, "Must send ETH");
        EnterpriseAccount storage account = enterprises[msg.sender];

        uint256 repayAmount = msg.value;
        require(repayAmount <= account.publicBorrowed, "Repay exceeds debt");

        // Update state
        account.publicBorrowed -= repayAmount;
        account.encryptedBorrowed = FHE.sub(
            account.encryptedBorrowed,
            FHE.asEuint128(repayAmount)
        );
        totalBorrowed -= repayAmount;
        totalPoolETH += repayAmount;

        FHE.allowThis(account.encryptedBorrowed);

        emit LoanRepaid(msg.sender, repayAmount);
    }

    /// @notice Withdraw collateral (only if no outstanding loans)
    function withdrawCollateral(uint256 amount) external onlyActive {
        EnterpriseAccount storage account = enterprises[msg.sender];
        require(account.publicBorrowed == 0, "Must repay loans first");
        require(amount <= account.collateralETH, "Insufficient collateral");

        account.collateralETH -= amount;
        totalCollateral -= amount;
        totalPoolETH -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // ============= View Functions =============

    /// @notice Get pool statistics
    function getPoolStats() external view returns (
        uint256 totalETH,
        uint256 borrowed,
        uint256 available,
        uint256 utilization
    ) {
        uint256 avail = getAvailableLiquidity();
        uint256 util = totalPoolETH > 0 ? (totalBorrowed * 100) / totalPoolETH : 0;

        return (totalPoolETH, totalBorrowed, avail, util);
    }

    /// @notice Get available liquidity for borrowing
    function getAvailableLiquidity() public view returns (uint256) {
        uint256 balance = address(this).balance;
        return balance > totalBorrowed ? balance - totalBorrowed : 0;
    }

    /// @notice Get enterprise public data
    function getEnterprisePublicData(address enterprise) external view returns (
        uint256 collateral,
        uint256 borrowed,
        bool active
    ) {
        EnterpriseAccount storage account = enterprises[enterprise];
        return (
            account.collateralETH,
            account.publicBorrowed,
            account.isActive
        );
    }

    /// @notice Get user's available credit (decrypted)
    function getMyAvailableCredit() external view onlyActive returns (uint256) {
        EnterpriseAccount storage account = enterprises[msg.sender];
        uint256 limit = FHE.decrypt(account.encryptedCreditLimit);
        uint256 borrowed = account.publicBorrowed;
        return limit > borrowed ? limit - borrowed : 0;
    }

    /// @notice Get user's encrypted data handles
    function getMyEncryptedData() external view onlyActive returns (
        euint128 assets,
        euint128 liabilities,
        euint128 revenue,
        euint128 creditLimit,
        euint128 borrowed
    ) {
        EnterpriseAccount storage account = enterprises[msg.sender];
        return (
            account.encryptedAssets,
            account.encryptedLiabilities,
            account.encryptedRevenue,
            account.encryptedCreditLimit,
            account.encryptedBorrowed
        );
    }

    /// @notice Get health factor (collateral / borrowed)
    function getHealthFactor(address enterprise) external view returns (uint256) {
        EnterpriseAccount storage account = enterprises[enterprise];
        if (account.publicBorrowed == 0) return type(uint256).max;
        return (account.collateralETH * 100) / account.publicBorrowed;
    }

    /// @notice Get total number of enterprises
    function getEnterpriseCount() external view returns (uint256) {
        return enterpriseList.length;
    }

    // ============= Receive ETH =============

    receive() external payable {
        totalPoolETH += msg.value;
    }
}
