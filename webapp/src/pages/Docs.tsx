import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import {
  Shield, Lock, Code, BookOpen, Github, Rocket, Target, Zap,
  CheckCircle2, PlayCircle, Coins, ArrowRightLeft, Percent,
  AlertTriangle, FileCode, Database, Users, Eye, EyeOff,
  ArrowDown, ArrowUp, Wallet, Info, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Docs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navbar />

      <div className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Documentation v1.0
          </Badge>
          <h1 className="text-4xl font-bold mb-4">CloakCredit Pool Documentation</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Complete guide to using the privacy-preserving DeFi lending protocol powered by Zama's Fully Homomorphic Encryption (FHE)
          </p>
        </div>

        {/* Demo Video Section */}
        <Card className="p-8 mb-12 border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <PlayCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Demo Video</h2>
              <p className="text-sm text-muted-foreground">Watch CloakCredit Pool in action</p>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">
            See how encrypted deposits, withdrawals, borrowing, and repayments work with complete privacy protection.
            All transaction amounts remain encrypted on-chain.
          </p>
          <div className="relative rounded-xl overflow-hidden bg-black/5 border">
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

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="p-4 hover:shadow-card transition-all hover:border-primary/30 cursor-pointer">
            <a href="#overview" className="block">
              <BookOpen className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-sm">Overview</h3>
              <p className="text-xs text-muted-foreground">What is CloakCredit?</p>
            </a>
          </Card>
          <Card className="p-4 hover:shadow-card transition-all hover:border-primary/30 cursor-pointer">
            <a href="#how-it-works" className="block">
              <Coins className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-sm">How It Works</h3>
              <p className="text-xs text-muted-foreground">Deposit, Borrow, Repay</p>
            </a>
          </Card>
          <Card className="p-4 hover:shadow-card transition-all hover:border-primary/30 cursor-pointer">
            <a href="#smart-contracts" className="block">
              <FileCode className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-sm">Smart Contracts</h3>
              <p className="text-xs text-muted-foreground">Technical details</p>
            </a>
          </Card>
          <Card className="p-4 hover:shadow-card transition-all hover:border-primary/30 cursor-pointer">
            <a href="#fhe-technology" className="block">
              <Shield className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-sm">FHE Technology</h3>
              <p className="text-xs text-muted-foreground">Privacy explained</p>
            </a>
          </Card>
        </div>

        {/* Overview Section */}
        <Card className="p-8 mb-8" id="overview">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">What is CloakCredit Pool?</h2>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-4">
              CloakCredit Pool is a <strong className="text-foreground">privacy-preserving DeFi lending protocol</strong> built
              on Ethereum that uses <strong className="text-foreground">Fully Homomorphic Encryption (FHE)</strong> to protect
              all user financial data. Unlike traditional DeFi protocols where every transaction amount is publicly visible
              on the blockchain, CloakCredit encrypts all balances and transaction amounts.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold text-red-600">Traditional DeFi (Public)</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Everyone can see your deposit amounts</li>
                  <li>- Borrow amounts are publicly visible</li>
                  <li>- Your financial position is exposed</li>
                  <li>- Transaction history is trackable</li>
                </ul>
              </div>

              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <EyeOff className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-green-600">CloakCredit (Private)</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>- Deposit amounts are encrypted</li>
                  <li>- Borrow amounts are encrypted</li>
                  <li>- Only you can view your balances</li>
                  <li>- Transaction amounts hidden</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* How It Works Section */}
        <Card className="p-8 mb-8" id="how-it-works">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ArrowRightLeft className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">How It Works</h2>
          </div>

          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="deposit" className="text-xs sm:text-sm">
                <ArrowDown className="w-4 h-4 mr-1" />
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="text-xs sm:text-sm">
                <ArrowUp className="w-4 h-4 mr-1" />
                Withdraw
              </TabsTrigger>
              <TabsTrigger value="borrow" className="text-xs sm:text-sm">
                <Coins className="w-4 h-4 mr-1" />
                Borrow
              </TabsTrigger>
              <TabsTrigger value="repay" className="text-xs sm:text-sm">
                <Wallet className="w-4 h-4 mr-1" />
                Repay
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-4">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ArrowDown className="w-5 h-5 text-blue-500" />
                  Deposit Process
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold">Wrap ETH to cWETH</h4>
                      <p className="text-sm text-muted-foreground">
                        First, convert your ETH to Confidential WETH (cWETH) using the "Wrap ETH" button in the navigation bar.
                        The amount is immediately encrypted when wrapped.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold">Approve Pool as Operator</h4>
                      <p className="text-sm text-muted-foreground">
                        Allow the lending pool to transfer your cWETH. This is a one-time approval that enables the pool
                        to accept your encrypted deposits.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold">Deposit to Pool</h4>
                      <p className="text-sm text-muted-foreground">
                        Enter the amount you want to deposit. The frontend encrypts this amount using FHE before sending
                        to the blockchain. Your deposit balance is stored encrypted on-chain.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-blue-600 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <strong>Privacy:</strong> Your deposit amount is never visible on-chain in plaintext
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4">
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ArrowUp className="w-5 h-5 text-orange-500" />
                  Withdraw Process
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold">Enter Withdrawal Amount</h4>
                      <p className="text-sm text-muted-foreground">
                        Specify how much cWETH you want to withdraw from the pool. The amount is encrypted before
                        being sent to the smart contract.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold">Encrypted Balance Check</h4>
                      <p className="text-sm text-muted-foreground">
                        The smart contract performs an encrypted subtraction on your balance. If you don't have enough
                        deposited, the transaction will fail - but no one learns your actual balance.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold">Receive cWETH</h4>
                      <p className="text-sm text-muted-foreground">
                        cWETH is transferred back to your wallet. You can then unwrap it to ETH if needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="borrow" className="space-y-4">
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-purple-500" />
                  Borrow Process
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold">Ensure Sufficient Collateral</h4>
                      <p className="text-sm text-muted-foreground">
                        You must have deposited cWETH as collateral. The protocol requires <strong>150% collateral ratio</strong>,
                        meaning to borrow 1 cWETH, you need at least 1.5 cWETH deposited.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold">Encrypted Collateral Check</h4>
                      <p className="text-sm text-muted-foreground">
                        The smart contract calculates your available collateral using encrypted arithmetic.
                        Available = Deposited - Already Borrowed. All calculations happen on encrypted values.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold">Receive Borrowed cWETH</h4>
                      <p className="text-sm text-muted-foreground">
                        If collateral check passes, cWETH is transferred to your wallet. Your encrypted borrow balance
                        is updated accordingly.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
                  <p className="text-sm text-purple-600 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    <strong>Interest Rate:</strong> 5% APY on borrowed amounts
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="repay" className="space-y-4">
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-500" />
                  Repay Process
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold">Have cWETH Ready</h4>
                      <p className="text-sm text-muted-foreground">
                        Ensure you have enough cWETH in your wallet to repay. If needed, wrap more ETH to cWETH
                        using the "Wrap ETH" button.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold">Enter Repayment Amount</h4>
                      <p className="text-sm text-muted-foreground">
                        Specify how much you want to repay. The amount is encrypted and sent to the pool.
                        Your encrypted borrow balance is reduced by this amount.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold">Collateral Released</h4>
                      <p className="text-sm text-muted-foreground">
                        As you repay, your available collateral increases, allowing you to withdraw more of your
                        deposited funds or borrow again.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Protocol Parameters */}
        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent/10 p-2 rounded-lg">
              <Database className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold">Protocol Parameters</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Percent className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">150%</p>
              <p className="text-sm text-muted-foreground">Collateral Ratio</p>
              <p className="text-xs text-muted-foreground mt-1">Required to borrow</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Coins className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">5%</p>
              <p className="text-sm text-muted-foreground">Interest Rate (APY)</p>
              <p className="text-xs text-muted-foreground mt-1">On borrowed amounts</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Lock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">1:1</p>
              <p className="text-sm text-muted-foreground">ETH : cWETH Rate</p>
              <p className="text-xs text-muted-foreground mt-1">Fixed exchange rate</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-600">Collateral Requirement</h4>
                <p className="text-sm text-muted-foreground">
                  To borrow 1 cWETH, you need at least 1.5 cWETH deposited as collateral.
                  Example: With 3 cWETH deposited, you can borrow up to 2 cWETH.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* FHE Technology Section */}
        <Card className="p-8 mb-8" id="fhe-technology">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">FHE Technology Explained</h2>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-6">
              <strong className="text-foreground">Fully Homomorphic Encryption (FHE)</strong> is a cryptographic technique
              that allows computations to be performed directly on encrypted data without ever decrypting it.
              CloakCredit Pool uses <a href="https://docs.zama.ai/fhevm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Zama's fhEVM</a> implementation.
            </p>

            <div className="bg-muted/30 rounded-lg p-6 mb-6">
              <h4 className="font-semibold mb-4">How FHE Works in CloakCredit:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1 rounded">
                    <span className="text-sm font-mono">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Encryption:</strong> When you deposit, your amount is encrypted into an <code className="bg-muted px-1 rounded">euint64</code>
                    (encrypted unsigned 64-bit integer) using FHE.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1 rounded">
                    <span className="text-sm font-mono">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Computation:</strong> The smart contract performs arithmetic (add, subtract, compare) on encrypted values.
                    For example, <code className="bg-muted px-1 rounded">FHE.add(balance, amount)</code> adds two encrypted numbers.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1 rounded">
                    <span className="text-sm font-mono">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Access Control:</strong> Only the owner of an encrypted value can request decryption.
                    The contract grants access using <code className="bg-muted px-1 rounded">FHE.allow()</code>.
                  </p>
                </div>
              </div>
            </div>

            <h4 className="font-semibold mb-3">Privacy Guarantees:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Encrypted On-Chain Storage</p>
                  <p className="text-xs text-muted-foreground">All balances stored as encrypted ciphertexts</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">No Amount in Events</p>
                  <p className="text-xs text-muted-foreground">Transaction events don't leak amounts</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Encrypted Inputs</p>
                  <p className="text-xs text-muted-foreground">Function parameters are encrypted</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Owner-Only Decryption</p>
                  <p className="text-xs text-muted-foreground">Only you can view your balances</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Smart Contracts Section */}
        <Card className="p-8 mb-8" id="smart-contracts">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FileCode className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Smart Contracts</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="cweth">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-semibold">ConfidentialWETH (cWETH)</span>
                    <Badge className="ml-2 text-xs">ERC7984</Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-8 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    An ERC7984 (ConfidentialERC20) token that wraps ETH with encrypted balances.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-2">
                    <p><span className="text-green-500">// Deposit ETH, receive encrypted cWETH</span></p>
                    <p>function <span className="text-blue-500">deposit</span>() external payable;</p>
                    <p className="mt-2"><span className="text-green-500">// Transfer with encrypted amount</span></p>
                    <p>function <span className="text-blue-500">confidentialTransfer</span>(address to, euint64 amount);</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Address:</strong>{' '}
                      <code className="text-primary">0x8671241CAC29118F883a660aD94586F12cDBF6D6</code>
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pool">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-semibold">FHELendingPool</span>
                    <Badge className="ml-2 text-xs">Main Pool</Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-8 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    The main lending pool contract supporting encrypted deposits, withdrawals, borrows, and repayments.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-2">
                    <p><span className="text-green-500">// Core functions</span></p>
                    <p>function <span className="text-blue-500">deposit</span>(externalEuint64 amount, bytes proof);</p>
                    <p>function <span className="text-blue-500">withdraw</span>(externalEuint64 amount, bytes proof);</p>
                    <p>function <span className="text-blue-500">borrow</span>(externalEuint64 amount, bytes proof);</p>
                    <p>function <span className="text-blue-500">repay</span>(externalEuint64 amount, bytes proof);</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Address:</strong>{' '}
                      <code className="text-primary">0xEBaf219D0bb14C243d29A3a8cCdF252482cE92E8</code>
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="useraccount">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-semibold">UserAccount Structure</span>
                    <Badge variant="outline" className="ml-2 text-xs">Data Model</Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-8 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Each user's account data stored with encrypted balances.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-2">
                    <p><span className="text-purple-500">struct</span> UserAccount {'{'}</p>
                    <p className="pl-4">euint64 encryptedDeposited;  <span className="text-green-500">// FHE encrypted</span></p>
                    <p className="pl-4">euint64 encryptedBorrowed;   <span className="text-green-500">// FHE encrypted</span></p>
                    <p className="pl-4">uint256 lastUpdate;          <span className="text-green-500">// Timestamp</span></p>
                    <p className="pl-4">bool isActive;               <span className="text-green-500">// Status</span></p>
                    <p>{'}'}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* FAQ Section */}
        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent/10 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>What is the difference between ETH and cWETH?</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  cWETH (Confidential Wrapped ETH) is a privacy-preserving version of wrapped ETH. When you wrap ETH to cWETH,
                  your balance becomes encrypted using FHE. The exchange rate is always 1:1 - one ETH equals one cWETH.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2">
              <AccordionTrigger>Why do I need to approve the pool as an operator?</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  The ERC7984 token standard uses an operator pattern for transfers. By approving the pool as an operator,
                  you allow it to transfer cWETH on your behalf during deposits and repayments. This is a one-time approval.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3">
              <AccordionTrigger>How is the 150% collateral ratio calculated?</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  To borrow X amount, you need at least 1.5X deposited as collateral. For example:
                  <br />- To borrow 1 cWETH, you need 1.5 cWETH deposited
                  <br />- To borrow 2 cWETH, you need 3 cWETH deposited
                  <br />- With 6 cWETH deposited, you can borrow up to 4 cWETH
                  <br />
                  <br />The calculation is: Max Borrow = Deposited ÷ 1.5
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4">
              <AccordionTrigger>Can others see my transaction amounts?</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  No. All transaction amounts are encrypted before being sent to the blockchain. The smart contract events
                  do not include any amount data. Only you can decrypt and view your own balances.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5">
              <AccordionTrigger>Is this deployed on mainnet?</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Currently, CloakCredit Pool is deployed on Ethereum Sepolia testnet for testing and demonstration purposes.
                  Mainnet deployment is planned after security audits. Do not use real funds - use testnet ETH only.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Roadmap Section */}
        <Card className="p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
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
                  <span>Deploy ConfidentialWETH (ERC7984) token</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Deploy FHELendingPool with encrypted operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>React frontend with wallet integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Transaction notifications with explorer links</span>
                </li>
              </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-primary/20">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background"></div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">Phase 2: Enhanced Features</h3>
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Progress</Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Multi-asset support (USDC, DAI)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Encrypted interest calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Liquidation mechanism with privacy</span>
                </li>
              </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-primary/20">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-muted border-4 border-background"></div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">Phase 3: Production</h3>
                <Badge variant="outline">Planned</Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Professional security audit</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Ethereum mainnet deployment</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Cross-chain bridges</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Contract Addresses */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Contract Addresses</h2>
          <p className="text-sm text-muted-foreground mb-4">Deployed on Ethereum Sepolia Testnet</p>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">ConfidentialWETH (cWETH)</p>
              <code className="text-sm font-mono text-primary break-all">
                0x8671241CAC29118F883a660aD94586F12cDBF6D6
              </code>
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://sepolia.etherscan.io/address/0x8671241CAC29118F883a660aD94586F12cDBF6D6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Etherscan
                  </a>
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">FHELendingPool</p>
              <code className="text-sm font-mono text-primary break-all">
                0xEBaf219D0bb14C243d29A3a8cCdF252482cE92E8
              </code>
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://sepolia.etherscan.io/address/0xEBaf219D0bb14C243d29A3a8cCdF252482cE92E8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Etherscan
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* GitHub CTA */}
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

          <div className="flex flex-wrap gap-4 mt-6">
            <Button asChild>
              <a
                href="https://github.com/RodneyKennedyliangxucong61190/CloakCredit-Pool"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                View Repository
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/RodneyKennedyliangxucong61190/CloakCredit-Pool/blob/main/contracts/FHELendingPool.sol"
                target="_blank"
                rel="noopener noreferrer"
              >
                View FHELendingPool.sol
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/RodneyKennedyliangxucong61190/CloakCredit-Pool/blob/main/contracts/ConfidentialWETH.sol"
                target="_blank"
                rel="noopener noreferrer"
              >
                View ConfidentialWETH.sol
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Docs;
