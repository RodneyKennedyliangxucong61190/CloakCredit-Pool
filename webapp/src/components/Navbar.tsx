import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-card/80 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CloakCredit-Pool
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
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
