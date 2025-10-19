import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Shield, Lock, Code, BookOpen, Github, Rocket, Target, Zap, CheckCircle2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Docs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navbar />

      <div className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-muted-foreground text-lg">
            Learn how to use ShadowLend's privacy-preserving lending protocol
          </p>
        </div>

        <Card className="p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <PlayCircle className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Demo Video</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Watch how ShadowLend works - see encrypted deposits, withdrawals, and privacy-preserving transactions in action.
          </p>
          <div className="relative rounded-lg overflow-hidden bg-black/5">
            <video
              controls
              className="w-full rounded-lg"
              poster="/logo.svg"
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 hover:shadow-card transition-shadow cursor-pointer">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Quick start guide to deposit, borrow, and earn with full privacy
            </p>
            <Button variant="outline" size="sm">Read More</Button>
          </Card>

          <Card className="p-6 hover:shadow-card transition-shadow cursor-pointer">
            <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">FHE Technology</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Understanding Fully Homomorphic Encryption and privacy guarantees
            </p>
            <Button variant="outline" size="sm">Read More</Button>
          </Card>

          <Card className="p-6 hover:shadow-card transition-shadow cursor-pointer">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Contracts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Technical documentation for developers and auditors
            </p>
            <Button variant="outline" size="sm">Read More</Button>
          </Card>
        </div>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Privacy-Preserving Deposits</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                All deposit amounts are encrypted using Zama's FHE technology. Your balance remains private while being verifiable on-chain.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Encrypted Borrowing</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Borrow ETH with your collateral and borrow amounts completely encrypted. No one can see your financial positions.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Code className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Open Source</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                All smart contracts and frontend code are open source and available on GitHub for community review and contribution.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold">Roadmap</h2>
          </div>

          <div className="space-y-8">
            <div className="relative pl-8 border-l-2 border-primary/20">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">Phase 1: Foundation</h3>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Deploy FHE-enabled smart contracts on Sepolia testnet</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Implement encrypted deposit and withdrawal functionality</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Launch web interface with wallet integration</span>
                </li>
              </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-primary/20">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background"></div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">Phase 2: Enhanced Privacy</h3>
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Progress</Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Add support for multiple ERC-20 token collateral</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Implement encrypted interest rate calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Advanced liquidation mechanism with privacy protection</span>
                </li>
              </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-primary/20">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-muted border-4 border-background"></div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">Phase 3: Mainnet & Scale</h3>
                <Badge variant="outline">Planned</Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Security audit by leading blockchain security firms</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Deploy to Ethereum mainnet</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Cross-chain bridge integration for multi-chain support</span>
                </li>
              </ul>
            </div>

            <div className="relative pl-8">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-muted border-4 border-background"></div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">Phase 4: Ecosystem Growth</h3>
                <Badge variant="outline">Future</Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Governance token launch and DAO formation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Integration with major DeFi protocols</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Mobile app for iOS and Android</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Open Source</h2>
              <p className="text-muted-foreground">
                View our code, contribute, or report issues on GitHub
              </p>
            </div>
            <Github className="w-12 h-12 text-muted-foreground" />
          </div>
          
          <div className="flex gap-4 mt-6">
            <Button asChild>
              <a 
                href="https://github.com/RodneyKennedyliangxucong61190/CloakCredit-Pool" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a 
                href="https://github.com/RodneyKennedyliangxucong61190/CloakCredit-Pool/blob/main/contracts/FHELendingPool.sol" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Smart Contract
              </a>
            </Button>
          </div>
        </Card>

        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Contract Address</h2>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">Sepolia Testnet</p>
            <code className="text-sm font-mono break-all">
              0xd674264b7A3c6927581B0786995eb44B5F94F4fC
            </code>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://sepolia.etherscan.io/address/0xd674264b7A3c6927581B0786995eb44B5F94F4fC" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on Etherscan
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Docs;
