// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, externalEuint64, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";

/**
 * @title ConfidentialWETH - Privacy-Preserving Wrapped ETH
 * @notice ERC7984 (ConfidentialERC20) implementation for wrapped ETH
 * @dev Users deposit ETH and receive confidential cWETH tokens with encrypted balances
 *
 * Key features:
 * - Deposit ETH → receive encrypted cWETH balance
 * - Transfer cWETH with encrypted amounts (no amount leakage)
 * - Withdraw cWETH → receive ETH (requires async decryption)
 */
contract ConfidentialWETH is ZamaEthereumConfig, ERC7984 {
    // ============= Events =============
    event Deposited(address indexed user);  // No amount - privacy preserved
    event WithdrawRequested(address indexed user, euint64 encryptedAmount);
    event WithdrawFinalized(address indexed user, uint64 amount);

    // ============= State =============
    mapping(euint64 => address) private _withdrawRequests;

    // ============= Constructor =============
    constructor() ERC7984("Confidential Wrapped ETH", "cWETH", "") {}

    // ============= Override decimals to match ETH =============
    function decimals() public pure override returns (uint8) {
        return 18;
    }

    // ============= Deposit ETH → cWETH =============

    /**
     * @notice Deposit ETH and receive encrypted cWETH
     * @dev Amount is encrypted on-chain, only depositor can view their balance
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit ETH");

        // Convert wei to encrypted amount and mint
        euint64 amount = FHE.asEuint64(uint64(msg.value));
        _mint(msg.sender, amount);

        emit Deposited(msg.sender);
    }

    /**
     * @notice Deposit ETH to a specific address
     * @param to Recipient of the cWETH tokens
     */
    function depositTo(address to) external payable {
        require(msg.value > 0, "Must deposit ETH");
        require(to != address(0), "Invalid recipient");

        euint64 amount = FHE.asEuint64(uint64(msg.value));
        _mint(to, amount);

        emit Deposited(to);
    }

    // ============= Withdraw cWETH → ETH =============

    /**
     * @notice Request withdrawal of cWETH to ETH
     * @dev Requires async decryption - call finalizeWithdraw after decryption
     * @param encryptedAmount Encrypted amount to withdraw
     * @param inputProof Zero-knowledge proof for the encrypted input
     */
    function withdraw(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        _initiateWithdraw(msg.sender, amount);
    }

    /**
     * @notice Request withdrawal using already-allowed encrypted amount
     * @param amount Encrypted amount (caller must have FHE access)
     */
    function withdraw(euint64 amount) external {
        require(FHE.isAllowed(amount, msg.sender), "Not authorized for amount");
        _initiateWithdraw(msg.sender, amount);
    }

    /**
     * @notice Finalize a withdrawal request with decryption proof
     * @param burntAmount The encrypted amount that was burnt
     * @param cleartextAmount The decrypted amount
     * @param decryptionProof Proof from the decryption gateway
     */
    function finalizeWithdraw(
        euint64 burntAmount,
        uint64 cleartextAmount,
        bytes calldata decryptionProof
    ) external {
        address recipient = _withdrawRequests[burntAmount];
        require(recipient != address(0), "Invalid withdraw request");
        delete _withdrawRequests[burntAmount];

        // Verify decryption proof
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = euint64.unwrap(burntAmount);
        bytes memory cleartexts = abi.encode(cleartextAmount);
        FHE.checkSignatures(handles, cleartexts, decryptionProof);

        // Transfer ETH
        require(address(this).balance >= cleartextAmount, "Insufficient ETH");
        (bool success, ) = recipient.call{value: cleartextAmount}("");
        require(success, "ETH transfer failed");

        emit WithdrawFinalized(recipient, cleartextAmount);
    }

    // ============= Internal =============

    function _initiateWithdraw(address from, euint64 amount) internal {
        // Burn tokens and get actual burnt amount
        euint64 burntAmount = _burn(from, amount);

        // Make decryptable for async withdrawal
        FHE.makePubliclyDecryptable(burntAmount);

        // Store withdrawal request
        require(_withdrawRequests[burntAmount] == address(0), "Duplicate request");
        _withdrawRequests[burntAmount] = from;

        emit WithdrawRequested(from, burntAmount);
    }

    // ============= Receive ETH =============
    receive() external payable {
        // Direct ETH transfers are deposited
        euint64 amount = FHE.asEuint64(uint64(msg.value));
        _mint(msg.sender, amount);
        emit Deposited(msg.sender);
    }
}
