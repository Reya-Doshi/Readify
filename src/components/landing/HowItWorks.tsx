import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Settings, ClipboardCheck } from 'lucide-react';

const STEPS = [
  {
    num: "01",
    title: "Describe your project",
    desc: "Input your basic details, stack tags, features, and config styles in our developer configuration form.",
    icon: HelpCircle,
  },
  {
    num: "02",
    title: "Customize your layout",
    desc: "Fine-tune details by toggling optional badges, installation checklists, contribution docs, and licensing.",
    icon: Settings,
  },
  {
    num: "03",
    title: "Generate and export",
    desc: "Animate professional output sections chunk-by-chunk. Download code or copy it instantly to your workspace.",
    icon: ClipboardCheck,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background relative border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-xs font-semibold text-accent tracking-widest uppercase">Workflow Outline</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-neutral-high">
            How Readify structures your code docs
          </h3>
          <p className="text-sm text-neutral-low/70">
            A three-step streamlined flow built for speed and visual control.
          </p>
        </div>

        {/* Timeline Steps Layout */}
        <div className="relative">
          
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-[12%] right-[12%] h-[1px] bg-white/[0.06] -translate-y-[40px] z-0" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="flex flex-col items-center text-center gap-6"
                >
                  {/* Step Ring */}
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#111] border border-white/[0.08] group hover:border-accent/40 transition-colors duration-300">
                    {/* Index Badge */}
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-accent text-[9px] font-bold text-neutral-high select-none">
                      {step.num}
                    </span>
                    <Icon className="h-6 w-6 text-neutral-low group-hover:text-accent transition-colors duration-300" />
                  </div>

                  {/* Info Text */}
                  <div className="flex flex-col gap-2 max-w-xs">
                    <h4 className="text-lg font-bold text-neutral-high">
                      {step.title}
                    </h4>
                    <p className="text-xs text-neutral-low/70 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
