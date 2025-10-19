const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting FHELendingPool deployment to Sepolia...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance < hre.ethers.parseEther("0.01")) {
    console.warn("⚠️  Warning: Low balance, you may need more ETH for deployment");
  }

  // Deploy FHELendingPool
  console.log("\n📦 Deploying FHELendingPool...");
  const FHELendingPool = await hre.ethers.getContractFactory("FHELendingPool");
  const pool = await FHELendingPool.deploy();

  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();

  console.log("✅ FHELendingPool deployed to:", poolAddress);

  // Update .env file
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = fs.readFileSync(envPath, "utf8");
  envContent = envContent.replace(
    /LENDING_POOL_ADDRESS=.*/,
    `LENDING_POOL_ADDRESS=${poolAddress}`
  );
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Updated .env file with contract address");

  // Update frontend config
  const configPath = path.join(__dirname, "..", "webapp", "src", "config", "contracts.ts");
  let configContent = fs.readFileSync(configPath, "utf8");
  configContent = configContent.replace(
    /export const LENDING_POOL_ADDRESS = ['"]0x[0-9a-fA-F]{40}['"]/,
    `export const LENDING_POOL_ADDRESS = '${poolAddress}'`
  );
  fs.writeFileSync(configPath, configContent);
  console.log("✅ Updated frontend config with contract address");

  // Get initial pool stats
  const stats = await pool.getPoolStats();
  console.log("\n📊 Initial Pool Stats:");
  console.log("  - Total ETH Balance:", hre.ethers.formatEther(stats[0]), "ETH");
  console.log("  - User Count:", stats[1].toString());
  console.log("  - Interest Rate:", (Number(stats[2]) / 100).toFixed(2), "%");

  // Get collateral ratio
  const collateralRatio = await pool.collateralRatio();
  console.log("  - Collateral Ratio:", collateralRatio.toString(), "%");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Contract Details:");
  console.log("  - Network: Sepolia Testnet");
  console.log("  - Contract Address:", poolAddress);
  console.log("  - Explorer:", `https://sepolia.etherscan.io/address/${poolAddress}`);
  console.log("\n💡 Next Steps:");
  console.log("  1. Verify contract on Etherscan (optional)");
  console.log("  2. Restart frontend dev server to load new contract address");
  console.log("  3. Test deposit/withdraw with FHE encryption");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
