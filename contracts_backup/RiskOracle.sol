// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint128, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title RiskOracle - Credit Risk Assessment Oracle
/// @notice Off-chain service submits encrypted credit ratings
contract RiskOracle is SepoliaConfig {

    address public admin;
    address public poolController;

    // Authorized oracles
    mapping(address => bool) public authorizedOracles;

    // Credit assessments
    struct CreditAssessment {
        euint8 creditScore;        // 0-100 encrypted score
        uint256 timestamp;
        bytes32 dataHash;          // Hash of off-chain assessment data
        bool isValid;
    }

    mapping(address => CreditAssessment) public assessments;

    // Events
    event OracleAuthorized(address indexed oracle);
    event OracleRevoked(address indexed oracle);
    event AssessmentSubmitted(address indexed enterprise, uint256 timestamp);
    event AssessmentInvalidated(address indexed enterprise);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedOracles[msg.sender], "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedOracles[msg.sender] = true;
    }

    /// @notice Set pool controller address
    function setPoolController(address _controller) external onlyAdmin {
        poolController = _controller;
    }

    /// @notice Authorize an oracle
    function authorizeOracle(address oracle) external onlyAdmin {
        authorizedOracles[oracle] = true;
        emit OracleAuthorized(oracle);
    }

    /// @notice Revoke oracle authorization
    function revokeOracle(address oracle) external onlyAdmin {
        authorizedOracles[oracle] = false;
        emit OracleRevoked(oracle);
    }

    /// @notice Submit encrypted credit assessment
    function submitAssessment(
        address enterprise,
        externalEuint8 encScore,
        bytes calldata scoreProof,
        bytes32 dataHash
    ) external onlyAuthorized {
        euint8 score = FHE.fromExternal(encScore, scoreProof);

        assessments[enterprise] = CreditAssessment({
            creditScore: score,
            timestamp: block.timestamp,
            dataHash: dataHash,
            isValid: true
        });

        FHE.allowThis(score);
        FHE.allow(score, poolController);

        emit AssessmentSubmitted(enterprise, block.timestamp);
    }

    /// @notice Invalidate assessment
    function invalidateAssessment(address enterprise) external onlyAuthorized {
        assessments[enterprise].isValid = false;
        emit AssessmentInvalidated(enterprise);
    }

    /// @notice Get assessment for enterprise
    function getAssessment(address enterprise) external view returns (
        euint8 score,
        uint256 timestamp,
        bytes32 dataHash,
        bool isValid
    ) {
        CreditAssessment storage assessment = assessments[enterprise];
        return (
            assessment.creditScore,
            assessment.timestamp,
            assessment.dataHash,
            assessment.isValid
        );
    }

    /// @notice Check if oracle is authorized
    function isAuthorized(address oracle) external view returns (bool) {
        return authorizedOracles[oracle];
    }
}
