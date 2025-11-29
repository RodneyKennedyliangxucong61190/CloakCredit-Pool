// FHE SDK utilities for fhEVM 0.9.1
// Pattern based on LuckyVault reference implementation

import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";

declare global {
  interface Window {
    RelayerSDK?: any;
    relayerSDK?: any;
    ethereum?: any;
    okxwallet?: any;
  }
}

// Global singleton
let fheInstance: any = null;

/**
 * Get the Relayer SDK from window object
 */
const getSDK = () => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }
  const sdk = window.RelayerSDK || window.relayerSDK;
  if (!sdk) {
    throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present in index.html");
  }
  return sdk;
};

/**
 * Initialize FHE SDK with provider
 */
export const initializeFHE = async (provider?: any) => {
  if (fheInstance) return fheInstance;
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }

  const ethereumProvider =
    provider || window.ethereum || window.okxwallet?.provider || window.okxwallet;
  if (!ethereumProvider) {
    throw new Error("No wallet provider detected. Connect a wallet first.");
  }

  const sdk = getSDK();
  const { initSDK, createInstance, SepoliaConfig } = sdk;
  await initSDK();
  const config = { ...SepoliaConfig, network: ethereumProvider };
  fheInstance = await createInstance(config);
  return fheInstance;
};

/**
 * Get FHE instance (auto-initialize if not initialized)
 */
const getInstance = async (provider?: any) => {
  if (fheInstance) return fheInstance;
  return initializeFHE(provider);
};

/**
 * Encrypt a uint64 value for lending operations
 * @param value - The amount value to encrypt
 * @param contractAddress - The lending pool contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptAmount = async (
  value: bigint,
  contractAddress: Address,
  userAddress: Address,
  provider?: any
): Promise<{
  handle: `0x${string}`;
  proof: `0x${string}`;
}> => {
  console.log('[FHE] Encrypting amount:', value.toString());
  const instance = await getInstance(provider);
  const contractAddr = getAddress(contractAddress);
  const userAddr = getAddress(userAddress);

  console.log('[FHE] Creating encrypted input for:', {
    contract: contractAddr,
    user: userAddr,
  });

  const input = instance.createEncryptedInput(contractAddr, userAddr);
  input.add64(value);  // euint64 for amount

  console.log('[FHE] Encrypting input...');
  const { handles, inputProof } = await input.encrypt();
  console.log('[FHE] Encryption complete, handles:', handles.length);

  if (handles.length < 1) {
    throw new Error('FHE SDK returned insufficient handles');
  }

  return {
    handle: bytesToHex(handles[0]) as `0x${string}`,
    proof: bytesToHex(inputProof) as `0x${string}`,
  };
};

/**
 * Check if FHE SDK is loaded and ready
 */
export const isFHEReady = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window.RelayerSDK || window.relayerSDK);
};

/**
 * Check if FHE instance is initialized
 */
export const isFheReady = (): boolean => {
  return fheInstance !== null;
};

export const isSDKLoaded = isFHEReady;

/**
 * Wait for FHE SDK to be loaded (with timeout)
 */
export const waitForFHE = async (timeoutMs: number = 10000): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (isFHEReady()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return false;
};

/**
 * Get FHE status for debugging
 */
export const getFHEStatus = (): {
  sdkLoaded: boolean;
  instanceReady: boolean;
} => {
  return {
    sdkLoaded: isFHEReady(),
    instanceReady: fheInstance !== null,
  };
};

/**
 * Reset FHE instance (for testing or forced reload)
 */
export function resetFHEInstance(): void {
  fheInstance = null;
  console.log('🔄 FHE instance has been reset');
}
