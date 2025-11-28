import FHELendingPoolArtifact from '../contracts/FHELendingPool.json';
import ConfidentialWETHArtifact from '../contracts/ConfidentialWETH.json';

// Contract addresses - deployed to Sepolia
export const CWETH_ADDRESS = '0x8671241CAC29118F883a660aD94586F12cDBF6D6';
export const LENDING_POOL_ADDRESS = '0xEBaf219D0bb14C243d29A3a8cCdF252482cE92E8';

// Contract ABIs
export const CWETH_ABI = ConfidentialWETHArtifact.abi;
export const LENDING_POOL_ABI = FHELendingPoolArtifact.abi;

// Chain ID
export const SEPOLIA_CHAIN_ID = 11155111;
