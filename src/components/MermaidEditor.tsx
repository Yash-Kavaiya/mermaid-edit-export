import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Download, AlertCircle, RefreshCw, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';

const defaultCode = `graph TD
    A(Start) --> B{Is it?};
    B -- Yes --> C(OK);
    C --> D(End);
    B -- No --> E(Find out);
    E --> B;
`;

const svgStringToPngBlob = (svgString: string, scale = 2): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Failed to get canvas context.'));
      }

      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      }, 'image/png');
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      console.error("Image loading error:", error);
      reject(new Error('Failed to load SVG image for conversion.'));
    };

    img.src = url;
  });
};

const MermaidEditor = () => {
  const [code, setCode] = useState<string>(defaultCode);
  const [error, setError] = useState<string | null>(null);
  const debouncedCode = useDebounce(code, 500);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const { toast } = useToast();
  const [svgString, setSvgString] = useState('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      flowchart: {
        curve: 'cardinal',
      },
      themeVariables: {
        background: 'transparent',
        primaryColor: '#e0f2fe',
        primaryTextColor: '#0c4a6e',
        primaryBorderColor: '#0ea5e9',
        lineColor: '#0ea5e9',
        textColor: '#0c4a6e',
        arrowheadColor: '#0ea5e9',
      },
    });
  }, []);

  const renderDiagram = async () => {
    if (!previewRef.current) return;
    setIsRendering(true);
    setError(null);
    setSvgString('');
    try {
      // Use a timestamp to ensure a unique ID for each render
      const id = `mermaid-diagram-${Date.now()}`;
      const { svg } = await mermaid.render(id, debouncedCode);
      previewRef.current.innerHTML = svg;
      setSvgString(svg);
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

  const handleExport = async () => {
    if (!svgString) {
      toast({
        variant: "destructive",
        title: "No diagram to export",
        description: "Please render a diagram first.",
      });
      return;
    }

    try {
        const blob = await svgStringToPngBlob(svgString);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Failed to export image: ', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: `Could not export image. ${errorMessage}`,
        });
    }
  };

  const handleCopyImage = async () => {
    if (!svgString) {
      toast({
        variant: "destructive",
        title: "No diagram to copy",
        description: "Please render a diagram first.",
      });
      return;
    }

    try {
      const blob = await svgStringToPngBlob(svgString);
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast({
        title: "Image Copied",
        description: "The diagram has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy image: ', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: `Could not copy image to clipboard. ${errorMessage}`,
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
        <Button onClick={handleCopyImage} variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          Copy Image
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
          <div className="flex h-full items-center justify-center p-4 bg-white text-black overflow-auto">
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
