import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Footer } from '../components/landing/Footer';
import { Button } from '../components/ui/Button';
import { useRouter } from '../lib/router';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  const { navigateTo } = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Landing Navbar */}
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Features Card List */}
        <Features />

        {/* How It Works Progress Section */}
        <HowItWorks />

        {/* Pricing Tiers Section */}
        <section id="pricing" className="py-20 bg-[#0C0C0C] border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-xs font-semibold text-accent tracking-widest uppercase">Pricing Models</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-neutral-high">
                Flexible plans for every project size
              </h3>
              <p className="text-sm text-neutral-low/70">
                Start for free in local sandbox mode, upgrade when you want cloud database storage and premium AI tools.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              
              {/* Sandbox Card */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-panel border-white/[0.06] rounded-xl p-8 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-lg font-bold text-neutral-high">Sandbox Plan</h4>
                  <p className="text-xs text-neutral-low/60 mt-1">Perfect for offline developers starting out.</p>
                  
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-neutral-high">$0</span>
                    <span className="text-xs text-neutral-low/50">/ month</span>
                  </div>

                  <ul className="mt-8 space-y-4 text-xs text-neutral-low/80">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>Standard README generation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>5 markdown styles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>Download README.md & copy raw</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>LocalStorage project history</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Button variant="outline" className="w-full" onClick={() => navigateTo('signup')}>
                    Start Writing Free
                  </Button>
                </div>
              </motion.div>

              {/* Developer Pro Card */}
              <motion.div
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-panel border-accent/25 bg-accent/5 rounded-xl p-8 flex flex-col justify-between relative"
              >
                {/* Popular Badge */}
                <span className="absolute -top-3 right-8 px-2.5 py-1 rounded bg-accent text-[9px] font-bold text-neutral-high uppercase tracking-wider select-none">
                  SaaS Standard
                </span>

                <div>
                  <h4 className="text-lg font-bold text-neutral-high">Developer Pro</h4>
                  <p className="text-xs text-neutral-low/60 mt-1">For active maintainers and software engineers.</p>
                  
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-neutral-high">$9</span>
                    <span className="text-xs text-neutral-low/50">/ month</span>
                  </div>

                  <ul className="mt-8 space-y-4 text-xs text-neutral-low/80">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>Everything in Sandbox Plan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>Supabase cloud sync storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>Gemini API / LLM-powered refactorings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>API specifications & tables generation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span>Favorite layouts preset editor</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Button variant="primary" className="w-full bg-accent hover:bg-accent-dark text-white border-none" onClick={() => navigateTo('signup')}>
                    Upgrade to Pro
                  </Button>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
