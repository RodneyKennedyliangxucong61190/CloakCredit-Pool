# ShadowLend

![ShadowLend Banner](webapp/public/logo.svg)

**Where Shadows Protect Your Wealth**

ShadowLend is a privacy-preserving DeFi lending protocol built with [Zama's](https://www.zama.ai/) Fully Homomorphic Encryption (FHE) technology. Lend, borrow, and earn - all with cryptographic privacy on Ethereum.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia-blue)](https://sepolia.etherscan.io/)

## 🌟 Features

- **🔒 Privacy-Preserving**: All deposit and borrow amounts are encrypted using FHE
- **🛡️ Secure**: Built on Zama's battle-tested FHE infrastructure
- **💎 Transparent**: Open-source smart contracts and frontend
- **⚡ Instant**: Real-time deposits and withdrawals with no lockup periods
- **🔄 Decentralized**: Non-custodial protocol with on-chain privacy

## 🏗️ Project Architecture

```
ShadowLend/
├── contracts/              # Solidity smart contracts
│   ├── FHELendingPool.sol # Main lending pool with FHE encryption
│   └── SimpleLendingPool.sol
├── webapp/                 # React frontend application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components (Index, Dashboard, Markets, Docs)
│   │   ├── lib/           # FHE SDK integration
│   │   ├── hooks/         # Custom React hooks
│   │   └── config/        # Configuration files
│   └── public/            # Static assets
├── scripts/               # Deployment scripts
└── docs/                  # Documentation
```

## 🔐 Smart Contract Architecture

### FHELendingPool Contract

```
┌─────────────────────────────────────────────────────────────┐
│                    FHELendingPool.sol                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              User Account Structure                 │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  euint64 encryptedDeposited  (FHE Encrypted) │  │    │
│  │  │  euint64 encryptedBorrowed   (FHE Encrypted) │  │    │
│  │  │  uint256 lastUpdate          (Timestamp)      │  │    │
│  │  │  bool isActive               (Status)         │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Core Functions                         │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  deposit(encryptedAmount, inputProof)        │  │    │
│  │  │  └─> FHE.fromExternal() -> euint64          │  │    │
│  │  │                                               │  │    │
│  │  │  withdraw(encryptedAmount, inputProof,       │  │    │
│  │  │           plaintextAmount)                    │  │    │
│  │  │  └─> FHE.decrypt() -> Transfer ETH          │  │    │
│  │  │                                               │  │    │
│  │  │  borrow(encryptedAmount, inputProof,         │  │    │
│  │  │         plaintextAmount)                      │  │    │
│  │  │  └─> FHE operations + collateral check      │  │    │
│  │  │                                               │  │    │
│  │  │  repay(encryptedAmount, inputProof)          │  │    │
│  │  │  └─> FHE.sub() encrypted balances           │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Pool Statistics                        │    │
│  │  • totalETHBalance      (Public)                    │    │
│  │  • userCount            (Public)                    │    │
│  │  • depositRate          (5% APY)                    │    │
│  │  • borrowRate           (8% APY)                    │    │
│  │  • collateralRatio      (150%)                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### FHE Encryption Flow

```
┌──────────────┐      ┌───────────────┐      ┌──────────────┐
│   Frontend   │      │  FHE SDK      │      │  Smart       │
│   (User)     │─────>│  Encryption   │─────>│  Contract    │
└──────────────┘      └───────────────┘      └──────────────┘
                             │
                             │
                      ┌──────▼──────┐
                      │  Encrypted  │
                      │  euint64    │
                      │  + Proof    │
                      └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ On-Chain    │
                      │ Storage     │
                      │ (Private)   │
                      └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/RodneyKennedyliangxucong61190/CloakCredit-Pool.git
cd CloakCredit-Pool

# Install dependencies
npm install

# Install frontend dependencies
cd webapp
npm install
```

### Development

```bash
# Start the frontend development server
cd webapp
npm run dev
```

Visit `http://localhost:8080` to access the application.

### Smart Contract Deployment

```bash
# Configure your environment
cp .env.example .env
# Add your PRIVATE_KEY and SEPOLIA_RPC_URL

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

## 📊 Contract Information

- **Network**: Ethereum Sepolia Testnet
- **Contract Address**: `0xd674264b7A3c6927581B0786995eb44B5F94F4fC`
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0xd674264b7A3c6927581B0786995eb44B5F94F4fC)

## 🔑 Key Technologies

- **FHE**: [Zama fhEVM](https://docs.zama.ai/fhevm) - Fully Homomorphic Encryption for Ethereum
- **Smart Contracts**: Solidity 0.8.24
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**: ethers.js v6 + wagmi v2 + RainbowKit
- **Development**: Hardhat

## 🛣️ Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Deploy FHE-enabled smart contracts on Sepolia testnet
- [x] Implement encrypted deposit and withdrawal functionality
- [x] Launch web interface with wallet integration

### 🔄 Phase 2: Enhanced Privacy (In Progress)
- [ ] Add support for multiple ERC-20 token collateral
- [ ] Implement encrypted interest rate calculations
- [ ] Advanced liquidation mechanism with privacy protection

### 📋 Phase 3: Mainnet & Scale (Planned)
- [ ] Security audit by leading blockchain security firms
- [ ] Deploy to Ethereum mainnet
- [ ] Cross-chain bridge integration for multi-chain support

### 🔮 Phase 4: Ecosystem Growth (Future)
- [ ] Governance token launch and DAO formation
- [ ] Integration with major DeFi protocols
- [ ] Mobile app for iOS and Android

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [https://shadowlend.vercel.app](https://shadowlend.vercel.app)
- **GitHub**: [View Repository](https://github.com/RodneyKennedyliangxucong61190/CloakCredit-Pool)
- **Documentation**: [View Docs](https://shadowlend.vercel.app/docs)
- **Contract**: [View on Etherscan](https://sepolia.etherscan.io/address/0xd674264b7A3c6927581B0786995eb44B5F94F4fC)

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. This project is currently deployed on testnet only. Do not use with real funds until a full security audit has been completed.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for the incredible FHE technology
- [fhEVM](https://docs.zama.ai/fhevm) for the Ethereum FHE library
- The Ethereum and DeFi communities

---

Built with 🔒 by the ShadowLend team
