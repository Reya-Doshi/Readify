import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { ArrowRight, Play } from 'lucide-react';

export const Hero: React.FC = () => {
  const { navigateTo } = useRouter();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      navigateTo('dashboard');
    } else {
      navigateTo('signup');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36 bg-background">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/5 filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-96 h-96 rounded-full bg-blue-500/5 filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col gap-6 text-left"
          >
            {/* Version Badge */}
            <motion.div variants={itemVariants} className="inline-flex">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                Readify v2.0 - Gemini Powered
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-neutral-high"
            >
              Write README files developers <span className="text-accent">actually want</span> to read.
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              variants={itemVariants}
              className="text-lg text-neutral-low/80 max-w-xl leading-relaxed"
            >
              Transform your project details into clean, structured, and professional GitHub documentation in seconds. Fully customize templates, tech stack tags, and badges.
            </motion.p>

            {/* CTA Actions */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mt-2">
              <Button 
                variant="primary" 
                size="lg" 
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={handleCTA}
              >
                {user ? 'Go to Dashboard' : 'Create README'}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                leftIcon={<Play className="h-4 w-4 fill-current" />}
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See Example
              </Button>
            </motion.div>

            {/* Trust statement */}
            <motion.p 
              variants={itemVariants}
              className="text-xs text-neutral-low/50 mt-6 tracking-wide"
            >
              TRUSTED BY STUDENTS, OPEN-SOURCE MAINTAINERS, AND PROFESSIONAL DEVELOPERS.
            </motion.p>
          </motion.div>

          {/* Right Preview Card Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, delay: 0.3 }}
            className="lg:col-span-5 flex justify-center"
          >
            {/* GitHub Style Mock Card */}
            <div className="w-full max-w-md bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col text-left">
              
              {/* Card Header (Mac OS Window Controls + filename) */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#111111] border-b border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                  <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                  <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                </div>
                <div className="text-xs font-mono text-neutral-low/70">README.md</div>
                <div className="w-8" /> {/* Spacer */}
              </div>

              {/* Card Content (Realistic GitHub README Preview) */}
              <div className="p-6 font-sans space-y-4 max-h-[360px] overflow-y-auto bg-background/50">
                
                {/* Badges row */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">build: passing</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">license: MIT</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">version: 1.0.0</span>
                </div>

                {/* H1 Heading */}
                <div className="border-b border-white/[0.08] pb-2 mt-4">
                  <h1 className="text-2xl font-bold text-neutral-high font-mono tracking-tight flex items-center gap-1.5">
                    <span className="text-neutral-low/40">#</span> Task Manager API
                  </h1>
                </div>

                {/* Paragraph */}
                <p className="text-sm text-neutral-low/85 leading-relaxed">
                  A scalable, production-ready REST API built using Node.js and Express to manage tasks and collaborations securely.
                </p>

                {/* H2 Heading */}
                <div className="mt-4">
                  <h2 className="text-base font-bold text-neutral-high font-mono flex items-center gap-1.5">
                    <span className="text-neutral-low/40">##</span> Features
                  </h2>
                </div>

                {/* List Items */}
                <ul className="text-xs text-neutral-low/80 space-y-1.5 pl-4 list-disc">
                  <li>JWT Authentication & Route Guards</li>
                  <li>User Profiles & Role-Based Access Control</li>
                  <li>API Documentation using Swagger</li>
                  <li>MongoDB Database Integration with Mongoose</li>
                </ul>

                {/* H2 Heading */}
                <div className="mt-4">
                  <h2 className="text-base font-bold text-neutral-high font-mono flex items-center gap-1.5">
                    <span className="text-neutral-low/40">##</span> Tech Stack
                  </h2>
                </div>

                {/* Technology Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-1 rounded bg-white/[0.04] text-neutral-low border border-white/[0.08] text-[10px] font-mono">Node.js</span>
                  <span className="px-2 py-1 rounded bg-white/[0.04] text-neutral-low border border-white/[0.08] text-[10px] font-mono">Express</span>
                  <span className="px-2 py-1 rounded bg-white/[0.04] text-neutral-low border border-white/[0.08] text-[10px] font-mono">MongoDB</span>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
