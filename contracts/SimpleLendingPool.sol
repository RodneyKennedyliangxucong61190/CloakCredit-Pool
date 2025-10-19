// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SimpleLendingPool - ETH Lending and Borrowing Pool
/// @notice Users can deposit ETH and borrow against their deposits
contract SimpleLendingPool {

    // ============= State Variables =============

    address public admin;

    struct UserAccount {
        uint256 deposited;      // Total ETH deposited
        uint256 borrowed;       // Current borrowed amount
        uint256 lastUpdate;     // Last interaction timestamp
    }

    mapping(address => UserAccount) public accounts;
    address[] public userList;

    // Pool statistics
    uint256 public totalDeposits;
    uint256 public totalBorrowed;

    // Interest rate (basis points, e.g., 500 = 5%)
    uint256 public interestRate = 500;

    // Collateral ratio (150% = need 1.5 ETH deposited to borrow 1 ETH)
    uint256 public collateralRatio = 150;

    // ============= Events =============

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);

    // ============= Modifiers =============

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // ============= Constructor =============

    constructor() {
        admin = msg.sender;
    }

    // ============= Core Functions =============

    /// @notice Deposit ETH into the pool
    function deposit() external payable {
        require(msg.value > 0, "Must deposit ETH");

        UserAccount storage account = accounts[msg.sender];

        if (account.lastUpdate == 0) {
            userList.push(msg.sender);
        }

        account.deposited += msg.value;
        account.lastUpdate = block.timestamp;
        totalDeposits += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Withdraw deposited ETH
    /// @param amount Amount to withdraw in wei
    function withdraw(uint256 amount) external {
        UserAccount storage account = accounts[msg.sender];
        require(amount > 0, "Invalid amount");
        require(account.deposited >= amount, "Insufficient deposit");

        // Check if user has enough collateral after withdrawal
        uint256 remainingDeposit = account.deposited - amount;
        uint256 requiredCollateral = (account.borrowed * collateralRatio) / 100;
        require(remainingDeposit >= requiredCollateral, "Would be undercollateralized");

        account.deposited -= amount;
        account.lastUpdate = block.timestamp;
        totalDeposits -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Borrow ETH against deposited collateral
    /// @param amount Amount to borrow in wei
    function borrow(uint256 amount) external {
        UserAccount storage account = accounts[msg.sender];
        require(amount > 0, "Invalid amount");
        require(address(this).balance >= amount, "Insufficient pool liquidity");

        // Calculate maximum borrowable amount
        uint256 maxBorrow = (account.deposited * 100) / collateralRatio;
        require(account.borrowed + amount <= maxBorrow, "Exceeds credit limit");

        account.borrowed += amount;
        account.lastUpdate = block.timestamp;
        totalBorrowed += amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Borrowed(msg.sender, amount);
    }

    /// @notice Repay borrowed ETH
    function repay() external payable {
        UserAccount storage account = accounts[msg.sender];
        require(msg.value > 0, "Must repay ETH");
        require(account.borrowed > 0, "No debt to repay");

        uint256 repayAmount = msg.value > account.borrowed ? account.borrowed : msg.value;
        account.borrowed -= repayAmount;
        account.lastUpdate = block.timestamp;
        totalBorrowed -= repayAmount;

        // Refund excess payment
        if (msg.value > repayAmount) {
            (bool success, ) = msg.sender.call{value: msg.value - repayAmount}("");
            require(success, "ETH refund failed");
        }

        emit Repaid(msg.sender, repayAmount);
    }

    // ============= View Functions =============

    /// @notice Get user's account details
    function getAccount(address user) external view returns (
        uint256 deposited,
        uint256 borrowed,
        uint256 availableToBorrow,
        uint256 healthFactor
    ) {
        UserAccount storage account = accounts[user];
        deposited = account.deposited;
        borrowed = account.borrowed;

        // Calculate available borrow amount
        uint256 maxBorrow = (account.deposited * 100) / collateralRatio;
        availableToBorrow = maxBorrow > account.borrowed ? maxBorrow - account.borrowed : 0;

        // Calculate health factor (collateral / borrowed * 100)
        if (account.borrowed > 0) {
            healthFactor = (account.deposited * 100) / account.borrowed;
        } else {
            healthFactor = type(uint256).max;
        }

        return (deposited, borrowed, availableToBorrow, healthFactor);
    }

    /// @notice Get pool statistics
    function getPoolStats() external view returns (
        uint256 totalValueLocked,
        uint256 totalBorrowedAmount,
        uint256 availableLiquidity,
        uint256 utilizationRate
    ) {
        totalValueLocked = totalDeposits;
        totalBorrowedAmount = totalBorrowed;
        availableLiquidity = address(this).balance;

        if (totalDeposits > 0) {
            utilizationRate = (totalBorrowed * 100) / totalDeposits;
        } else {
            utilizationRate = 0;
        }

        return (totalValueLocked, totalBorrowedAmount, availableLiquidity, utilizationRate);
    }

    /// @notice Get total number of users
    function getUserCount() external view returns (uint256) {
        return userList.length;
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

    /// @notice Emergency withdrawal for admin
    function emergencyWithdraw(uint256 amount) external onlyAdmin {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = admin.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // ============= Fallback =============

    receive() external payable {
        totalDeposits += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
}
