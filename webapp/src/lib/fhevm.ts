import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";
import { LENDING_POOL_ADDRESS, CWETH_ADDRESS } from "@/config/contracts";

declare global {
  interface Window {
    RelayerSDK?: any;
    relayerSDK?: any;
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;

const getSDK = () => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }
  const sdk = window.RelayerSDK || window.relayerSDK;
  if (!sdk) {
    throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present.");
  }
  return sdk;
};

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

const getInstance = async (provider?: any) => {
  if (fheInstance) return fheInstance;
  return initializeFHE(provider);
};

/**
 * Encrypt a uint64 value for lending pool operations
 * @param value - The amount value to encrypt (in wei)
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptForPool = async (
  value: bigint,
  userAddress: Address,
  provider?: any
): Promise<{
  handle: `0x${string}`;
  proof: `0x${string}`;
}> => {
  console.log('[FHE] Encrypting amount for pool:', value.toString());
  const instance = await getInstance(provider);
  const contractAddr = getAddress(LENDING_POOL_ADDRESS as Address);
  const userAddr = getAddress(userAddress);

  const input = instance.createEncryptedInput(contractAddr, userAddr);
  input.add64(value);

  const { handles, inputProof } = await input.encrypt();
  console.log('[FHE] Pool encryption complete');

  if (handles.length < 1) {
    throw new Error('FHE SDK returned insufficient handles');
  }

  return {
    handle: bytesToHex(handles[0]) as `0x${string}`,
    proof: bytesToHex(inputProof) as `0x${string}`,
  };
};

/**
 * Encrypt a uint64 value for cWETH operations
 * @param value - The amount value to encrypt (in wei)
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptForCWETH = async (
  value: bigint,
  userAddress: Address,
  provider?: any
): Promise<{
  handle: `0x${string}`;
  proof: `0x${string}`;
}> => {
  console.log('[FHE] Encrypting amount for cWETH:', value.toString());
  const instance = await getInstance(provider);
  const contractAddr = getAddress(CWETH_ADDRESS as Address);
  const userAddr = getAddress(userAddress);

  const input = instance.createEncryptedInput(contractAddr, userAddr);
  input.add64(value);

  const { handles, inputProof } = await input.encrypt();
  console.log('[FHE] cWETH encryption complete');

  if (handles.length < 1) {
    throw new Error('FHE SDK returned insufficient handles');
  }

  return {
    handle: bytesToHex(handles[0]) as `0x${string}`,
    proof: bytesToHex(inputProof) as `0x${string}`,
  };
};

/**
 * Encrypt a uint64 value with custom contract address
 */
export const encryptUint64 = async (
  value: number | bigint,
  contractAddress: Address,
  userAddress: Address,
  provider?: any
): Promise<{
  data: `0x${string}`;
  signature: `0x${string}`;
}> => {
  console.log('[FHE] Encrypting uint64:', value.toString());
  const instance = await getInstance(provider);
  const contractAddr = getAddress(contractAddress);
  const userAddr = getAddress(userAddress);

  const input = instance.createEncryptedInput(contractAddr, userAddr);
  input.add64(BigInt(value));

  const { handles, inputProof } = await input.encrypt();
  console.log('[FHE] uint64 encryption successful');

  return {
    data: bytesToHex(handles[0]) as `0x${string}`,
    signature: bytesToHex(inputProof) as `0x${string}`,
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
export const isFheInitialized = (): boolean => {
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
 * Reset FHE instance (for testing or network switching)
 */
export const resetFheInstance = (): void => {
  fheInstance = null;
  console.log('[FHE] Instance reset');
};

/**
 * Get current FHE instance
 */
export const getFHEVMInstance = (): any => {
  return fheInstance;
};

// Aliases for backwards compatibility
export const initializeFHEVM = initializeFHE;
export const encryptAmount = encryptForPool;
