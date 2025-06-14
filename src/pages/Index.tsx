
import Header from '@/components/Header';
import MermaidEditor from '@/components/MermaidEditor';
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <MermaidEditor />
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
