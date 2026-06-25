import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { 
  Copy, 
  Check, 
  Download, 
  Edit3, 
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreviewPanelProps {
  content: string;
  setContent: (val: string) => void;
  isGenerating: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  content,
  setContent,
  isGenerating
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);


  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "README.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Removed AI improvement submit handler as the improvement feature is disabled.

  return (
    <div className="flex flex-col h-[82vh] bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl relative">
      
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/[0.08] flex-shrink-0">
        
        {/* Left: Tab Selectors */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/[0.04]">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-white/[0.06] text-neutral-high shadow'
                : 'text-neutral-low/60 hover:text-neutral-high'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'code'
                ? 'bg-white/[0.06] text-neutral-high shadow'
                : 'text-neutral-low/60 hover:text-neutral-high'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Raw Markdown</span>
          </button>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
            <Button
              variant="outline"
              size="sm"
              className="px-2.5 py-1.5 text-neutral-low hover:text-neutral-high"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </Tooltip>

          {/* Download Button */}
          <Tooltip content="Download README.md">
            <Button
              variant="outline"
              size="sm"
              className="px-2.5 py-1.5 text-neutral-low hover:text-neutral-high"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>

      </div>

      {/* 2. Content Workspace */}
      <div className="flex-1 overflow-y-auto p-6 bg-black/30 font-sans text-left relative">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            /* Generating spinner overlay */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs gap-3"
            >
              <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-neutral-low/60 uppercase tracking-widest font-semibold animate-pulse">
                Writing documentation sections...
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {activeTab === 'preview' ? (
          /* Rendered Markdown Preview */
          <div className="markdown-body select-text min-h-full">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
                <span className="text-xs text-neutral-low/40">Markdown is empty. Click Generate on the left to write README sections.</span>
              </div>
            )}
          </div>
        ) : (
          /* Plain Code Editor */
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full bg-transparent resize-none outline-none border-none text-neutral-low font-mono text-xs leading-relaxed focus:ring-0 focus:border-none p-0 select-text"
            placeholder="# Project README..."
          />
        )}
      </div>

    </div>
  );
};
