import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { Sparkles, Layers, Eye, Download } from 'lucide-react';

const FEATURES = [
  {
    title: "Intelligent Documentation",
    desc: "Automatically structures your project into professional README sections using advanced LLM reasoning.",
    icon: Sparkles,
  },
  {
    title: "Multiple Templates",
    desc: "Choose between Minimal, Open Source, Portfolio, Startup, and Enterprise styles depending on your audience.",
    icon: Layers,
  },
  {
    title: "Live Markdown Preview",
    desc: "See your README rendered in a real-time realistic GitHub preview container as it generates.",
    icon: Eye,
  },
  {
    title: "Export Anywhere",
    desc: "Copy the raw markdown to your clipboard or download a README.md file with a single click.",
    icon: Download,
  },
];

export const Features: React.FC = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring' as const, stiffness: 70, damping: 15 } 
    },
  };

  return (
    <section id="features" className="py-20 bg-[#0C0C0C] border-t border-white/[0.04] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-semibold text-accent tracking-widest uppercase">Platform Capabilities</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-neutral-high">
            Everything you need for premium documentation
          </h3>
          <p className="text-sm text-neutral-low/70">
            Readify matches professional workflows with AI speed to produce rich, compliant README pages.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div key={idx} variants={itemVariants}>
                <GlassCard hoverable className="h-full flex flex-col gap-4 text-left border-white/[0.06] hover:border-accent/30 group">
                  <div className="h-10 w-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-low group-hover:text-accent group-hover:bg-accent/10 group-hover:border-accent/35 transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-base font-bold text-neutral-high group-hover:text-accent transition-colors duration-200">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-neutral-low/75 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};
