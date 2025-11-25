import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'open' | 'closed' | 'opening-soon';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          label: 'Open',
          dotColor: 'bg-success-green',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          ariaLabel: 'Resort is open',
        };
      case 'closed':
        return {
          label: 'Closed',
          dotColor: 'bg-red-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          ariaLabel: 'Resort is closed',
        };
      case 'opening-soon':
        return {
          label: 'Opening Soon',
          dotColor: 'bg-yellow-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          ariaLabel: 'Resort is opening soon',
        };
      default:
        return {
          label: 'Unknown',
          dotColor: 'bg-gray-400',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          ariaLabel: 'Resort status unknown',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bgColor,
        config.textColor,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
      role="status"
      aria-label={config.ariaLabel}
    >
      <span
        className={cn(
          'rounded-full',
          config.dotColor,
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
        )}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
