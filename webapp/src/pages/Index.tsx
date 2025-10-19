import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import DepositWithdraw from '@/components/DepositWithdraw';
import BalanceCard from '@/components/BalanceCard';
import { DollarSign, Users, TrendingUp, Lock } from 'lucide-react';
import { useReadContract } from 'wagmi';
import { LENDING_POOL_ADDRESS, LENDING_POOL_ABI } from '@/config/contracts';
import { formatEther } from 'viem';

const Index = () => {
  const { data: poolStats } = useReadContract({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'getPoolStats',
    query: {
      refetchInterval: 5000, // Refresh every 5 seconds
    },
  });

  const { data: userCount } = useReadContract({
    address: LENDING_POOL_ADDRESS as `0x${string}`,
    abi: LENDING_POOL_ABI,
    functionName: 'getUserCount',
    query: {
      refetchInterval: 10000,
    },
  });

  const totalValueLocked = poolStats ? formatEther(poolStats[0] as bigint) : '0';
  const totalBorrowed = poolStats ? formatEther(poolStats[1] as bigint) : '0';
  const availableLiquidity = poolStats ? formatEther(poolStats[2] as bigint) : '0';
  const utilizationRate = poolStats ? Number(poolStats[3]) : 0;
  const activeUsers = userCount ? Number(userCount) : 0;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Where Shadows Protect Your Wealth
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Lend, borrow, and earn - all with cryptographic privacy powered by Zama's FHE technology
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard
            icon={DollarSign}
            title="Total Value Locked"
            value={`${parseFloat(totalValueLocked).toFixed(2)} ETH`}
            change={`${utilizationRate}% utilized`}
            gradient
          />
          <StatsCard
            icon={Users}
            title="Active Users"
            value={activeUsers.toString()}
            change="Live on Sepolia"
          />
          <StatsCard
            icon={TrendingUp}
            title="Total Borrowed"
            value={`${parseFloat(totalBorrowed).toFixed(2)} ETH`}
            change={`${parseFloat(availableLiquidity).toFixed(2)} ETH available`}
          />
          <StatsCard
            icon={Lock}
            title="Collateral Ratio"
            value="150%"
            change="Required minimum"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DepositWithdraw />
          </div>
          <div>
            <BalanceCard />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Over-Collateralized</h3>
            <p className="text-sm text-muted-foreground">
              150% collateral ratio ensures pool solvency and protects all depositors
            </p>
          </div>

          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Fixed Interest Rate</h3>
            <p className="text-sm text-muted-foreground">
              Predictable 5% interest rate on all borrows, transparent fee structure
            </p>
          </div>

          <div className="text-center p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Instant Liquidity</h3>
            <p className="text-sm text-muted-foreground">
              Deposit and withdraw anytime with instant settlement and no lockup periods
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
