import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Github, ArrowRightLeft, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Contract } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CWETH_ADDRESS, CWETH_ABI } from '@/config/contracts';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';

// Sepolia block explorer
const EXPLORER_URL = 'https://sepolia.etherscan.io';
const getExplorerLink = (hash: string) => `${EXPLORER_URL}/tx/${hash}`;

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const [wrapAmount, setWrapAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: ethBalance, refetch: refetchBalance } = useBalance({
    address: address,
  });

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

  const handleWrap = async () => {
    if (!wrapAmount || parseFloat(wrapAmount) <= 0 || !signer) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to wrap',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    let txHash: string | undefined;

    try {
      const weiAmount = parseEther(wrapAmount);
      const signerInstance = await signer;
      const cweth = new Contract(CWETH_ADDRESS, CWETH_ABI, signerInstance);

      const tx = await cweth.deposit({ value: weiAmount });
      txHash = tx.hash;

      showTxPendingToast(
        'Wrapping ETH...',
        `Converting ${wrapAmount} ETH to encrypted cWETH`,
        txHash
      );

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        showTxSuccessToast(
          'Wrap Successful!',
          `Successfully wrapped ${wrapAmount} ETH to cWETH`,
          txHash
        );
        setWrapAmount('');
        setIsOpen(false);
        refetchBalance();
      } else {
        showTxErrorToast(
          'Wrap Failed',
          'Transaction was reverted on chain',
          txHash
        );
      }
    } catch (error: any) {
      console.error('Wrap failed:', error);
      showTxErrorToast(
        'Wrap Failed',
        error.reason || error.message || 'Failed to wrap ETH',
        txHash
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setMaxAmount = () => {
    if (ethBalance) {
      // Leave some ETH for gas
      const maxAmount = parseFloat(formatEther(ethBalance.value)) - 0.01;
      setWrapAmount(maxAmount > 0 ? maxAmount.toFixed(6) : '0');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-card/80 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="ShadowLend Logo" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ShadowLend
              </h1>
              <p className="text-xs text-muted-foreground">Privacy-Preserving Lending</p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <Link to="/markets" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Markets
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/docs" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Docs
              </Link>
              <a
                href="https://github.com/RodneyKennedyliangxucong61190/CloakCredit-Pool"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>

            {/* Wrap ETH Button */}
            {isConnected && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Wrap ETH</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ArrowRightLeft className="w-5 h-5 text-primary" />
                      Wrap ETH to cWETH
                    </DialogTitle>
                    <DialogDescription>
                      Convert your ETH to Confidential WETH (cWETH) to use in the lending pool.
                      Your cWETH balance is encrypted for privacy.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Your ETH Balance</span>
                        <span className="text-sm font-medium">
                          {ethBalance ? parseFloat(formatEther(ethBalance.value)).toFixed(4) : '0.0000'} ETH
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount to Wrap</label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.0"
                          value={wrapAmount}
                          onChange={(e) => setWrapAmount(e.target.value)}
                          className="pr-20"
                          disabled={isLoading}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                          onClick={setMaxAmount}
                          disabled={isLoading}
                        >
                          MAX
                        </Button>
                      </div>
                    </div>

                    <div className="bg-primary/10 rounded-lg p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">You will receive</span>
                        <span className="font-medium">{wrapAmount || '0'} cWETH</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Exchange rate</span>
                        <span className="font-medium">1 ETH = 1 cWETH</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleWrap}
                      disabled={isLoading || !wrapAmount || parseFloat(wrapAmount) <= 0}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Wrapping...
                        </>
                      ) : (
                        'Wrap ETH'
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      cWETH uses Zama's FHE technology for encrypted balances
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
