import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-neutral-low">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] rounded-lg text-sm text-neutral-high focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200"
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronDown className={`h-4 w-4 text-neutral-low transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-background-card border border-white/[0.08] rounded-lg shadow-xl backdrop-blur-md max-h-60 overflow-y-auto animate-fade-in">
            <div className="p-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start justify-between px-3 py-2 rounded-md text-sm text-left transition-colors duration-150 ${
                      isSelected
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-neutral-low hover:bg-white/[0.04] hover:text-neutral-high'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className={`text-[10px] ${isSelected ? 'text-accent/80' : 'text-neutral-low/50'}`}>
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
