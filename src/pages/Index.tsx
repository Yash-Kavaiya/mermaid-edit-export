
import Header from '@/components/Header';
import MermaidEditor from '@/components/MermaidEditor';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <MermaidEditor />
      </main>
    </div>
  );
};

export default Index;
