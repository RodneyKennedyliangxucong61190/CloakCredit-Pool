# CloakCredit Pool

<div align="center">
  <img src="webapp/public/logo.svg" alt="CloakCredit Pool Logo" width="120" />

  **Privacy-Preserving DeFi Lending Protocol**

  *Powered by Zama's Fully Homomorphic Encryption (FHE)*

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Solidity](https://img.shields.io/badge/Solidity-0.8.27-363636.svg)](https://docs.soliditylang.org/)
  [![fhEVM](https://img.shields.io/badge/fhEVM-0.9.1-00D4AA.svg)](https://docs.zama.ai/fhevm)
  [![Network](https://img.shields.io/badge/Network-Sepolia-blue)](https://sepolia.etherscan.io/)

  [Live Demo](https://cloakcredit-pool.vercel.app) · [Documentation](https://cloakcredit-pool.vercel.app/docs) · [Etherscan](https://sepolia.etherscan.io/address/0xEBaf219D0bb14C243d29A3a8cCdF252482cE92E8)
</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
  - [System Architecture](#system-architecture)
  - [Smart Contract Architecture](#smart-contract-architecture)
  - [Frontend Architecture](#frontend-architecture)
- [Smart Contracts](#smart-contracts)
  - [ConfidentialWETH (cWETH)](#confidentialweth-cweth)
  - [FHELendingPool](#fhelendingpool)
- [User Flow](#user-flow)
- [Privacy Guarantees](#privacy-guarantees)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Deployment](#deployment)
- [Contract Addresses](#contract-addresses)
- [API Reference](#api-reference)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

CloakCredit Pool is a **privacy-preserving DeFi lending protocol** that leverages [Zama's fhEVM](https://docs.zama.ai/fhevm) to enable fully confidential lending and borrowing operations on Ethereum. Unlike traditional DeFi protocols where all transaction amounts are publicly visible on-chain, CloakCredit Pool encrypts all user balances and transaction amounts using Fully Homomorphic Encryption (FHE).

### What is FHE?

Fully Homomorphic Encryption allows computations to be performed on encrypted data without decrypting it. This means:
- Your deposit amount remains **encrypted** on-chain
- Your borrow amount remains **encrypted** on-chain
- Collateral calculations happen on **encrypted values**
- Nobody can see your actual balances except you

---

## Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Full Privacy** | All amounts encrypted using FHE - no plaintext leakage |
| 🏦 **Lending & Borrowing** | Deposit cWETH to earn, borrow against collateral |
| 📊 **ERC7984 Compliant** | Uses the ConfidentialERC20 standard for encrypted tokens |
| ⚡ **Real-time Operations** | Instant deposits and withdrawals |
| 🛡️ **Over-collateralized** | 150% collateral ratio for secure borrowing |
| 🔄 **Non-custodial** | Users maintain full control of their assets |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CloakCredit Pool System                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐    │
│  │   User Wallet    │────▶│   Frontend App   │────▶│  Smart Contracts │    │
│  │   (MetaMask)     │     │   (React/Vite)   │     │    (Solidity)    │    │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘    │
│           │                        │                        │               │
│           │                        │                        │               │
│           ▼                        ▼                        ▼               │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐    │
│  │  Sepolia Testnet │     │   RainbowKit     │     │   Zama fhEVM     │    │
│  │    (Ethereum)    │     │  + wagmi + viem  │     │  FHE Coprocessor │    │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Smart Contract Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      ConfidentialWETH (cWETH)                         │  │
│  │                         ERC7984 Token Contract                         │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │  │
│  │  │  deposit()      │  │  withdraw()     │  │  transfer()     │       │  │
│  │  │  ETH → cWETH    │  │  cWETH → ETH    │  │  Encrypted Amt  │       │  │
│  │  │  (Encrypts)     │  │  (Decrypts)     │  │  (No leakage)   │       │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘       │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    │ Uses cWETH for all operations           │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         FHELendingPool                                │  │
│  │                      Main Lending Protocol                             │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    UserAccount Structure                         │  │  │
│  │  │  ┌────────────────────────────────────────────────────────────┐ │  │  │
│  │  │  │  euint64 encryptedDeposited   (FHE Encrypted)              │ │  │  │
│  │  │  │  euint64 encryptedBorrowed    (FHE Encrypted)              │ │  │  │
│  │  │  │  uint256 lastUpdate           (Timestamp)                   │ │  │  │
│  │  │  │  bool isActive                (Status)                      │ │  │  │
│  │  │  └────────────────────────────────────────────────────────────┘ │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     Core Functions                               │  │  │
│  │  │                                                                   │  │  │
│  │  │  deposit(encryptedAmount, proof)    → Add cWETH to pool         │  │  │
│  │  │  withdraw(encryptedAmount, proof)   → Remove cWETH from pool    │  │  │
│  │  │  borrow(encryptedAmount, proof)     → Borrow against collateral │  │  │
│  │  │  repay(encryptedAmount, proof)      → Repay borrowed amount     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     Pool Parameters                              │  │  │
│  │  │                                                                   │  │  │
│  │  │  • interestRate     = 500 (5% APY)                              │  │  │
│  │  │  • collateralRatio  = 150 (150% required)                       │  │  │
│  │  │  • userCount        = Dynamic                                    │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
webapp/
├── src/
│   ├── components/           # React UI Components
│   │   ├── DepositWithdraw.tsx   # Main lending interface (4 tabs)
│   │   ├── Navbar.tsx            # Navigation + Wrap ETH button
│   │   ├── BalanceCard.tsx       # Encrypted balance display
│   │   ├── StatsCard.tsx         # Pool statistics cards
│   │   └── ui/                   # shadcn/ui components
│   │
│   ├── pages/                # Page Components
│   │   ├── Index.tsx             # Home page with pool interface
│   │   ├── Dashboard.tsx         # User dashboard
│   │   ├── Markets.tsx           # Market overview
│   │   └── Docs.tsx              # Documentation
│   │
│   ├── config/               # Configuration
│   │   └── contracts.ts          # Contract addresses & ABIs
│   │
│   ├── contracts/            # Contract ABIs (JSON)
│   │   ├── FHELendingPool.json
│   │   └── ConfidentialWETH.json
│   │
│   ├── hooks/                # Custom React Hooks
│   │   ├── useEthersSigner.ts    # ethers.js signer hook
│   │   └── use-toast.ts          # Toast notification hook
│   │
│   ├── lib/                  # Utilities
│   │   ├── utils.ts              # General utilities
│   │   └── fhevm.ts              # FHE encryption utilities
│   │
│   └── App.tsx               # Main App with routing
│
├── public/                   # Static assets
└── package.json              # Dependencies
```

---

## Smart Contracts

### ConfidentialWETH (cWETH)

**File:** `contracts/ConfidentialWETH.sol`

An ERC7984 (ConfidentialERC20) compliant wrapped ETH token with encrypted balances.

```solidity
contract ConfidentialWETH is ZamaEthereumConfig, ERC7984 {
    // Key Functions:

    function deposit() external payable;
    // Deposit ETH → Receive encrypted cWETH balance

    function depositTo(address to) external payable;
    // Deposit ETH for another address

    function withdraw(externalEuint64 encryptedAmount, bytes calldata inputProof) external;
    // Request withdrawal (async decryption required)

    function finalizeWithdraw(euint64 burntAmount, uint64 cleartextAmount, bytes calldata decryptionProof) external;
    // Finalize withdrawal with decryption proof
}
```

**Key Properties:**
- Name: "Confidential Wrapped ETH"
- Symbol: "cWETH"
- Decimals: 18
- Standard: ERC7984 (ConfidentialERC20)

### FHELendingPool

**File:** `contracts/FHELendingPool.sol`

The main lending pool contract supporting encrypted deposits, withdrawals, borrows, and repayments.

```solidity
contract FHELendingPool is ZamaEthereumConfig {
    // User Account Structure
    struct UserAccount {
        euint64 encryptedDeposited;   // Encrypted deposited amount
        euint64 encryptedBorrowed;    // Encrypted borrowed amount
        uint256 lastUpdate;           // Last update timestamp
        bool isActive;                // Account status
    }

    // Core Functions:

    function deposit(externalEuint64 encryptedAmount, bytes calldata inputProof) external;
    // Deposit cWETH into the lending pool

    function withdraw(externalEuint64 encryptedAmount, bytes calldata inputProof) external;
    // Withdraw cWETH from the lending pool

    function borrow(externalEuint64 encryptedAmount, bytes calldata inputProof) external;
    // Borrow cWETH against collateral (150% ratio)

    function repay(externalEuint64 encryptedAmount, bytes calldata inputProof) external;
    // Repay borrowed cWETH

    function approvePoolAsOperator() external;
    // Approve pool as cWETH operator (required before deposit/repay)
}
```

**Pool Parameters:**
| Parameter | Value | Description |
|-----------|-------|-------------|
| `interestRate` | 500 | 5% APY (basis points) |
| `collateralRatio` | 150 | 150% collateral required |

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Complete User Flow                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Step 1  │───▶│  Step 2  │───▶│  Step 3  │───▶│  Step 4  │───▶│  Step 5  │
│ Wrap ETH │    │ Approve  │    │ Deposit  │    │  Borrow  │    │  Repay   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ cWETH.   │    │ pool.    │    │ pool.    │    │ pool.    │    │ pool.    │
│ deposit()│    │ approve  │    │ deposit()│    │ borrow() │    │ repay()  │
│          │    │ Operator │    │          │    │          │    │          │
│ ETH→cWETH│    │          │    │ Encrypted│    │ Encrypted│    │ Encrypted│
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Detailed Steps:

1. **Wrap ETH to cWETH**
   - User sends ETH to `ConfidentialWETH.deposit()`
   - Receives encrypted cWETH balance (1:1 ratio)
   - Amount is encrypted immediately on-chain

2. **Approve Pool as Operator**
   - Call `pool.approvePoolAsOperator()`
   - Allows pool to transfer cWETH on your behalf
   - One-time operation per user

3. **Deposit to Lending Pool**
   - Frontend encrypts amount using FHE
   - Call `pool.deposit(encryptedAmount, proof)`
   - cWETH transferred from user to pool (encrypted)
   - Earns interest on deposited amount

4. **Borrow Against Collateral**
   - Encrypted collateral check (≥150% of borrow amount)
   - Call `pool.borrow(encryptedAmount, proof)`
   - Receive cWETH loan (encrypted)

5. **Repay Loan**
   - Call `pool.repay(encryptedAmount, proof)`
   - cWETH transferred back to pool
   - Reduces encrypted borrow balance

---

## Privacy Guarantees

| Data Point | Privacy Status | Details |
|------------|---------------|---------|
| Deposit Amount | ✅ **ENCRYPTED** | FHE encrypted `euint64` |
| Borrow Amount | ✅ **ENCRYPTED** | FHE encrypted `euint64` |
| Repay Amount | ✅ **ENCRYPTED** | FHE encrypted `euint64` |
| Withdraw Amount | ✅ **ENCRYPTED** | FHE encrypted `euint64` |
| User Balances | ✅ **ENCRYPTED** | Only owner can decrypt |
| Event Logs | ✅ **NO AMOUNTS** | Events emit no amount data |
| Pool Statistics | ⚠️ Public | User count, rates (no amounts) |

### What is NOT visible on-chain:
- How much you deposited
- How much you borrowed
- Your current balance
- Your transaction amounts

### What IS visible on-chain:
- That you interacted with the pool
- Number of active users
- Interest rate and collateral ratio

---

## Technology Stack

### Smart Contracts

| Technology | Version | Purpose |
|------------|---------|---------|
| Solidity | 0.8.27 | Smart contract language |
| Hardhat | 2.26.3 | Development framework |
| fhEVM | 0.9.1 | FHE library for Solidity |
| OpenZeppelin Contracts | 5.0.2 | Standard contract utilities |
| OZ Confidential Contracts | 0.3.0 | ERC7984 implementation |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type-safe JavaScript |
| Vite | 5.4.19 | Build tool |
| wagmi | 2.18.1 | React hooks for Ethereum |
| viem | 2.38.3 | Ethereum interactions |
| RainbowKit | 2.2.9 | Wallet connection UI |
| ethers.js | 6.15.0 | Ethereum library |
| Tailwind CSS | 3.4.17 | Styling |
| shadcn/ui | - | UI components |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Ethereum Sepolia | Testnet deployment |
| Vercel | Frontend hosting |
| Zama Gateway | FHE decryption service |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** - Get from [Sepolia Faucet](https://sepoliafaucet.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/RodneyKennedyliangxucong61190/CloakCredit-Pool.git
cd CloakCredit-Pool

# Install smart contract dependencies
npm install

# Install frontend dependencies
cd webapp
npm install
```

### Development

```bash
# Start frontend development server
cd webapp
npm run dev

# The app will be available at http://localhost:5173
```

### Deployment

#### Smart Contracts

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY and SEPOLIA_RPC_URL

# 2. Compile contracts
npm run compile

# 3. Deploy to Sepolia
npm run deploy
# or
npx hardhat run scripts/deploy.js --network sepolia
```

#### Frontend

```bash
cd webapp

# Build for production
npm run build

# Deploy to Vercel (or your preferred hosting)
vercel --prod
```

---

## Contract Addresses

### Sepolia Testnet

| Contract | Address |
|----------|---------|
| **ConfidentialWETH** | [`0x8671241CAC29118F883a660aD94586F12cDBF6D6`](https://sepolia.etherscan.io/address/0x8671241CAC29118F883a660aD94586F12cDBF6D6) |
| **FHELendingPool** | [`0xEBaf219D0bb14C243d29A3a8cCdF252482cE92E8`](https://sepolia.etherscan.io/address/0xEBaf219D0bb14C243d29A3a8cCdF252482cE92E8) |

---

## API Reference

### ConfidentialWETH

```solidity
// Deposit ETH, receive encrypted cWETH
function deposit() external payable;

// Deposit ETH for another address
function depositTo(address to) external payable;

// Request withdrawal (with encrypted amount)
function withdraw(externalEuint64 encryptedAmount, bytes calldata inputProof) external;

// Finalize withdrawal with decryption proof
function finalizeWithdraw(euint64 burntAmount, uint64 cleartextAmount, bytes calldata decryptionProof) external;
```

### FHELendingPool

```solidity
// Deposit cWETH to pool
function deposit(externalEuint64 encryptedAmount, bytes calldata inputProof) external;

// Withdraw cWETH from pool
function withdraw(externalEuint64 encryptedAmount, bytes calldata inputProof) external;

// Borrow cWETH against collateral
function borrow(externalEuint64 encryptedAmount, bytes calldata inputProof) external;

// Repay borrowed cWETH
function repay(externalEuint64 encryptedAmount, bytes calldata inputProof) external;

// Approve pool as cWETH operator
function approvePoolAsOperator() external;

// View functions
function getPoolStats() external view returns (uint256 activeUsers, uint256 rate, uint256 collRatio);
function isUserActive(address user) external view returns (bool);
function getTokenAddress() external view returns (address);
```

---

## Security Considerations

### Implemented Security Features

- ✅ **Over-collateralization**: 150% collateral ratio prevents under-collateralized loans
- ✅ **No Plaintext Amounts**: All amounts are FHE encrypted
- ✅ **Access Control**: Admin functions restricted to deployer
- ✅ **Operator Pattern**: Users must explicitly approve pool operations

### Known Limitations

- ⚠️ **Testnet Only**: Currently deployed on Sepolia testnet
- ⚠️ **No Liquidation**: Liquidation mechanism not yet implemented
- ⚠️ **Single Asset**: Only cWETH supported currently
- ⚠️ **No Audit**: Smart contracts have not been professionally audited

### Best Practices

1. Never share your private keys
2. Start with small amounts for testing
3. Verify transaction details before signing
4. Keep your wallet software updated

---

## Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] ConfidentialWETH (ERC7984) token deployment
- [x] FHELendingPool with encrypted operations
- [x] React frontend with wallet integration
- [x] Transaction notifications with explorer links

### 🔄 Phase 2: Enhanced Features (In Progress)
- [ ] Multi-asset support (USDC, DAI)
- [ ] Encrypted interest calculations
- [ ] Liquidation mechanism
- [ ] Governance framework

### 📋 Phase 3: Production (Planned)
- [ ] Professional security audit
- [ ] Mainnet deployment
- [ ] Cross-chain bridges
- [ ] Mobile application

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Solidity style guide for smart contracts
- Use TypeScript for frontend code
- Write tests for new features
- Update documentation as needed

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Zama](https://www.zama.ai/) - FHE technology and fhEVM
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract libraries
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

<div align="center">
  <p>Built with 🔐 privacy by the CloakCredit team</p>

  [Website](https://cloakcredit-pool.vercel.app) · [GitHub](https://github.com/RodneyKennedyliangxucong61190/CloakCredit-Pool) · [Docs](https://cloakcredit-pool.vercel.app/docs)
</div>
