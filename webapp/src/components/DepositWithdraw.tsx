import { useAccount, useBalance } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { Contract, parseEther } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { initializeFHEVM, encryptForPool, encryptForCWETH } from '../lib/fhevm';
import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
  CWETH_ADDRESS,
  CWETH_ABI
} from '../config/contracts';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Info,
  Shield,
  Landmark,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatEther } from 'viem';
import { ToastAction } from './ui/toast';

type OperationType = 'wrap' | 'approve' | 'deposit' | 'withdraw' | 'unwrap' | 'borrow' | 'repay' | null;

// Sepolia block explorer
const EXPLORER_URL = 'https://sepolia.etherscan.io';

const getExplorerLink = (hash: string) => `${EXPLORER_URL}/tx/${hash}`;

const DepositWithdraw = () => {
  const { address } = useAccount();
  const signer = useEthersSigner();
  const { toast } = useToast();

  const [amount, setAmount] = useState('0.01');
  const [loading, setLoading] = useState(false);
  const [fheReady, setFheReady] = useState(false);
  const [activeOperation, setActiveOperation] = useState<OperationType>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  // Get ETH balance for display
  const { data: ethBalance, refetch: refetchBalance } = useBalance({
    address: address,
  });

  useEffect(() => {
    const init = async () => {
      try {
        await initializeFHEVM();
        setFheReady(true);
        console.log('FHE initialized and ready');
      } catch (error) {
        console.error('Failed to initialize FHE:', error);
        toast({
          title: 'FHE Initialization Failed',
          description: 'Please refresh the page and try again',
          variant: 'destructive',
        });
      }
    };
    init();
  }, [toast]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (txSuccess) {
      const timer = setTimeout(() => setTxSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [txSuccess]);

  const handleSuccess = useCallback((message: string) => {
    setTxSuccess(message);
    refetchBalance();
  }, [refetchBalance]);

  // Toast with transaction link
  const showTxPendingToast = (title: string, description: string, hash: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {title}
        </div>
      ) as any,
      description: (
        <div className="space-y-2">
          <p>{description}</p>
          <a
            href={getExplorerLink(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1 text-xs"
          >
            View on Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) as any,
    });
  };

  const showTxSuccessToast = (title: string, description: string, hash: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          {title}
        </div>
      ) as any,
      description: (
        <div className="space-y-2">
          <p>{description}</p>
          <a
            href={getExplorerLink(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1 text-xs"
          >
            View on Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) as any,
    });
  };

  const showTxErrorToast = (title: string, description: string, hash?: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {title}
        </div>
      ) as any,
      description: (
        <div className="space-y-2">
          <p>{description}</p>
          {hash && (
            <a
              href={getExplorerLink(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 text-xs"
            >
              View on Etherscan <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ) as any,
      variant: 'destructive',
    });
  };

  // Approve pool as operator
  const approvePool = async () => {
    if (!address || !signer) return;

    setLoading(true);
    setActiveOperation('approve');

    let txHash: string | undefined;

    try {
      const signerInstance = await signer;
      const cweth = new Contract(CWETH_ADDRESS, CWETH_ABI, signerInstance);

      const maxUint48 = BigInt(2 ** 48 - 1);
      const tx = await cweth.setOperator(LENDING_POOL_ADDRESS, maxUint48);
      txHash = tx.hash;

      showTxPendingToast(
        'Approving Pool...',
        'Setting lending pool as operator for your cWETH',
        txHash
      );

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        showTxSuccessToast(
          'Approval Successful!',
          'Lending pool can now manage your cWETH deposits.',
          txHash
        );
        handleSuccess('approve');
      } else {
        showTxErrorToast(
          'Approval Failed',
          'Transaction was reverted on chain',
          txHash
        );
      }
    } catch (error: any) {
      console.error('Approve failed:', error);
      showTxErrorToast(
        'Approval Failed',
        error.reason || error.message || 'Failed to approve pool',
        txHash
      );
    } finally {
      setLoading(false);
      setActiveOperation(null);
    }
  };

  // Step 3: Deposit cWETH to pool
  const depositToPool = async () => {
    if (!address || !signer || !fheReady) return;

    setLoading(true);
    setActiveOperation('deposit');

    let txHash: string | undefined;

    try {
      const weiAmount = parseEther(amount);

      console.log('Encrypting deposit amount for pool...');
      const { handle, proof } = await encryptForPool(weiAmount, address as `0x${string}`);

      const signerInstance = await signer;
      const pool = new Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, signerInstance);

      const tx = await pool.deposit(handle, proof);
      txHash = tx.hash;

      showTxPendingToast(
        'Depositing...',
        'Depositing encrypted cWETH to lending pool',
        txHash
      );

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        showTxSuccessToast(
          'Deposit Successful!',
          'Your cWETH is now in the pool. Amount fully encrypted!',
          txHash
        );
        handleSuccess('deposit');
      } else {
        showTxErrorToast(
          'Deposit Failed',
          'Transaction was reverted on chain',
          txHash
        );
      }
    } catch (error: any) {
      console.error('Deposit failed:', error);
      showTxErrorToast(
        'Deposit Failed',
        error.reason || error.message || 'Failed to deposit',
        txHash
      );
    } finally {
      setLoading(false);
      setActiveOperation(null);
    }
  };

  // Withdraw from pool
  const withdrawFromPool = async () => {
    if (!address || !signer || !fheReady) return;

    setLoading(true);
    setActiveOperation('withdraw');

    let txHash: string | undefined;

    try {
      const weiAmount = parseEther(amount);

      console.log('Encrypting withdrawal amount...');
      const { handle, proof } = await encryptForPool(weiAmount, address as `0x${string}`);

      const signerInstance = await signer;
      const pool = new Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, signerInstance);

      const tx = await pool.withdraw(handle, proof);
      txHash = tx.hash;

      showTxPendingToast(
        'Withdrawing...',
        'Withdrawing encrypted cWETH from pool',
        txHash
      );

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        showTxSuccessToast(
          'Withdrawal Successful!',
          'cWETH returned to your wallet. Amount stayed encrypted!',
          txHash
        );
        handleSuccess('withdraw');
      } else {
        showTxErrorToast(
          'Withdrawal Failed',
          'Transaction was reverted on chain',
          txHash
        );
      }
    } catch (error: any) {
      console.error('Withdraw failed:', error);
      showTxErrorToast(
        'Withdrawal Failed',
        error.reason || error.message || 'Failed to withdraw',
        txHash
      );
    } finally {
      setLoading(false);
      setActiveOperation(null);
    }
  };

  // Unwrap cWETH -> ETH
  const unwrapCWETH = async () => {
    if (!address || !signer || !fheReady) return;

    setLoading(true);
    setActiveOperation('unwrap');

    let txHash: string | undefined;

    try {
      const weiAmount = parseEther(amount);

      console.log('Encrypting unwrap amount...');
      const { handle, proof } = await encryptForCWETH(weiAmount, address as `0x${string}`);

      const signerInstance = await signer;
      const cweth = new Contract(CWETH_ADDRESS, CWETH_ABI, signerInstance);

      const tx = await cweth['withdraw(bytes32,bytes)'](handle, proof);
      txHash = tx.hash;

      showTxPendingToast(
        'Requesting Unwrap...',
        'Initiating decryption request for withdrawal',
        txHash
      );

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        showTxSuccessToast(
          'Unwrap Request Submitted!',
          'Decryption pending. Finalize after gateway processes the request.',
          txHash
        );
        handleSuccess('unwrap');
      } else {
        showTxErrorToast(
          'Unwrap Failed',
          'Transaction was reverted on chain',
          txHash
        );
      }
    } catch (error: any) {
      console.error('Unwrap failed:', error);
      showTxErrorToast(
        'Unwrap Failed',
        error.reason || error.message || 'Failed to unwrap',
        txHash
      );
    } finally {
      setLoading(false);
      setActiveOperation(null);
    }
  };

  // Borrow from pool
  const borrowFromPool = async () => {
    if (!address || !signer || !fheReady) return;

    setLoading(true);
    setActiveOperation('borrow');

    let txHash: string | undefined;

    try {
      const weiAmount = parseEther(amount);

      console.log('Encrypting borrow amount...');
      const { handle, proof } = await encryptForPool(weiAmount, address as `0x${string}`);

      const signerInstance = await signer;
      const pool = new Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, signerInstance);

      const tx = await pool.borrow(handle, proof);
      txHash = tx.hash;

      showTxPendingToast(
        'Borrowing...',
        'Borrowing encrypted cWETH against your collateral',
        txHash
      );

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        showTxSuccessToast(
          'Borrow Successful!',
          'cWETH borrowed successfully. Amount fully encrypted!',
          txHash
        );
        handleSuccess('borrow');
      } else {
        showTxErrorToast(
          'Borrow Failed',
          'Transaction was reverted. Check your collateral.',
          txHash
        );
      }
    } catch (error: any) {
      console.error('Borrow failed:', error);
      showTxErrorToast(
        'Borrow Failed',
        error.reason || error.message || 'Failed to borrow. Check your collateral.',
        txHash
      );
    } finally {
      setLoading(false);
      setActiveOperation(null);
    }
  };

  // Repay borrowed amount
  const repayToPool = async () => {
    if (!address || !signer || !fheReady) return;

    setLoading(true);
    setActiveOperation('repay');

    let txHash: string | undefined;

    try {
      const weiAmount = parseEther(amount);

      console.log('Encrypting repay amount...');
      const { handle, proof } = await encryptForPool(weiAmount, address as `0x${string}`);

      const signerInstance = await signer;
      const pool = new Contract(LENDING_POOL_ADDRESS, LENDING_POOL_ABI, signerInstance);

      const tx = await pool.repay(handle, proof);
      txHash = tx.hash;

      showTxPendingToast(
        'Repaying...',
        'Repaying encrypted cWETH to the pool',
        txHash
      );

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        showTxSuccessToast(
          'Repay Successful!',
          'Loan repaid successfully. Balance updated.',
          txHash
        );
        handleSuccess('repay');
      } else {
        showTxErrorToast(
          'Repay Failed',
          'Transaction was reverted on chain',
          txHash
        );
      }
    } catch (error: any) {
      console.error('Repay failed:', error);
      showTxErrorToast(
        'Repay Failed',
        error.reason || error.message || 'Failed to repay',
        txHash
      );
    } finally {
      setLoading(false);
      setActiveOperation(null);
    }
  };

  const renderStepButton = (
    step: number,
    label: string,
    onClick: () => void,
    operation: OperationType,
    loadingLabel: string,
    variant: 'outline' | 'default' = 'outline',
    colorClass: string = 'bg-primary/20 text-primary'
  ) => (
    <Button
      onClick={onClick}
      variant={variant}
      className={`w-full h-10 justify-start gap-2 ${variant === 'default' ? 'h-12 text-base font-semibold bg-gradient-primary hover:opacity-90' : ''}`}
      disabled={!address || loading || (!fheReady && operation !== 'wrap' && operation !== 'approve')}
    >
      <span className={`w-5 h-5 rounded-full ${variant === 'default' ? 'bg-white/20 text-white' : colorClass} text-xs flex items-center justify-center`}>
        {loading && activeOperation === operation ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : txSuccess === operation ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : (
          step
        )}
      </span>
      {loading && activeOperation === operation ? loadingLabel : label}
    </Button>
  );

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-card overflow-hidden">
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="w-full grid grid-cols-4 rounded-none border-b border-border bg-muted/30">
          <TabsTrigger value="deposit" className="rounded-none data-[state=active]:bg-primary-light data-[state=active]:text-primary">
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="rounded-none data-[state=active]:bg-accent-light data-[state=active]:text-accent">
            <ArrowUpFromLine className="w-4 h-4 mr-2" />
            Withdraw
          </TabsTrigger>
          <TabsTrigger value="borrow" className="rounded-none data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600">
            <Landmark className="w-4 h-4 mr-2" />
            Borrow
          </TabsTrigger>
          <TabsTrigger value="repay" className="rounded-none data-[state=active]:bg-green-100 data-[state=active]:text-green-600">
            <RotateCcw className="w-4 h-4 mr-2" />
            Repay
          </TabsTrigger>
        </TabsList>

        {/* DEPOSIT TAB */}
        <TabsContent value="deposit" className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Amount (ETH)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl font-semibold h-16 pr-20 bg-input/50"
                  disabled={loading}
                  step="0.001"
                  min="0"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  ETH
                </div>
              </div>
              {ethBalance && (
                <p className="text-xs text-muted-foreground mt-1">
                  Balance: {parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH
                </p>
              )}
            </div>

            <div className="bg-accent-light/50 border border-accent/20 rounded-lg p-4">
              <div className="flex gap-2 mb-2">
                <Shield className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground/80">
                  <p className="font-medium mb-1">Full Privacy with ERC7984</p>
                  <p className="text-xs text-muted-foreground">
                    ETH is wrapped to cWETH (encrypted). All transfers use encrypted amounts - no leakage!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {['0.01', '0.05', '0.1', '0.5'].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(amt)}
                  className="hover:bg-primary-light hover:text-primary hover:border-primary"
                  disabled={loading}
                >
                  {amt}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Step-by-step deposit:</p>
              {renderStepButton(1, 'Approve Pool as Operator', approvePool, 'approve', 'Approving...')}
              {renderStepButton(2, 'Deposit cWETH to Pool', depositToPool, 'deposit', 'Depositing...', 'default')}
              <p className="text-xs text-muted-foreground mt-2">
                Need cWETH? Use the "Wrap ETH" button in the navigation bar first.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* WITHDRAW TAB */}
        <TabsContent value="withdraw" className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Amount (ETH equivalent)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl font-semibold h-16 pr-20 bg-input/50"
                  disabled={loading}
                  step="0.001"
                  min="0"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  cWETH
                </div>
              </div>
            </div>

            <div className="bg-primary-light/50 border border-primary/20 rounded-lg p-4">
              <div className="flex gap-2 mb-2">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground/80">
                  <p className="font-medium mb-1">Private Withdrawal</p>
                  <p className="text-xs text-muted-foreground">
                    Withdrawal amounts stay encrypted. Unwrapping requires async gateway decryption.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {['0.01', '0.05', '0.1', '0.5'].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(amt)}
                  className="hover:bg-accent-light hover:text-accent hover:border-accent"
                  disabled={loading}
                >
                  {amt}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Step-by-step withdrawal:</p>
              {renderStepButton(1, 'Withdraw cWETH from Pool', withdrawFromPool, 'withdraw', 'Withdrawing...', 'outline', 'bg-accent/20 text-accent')}
              <Button
                onClick={unwrapCWETH}
                className="w-full h-12 text-base font-semibold bg-gradient-accent hover:opacity-90 transition-opacity shadow-soft justify-start gap-2"
                disabled={!address || loading || !fheReady}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center">
                  {loading && activeOperation === 'unwrap' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    2
                  )}
                </span>
                {loading && activeOperation === 'unwrap' ? 'Requesting Unwrap...' : 'Unwrap cWETH → ETH'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* BORROW TAB */}
        <TabsContent value="borrow" className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Borrow Amount (cWETH)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl font-semibold h-16 pr-20 bg-input/50"
                  disabled={loading}
                  step="0.001"
                  min="0"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  cWETH
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground/80">
                  <p className="font-medium mb-1">Collateral Required: 150%</p>
                  <p className="text-xs text-muted-foreground">
                    To borrow 1 cWETH, you need at least 1.5 cWETH deposited as collateral.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Collateral Ratio</span>
                <span className="text-sm font-medium">150%</span>
              </div>
              <Progress value={66} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Your collateral ratio is checked on encrypted values
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {['0.01', '0.02', '0.05', '0.1'].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(amt)}
                  className="hover:bg-orange-100 hover:text-orange-600 hover:border-orange-300"
                  disabled={loading}
                >
                  {amt}
                </Button>
              ))}
            </div>

            <Button
              onClick={borrowFromPool}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 transition-opacity shadow-soft"
              disabled={!address || loading || !fheReady}
            >
              {loading && activeOperation === 'borrow' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Borrowing...
                </>
              ) : !fheReady ? (
                'Initializing FHE...'
              ) : (
                <>
                  <Landmark className="w-4 h-4 mr-2" />
                  Borrow cWETH
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You must have deposited collateral before borrowing
            </p>
          </div>
        </TabsContent>

        {/* REPAY TAB */}
        <TabsContent value="repay" className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Repay Amount (cWETH)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl font-semibold h-16 pr-20 bg-input/50"
                  disabled={loading}
                  step="0.001"
                  min="0"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  cWETH
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground/80">
                  <p className="font-medium mb-1">Repay Your Loan</p>
                  <p className="text-xs text-muted-foreground">
                    Repaying reduces your borrowed amount and increases available collateral.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {['0.01', '0.02', '0.05', '0.1'].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(amt)}
                  className="hover:bg-green-100 hover:text-green-600 hover:border-green-300"
                  disabled={loading}
                >
                  {amt}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Before repaying:</p>
              {renderStepButton(1, 'Approve Pool (if needed)', approvePool, 'approve', 'Approving...', 'outline', 'bg-green-100 text-green-600')}
              <p className="text-xs text-muted-foreground">
                Need cWETH? Use the "Wrap ETH" button in the navigation bar.
              </p>
            </div>

            <Button
              onClick={repayToPool}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 transition-opacity shadow-soft"
              disabled={!address || loading || !fheReady}
            >
              {loading && activeOperation === 'repay' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Repaying...
                </>
              ) : !fheReady ? (
                'Initializing FHE...'
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Repay Loan
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default DepositWithdraw;
