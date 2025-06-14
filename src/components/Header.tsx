
import { PenLine } from 'lucide-react';

const Header = () => {
  return (
    <header className="py-4 px-6 border-b border-border flex items-center gap-3">
      <PenLine className="w-6 h-6 text-primary" />
      <h1 className="text-xl font-semibold text-primary">Mermaid Chart Editor</h1>
    </header>
  );
};

export default Header;
