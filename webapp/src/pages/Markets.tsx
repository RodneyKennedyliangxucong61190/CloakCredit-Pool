import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Markets = () => {
  const markets = [
    {
      asset: 'ETH',
      totalSupply: 'Encrypted',
      totalBorrow: 'Encrypted',
      supplyAPY: '5.00%',
      borrowAPY: '8.00%',
      utilization: '65%'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Markets</h1>
          <p className="text-muted-foreground">Explore lending markets with full privacy protection</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Privacy First</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              All deposit and borrow amounts are encrypted using Zama's FHE technology
            </p>
          </Card>

          <Card className="p-6 border-accent/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-accent/10 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold">Secure Lending</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Smart contract security with on-chain privacy guarantees
            </p>
          </Card>

          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Competitive Rates</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Dynamic interest rates optimized for both lenders and borrowers
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Asset</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total Supply</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total Borrow</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Supply APY</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Borrow APY</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Utilization</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market, index) => (
                  <tr key={index} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                          {market.asset}
                        </div>
                        <div>
                          <p className="font-medium">{market.asset}</p>
                          <p className="text-xs text-muted-foreground">Ethereum</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="font-medium">{market.totalSupply}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3 text-accent" />
                        <span className="font-medium">{market.totalBorrow}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-green-500 border-green-500/20">
                        {market.supplyAPY}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-blue-500 border-blue-500/20">
                        {market.borrowAPY}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                          <div 
                            className="bg-primary rounded-full h-2" 
                            style={{ width: market.utilization }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{market.utilization}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm">Deposit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-8">
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <h3 className="text-lg font-semibold mb-2">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-medium mb-2">Deposit Assets</h4>
                <p className="text-sm text-muted-foreground">
                  Your deposit amount is encrypted using FHE before being recorded on-chain
                </p>
              </div>
              <div>
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-medium mb-2">Earn Interest</h4>
                <p className="text-sm text-muted-foreground">
                  Start earning competitive APY while maintaining complete privacy
                </p>
              </div>
              <div>
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-medium mb-2">Withdraw Anytime</h4>
                <p className="text-sm text-muted-foreground">
                  Access your funds whenever you need them with full privacy protection
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Markets;
