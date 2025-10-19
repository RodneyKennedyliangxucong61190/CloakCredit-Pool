import { Card } from './ui/card';
import { Wallet, TrendingUp, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { useAccount, useReadContract, useBalance } from 'wagmi';
import { LENDING_POOL_ADDRESS, LENDING_POOL_ABI } from '@/config/contracts';
import { formatEther } from 'viem';

const BalanceCard = () => {
  const { address, isConnected } = useAccount();
  
  const { data: ethBalance } = useBalance({
    address: address,
  });

  const { data: accountData } = useReadContract({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'getAccount',
    args: [address],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 5000, // Refresh every 5 seconds
    },
  });

  const deposited = accountData ? formatEther(accountData[0] as bigint) : '0';
  const borrowed = accountData ? formatEther(accountData[1] as bigint) : '0';
  const availableToBorrow = accountData ? formatEther(accountData[2] as bigint) : '0';
  const healthFactor = accountData ? Number(accountData[3]) / 100 : 0;

  return (
    <Card className="bg-gradient-primary text-primary-foreground shadow-glow border-0 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Your Balance</span>
          </div>
          <Lock className="w-4 h-4 opacity-70" />
        </div>

        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold">
              {isConnected && ethBalance 
                ? parseFloat(formatEther(ethBalance.value)).toFixed(4)
                : '0.00'}
            </span>
            <span className="text-xl opacity-90">ETH</span>
          </div>
          <p className="text-sm opacity-80">Wallet Balance</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xs opacity-80 mb-1">Deposited</p>
            <p className="text-xl font-bold">{parseFloat(deposited).toFixed(4)} ETH</p>
          </div>
          <div>
            <p className="text-xs opacity-80 mb-1">Borrowed</p>
            <p className="text-xl font-bold">{parseFloat(borrowed).toFixed(4)} ETH</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs opacity-80 mb-1">Available to Borrow</p>
            <p className="text-lg font-bold">{parseFloat(availableToBorrow).toFixed(4)} ETH</p>
          </div>
          <div>
            <p className="text-xs opacity-80 mb-1">Health Factor</p>
            <p className="text-lg font-bold">
              {healthFactor === 0 ? '∞' : healthFactor.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg p-3">
          <TrendingUp className="w-4 h-4" />
          <span className="opacity-90">Interest Rate: <span className="font-bold">5.0%</span></span>
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
