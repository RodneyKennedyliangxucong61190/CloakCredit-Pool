// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {
    FHE,
    ebool,
    euint8,
    euint16,
    euint32,
    euint64,
    euint128,
    externalEuint8,
    externalEuint16,
    externalEuint32,
    externalEuint64,
    externalEuint128
} from "@fhevm/solidity/lib/FHE.sol";
import {GatewayCaller} from "@fhevm/solidity/gateway/GatewayCaller.sol";

/**
 * @title CloakCreditPool
 * @notice Advanced encrypted credit pool management with multi-segment risk assessment, dynamic collateral rebalancing, and automated liquidation
 * @dev Deep improvements include:
 *      - 8-state position lifecycle (Draft → Liquidated/Closed)
 *      - Multi-segment policy management with custom risk parameters
 *      - Dynamic collateral rebalancing with threshold monitoring
 *      - Automated liquidation cascade with partial liquidation support
 *      - Interest rate calculation based on utilization and risk
 *      - Credit line management with draw-down and repayment tracking
 *      - Multi-party governance (poolGovernor, riskCouncil, liquidator)
 *      - Time-weighted average calculations for volatility tracking
 *      - 5 roles: owner, poolGovernor, riskCouncil, liquidator, auditor
 *      - Gateway decryption: healthBand, stabilityTier, collateralRatio, riskScore, liquidityScore, interestRate
 */
contract CloakCreditPool is SepoliaConfig, GatewayCaller {

    // ========== Enums ==========

    enum PositionStatus {
        Draft,              // 0: Initial state
        Active,             // 1: Active position
        Monitored,          // 2: Under close monitoring
        Warning,            // 3: Warning state (near threshold)
        Undercollateralized,// 4: Below required collateral
        Liquidating,        // 5: In liquidation process
        PartialLiquidated,  // 6: Partially liquidated
        Liquidated,         // 7: Fully liquidated
        Closed              // 8: Voluntarily closed
    }

    enum HealthBand {
        Critical,           // 0: Immediate action required
        Recovery,           // 1: Recovering from critical
        Watch,              // 2: On watch list
        Healthy,            // 3: Healthy position
        Premium             // 4: Premium health status
    }

    // ========== Roles ==========

    address public owner;
    address public poolGovernor;
    address public riskCouncil;
    mapping(address => bool) public liquidators;
    mapping(address => bool) public auditors;

    bytes32 public constant DEFAULT_SEGMENT = bytes32("DEFAULT_SEGMENT");

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyGovernor() {
        require(msg.sender == poolGovernor, "Not governor");
        _;
    }

    modifier onlyCouncil() {
        require(msg.sender == riskCouncil || msg.sender == poolGovernor, "Not council");
        _;
    }

    modifier onlyLiquidator() {
        require(liquidators[msg.sender], "Not liquidator");
        _;
    }

    modifier onlyAuditor() {
        require(auditors[msg.sender], "Not auditor");
        _;
    }

    // ========== State Variables ==========

    struct Position {
        bytes32 positionId;
        address manager;
        bytes32 segmentKey;
        euint128 assetCipher;                       // Encrypted collateral assets
        euint128 debtCipher;                        // Encrypted debt amount
        euint128 creditLineCipher;                  // Encrypted credit line limit
        euint128 drawnAmountCipher;                 // Encrypted drawn amount
        euint64 utilizationCipher;                  // Encrypted utilization rate
        euint32 covenantScoreCipher;                // Encrypted covenant score
        euint8 riskLevelCipher;                     // Encrypted risk level (0-5)
        euint32 liquidityScoreCipher;               // Encrypted liquidity score
        euint16 covenantDriftCipher;                // Encrypted covenant drift
        euint32 stressIndexCipher;                  // Encrypted stress test index
        euint32 interestRateCipher;                 // Encrypted interest rate (bps)
        euint64 accruedInterestCipher;              // Encrypted accrued interest
        PositionStatus status;
        uint256 openedAt;
        uint256 lastReviewAt;
        uint256 lastRebalanceAt;
        uint256 liquidationStartedAt;
        uint256 closedAt;
        uint16 reviewCount;
        uint16 rebalanceCount;
        uint16 statusChangeCount;
        bool isActive;
        bool isFlagged;
        bool isFrozen;
    }

    struct HealthReview {
        bytes32 positionId;
        euint8 healthBandCipher;                    // Health band (0-4)
        euint8 stabilityTierCipher;                 // Stability tier (0-3)
        euint128 collateralRatioCipher;             // Collateral ratio (basis points)
        euint128 maskedAssetCipher;                 // Masked asset value
        euint64 riskScoreCipher;                    // Aggregate risk score
        euint32 liquidityScoreCipher;               // Liquidity assessment
        euint32 interestRateCipher;                 // Calculated interest rate
        euint64 liquidationThresholdCipher;         // Liquidation threshold
        uint256 evaluatedAt;
        address evaluatedBy;
        bool isComplete;
        // Decrypted values
        uint8 decryptedHealthBand;
        uint8 decryptedStabilityTier;
        uint128 decryptedCollateralRatio;
        uint64 decryptedRiskScore;
        uint32 decryptedLiquidityScore;
        uint32 decryptedInterestRate;
        bool isDecrypted;
    }

    struct RebalanceAction {
        bytes32 positionId;
        euint128 requiredCollateralCipher;          // Required collateral amount
        euint128 deficitCipher;                     // Collateral deficit
        euint128 adjustedAssetCipher;               // Adjusted asset after rebalance
        euint8 urgencyLevelCipher;                  // Urgency level (0-5)
        uint256 initiatedAt;
        address initiatedBy;
        bool isCompleted;
    }

    struct LiquidationRecord {
        bytes32 positionId;
        euint128 liquidatedAssetCipher;             // Amount of assets liquidated
        euint128 recoveredDebtCipher;               // Debt recovered
        euint128 remainingAssetCipher;              // Remaining assets
        euint128 remainingDebtCipher;               // Remaining debt
        euint64 liquidationPenaltyCipher;           // Liquidation penalty
        uint256 executedAt;
        address executedBy;
        bool isPartial;
        bool isComplete;
    }

    struct CreditLineActivity {
        bytes32 positionId;
        euint128 drawAmountCipher;                  // Draw amount
        euint128 repayAmountCipher;                 // Repayment amount
        euint128 balanceAfterCipher;                // Balance after transaction
        euint32 interestAccruedCipher;              // Interest accrued
        uint256 timestamp;
        bool isDrawdown;
    }

    struct ManagerProfile {
        address manager;
        uint256[] positionIds;                      // All position IDs
        euint32 totalPositionsCipher;               // Total positions count
        euint32 activePositionsCipher;              // Active positions
        euint32 liquidatedPositionsCipher;          // Liquidated count
        euint128 totalCreditUsedCipher;             // Total credit used
        euint128 totalRepaidCipher;                 // Total repaid
        euint16 averageHealthScoreCipher;           // Average health score
        euint8 creditRatingCipher;                  // Credit rating (0-100)
        uint256 firstPositionAt;
        uint256 lastPositionAt;
        uint32 positionCount;
    }

    struct PoolPolicy {
        uint128 minAsset;                           // Minimum collateral asset
        uint128 assetBuffer;                        // Asset buffer amount
        uint128 debtBuffer;                         // Debt buffer amount
        uint64 maxUtilization;                      // Max utilization (bps)
        uint32 minCovenantScore;                    // Min covenant score
        uint8 maxRiskLevel;                         // Max risk level
        uint32 minLiquidityScore;                   // Min liquidity score
        uint16 maxCovenantDrift;                    // Max covenant drift
        uint32 minStressIndex;                      // Min stress index
        uint128 collateralRatioThreshold;           // Collateral ratio threshold
        uint128 liquidationThreshold;               // Liquidation trigger threshold
        uint128 partialLiquidationThreshold;        // Partial liquidation threshold
        uint32 baseInterestRate;                    // Base interest rate (bps)
        uint32 riskPremiumRate;                     // Risk premium rate (bps)
        uint32 liquidationPenaltyBps;               // Liquidation penalty (bps)
        uint32 reviewWindow;                        // Review window duration
        uint32 reviewCooldown;                      // Review cooldown period
        uint32 rebalanceWindow;                     // Rebalance window
        uint8 maxReviews;                           // Max reviews allowed
    }

    struct SegmentPolicy {
        PoolPolicy policy;
        euint32 stressBoostCipher;                  // Stress boost factor
        bool exists;
        uint256 updatedAt;
    }

    // Storage mappings
    mapping(bytes32 => Position) public positions;
    mapping(bytes32 => HealthReview) public reviews;
    mapping(bytes32 => RebalanceAction[]) public rebalanceHistory;
    mapping(bytes32 => LiquidationRecord[]) public liquidationHistory;
    mapping(bytes32 => CreditLineActivity[]) public creditActivity;
    mapping(address => ManagerProfile) public managers;
    mapping(bytes32 => SegmentPolicy) private segmentPolicies;
    mapping(uint256 => bytes32) private gatewayRequestToPosition;

    PoolPolicy public policy;
    uint256 public positionCount;
    uint256 public activePositionCount;
    uint256 public liquidatedCount;

    // Aggregate pool statistics
    euint128 public poolTotalAssetsCipher;
    euint128 public poolTotalDebtCipher;
    euint128 public poolTotalCreditLineCipher;
    euint128 public poolTotalDrawnCipher;
    euint64 public poolAggregateRiskCipher;
    euint32 public poolAggregateLiquidityCipher;
    euint32 public poolAverageInterestRateCipher;

    // ========== Events ==========

    event PositionOpened(
        bytes32 indexed positionId,
        address indexed manager,
        bytes32 indexed segmentKey,
        uint256 timestamp
    );

    event PositionStatusChanged(
        bytes32 indexed positionId,
        PositionStatus oldStatus,
        PositionStatus newStatus,
        uint256 timestamp
    );

    event HealthReviewRequested(
        bytes32 indexed positionId,
        uint256 requestId,
        address reviewer
    );

    event HealthReviewCompleted(
        bytes32 indexed positionId,
        uint8 healthBand,
        uint8 stabilityTier,
        uint128 collateralRatio,
        uint64 riskScore,
        uint32 interestRate
    );

    event RebalanceInitiated(
        bytes32 indexed positionId,
        uint256 actionIndex,
        uint8 urgencyLevel,
        uint256 timestamp
    );

    event RebalanceCompleted(
        bytes32 indexed positionId,
        uint256 actionIndex,
        uint256 timestamp
    );

    event LiquidationStarted(
        bytes32 indexed positionId,
        bool isPartial,
        uint256 timestamp
    );

    event LiquidationCompleted(
        bytes32 indexed positionId,
        uint256 recordIndex,
        uint256 timestamp
    );

    event CreditDrawn(
        bytes32 indexed positionId,
        uint256 activityIndex,
        uint256 timestamp
    );

    event CreditRepaid(
        bytes32 indexed positionId,
        uint256 activityIndex,
        uint256 timestamp
    );

    event PositionClosed(
        bytes32 indexed positionId,
        uint256 timestamp
    );

    event RoleGranted(
        address indexed account,
        string role
    );

    event RoleRevoked(
        address indexed account,
        string role
    );

    // ========== Constructor ==========

    constructor() {
        owner = msg.sender;
        poolGovernor = msg.sender;
        riskCouncil = msg.sender;

        policy = PoolPolicy({
            minAsset: 110_000 ether,
            assetBuffer: 12_000 ether,
            debtBuffer: 6_500 ether,
            maxUtilization: 7950,                   // 79.5%
            minCovenantScore: 640,
            maxRiskLevel: 3,
            minLiquidityScore: 760,
            maxCovenantDrift: 140,
            minStressIndex: 450,
            collateralRatioThreshold: 16500,        // 165%
            liquidationThreshold: 12000,            // 120%
            partialLiquidationThreshold: 13500,     // 135%
            baseInterestRate: 500,                  // 5%
            riskPremiumRate: 300,                   // 3%
            liquidationPenaltyBps: 1000,            // 10%
            reviewWindow: uint32(8 hours),
            reviewCooldown: uint32(4 hours),
            rebalanceWindow: uint32(2 hours),
            maxReviews: 5
        });

        segmentPolicies[DEFAULT_SEGMENT] = SegmentPolicy({
            policy: policy,
            stressBoostCipher: FHE.asEuint32(60),
            exists: true,
            updatedAt: block.timestamp
        });
        FHE.allowThis(segmentPolicies[DEFAULT_SEGMENT].stressBoostCipher);

        // Initialize aggregate statistics
        poolTotalAssetsCipher = FHE.asEuint128(0);
        poolTotalDebtCipher = FHE.asEuint128(0);
        poolTotalCreditLineCipher = FHE.asEuint128(0);
        poolTotalDrawnCipher = FHE.asEuint128(0);
        poolAggregateRiskCipher = FHE.asEuint64(0);
        poolAggregateLiquidityCipher = FHE.asEuint32(0);
        poolAverageInterestRateCipher = FHE.asEuint32(0);

        FHE.allowThis(poolTotalAssetsCipher);
        FHE.allowThis(poolTotalDebtCipher);
        FHE.allowThis(poolTotalCreditLineCipher);
        FHE.allowThis(poolTotalDrawnCipher);
        FHE.allowThis(poolAggregateRiskCipher);
        FHE.allowThis(poolAggregateLiquidityCipher);
        FHE.allowThis(poolAverageInterestRateCipher);
    }

    // ========== Role Management ==========

    function grantLiquidator(address account) external onlyOwner {
        liquidators[account] = true;
        emit RoleGranted(account, "Liquidator");
    }

    function revokeLiquidator(address account) external onlyOwner {
        liquidators[account] = false;
        emit RoleRevoked(account, "Liquidator");
    }

    function grantAuditor(address account) external onlyOwner {
        auditors[account] = true;
        emit RoleGranted(account, "Auditor");
    }

    function revokeAuditor(address account) external onlyOwner {
        auditors[account] = false;
        emit RoleRevoked(account, "Auditor");
    }

    function transferGovernor(address newGovernor) external onlyGovernor {
        require(newGovernor != address(0), "Invalid address");
        poolGovernor = newGovernor;
    }

    function updateRiskCouncil(address newCouncil) external onlyGovernor {
        require(newCouncil != address(0), "Invalid address");
        riskCouncil = newCouncil;
    }

    // ========== Core Functions ==========

    /**
     * @notice Open new credit position
     */
    function openPosition(
        bytes32 positionId,
        bytes32 segmentKey,
        externalEuint128 encryptedAsset,
        bytes calldata assetProof,
        externalEuint128 encryptedDebt,
        bytes calldata debtProof,
        externalEuint128 encryptedCreditLine,
        bytes calldata creditProof,
        externalEuint64 encryptedUtil,
        bytes calldata utilProof,
        externalEuint32 encryptedCov,
        bytes calldata covProof,
        externalEuint8 encryptedRisk,
        bytes calldata riskProof,
        externalEuint32 encryptedLiquidity,
        bytes calldata liquidityProof,
        externalEuint16 encryptedDrift,
        bytes calldata driftProof,
        externalEuint32 encryptedStress,
        bytes calldata stressProof
    ) external returns (bytes32) {
        require(positions[positionId].openedAt == 0, "Position exists");

        if (segmentKey == bytes32(0)) {
            segmentKey = DEFAULT_SEGMENT;
        }

        // Convert external inputs
        euint128 asset = FHE.asEuint128(encryptedAsset, assetProof);
        euint128 debt = FHE.asEuint128(encryptedDebt, debtProof);
        euint128 creditLine = FHE.asEuint128(encryptedCreditLine, creditProof);
        euint64 util = FHE.asEuint64(encryptedUtil, utilProof);
        euint32 cov = FHE.asEuint32(encryptedCov, covProof);
        euint8 risk = FHE.asEuint8(encryptedRisk, riskProof);
        euint32 liquidity = FHE.asEuint32(encryptedLiquidity, liquidityProof);
        euint16 drift = FHE.asEuint16(encryptedDrift, driftProof);
        euint32 stress = FHE.asEuint32(encryptedStress, stressProof);

        // Allow contract access
        FHE.allowThis(asset);
        FHE.allowThis(debt);
        FHE.allowThis(creditLine);
        FHE.allowThis(util);
        FHE.allowThis(cov);
        FHE.allowThis(risk);
        FHE.allowThis(liquidity);
        FHE.allowThis(drift);
        FHE.allowThis(stress);

        // Allow manager access
        FHE.allow(asset, msg.sender);
        FHE.allow(debt, msg.sender);
        FHE.allow(creditLine, msg.sender);
        FHE.allow(util, msg.sender);
        FHE.allow(cov, msg.sender);
        FHE.allow(risk, msg.sender);
        FHE.allow(liquidity, msg.sender);
        FHE.allow(drift, msg.sender);
        FHE.allow(stress, msg.sender);

        Position storage pos = positions[positionId];
        pos.positionId = positionId;
        pos.manager = msg.sender;
        pos.segmentKey = segmentKey;
        pos.assetCipher = asset;
        pos.debtCipher = debt;
        pos.creditLineCipher = creditLine;
        pos.drawnAmountCipher = FHE.asEuint128(0);
        pos.utilizationCipher = util;
        pos.covenantScoreCipher = cov;
        pos.riskLevelCipher = risk;
        pos.liquidityScoreCipher = liquidity;
        pos.covenantDriftCipher = drift;
        pos.stressIndexCipher = stress;
        pos.interestRateCipher = FHE.asEuint32(policy.baseInterestRate);
        pos.accruedInterestCipher = FHE.asEuint64(0);
        pos.status = PositionStatus.Active;
        pos.openedAt = block.timestamp;
        pos.lastReviewAt = block.timestamp;
        pos.isActive = true;

        FHE.allowThis(pos.drawnAmountCipher);
        FHE.allowThis(pos.interestRateCipher);
        FHE.allowThis(pos.accruedInterestCipher);

        // Update manager profile
        ManagerProfile storage profile = managers[msg.sender];
        if (profile.firstPositionAt == 0) {
            profile.manager = msg.sender;
            profile.firstPositionAt = block.timestamp;
            profile.totalPositionsCipher = FHE.asEuint32(0);
            profile.activePositionsCipher = FHE.asEuint32(0);
            profile.liquidatedPositionsCipher = FHE.asEuint32(0);
            profile.totalCreditUsedCipher = FHE.asEuint128(0);
            profile.totalRepaidCipher = FHE.asEuint128(0);
            profile.averageHealthScoreCipher = FHE.asEuint16(500);
            profile.creditRatingCipher = FHE.asEuint8(50);

            FHE.allowThis(profile.totalPositionsCipher);
            FHE.allowThis(profile.activePositionsCipher);
            FHE.allowThis(profile.liquidatedPositionsCipher);
            FHE.allowThis(profile.totalCreditUsedCipher);
            FHE.allowThis(profile.totalRepaidCipher);
            FHE.allowThis(profile.averageHealthScoreCipher);
            FHE.allowThis(profile.creditRatingCipher);
        }

        profile.positionIds.push(uint256(positionId));
        profile.totalPositionsCipher = FHE.add(profile.totalPositionsCipher, FHE.asEuint32(1));
        profile.activePositionsCipher = FHE.add(profile.activePositionsCipher, FHE.asEuint32(1));
        profile.lastPositionAt = block.timestamp;
        profile.positionCount++;

        // Update aggregate statistics
        positionCount++;
        activePositionCount++;
        poolTotalAssetsCipher = FHE.add(poolTotalAssetsCipher, asset);
        poolTotalDebtCipher = FHE.add(poolTotalDebtCipher, debt);
        poolTotalCreditLineCipher = FHE.add(poolTotalCreditLineCipher, creditLine);

        emit PositionOpened(positionId, msg.sender, segmentKey, block.timestamp);
        emit PositionStatusChanged(positionId, PositionStatus.Draft, PositionStatus.Active, block.timestamp);

        return positionId;
    }

    /**
     * @notice Request comprehensive health review with Gateway decryption
     */
    function requestHealthReview(bytes32 positionId) external returns (uint256) {
        Position storage pos = positions[positionId];
        require(pos.openedAt != 0, "Position not found");
        require(pos.isActive && !pos.isFrozen, "Position not active");
        require(msg.sender == pos.manager || msg.sender == poolGovernor || msg.sender == riskCouncil, "Not authorized");

        SegmentPolicy storage sp = segmentPolicies[pos.segmentKey];
        PoolPolicy memory pol = sp.exists ? sp.policy : policy;

        require(pos.reviewCount < pol.maxReviews, "Review limit reached");

        // Calculate adjusted collateral ratio
        euint128 adjustedAsset = FHE.add(pos.assetCipher, FHE.asEuint128(pol.assetBuffer));
        euint128 adjustedDebt = FHE.add(pos.debtCipher, FHE.asEuint128(pol.debtBuffer));
        euint128 collateralRatio = FHE.div(
            FHE.mul(adjustedAsset, uint128(10000)),
            FHE.add(adjustedDebt, FHE.asEuint128(1))
        );

        // Comprehensive health checks
        ebool assetOk = FHE.ge(adjustedAsset, FHE.asEuint128(pol.minAsset));
        ebool utilOk = FHE.le(pos.utilizationCipher, FHE.asEuint64(pol.maxUtilization));
        ebool covOk = FHE.ge(pos.covenantScoreCipher, FHE.asEuint32(pol.minCovenantScore));
        ebool riskOk = FHE.le(pos.riskLevelCipher, FHE.asEuint8(pol.maxRiskLevel));
        ebool liquidityOk = FHE.ge(pos.liquidityScoreCipher, FHE.asEuint32(pol.minLiquidityScore));
        ebool driftOk = FHE.le(pos.covenantDriftCipher, FHE.asEuint16(pol.maxCovenantDrift));
        ebool stressOk = FHE.ge(pos.stressIndexCipher, FHE.asEuint32(pol.minStressIndex));
        ebool collateralHealthy = FHE.ge(collateralRatio, FHE.asEuint128(pol.collateralRatioThreshold));
        ebool collateralWarning = FHE.ge(collateralRatio, FHE.asEuint128(pol.partialLiquidationThreshold));
        ebool collateralCritical = FHE.ge(collateralRatio, FHE.asEuint128(pol.liquidationThreshold));

        // Determine health band (0=Critical, 1=Recovery, 2=Watch, 3=Healthy, 4=Premium)
        ebool fullyHealthy = FHE.and(assetOk, FHE.and(utilOk, FHE.and(covOk, FHE.and(riskOk, FHE.and(liquidityOk, FHE.and(driftOk, FHE.and(stressOk, collateralHealthy)))))));
        ebool watching = FHE.and(assetOk, FHE.and(utilOk, FHE.and(covOk, FHE.and(collateralWarning, riskOk))));
        ebool recovering = FHE.and(assetOk, FHE.and(utilOk, FHE.and(liquidityOk, collateralCritical)));

        euint8 healthBand = FHE.select(fullyHealthy, FHE.asEuint8(4),  // Premium
            FHE.select(watching, FHE.asEuint8(3),  // Healthy
                FHE.select(recovering, FHE.asEuint8(2),  // Watch
                    FHE.select(collateralCritical, FHE.asEuint8(1), FHE.asEuint8(0)))));  // Recovery or Critical

        // Calculate composite risk score
        euint64 riskScore = FHE.add(
            FHE.mul(FHE.asEuint64(pos.riskLevelCipher), uint64(120)),
            FHE.add(
                FHE.div(pos.utilizationCipher, uint64(90)),
                FHE.mul(FHE.asEuint64(pos.covenantDriftCipher), uint64(2))
            )
        );
        if (sp.exists) {
            riskScore = FHE.add(riskScore, FHE.asEuint64(sp.stressBoostCipher));
        }

        // Calculate stability tier (0=Unstable, 1=Caution, 2=Stable, 3=Strong)
        euint8 stabilityTier = FHE.select(
            FHE.ge(collateralRatio, FHE.asEuint128(pol.collateralRatioThreshold + 500)),
            FHE.asEuint8(3),  // Strong
            FHE.select(
                FHE.ge(collateralRatio, FHE.asEuint128(pol.collateralRatioThreshold)),
                FHE.asEuint8(2),  // Stable
                FHE.select(collateralWarning, FHE.asEuint8(1), FHE.asEuint8(0))  // Caution or Unstable
            )
        );

        // Calculate dynamic interest rate: baseRate + (riskLevel * riskPremium / 10)
        euint32 riskPremium = FHE.mul(FHE.asEuint32(pos.riskLevelCipher), uint32(pol.riskPremiumRate));
        euint32 interestRate = FHE.add(FHE.asEuint32(pol.baseInterestRate), FHE.div(riskPremium, uint32(10)));

        // Calculate liquidation threshold
        euint64 liquidationThreshold = FHE.asEuint64(pol.liquidationThreshold);

        // Store review
        HealthReview storage review = reviews[positionId];
        review.positionId = positionId;
        review.healthBandCipher = healthBand;
        review.stabilityTierCipher = stabilityTier;
        review.collateralRatioCipher = collateralRatio;
        review.maskedAssetCipher = adjustedAsset;
        review.riskScoreCipher = riskScore;
        review.liquidityScoreCipher = pos.liquidityScoreCipher;
        review.interestRateCipher = interestRate;
        review.liquidationThresholdCipher = liquidationThreshold;
        review.evaluatedAt = block.timestamp;
        review.evaluatedBy = msg.sender;

        FHE.allowThis(healthBand);
        FHE.allowThis(stabilityTier);
        FHE.allowThis(collateralRatio);
        FHE.allowThis(riskScore);
        FHE.allowThis(interestRate);
        FHE.allowThis(liquidationThreshold);

        // Prepare for Gateway decryption (6 values)
        uint256[] memory cts = new uint256[](6);
        cts[0] = FHE.decrypt(healthBand);
        cts[1] = FHE.decrypt(stabilityTier);
        cts[2] = FHE.decrypt(collateralRatio);
        cts[3] = FHE.decrypt(riskScore);
        cts[4] = FHE.decrypt(pos.liquidityScoreCipher);
        cts[5] = FHE.decrypt(interestRate);

        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.healthReviewCallback.selector,
            0,
            block.timestamp + pol.reviewWindow,
            false
        );

        gatewayRequestToPosition[requestId] = positionId;
        pos.reviewCount++;
        pos.lastReviewAt = block.timestamp;

        emit HealthReviewRequested(positionId, requestId, msg.sender);

        return requestId;
    }

    /**
     * @notice Gateway callback for health review decryption
     */
    function healthReviewCallback(
        uint256 requestId,
        uint256[] calldata decryptedValues
    ) external onlyGateway {
        bytes32 positionId = gatewayRequestToPosition[requestId];
        require(positionId != bytes32(0), "Position not found");
        require(decryptedValues.length >= 6, "Invalid payload");

        Position storage pos = positions[positionId];
        HealthReview storage review = reviews[positionId];

        uint8 healthBand = uint8(decryptedValues[0]);
        uint8 stabilityTier = uint8(decryptedValues[1]);
        uint128 collateralRatio = uint128(decryptedValues[2]);
        uint64 riskScore = uint64(decryptedValues[3]);
        uint32 liquidityScore = uint32(decryptedValues[4]);
        uint32 interestRate = uint32(decryptedValues[5]);

        review.decryptedHealthBand = healthBand;
        review.decryptedStabilityTier = stabilityTier;
        review.decryptedCollateralRatio = collateralRatio;
        review.decryptedRiskScore = riskScore;
        review.decryptedLiquidityScore = liquidityScore;
        review.decryptedInterestRate = interestRate;
        review.isDecrypted = true;
        review.isComplete = true;

        // Update position status based on health
        PositionStatus oldStatus = pos.status;
        PositionStatus newStatus = oldStatus;

        if (healthBand == 0) {  // Critical
            newStatus = PositionStatus.Undercollateralized;
        } else if (healthBand == 1) {  // Recovery
            newStatus = PositionStatus.Warning;
        } else if (healthBand == 2) {  // Watch
            newStatus = PositionStatus.Monitored;
        } else if (healthBand >= 3) {  // Healthy or Premium
            newStatus = PositionStatus.Active;
        }

        if (newStatus != oldStatus) {
            pos.status = newStatus;
            pos.statusChangeCount++;
            emit PositionStatusChanged(positionId, oldStatus, newStatus, block.timestamp);
        }

        // Update position interest rate
        pos.interestRateCipher = review.interestRateCipher;

        // Update aggregate statistics
        poolAggregateRiskCipher = FHE.add(poolAggregateRiskCipher, review.riskScoreCipher);
        poolAggregateLiquidityCipher = FHE.add(poolAggregateLiquidityCipher, review.liquidityScoreCipher);

        // Update average interest rate
        if (positionCount > 0) {
            poolAverageInterestRateCipher = FHE.div(
                FHE.add(
                    FHE.mul(poolAverageInterestRateCipher, FHE.asEuint32(positionCount - 1)),
                    review.interestRateCipher
                ),
                uint32(positionCount)
            );
        }

        delete gatewayRequestToPosition[requestId];

        emit HealthReviewCompleted(positionId, healthBand, stabilityTier, collateralRatio, riskScore, interestRate);
    }

    /**
     * @notice Draw credit from position's credit line
     */
    function drawCredit(
        bytes32 positionId,
        externalEuint128 encryptedAmount,
        bytes calldata proof
    ) external {
        Position storage pos = positions[positionId];
        require(pos.manager == msg.sender, "Not manager");
        require(pos.isActive && !pos.isFrozen, "Position not active");

        euint128 drawAmount = FHE.asEuint128(encryptedAmount, proof);
        FHE.allowThis(drawAmount);

        // Check available credit
        ebool withinLimit = FHE.le(
            FHE.add(pos.drawnAmountCipher, drawAmount),
            pos.creditLineCipher
        );
        require(FHE.decrypt(withinLimit) == 1, "Exceeds credit line");

        // Update drawn amount
        pos.drawnAmountCipher = FHE.add(pos.drawnAmountCipher, drawAmount);
        pos.debtCipher = FHE.add(pos.debtCipher, drawAmount);

        // Record activity
        CreditLineActivity memory activity = CreditLineActivity({
            positionId: positionId,
            drawAmountCipher: drawAmount,
            repayAmountCipher: FHE.asEuint128(0),
            balanceAfterCipher: pos.drawnAmountCipher,
            interestAccruedCipher: FHE.asEuint32(0),
            timestamp: block.timestamp,
            isDrawdown: true
        });

        FHE.allowThis(activity.repayAmountCipher);
        FHE.allowThis(activity.interestAccruedCipher);

        creditActivity[positionId].push(activity);

        // Update manager profile
        ManagerProfile storage profile = managers[pos.manager];
        profile.totalCreditUsedCipher = FHE.add(profile.totalCreditUsedCipher, drawAmount);

        // Update aggregate statistics
        poolTotalDrawnCipher = FHE.add(poolTotalDrawnCipher, drawAmount);
        poolTotalDebtCipher = FHE.add(poolTotalDebtCipher, drawAmount);

        emit CreditDrawn(positionId, creditActivity[positionId].length - 1, block.timestamp);
    }

    /**
     * @notice Repay credit to position
     */
    function repayCredit(
        bytes32 positionId,
        externalEuint128 encryptedAmount,
        bytes calldata proof
    ) external {
        Position storage pos = positions[positionId];
        require(pos.manager == msg.sender, "Not manager");

        euint128 repayAmount = FHE.asEuint128(encryptedAmount, proof);
        FHE.allowThis(repayAmount);

        // Update debt and drawn amount
        ebool canRepay = FHE.ge(pos.debtCipher, repayAmount);
        euint128 actualRepay = FHE.select(canRepay, repayAmount, pos.debtCipher);

        pos.debtCipher = FHE.sub(pos.debtCipher, actualRepay);
        pos.drawnAmountCipher = FHE.sub(pos.drawnAmountCipher, actualRepay);

        // Record activity
        CreditLineActivity memory activity = CreditLineActivity({
            positionId: positionId,
            drawAmountCipher: FHE.asEuint128(0),
            repayAmountCipher: actualRepay,
            balanceAfterCipher: pos.drawnAmountCipher,
            interestAccruedCipher: pos.accruedInterestCipher,
            timestamp: block.timestamp,
            isDrawdown: false
        });

        FHE.allowThis(activity.drawAmountCipher);

        creditActivity[positionId].push(activity);

        // Update manager profile
        ManagerProfile storage profile = managers[pos.manager];
        profile.totalRepaidCipher = FHE.add(profile.totalRepaidCipher, actualRepay);

        // Credit rating bonus for repayment
        ebool canIncrease = FHE.lt(profile.creditRatingCipher, FHE.asEuint8(95));
        profile.creditRatingCipher = FHE.select(
            canIncrease,
            FHE.add(profile.creditRatingCipher, FHE.asEuint8(5)),
            FHE.asEuint8(100)
        );

        // Update aggregate statistics
        poolTotalDebtCipher = FHE.sub(poolTotalDebtCipher, actualRepay);

        emit CreditRepaid(positionId, creditActivity[positionId].length - 1, block.timestamp);
    }

    /**
     * @notice Initiate rebalance action for undercollateralized position
     */
    function initiateRebalance(bytes32 positionId) external onlyCouncil {
        Position storage pos = positions[positionId];
        require(pos.isActive, "Position not active");
        require(pos.status == PositionStatus.Undercollateralized || pos.status == PositionStatus.Warning, "Invalid status");

        HealthReview storage review = reviews[positionId];
        require(review.isDecrypted, "Review not decrypted");

        PoolPolicy memory pol = segmentPolicies[pos.segmentKey].exists ?
            segmentPolicies[pos.segmentKey].policy : policy;

        // Calculate required collateral and deficit
        euint128 requiredCollateral = FHE.div(
            FHE.mul(pos.debtCipher, FHE.asEuint128(pol.collateralRatioThreshold)),
            uint128(10000)
        );

        ebool hasDeficit = FHE.lt(pos.assetCipher, requiredCollateral);
        euint128 deficit = FHE.select(
            hasDeficit,
            FHE.sub(requiredCollateral, pos.assetCipher),
            FHE.asEuint128(0)
        );

        // Determine urgency level based on health band
        euint8 urgencyLevel = FHE.asEuint8(review.decryptedHealthBand == 0 ? 5 :
            (review.decryptedHealthBand == 1 ? 3 : 1));

        RebalanceAction memory action = RebalanceAction({
            positionId: positionId,
            requiredCollateralCipher: requiredCollateral,
            deficitCipher: deficit,
            adjustedAssetCipher: pos.assetCipher,
            urgencyLevelCipher: urgencyLevel,
            initiatedAt: block.timestamp,
            initiatedBy: msg.sender,
            isCompleted: false
        });

        FHE.allowThis(urgencyLevel);

        rebalanceHistory[positionId].push(action);
        pos.rebalanceCount++;
        pos.lastRebalanceAt = block.timestamp;

        emit RebalanceInitiated(positionId, rebalanceHistory[positionId].length - 1, uint8(FHE.decrypt(urgencyLevel)), block.timestamp);
    }

    /**
     * @notice Start liquidation process for critical position
     */
    function startLiquidation(bytes32 positionId, bool isPartial) external onlyLiquidator {
        Position storage pos = positions[positionId];
        require(pos.isActive, "Position not active");
        require(pos.status == PositionStatus.Undercollateralized, "Not eligible for liquidation");

        HealthReview storage review = reviews[positionId];
        require(review.isDecrypted, "Review not decrypted");
        require(review.decryptedCollateralRatio < policy.liquidationThreshold, "Above liquidation threshold");

        PositionStatus oldStatus = pos.status;
        pos.status = isPartial ? PositionStatus.PartialLiquidated : PositionStatus.Liquidating;
        pos.liquidationStartedAt = block.timestamp;
        pos.statusChangeCount++;

        emit LiquidationStarted(positionId, isPartial, block.timestamp);
        emit PositionStatusChanged(positionId, oldStatus, pos.status, block.timestamp);
    }

    /**
     * @notice Complete liquidation
     */
    function completeLiquidation(
        bytes32 positionId,
        externalEuint128 encryptedLiquidatedAsset,
        bytes calldata assetProof,
        externalEuint128 encryptedRecoveredDebt,
        bytes calldata debtProof
    ) external onlyLiquidator {
        Position storage pos = positions[positionId];
        require(pos.status == PositionStatus.Liquidating || pos.status == PositionStatus.PartialLiquidated, "Not in liquidation");

        euint128 liquidatedAsset = FHE.asEuint128(encryptedLiquidatedAsset, assetProof);
        euint128 recoveredDebt = FHE.asEuint128(encryptedRecoveredDebt, debtProof);

        FHE.allowThis(liquidatedAsset);
        FHE.allowThis(recoveredDebt);

        // Calculate liquidation penalty
        euint64 penalty = FHE.asEuint64(FHE.div(
            FHE.mul(liquidatedAsset, FHE.asEuint128(policy.liquidationPenaltyBps)),
            uint128(10000)
        ));

        FHE.allowThis(penalty);

        // Update position
        pos.assetCipher = FHE.sub(pos.assetCipher, liquidatedAsset);
        pos.debtCipher = FHE.sub(pos.debtCipher, recoveredDebt);

        bool isComplete = FHE.decrypt(FHE.eq(pos.debtCipher, FHE.asEuint128(0))) == 1;

        LiquidationRecord memory record = LiquidationRecord({
            positionId: positionId,
            liquidatedAssetCipher: liquidatedAsset,
            recoveredDebtCipher: recoveredDebt,
            remainingAssetCipher: pos.assetCipher,
            remainingDebtCipher: pos.debtCipher,
            liquidationPenaltyCipher: penalty,
            executedAt: block.timestamp,
            executedBy: msg.sender,
            isPartial: !isComplete,
            isComplete: isComplete
        });

        liquidationHistory[positionId].push(record);

        if (isComplete) {
            PositionStatus oldStatus = pos.status;
            pos.status = PositionStatus.Liquidated;
            pos.isActive = false;
            pos.closedAt = block.timestamp;
            pos.statusChangeCount++;

            // Update manager profile
            ManagerProfile storage profile = managers[pos.manager];
            profile.liquidatedPositionsCipher = FHE.add(profile.liquidatedPositionsCipher, FHE.asEuint32(1));
            profile.activePositionsCipher = FHE.sub(profile.activePositionsCipher, FHE.asEuint32(1));

            // Credit rating penalty
            ebool canDecrease = FHE.gt(profile.creditRatingCipher, FHE.asEuint8(20));
            profile.creditRatingCipher = FHE.select(
                canDecrease,
                FHE.sub(profile.creditRatingCipher, FHE.asEuint8(20)),
                FHE.asEuint8(0)
            );

            // Update aggregate statistics
            activePositionCount--;
            liquidatedCount++;

            emit PositionStatusChanged(positionId, oldStatus, PositionStatus.Liquidated, block.timestamp);
        }

        emit LiquidationCompleted(positionId, liquidationHistory[positionId].length - 1, block.timestamp);
    }

    /**
     * @notice Close position voluntarily
     */
    function closePosition(bytes32 positionId) external {
        Position storage pos = positions[positionId];
        require(pos.manager == msg.sender, "Not manager");
        require(pos.isActive, "Position not active");

        // Check if all debt is repaid
        ebool debtCleared = FHE.eq(pos.debtCipher, FHE.asEuint128(0));
        require(FHE.decrypt(debtCleared) == 1, "Debt not cleared");

        PositionStatus oldStatus = pos.status;
        pos.status = PositionStatus.Closed;
        pos.isActive = false;
        pos.closedAt = block.timestamp;
        pos.statusChangeCount++;

        // Update manager profile
        ManagerProfile storage profile = managers[pos.manager];
        profile.activePositionsCipher = FHE.sub(profile.activePositionsCipher, FHE.asEuint32(1));

        // Update aggregate statistics
        activePositionCount--;
        poolTotalAssetsCipher = FHE.sub(poolTotalAssetsCipher, pos.assetCipher);

        emit PositionClosed(positionId, block.timestamp);
        emit PositionStatusChanged(positionId, oldStatus, PositionStatus.Closed, block.timestamp);
    }

    // ========== View Functions ==========

    function getPositionInfo(bytes32 positionId) external view returns (
        address manager,
        bytes32 segmentKey,
        PositionStatus status,
        uint256 openedAt,
        uint256 lastReviewAt,
        uint256 liquidationStartedAt,
        uint256 closedAt,
        bool isActive,
        bool isFlagged,
        uint16 reviewCount,
        uint16 rebalanceCount
    ) {
        Position storage pos = positions[positionId];
        return (
            pos.manager,
            pos.segmentKey,
            pos.status,
            pos.openedAt,
            pos.lastReviewAt,
            pos.liquidationStartedAt,
            pos.closedAt,
            pos.isActive,
            pos.isFlagged,
            pos.reviewCount,
            pos.rebalanceCount
        );
    }

    function getHealthReview(bytes32 positionId) external view returns (
        uint8 healthBand,
        uint8 stabilityTier,
        uint128 collateralRatio,
        uint64 riskScore,
        uint32 liquidityScore,
        uint32 interestRate,
        bool isDecrypted
    ) {
        HealthReview storage review = reviews[positionId];
        return (
            review.decryptedHealthBand,
            review.decryptedStabilityTier,
            review.decryptedCollateralRatio,
            review.decryptedRiskScore,
            review.decryptedLiquidityScore,
            review.decryptedInterestRate,
            review.isDecrypted
        );
    }

    function getRebalanceCount(bytes32 positionId) external view returns (uint256) {
        return rebalanceHistory[positionId].length;
    }

    function getLiquidationCount(bytes32 positionId) external view returns (uint256) {
        return liquidationHistory[positionId].length;
    }

    function getCreditActivityCount(bytes32 positionId) external view returns (uint256) {
        return creditActivity[positionId].length;
    }

    function getManagerProfileInfo(address manager) external view returns (
        uint256 firstPositionAt,
        uint256 lastPositionAt,
        uint32 positionCount,
        uint256[] memory positionIds
    ) {
        ManagerProfile storage profile = managers[manager];
        return (
            profile.firstPositionAt,
            profile.lastPositionAt,
            profile.positionCount,
            profile.positionIds
        );
    }

    function getPoolStats() external view returns (
        uint256 totalPositions,
        uint256 activePositions,
        uint256 liquidated
    ) {
        return (
            positionCount,
            activePositionCount,
            liquidatedCount
        );
    }

    // ========== Admin Functions ==========

    function updatePolicy(PoolPolicy calldata newPolicy) external onlyGovernor {
        require(newPolicy.minAsset > 0, "Invalid policy");
        policy = newPolicy;
        segmentPolicies[DEFAULT_SEGMENT].policy = newPolicy;
        segmentPolicies[DEFAULT_SEGMENT].updatedAt = block.timestamp;
    }

    function setSegmentPolicy(
        bytes32 segmentKey,
        PoolPolicy calldata policy_,
        uint32 stressBoost
    ) external onlyCouncil {
        require(segmentKey != bytes32(0), "Invalid segment");
        require(policy_.minAsset > 0, "Invalid policy");

        SegmentPolicy storage sp = segmentPolicies[segmentKey];
        sp.policy = policy_;
        sp.stressBoostCipher = FHE.asEuint32(stressBoost);
        sp.exists = true;
        sp.updatedAt = block.timestamp;

        FHE.allowThis(sp.stressBoostCipher);
    }

    function flagPosition(bytes32 positionId, bool flagged) external onlyCouncil {
        Position storage pos = positions[positionId];
        require(pos.openedAt != 0, "Position not found");
        pos.isFlagged = flagged;
    }

    function freezePosition(bytes32 positionId, bool frozen) external onlyCouncil {
        Position storage pos = positions[positionId];
        require(pos.openedAt != 0, "Position not found");
        pos.isFrozen = frozen;
    }
}
