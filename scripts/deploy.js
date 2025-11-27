const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting ConfidentialWETH + FHELendingPool deployment to Sepolia...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.01")) {
    console.warn("Warning: Low balance, you may need more ETH for deployment");
  }

  // Step 1: Deploy ConfidentialWETH
  console.log("\n[1/2] Deploying ConfidentialWETH...");
  const ConfidentialWETH = await hre.ethers.getContractFactory("ConfidentialWETH");
  const cWETH = await ConfidentialWETH.deploy();
  await cWETH.waitForDeployment();
  const cWETHAddress = await cWETH.getAddress();
  console.log("ConfidentialWETH deployed to:", cWETHAddress);

  // Step 2: Deploy FHELendingPool with cWETH address
  console.log("\n[2/2] Deploying FHELendingPool...");
  const FHELendingPool = await hre.ethers.getContractFactory("FHELendingPool");
  const pool = await FHELendingPool.deploy(cWETHAddress);
  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();
  console.log("FHELendingPool deployed to:", poolAddress);

  // Update frontend config
  const configPath = path.join(__dirname, "..", "webapp", "src", "config", "contracts.ts");
  const configContent = `import FHELendingPoolArtifact from '../contracts/FHELendingPool.json';
import ConfidentialWETHArtifact from '../contracts/ConfidentialWETH.json';

// Contract addresses - deployed to Sepolia
export const CWETH_ADDRESS = '${cWETHAddress}';
export const LENDING_POOL_ADDRESS = '${poolAddress}';

// Contract ABIs
export const CWETH_ABI = ConfidentialWETHArtifact.abi;
export const LENDING_POOL_ABI = FHELendingPoolArtifact.abi;

// Chain ID
export const SEPOLIA_CHAIN_ID = 11155111;
`;
  fs.writeFileSync(configPath, configContent);
  console.log("\nUpdated frontend config with contract addresses");

  // Copy ABIs to frontend
  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const frontendContractsDir = path.join(__dirname, "..", "webapp", "src", "contracts");

  // Ensure frontend contracts directory exists
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // Copy ConfidentialWETH ABI
  const cWETHAbi = JSON.parse(
    fs.readFileSync(path.join(artifactsDir, "ConfidentialWETH.sol", "ConfidentialWETH.json"), "utf8")
  );
  fs.writeFileSync(
    path.join(frontendContractsDir, "ConfidentialWETH.json"),
    JSON.stringify({ abi: cWETHAbi.abi }, null, 2)
  );

  // Copy FHELendingPool ABI
  const poolAbi = JSON.parse(
    fs.readFileSync(path.join(artifactsDir, "FHELendingPool.sol", "FHELendingPool.json"), "utf8")
  );
  fs.writeFileSync(
    path.join(frontendContractsDir, "FHELendingPool.json"),
    JSON.stringify({ abi: poolAbi.abi }, null, 2)
  );
  console.log("Copied ABIs to frontend");

  // Get initial pool stats
  const stats = await pool.getPoolStats();
  console.log("\nInitial Pool Stats:");
  console.log("  - Active Users:", stats[0].toString());
  console.log("  - Interest Rate:", (Number(stats[1]) / 100).toFixed(2), "%");
  console.log("  - Collateral Ratio:", stats[2].toString(), "%");

  console.log("\nDeployment completed successfully!");
  console.log("\nContract Details:");
  console.log("  - Network: Sepolia Testnet");
  console.log("  - ConfidentialWETH:", cWETHAddress);
  console.log("  - FHELendingPool:", poolAddress);
  console.log("  - Explorer cWETH:", `https://sepolia.etherscan.io/address/${cWETHAddress}`);
  console.log("  - Explorer Pool:", `https://sepolia.etherscan.io/address/${poolAddress}`);

  console.log("\nUser Flow:");
  console.log("  1. User deposits ETH to cWETH.deposit() -> receives encrypted cWETH");
  console.log("  2. User approves pool as operator: cWETH.setOperator(pool, maxUint48)");
  console.log("  3. User deposits cWETH to pool: pool.deposit(encryptedAmount, proof)");
  console.log("  4. User can borrow against collateral: pool.borrow(encryptedAmount, proof)");
  console.log("  5. All amounts are fully encrypted - no leakage in events or parameters!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
