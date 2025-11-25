import { cn } from '@/lib/utils';

interface PassBadgeProps {
  pass: string;
  size?: 'xs' | 'sm' | 'md';
}

export function PassBadge({ pass, size = 'md' }: PassBadgeProps) {
  const getPassConfig = () => {
    switch (pass) {
      case 'epic':
        return {
          label: 'Epic',
          bgColor: 'bg-epic-red',
          textColor: 'text-white',
        };
      case 'ikon':
        return {
          label: 'Ikon',
          bgColor: 'bg-ikon-orange',
          textColor: 'text-white',
        };
      case 'indy':
        return {
          label: 'Indy',
          bgColor: 'bg-purple-600',
          textColor: 'text-white',
        };
      case 'local':
        return {
          label: 'Local',
          bgColor: 'bg-mountain-gray',
          textColor: 'text-white',
        };
      default:
        return {
          label: pass.charAt(0).toUpperCase() + pass.slice(1),
          bgColor: 'bg-gray-200',
          textColor: 'text-gray-700',
        };
    }
  };

  const config = getPassConfig();

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-semibold uppercase',
        config.bgColor,
        config.textColor,
        sizeClasses[size]
      )}
    >
      {config.label}
    </span>
  );
}
