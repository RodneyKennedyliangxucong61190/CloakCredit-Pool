import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-card/80 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PrivacyLend
              </h1>
              <p className="text-xs text-muted-foreground">Decentralized Privacy Lending</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <a href="#markets" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Markets
              </a>
              <a href="#dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="#docs" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Docs
              </a>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
