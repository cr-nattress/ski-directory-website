'use client';

import { useState, useId, ReactNode, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  title: string;
  defaultOpen?: boolean;
  /** Open by default on tablet (md) and larger screens */
  defaultOpenOnTablet?: boolean;
  children: ReactNode;
  id?: string;
}

export function AccordionItem({ title, defaultOpen = false, defaultOpenOnTablet = false, children, id }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const headerId = useId();

  // Handle responsive defaultOpen for tablet
  useEffect(() => {
    if (defaultOpenOnTablet && !defaultOpen) {
      const checkTablet = () => {
        const isTablet = window.matchMedia('(min-width: 768px)').matches;
        if (isTablet) {
          setIsOpen(true);
        }
      };
      checkTablet();
      // No need to add resize listener since this only affects initial state
    }
  }, [defaultOpenOnTablet, defaultOpen]);

  return (
    <div className="border-b border-gray-200" id={id}>
      <button
        id={headerId}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 text-left min-h-[56px]"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="text-lg font-semibold text-gray-900">{title}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[2000px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn('divide-y divide-gray-200 border-t border-gray-200', className)}>
      {children}
    </div>
  );
}
