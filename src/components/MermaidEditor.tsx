
import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { saveAsPng } from 'save-svg-as-png';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Download, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const defaultCode = `graph TD
    A[Start] --> B{Is it?};
    B -- Yes --> C[OK];
    C --> D[End];
    B -- No --> E[Find out];
    E --> B;
`;

const MermaidEditor = () => {
  const [code, setCode] = useState<string>(defaultCode);
  const [error, setError] = useState<string | null>(null);
  const debouncedCode = useDebounce(code, 500);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base', // Use 'base' to apply custom theme variables
      securityLevel: 'loose',
      themeVariables: {
        background: '#1c2128',
        primaryColor: '#2d333b',
        primaryTextColor: '#cdd9e5',
        lineColor: '#444c56',
        textColor: '#cdd9e5',
      },
    });
  }, []);

  const renderDiagram = async () => {
    if (!previewRef.current) return;
    setIsRendering(true);
    setError(null);
    try {
      // Use a timestamp to ensure a unique ID for each render
      const id = `mermaid-diagram-${Date.now()}`;
      const { svg } = await mermaid.render(id, debouncedCode);
      previewRef.current.innerHTML = svg;
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
      previewRef.current.innerHTML = '';
    } finally {
        setIsRendering(false);
    }
  };

  useEffect(() => {
    if (debouncedCode) {
      renderDiagram();
    }
  }, [debouncedCode]);

  const handleExport = () => {
    if (previewRef.current?.querySelector('svg')) {
      saveAsPng(previewRef.current.querySelector('svg')!, 'diagram.png', {
        backgroundColor: '#1c2128',
        scale: 2,
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="p-4 border-b border-border flex items-center justify-end gap-2">
        <Button onClick={renderDiagram} disabled={isRendering}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRendering ? 'animate-spin' : ''}`} />
            Render
        </Button>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export as PNG
        </Button>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border-none">
        <ResizablePanel defaultSize={40}>
          <div className="flex h-full items-center justify-center p-0">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full resize-none border-0 rounded-none bg-background p-4 font-mono focus-visible:ring-0"
              placeholder="Enter Mermaid code here..."
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <div className="flex h-full items-center justify-center p-4 bg-muted/20 overflow-auto">
            {error && (
              <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Rendering Error</AlertTitle>
                <AlertDescription>
                    <pre className="text-xs whitespace-pre-wrap font-mono">{error}</pre>
                </AlertDescription>
              </Alert>
            )}
            <div ref={previewRef} className="w-full h-full flex items-center justify-center" />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MermaidEditor;
