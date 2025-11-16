import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Download, AlertCircle, RefreshCw, Copy, Sparkles, Trash2, ZoomIn, ZoomOut, Maximize2, Minimize2, Move, Palette, Linkedin, Twitter, Github } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const defaultRawText = `A user starts a process. They are asked a question. If they say yes, it's OK and the process ends. If they say no, they need to find out more and go back to the question.`;

const initialDiagram = `graph TD
    A(Start) --> B{Is it?};
    B -- Yes --> C(OK);
    C --> D(End);
    B -- No --> E(Find out);
    E --> B;
`;

// Theme presets
const themePresets = {
  googleCloud: {
    name: 'Google Cloud',
    primaryColor: '#E8F0FE',
    primaryTextColor: '#202124',
    primaryBorderColor: '#4285F4',
    lineColor: '#5F6368',
    textColor: '#202124',
    arrowheadColor: '#5F6368',
  },
  microsoft: {
    name: 'Microsoft',
    primaryColor: '#E3F2FD',
    primaryTextColor: '#003366',
    primaryBorderColor: '#0078D4',
    lineColor: '#0078D4',
    textColor: '#003366',
    arrowheadColor: '#0078D4',
  },
  amazon: {
    name: 'Amazon',
    primaryColor: '#FFF3E0',
    primaryTextColor: '#221F1F',
    primaryBorderColor: '#FF9900',
    lineColor: '#232F3E',
    textColor: '#221F1F',
    arrowheadColor: '#FF9900',
  },
  nvidia: {
    name: 'NVIDIA',
    primaryColor: '#E8F5E9',
    primaryTextColor: '#1B5E20',
    primaryBorderColor: '#76B900',
    lineColor: '#76B900',
    textColor: '#1B5E20',
    arrowheadColor: '#76B900',
  },
  openai: {
    name: 'OpenAI',
    primaryColor: '#E0F2F1',
    primaryTextColor: '#004D40',
    primaryBorderColor: '#10A37F',
    lineColor: '#10A37F',
    textColor: '#004D40',
    arrowheadColor: '#10A37F',
  },
  claude: {
    name: 'Claude',
    primaryColor: '#FFF3E0',
    primaryTextColor: '#5D4037',
    primaryBorderColor: '#D97757',
    lineColor: '#D97757',
    textColor: '#5D4037',
    arrowheadColor: '#D97757',
  },
  meta: {
    name: 'Meta',
    primaryColor: '#E3F2FD',
    primaryTextColor: '#01579B',
    primaryBorderColor: '#0081FB',
    lineColor: '#0081FB',
    textColor: '#01579B',
    arrowheadColor: '#0081FB',
  },
  apple: {
    name: 'Apple',
    primaryColor: '#F5F5F5',
    primaryTextColor: '#1D1D1F',
    primaryBorderColor: '#555555',
    lineColor: '#A2AAAD',
    textColor: '#1D1D1F',
    arrowheadColor: '#555555',
  },
  netflix: {
    name: 'Netflix',
    primaryColor: '#FFEBEE',
    primaryTextColor: '#B71C1C',
    primaryBorderColor: '#E50914',
    lineColor: '#221F1F',
    textColor: '#B71C1C',
    arrowheadColor: '#E50914',
  },
  oracle: {
    name: 'Oracle',
    primaryColor: '#FFEBEE',
    primaryTextColor: '#C62828',
    primaryBorderColor: '#F80000',
    lineColor: '#F80000',
    textColor: '#C62828',
    arrowheadColor: '#F80000',
  },
  ibm: {
    name: 'IBM',
    primaryColor: '#E1F5FE',
    primaryTextColor: '#01579B',
    primaryBorderColor: '#006699',
    lineColor: '#006699',
    textColor: '#01579B',
    arrowheadColor: '#006699',
  },
  tcs: {
    name: 'TCS',
    primaryColor: '#E3F2FD',
    primaryTextColor: '#0D47A1',
    primaryBorderColor: '#0F62FE',
    lineColor: '#0F62FE',
    textColor: '#0D47A1',
    arrowheadColor: '#0F62FE',
  },
  accenture: {
    name: 'Accenture',
    primaryColor: '#F3E5F5',
    primaryTextColor: '#4A148C',
    primaryBorderColor: '#A100FF',
    lineColor: '#A100FF',
    textColor: '#4A148C',
    arrowheadColor: '#A100FF',
  },
  exl: {
    name: 'EXL',
    primaryColor: '#E3F2FD',
    primaryTextColor: '#01579B',
    primaryBorderColor: '#003DA5',
    lineColor: '#003DA5',
    textColor: '#01579B',
    arrowheadColor: '#003DA5',
  },
  infosys: {
    name: 'Infosys',
    primaryColor: '#E1F5FE',
    primaryTextColor: '#006064',
    primaryBorderColor: '#007CC3',
    lineColor: '#007CC3',
    textColor: '#006064',
    arrowheadColor: '#007CC3',
  },
  wipro: {
    name: 'Wipro',
    primaryColor: '#FFF3E0',
    primaryTextColor: '#E65100',
    primaryBorderColor: '#F36F21',
    lineColor: '#F36F21',
    textColor: '#E65100',
    arrowheadColor: '#F36F21',
  },
  dark: {
    name: 'Dark',
    primaryColor: '#1e293b',
    primaryTextColor: '#f1f5f9',
    primaryBorderColor: '#475569',
    lineColor: '#94a3b8',
    textColor: '#f1f5f9',
    arrowheadColor: '#94a3b8',
  },
  forest: {
    name: 'Forest',
    primaryColor: '#d4edda',
    primaryTextColor: '#155724',
    primaryBorderColor: '#28a745',
    lineColor: '#28a745',
    textColor: '#155724',
    arrowheadColor: '#28a745',
  },
  ocean: {
    name: 'Ocean',
    primaryColor: '#cfe2ff',
    primaryTextColor: '#084298',
    primaryBorderColor: '#0d6efd',
    lineColor: '#0d6efd',
    textColor: '#084298',
    arrowheadColor: '#0d6efd',
  },
  sunset: {
    name: 'Sunset',
    primaryColor: '#fff3cd',
    primaryTextColor: '#664d03',
    primaryBorderColor: '#ffc107',
    lineColor: '#fd7e14',
    textColor: '#664d03',
    arrowheadColor: '#fd7e14',
  },
  custom: {
    name: 'Custom',
    primaryColor: '#E8F0FE',
    primaryTextColor: '#202124',
    primaryBorderColor: '#4285F4',
    lineColor: '#5F6368',
    textColor: '#202124',
    arrowheadColor: '#5F6368',
  },
};

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

  // Theme and color customization
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themePresets>('googleCloud');
  const [customColors, setCustomColors] = useState(themePresets.googleCloud);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);

  // Export options
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf'>('png');
  const [exportScale, setExportScale] = useState(2);
  const [exportBackground, setExportBackground] = useState<'transparent' | 'white' | 'custom'>('transparent');
  const [customBgColor, setCustomBgColor] = useState('#ffffff');

  // Advanced styling options
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold' | 'bolder'>('normal');
  const [nodeBorderWidth, setNodeBorderWidth] = useState(2);
  const [nodeBorderRadius, setNodeBorderRadius] = useState(5);
  const [nodePadding, setNodePadding] = useState(10);
  const [nodeShadow, setNodeShadow] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(10);
  const [lineWidth, setLineWidth] = useState(2);
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [curveType, setCurveType] = useState<'basis' | 'linear' | 'step' | 'cardinal'>('basis');
  const [nodeSpacing, setNodeSpacing] = useState(50);
  const [levelSpacing, setLevelSpacing] = useState(50);
  const [diagramOpacity, setDiagramOpacity] = useState(1);

  // Advanced features
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

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
    const currentTheme = selectedTheme === 'custom' ? customColors : themePresets[selectedTheme];
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      flowchart: {
        curve: curveType,
        padding: nodePadding,
        nodeSpacing: nodeSpacing,
        rankSpacing: levelSpacing,
        diagramPadding: 20,
      },
      themeVariables: {
        background: 'transparent',
        fontFamily: fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        ...currentTheme,
        // Line styling
        lineColor: currentTheme.lineColor,
        edgeLabelBackground: 'transparent',
        // Node border
        nodeBorder: currentTheme.primaryBorderColor,
        mainBkg: currentTheme.primaryColor,
        textColor: currentTheme.textColor,
        primaryTextColor: currentTheme.primaryTextColor,
      },
    });
    // Re-render the diagram when theme or styling changes
    if (debouncedCode) {
      renderDiagram();
    }
  }, [selectedTheme, customColors, fontFamily, fontSize, fontWeight, nodeBorderWidth, nodeBorderRadius, nodePadding, lineWidth, lineStyle, curveType, nodeSpacing, levelSpacing, diagramOpacity, nodeShadow, shadowBlur]);

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

      // Apply advanced styling to SVG elements
      const svgElement = previewRef.current.querySelector('svg');
      if (svgElement) {
        // Apply opacity
        svgElement.style.opacity = diagramOpacity.toString();

        // Style all nodes (rectangles, circles, etc.)
        const nodes = svgElement.querySelectorAll('.node rect, .node circle, .node polygon, .node ellipse');
        nodes.forEach((node) => {
          const element = node as SVGElement;
          element.style.strokeWidth = `${nodeBorderWidth}px`;
          element.style.rx = `${nodeBorderRadius}px`;
          element.style.ry = `${nodeBorderRadius}px`;
          if (nodeShadow) {
            element.style.filter = `drop-shadow(0px 4px ${shadowBlur}px rgba(0, 0, 0, 0.3))`;
          }
        });

        // Style all edges/lines
        const edges = svgElement.querySelectorAll('.edgePath path');
        edges.forEach((edge) => {
          const element = edge as SVGElement;
          element.style.strokeWidth = `${lineWidth}px`;
          if (lineStyle === 'dashed') {
            element.style.strokeDasharray = '5,5';
          } else if (lineStyle === 'dotted') {
            element.style.strokeDasharray = '2,2';
          } else {
            element.style.strokeDasharray = 'none';
          }
        });

        // Style arrow markers
        const markers = svgElement.querySelectorAll('marker path');
        markers.forEach((marker) => {
          const element = marker as SVGElement;
          element.style.strokeWidth = `${lineWidth}px`;
        });
      }

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

  // Enhanced export with options
  const handleEnhancedExport = async () => {
    if (!svgString) {
      toast({
        variant: "destructive",
        title: "No diagram to export",
        description: "Please render a diagram first.",
      });
      return;
    }

    try {
      if (exportFormat === 'svg') {
        // Export as SVG
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'png') {
        // Export as PNG with custom options
        const blob = await svgStringToPngBlobWithOptions(svgString, exportScale, exportBackground, customBgColor);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'pdf') {
        // Export as PDF (using jsPDF)
        const { jsPDF } = await import('jspdf');
        const blob = await svgStringToPngBlobWithOptions(svgString, exportScale, exportBackground, customBgColor);
        const img = new Image();
        const url = URL.createObjectURL(blob);

        img.onload = () => {
          const pdf = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [img.width, img.height]
          });
          pdf.addImage(img, 'PNG', 0, 0, img.width, img.height);
          pdf.save('diagram.pdf');
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }

      toast({
        title: "Export Successful",
        description: `Diagram exported as ${exportFormat.toUpperCase()}.`,
      });
      setExportDialogOpen(false);
    } catch (err) {
      console.error('Failed to export: ', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: `Could not export diagram. ${errorMessage}`,
      });
    }
  };

  const svgStringToPngBlobWithOptions = (
    svgString: string,
    scale: number,
    background: 'transparent' | 'white' | 'custom',
    bgColor: string
  ): Promise<Blob> => {
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

        // Set background based on option
        if (background === 'white') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (background === 'custom') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

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

  // Zoom functions
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Theme functions
  const handleThemeChange = (theme: keyof typeof themePresets) => {
    setSelectedTheme(theme);
    if (theme !== 'custom') {
      setCustomColors(themePresets[theme]);
    }
  };

  const handleCustomColorChange = (colorKey: string, value: string) => {
    setCustomColors((prev) => ({
      ...prev,
      [colorKey]: value,
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="p-4 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
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
            {/* Theme Selector */}
            <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Palette className="mr-2 h-4 w-4" />
                  Theme
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Customize Theme & Style</DialogTitle>
                  <DialogDescription>
                    Choose a preset theme, customize colors, or adjust advanced styling options.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="presets" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="presets">Presets</TabsTrigger>
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                  <TabsContent value="presets" className="space-y-4">
                    <Select value={selectedTheme} onValueChange={handleThemeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(themePresets).map(([key, theme]) => (
                          <SelectItem key={key} value={key}>
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(themePresets).filter(([key]) => key !== 'custom').map(([key, theme]) => (
                        <button
                          key={key}
                          onClick={() => handleThemeChange(key as keyof typeof themePresets)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedTheme === key ? 'border-primary' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{theme.name}</div>
                            <div className="flex gap-1">
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.primaryColor }} />
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.primaryBorderColor }} />
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.lineColor }} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="custom" className="space-y-4">
                    <div className="grid gap-4">
                      {Object.entries(customColors).filter(([key]) => key !== 'name').map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Input
                            type="color"
                            value={value as string}
                            onChange={(e) => {
                              setSelectedTheme('custom');
                              handleCustomColorChange(key, e.target.value);
                            }}
                            className="col-span-1 h-10"
                          />
                          <Input
                            type="text"
                            value={value as string}
                            onChange={(e) => {
                              setSelectedTheme('custom');
                              handleCustomColorChange(key, e.target.value);
                            }}
                            className="col-span-1 font-mono text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="advanced" className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {/* Font Customization */}
                    <div className="space-y-3 border-b pb-4">
                      <h4 className="font-semibold text-sm">Font</h4>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Family</Label>
                          <Select value={fontFamily} onValueChange={setFontFamily}>
                            <SelectTrigger className="col-span-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Sans-serif Fonts */}
                              <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                              <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                              <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                              <SelectItem value="Tahoma, sans-serif">Tahoma</SelectItem>
                              <SelectItem value="'Trebuchet MS', sans-serif">Trebuchet MS</SelectItem>
                              <SelectItem value="'Segoe UI', sans-serif">Segoe UI</SelectItem>
                              <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                              <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                              <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                              <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                              <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                              <SelectItem value="'Inter', sans-serif">Inter</SelectItem>

                              {/* Serif Fonts */}
                              <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                              <SelectItem value="Georgia, serif">Georgia</SelectItem>
                              <SelectItem value="Garamond, serif">Garamond</SelectItem>
                              <SelectItem value="'Palatino Linotype', serif">Palatino Linotype</SelectItem>
                              <SelectItem value="'Merriweather', serif">Merriweather</SelectItem>
                              <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>

                              {/* Monospace Fonts */}
                              <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                              <SelectItem value="'Lucida Console', monospace">Lucida Console</SelectItem>
                              <SelectItem value="Monaco, monospace">Monaco</SelectItem>
                              <SelectItem value="'Consolas', monospace">Consolas</SelectItem>
                              <SelectItem value="'Source Code Pro', monospace">Source Code Pro</SelectItem>
                              <SelectItem value="'JetBrains Mono', monospace">JetBrains Mono</SelectItem>

                              {/* Display/Cursive Fonts */}
                              <SelectItem value="'Comic Sans MS', cursive">Comic Sans MS</SelectItem>
                              <SelectItem value="Impact, sans-serif">Impact</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Size: {fontSize}px</Label>
                          <Slider
                            value={[fontSize]}
                            onValueChange={([value]) => setFontSize(value)}
                            min={10}
                            max={32}
                            step={1}
                            className="col-span-2"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Weight</Label>
                          <Select value={fontWeight} onValueChange={(value: 'normal' | 'bold' | 'bolder') => setFontWeight(value)}>
                            <SelectTrigger className="col-span-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                              <SelectItem value="bolder">Bolder</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Node Styling */}
                    <div className="space-y-3 border-b pb-4">
                      <h4 className="font-semibold text-sm">Nodes</h4>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Border Width: {nodeBorderWidth}px</Label>
                          <Slider
                            value={[nodeBorderWidth]}
                            onValueChange={([value]) => setNodeBorderWidth(value)}
                            min={0}
                            max={10}
                            step={0.5}
                            className="col-span-2"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Border Radius: {nodeBorderRadius}px</Label>
                          <Slider
                            value={[nodeBorderRadius]}
                            onValueChange={([value]) => setNodeBorderRadius(value)}
                            min={0}
                            max={30}
                            step={1}
                            className="col-span-2"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Padding: {nodePadding}px</Label>
                          <Slider
                            value={[nodePadding]}
                            onValueChange={([value]) => setNodePadding(value)}
                            min={5}
                            max={30}
                            step={1}
                            className="col-span-2"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Shadow</Label>
                          <input
                            type="checkbox"
                            checked={nodeShadow}
                            onChange={(e) => setNodeShadow(e.target.checked)}
                            className="h-4 w-4"
                          />
                        </div>
                        {nodeShadow && (
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label className="text-sm">Shadow Blur: {shadowBlur}px</Label>
                            <Slider
                              value={[shadowBlur]}
                              onValueChange={([value]) => setShadowBlur(value)}
                              min={0}
                              max={30}
                              step={1}
                              className="col-span-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Line Styling */}
                    <div className="space-y-3 border-b pb-4">
                      <h4 className="font-semibold text-sm">Lines & Edges</h4>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Line Width: {lineWidth}px</Label>
                          <Slider
                            value={[lineWidth]}
                            onValueChange={([value]) => setLineWidth(value)}
                            min={0.5}
                            max={10}
                            step={0.5}
                            className="col-span-2"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Line Style</Label>
                          <Select value={lineStyle} onValueChange={(value: 'solid' | 'dashed' | 'dotted') => setLineStyle(value)}>
                            <SelectTrigger className="col-span-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="solid">Solid</SelectItem>
                              <SelectItem value="dashed">Dashed</SelectItem>
                              <SelectItem value="dotted">Dotted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Curve Type</Label>
                          <Select value={curveType} onValueChange={(value: 'basis' | 'linear' | 'step' | 'cardinal') => setCurveType(value)}>
                            <SelectTrigger className="col-span-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basis">Curved (Basis)</SelectItem>
                              <SelectItem value="linear">Straight (Linear)</SelectItem>
                              <SelectItem value="step">Stepped</SelectItem>
                              <SelectItem value="cardinal">Curved (Cardinal)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Spacing */}
                    <div className="space-y-3 border-b pb-4">
                      <h4 className="font-semibold text-sm">Spacing & Layout</h4>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Node Spacing: {nodeSpacing}px</Label>
                          <Slider
                            value={[nodeSpacing]}
                            onValueChange={([value]) => setNodeSpacing(value)}
                            min={20}
                            max={150}
                            step={5}
                            className="col-span-2"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Level Spacing: {levelSpacing}px</Label>
                          <Slider
                            value={[levelSpacing]}
                            onValueChange={([value]) => setLevelSpacing(value)}
                            min={20}
                            max={150}
                            step={5}
                            className="col-span-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Effects */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Effects</h4>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label className="text-sm">Opacity: {Math.round(diagramOpacity * 100)}%</Label>
                          <Slider
                            value={[diagramOpacity]}
                            onValueChange={([value]) => setDiagramOpacity(value)}
                            min={0.1}
                            max={1}
                            step={0.1}
                            className="col-span-2"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button onClick={() => setThemeDialogOpen(false)}>Done</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={renderDiagram} disabled={isRendering} variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${isRendering ? 'animate-spin' : ''}`} />
                Render
            </Button>
            <Button onClick={handleCopyImage} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy Image
            </Button>

            {/* Enhanced Export Dialog */}
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Export Diagram</DialogTitle>
                  <DialogDescription>
                    Choose export format and quality options.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Format</Label>
                    <Select value={exportFormat} onValueChange={(value: 'png' | 'svg' | 'pdf') => setExportFormat(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG (Raster)</SelectItem>
                        <SelectItem value="svg">SVG (Vector)</SelectItem>
                        <SelectItem value="pdf">PDF (Document)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {exportFormat === 'png' && (
                    <>
                      <div className="grid gap-2">
                        <Label>Quality (Scale: {exportScale}x)</Label>
                        <Slider
                          value={[exportScale]}
                          onValueChange={([value]) => setExportScale(value)}
                          min={1}
                          max={4}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1x (Low)</span>
                          <span>2x (Medium)</span>
                          <span>4x (High)</span>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Background</Label>
                        <Select value={exportBackground} onValueChange={(value: 'transparent' | 'white' | 'custom') => setExportBackground(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="transparent">Transparent</SelectItem>
                            <SelectItem value="white">White</SelectItem>
                            <SelectItem value="custom">Custom Color</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {exportBackground === 'custom' && (
                        <div className="grid gap-2">
                          <Label>Background Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={customBgColor}
                              onChange={(e) => setCustomBgColor(e.target.value)}
                              className="w-20"
                            />
                            <Input
                              type="text"
                              value={customBgColor}
                              onChange={(e) => setCustomBgColor(e.target.value)}
                              className="flex-1 font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleEnhancedExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Social Media Links */}
            <div className="flex items-center gap-1 ml-4 border-l pl-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="LinkedIn"
              >
                <a
                  href="https://www.linkedin.com/in/yashkavaiya/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="Twitter/X"
              >
                <a
                  href="https://x.com/Yash_Kavaiya_"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="GitHub"
              >
                <a
                  href="https://github.com/Yash-Kavaiya"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            </div>
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
          <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'}`}>
            {/* Zoom and Fullscreen Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 rounded-lg border shadow-lg p-2 flex flex-col gap-1">
                <Button size="icon" variant="ghost" onClick={handleZoomIn} title="Zoom In">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleZoomOut} title="Zoom Out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleResetZoom} title="Reset View">
                  <Move className="h-4 w-4" />
                </Button>
                <div className="border-t my-1" />
                <Button size="icon" variant="ghost" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 rounded-lg border shadow-lg p-2 text-xs text-center font-mono">
                {Math.round(zoom * 100)}%
              </div>
            </div>

            <div
              className="flex h-full items-center justify-center p-4 bg-white text-black overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            >
              {error && (
                <Alert variant="destructive" className="m-4 absolute">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Rendering Error</AlertTitle>
                  <AlertDescription>
                      <pre className="text-xs whitespace-pre-wrap font-mono">{error}</pre>
                  </AlertDescription>
                </Alert>
              )}
              <div
                ref={previewRef}
                className="w-full h-full flex items-center justify-center transition-transform"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: 'center center',
                }}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default MermaidEditor;
