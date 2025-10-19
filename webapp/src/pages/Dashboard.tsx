import { useAccount } from 'wagmi';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <Navbar />
        <div className="container mx-auto px-6 pt-32">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to view your dashboard
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your lending activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-border/50 hover:shadow-card transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-green-500 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                12.5%
              </span>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Total Deposited</h3>
            <p className="text-2xl font-bold">Encrypted</p>
            <p className="text-xs text-muted-foreground mt-2">Protected by FHE</p>
          </Card>

          <Card className="p-6 border-border/50 hover:shadow-card transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-accent/10 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs text-green-500 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                8.2%
              </span>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Total Borrowed</h3>
            <p className="text-2xl font-bold">Encrypted</p>
            <p className="text-xs text-muted-foreground mt-2">Private balance</p>
          </Card>

          <Card className="p-6 border-border/50 hover:shadow-card transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">APY</span>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Lending Rate</h3>
            <p className="text-2xl font-bold">5.00%</p>
            <p className="text-xs text-muted-foreground mt-2">Current APY</p>
          </Card>

          <Card className="p-6 border-border/50 hover:shadow-card transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-accent/10 p-2 rounded-lg">
                <ArrowDownRight className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground">APY</span>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Borrow Rate</h3>
            <p className="text-2xl font-bold">8.00%</p>
            <p className="text-xs text-muted-foreground mt-2">Current APY</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Health Factor</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Collateral Ratio</span>
                  <span className="text-sm font-medium">Encrypted</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Healthy</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Deposit</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <span className="text-sm font-medium">Encrypted</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <ArrowDownRight className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Borrow</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <span className="text-sm font-medium">Encrypted</span>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  View All Transactions
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
