import React from 'react';
import { FileCode2 } from 'lucide-react';
import { useRouter } from '../../lib/router';

export const Footer: React.FC = () => {
  const { navigateTo } = useRouter();

  return (
    <footer className="bg-[#080808] border-t border-white/[0.04] py-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('landing')}>
              <div className="h-8 w-8 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <FileCode2 className="h-4.5 w-4.5 text-accent" />
              </div>
              <span className="text-base font-bold tracking-tight text-neutral-high">Readify</span>
            </div>
            <p className="text-xs text-neutral-low/55 max-w-xs leading-relaxed">
              Readify helps developers construct professional, stylish, and structured README.md pages instantly. Elevate your repository's landing page today.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-high">Product</h4>
            <ul className="space-y-2 text-xs text-neutral-low/75">
              <li>
                <button onClick={() => navigateTo('landing')} className="hover:text-accent transition-colors">
                  Landing Page
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('signup')} className="hover:text-accent transition-colors">
                  Create README
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-high">Developer Tools</h4>
            <ul className="space-y-2 text-xs text-neutral-low/75">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  GitHub Profile
                </a>
              </li>
              <li>
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  Supabase Integration
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-neutral-low/40">
            &copy; {new Date().getFullYear()} Readify Inc. All rights reserved. Built with Gemini AI.
          </p>
          <div className="flex gap-4 text-[10px] text-neutral-low/40">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
