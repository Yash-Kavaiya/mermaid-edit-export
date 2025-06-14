import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Download, AlertCircle, RefreshCw, Copy, Sparkles, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaultRawText = `A user starts a process. They are asked a question. If they say yes, it's OK and the process ends. If they say no, they need to find out more and go back to the question.`;

const initialDiagram = `graph TD
    A(Start) --> B{Is it?};
    B -- Yes --> C(OK);
    C --> D(End);
    B -- No --> E(Find out);
    E --> B;
`;

const svgStringToPngBlob = (svgString: string, scale = 2): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
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
  const [code, setCode] = useState<string>(initialDiagram);
  const [error, setError] = useState<string | null>(null);
  const debouncedCode = useDebounce(code, 500);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const { toast } = useToast();
  const [svgString, setSvgString] = useState('');
  
  const [rawText, setRawText] = useState<string>(defaultRawText);
  const [apiKey, setApiKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [iconMappings, setIconMappings] = useState([
    { keyword: 'user', url: 'https://cdn.simpleicons.org/probot/black' },
    { keyword: 'database', url: 'https://cdn.simpleicons.org/serverless/black' },
    { keyword: 'bigquery', url: 'https://cdn.simpleicons.org/googlebigquery/4285F4' },
    { keyword: 'cloud', url: 'https://cdn.simpleicons.org/googlecloud/4285F4' },
    { keyword: 'compute', url: 'https://cdn.simpleicons.org/googlecloud/4285F4' },
    { keyword: 'cloud functions', url: 'https://cdn.simpleicons.org/googlecloudfunctions/4285F4' },
    { keyword: 'cloud run', url: 'https://cdn.simpleicons.org/googlecloudrun/4285F4' },
    { keyword: 'storage', url: 'https://cdn.simpleicons.org/googlecloudstorage/4285F4' },
    { keyword: 'colab', url: 'https://cdn.simpleicons.org/googlecolab/4285F4' },
    { keyword: 'dataflow', url: 'https://cdn.simpleicons.org/googledataflow/4285F4' },
    { keyword: 'dataproc', url: 'https://cdn.simpleicons.org/googledataproc/4285F4' },
    { keyword: 'datastudio', url: 'https://cdn.simpleicons.org/googledatastudio/4285F4' },
    { keyword: 'drive', url: 'https://cdn.simpleicons.org/googledrive/4285F4' },
    { keyword: 'kubernetes', url: 'https://cdn.simpleicons.org/googlekubernetesengine/4285F4' },
    { keyword: 'maps', url: 'https://cdn.simpleicons.org/googlemaps/4285F4' },
    { keyword: 'pub/sub', url: 'https://cdn.simpleicons.org/googlepubsub/4285F4' },
    { keyword: 'translate', url: 'https://cdn.simpleicons.org/googletranslate/4285F4' },
  ]);

  const handleMappingChange = (index: number, field: 'keyword' | 'url', value: string) => {
    const newMappings = iconMappings.map((mapping, i) => {
        if (i === index) {
            return { ...mapping, [field]: value };
        }
        return mapping;
    });
    setIconMappings(newMappings);
  };

  const addMapping = () => {
      setIconMappings([...iconMappings, { keyword: '', url: '' }]);
  };

  const removeMapping = (index: number) => {
      const newMappings = iconMappings.filter((_, i) => i !== index);
      setIconMappings(newMappings);
  };

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      flowchart: {
        curve: 'basis',
      },
      themeVariables: {
        background: 'transparent',
        primaryColor: '#E8F0FE',
        primaryTextColor: '#202124',
        primaryBorderColor: '#4285F4',
        lineColor: '#5F6368',
        textColor: '#202124',
        arrowheadColor: '#5F6368',
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
  
  const handleGenerate = async () => {
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API Key required",
        description: "Please enter your Gemini API key.",
      });
      return;
    }
    if (!rawText) {
      toast({
        variant: "destructive",
        title: "Input text required",
        description: "Please enter some text to generate a diagram from.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const validMappings = iconMappings.filter(m => m.keyword && m.url);
      const mappingInstructions = validMappings.length > 0 ?
 `
You can use icons in the diagram nodes. Here is a list of keywords (case-insensitive) and their corresponding icon URLs. If you find a keyword from the list in the text, use the associated icon in the node.
- IMPORTANT: When using an icon, the node text MUST be HTML.
- Format the node like this: nodeId["<img src='URL' width='32' height='32' /><br>Node Text"]
- Make sure to escape any special characters in the node text.

Icon Mappings:
${validMappings.map(m => `- ${m.keyword}: ${m.url}`).join('\n')}` : '';

      const prompt = `Based on the following text, generate a Mermaid.js graph.
- The graph should be visually appealing and follow a 'google theme' aesthetic. This means using clean lines, a simple color palette, and clear typography.
- Use rounded-edge nodes. For example, use 'A(Text)' for a rounded rectangle.
- Use curved arrows between nodes.
- Ensure proper alignment and a clear, easy-to-read layout.${mappingInstructions}
- Output ONLY the Mermaid.js code block, starting with 'graph TD' or similar, without any explanations, formatting, or markdown backticks.

Text: "${rawText}"`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      setCode(text.trim());
      setDialogOpen(false);
      toast({
        title: "Diagram Generated",
        description: "The Mermaid code has been generated and is ready to render.",
      });
    } catch (e) {
      console.error('Gemini API error:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: `Could not generate diagram. Check your API key and try again. Error: ${errorMessage}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
      <div className="p-4 border-b border-border flex items-center justify-between gap-2">
        <div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Generate Mermaid Diagram with AI</DialogTitle>
                <DialogDescription>
                  Enter your text and Gemini API key to generate a diagram. Your API key is not stored.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiKey" className="text-right">
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="col-span-3"
                    placeholder="Your Google Gemini API Key"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rawText">
                    Your Text
                  </Label>
                  <Textarea
                    id="rawText"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Type your text to generate a diagram from."
                    className="h-40 font-sans"
                  />
                </div>
              </div>
              <div className="grid gap-4 border-t pt-4">
                <Label>Icon Mappings (Optional)</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {iconMappings.map((mapping, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                placeholder="Keyword (e.g., User)"
                                value={mapping.keyword}
                                onChange={(e) => handleMappingChange(index, 'keyword', e.target.value)}
                            />
                            <Input
                                placeholder="Icon URL"
                                value={mapping.url}
                                onChange={(e) => handleMappingChange(index, 'url', e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeMapping(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button variant="outline" size="sm" onClick={addMapping} className="mt-2 w-full">Add Mapping</Button>
              </div>
              <DialogFooter>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center justify-end gap-2">
            <Button onClick={renderDiagram} disabled={isRendering} variant="outline">
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
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border-none">
        <ResizablePanel defaultSize={40}>
          <div className="flex h-full items-center justify-center p-0">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full resize-none border-0 rounded-none bg-background p-4 font-mono focus-visible:ring-0"
              placeholder="Enter Mermaid code here or generate with AI..."
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
