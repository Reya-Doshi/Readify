import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Terminal, Shield, FileCode, Check } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  onFinished?: () => void;
}

const MESSAGES = [
  { text: "Understanding your project details...", icon: Terminal },
  { text: "Analyzing your technology stack...", icon: FileCode },
  { text: "Structuring professional documentation outline...", icon: Shield },
  { text: "Writing a developer-friendly README...", icon: Check },
];

export const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setMsgIndex(0);
      setProgress(0);
      return;
    }

    // Progress bar simulation (takes ~6 seconds total)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 100);

    // Message rotation
    const messageInterval = setInterval(() => {
      setMsgIndex((prev) => {
        if (prev < MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const CurrentIcon = MESSAGES[msgIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md p-6 glass-panel rounded-xl flex flex-col items-center text-center gap-6"
      >
        {/* Animated Icon Ring */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20">
          <motion.div
            className="absolute inset-0 border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <CurrentIcon className="h-6 w-6 text-accent animate-pulse" />
        </div>

        {/* Text Area with Fade Transitions */}
        <div className="h-14 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={msgIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium text-neutral-high"
            >
              {MESSAGES[msgIndex].text}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/[0.04] border border-white/[0.08] h-2 rounded-full overflow-hidden">
          <motion.div
            className="bg-accent h-full rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut" }}
          />
        </div>

        <div className="text-[10px] text-neutral-low/55 tracking-wider uppercase">
          AI Generation Engine • Processing {Math.round(progress)}%
        </div>
      </motion.div>
    </div>
  );
};
