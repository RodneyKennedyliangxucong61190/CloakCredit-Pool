import { Card } from './ui/card';
import { Wallet, TrendingUp, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { LENDING_POOL_ADDRESS, LENDING_POOL_ABI, CWETH_ADDRESS } from '@/config/contracts';
import { formatEther } from 'viem';
import { useState, useCallback } from 'react';

const BalanceCard = () => {
  const { address, isConnected } = useAccount();
  const [showBalances, setShowBalances] = useState(false);

  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address: address,
  });

  const { data: poolStats, refetch: refetchStats } = useReadContract({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'getPoolStats',
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  const { data: isActive, refetch: refetchActive } = useReadContract({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'isUserActive',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 5000,
    },
  });

  const handleRefresh = useCallback(() => {
    refetchEth();
    refetchStats();
    refetchActive();
  }, [refetchEth, refetchStats, refetchActive]);

  const interestRate = poolStats ? Number(poolStats[1]) / 100 : 5;
  const collateralRatio = poolStats ? Number(poolStats[2]) : 150;

  return (
    <Card className="bg-gradient-primary text-primary-foreground shadow-glow border-0 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Your Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold">
              {isConnected && ethBalance
                ? parseFloat(formatEther(ethBalance.value)).toFixed(4)
                : '0.0000'}
            </span>
            <span className="text-xl opacity-90">ETH</span>
          </div>
          <p className="text-sm opacity-80">Wallet Balance</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xs opacity-80 mb-1">Pool Deposited</p>
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 opacity-70" />
              <p className="text-xl font-bold">
                {showBalances ? 'Encrypted' : '****'}
              </p>
            </div>
            <p className="text-xs opacity-60 mt-1">FHE Protected</p>
          </div>
          <div>
            <p className="text-xs opacity-80 mb-1">Pool Borrowed</p>
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 opacity-70" />
              <p className="text-xl font-bold">
                {showBalances ? 'Encrypted' : '****'}
              </p>
            </div>
            <p className="text-xs opacity-60 mt-1">Private Balance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs opacity-80 mb-1">Interest Rate</p>
            <p className="text-lg font-bold">{interestRate.toFixed(2)}%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs opacity-80 mb-1">Collateral Ratio</p>
            <p className="text-lg font-bold">{collateralRatio}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg p-3">
          <TrendingUp className="w-4 h-4" />
          <span className="opacity-90">
            Status: <span className="font-bold">{isActive ? 'Active' : 'Not Active'}</span>
          </span>
        </div>

        {!isConnected && (
          <div className="text-center text-sm opacity-80 py-2">
            Connect wallet to view your balance
          </div>
        )}
      </div>
    </Card>
  );
};

export default BalanceCard;
