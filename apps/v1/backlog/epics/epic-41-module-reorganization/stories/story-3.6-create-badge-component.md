# Story 3.6: Create Unified Badge Component

## Description
Create a unified Badge component in `ui/primitives/` that can be used across the app for consistent badge styling.

## Acceptance Criteria
- [ ] Badge component created in `ui/primitives/Badge.tsx`
- [ ] Supports variants: default, pass (epic, ikon, indy, local), status
- [ ] Build passes
- [ ] Can be used in pass type chips and status badges

## Tasks

1. Create `ui/primitives/Badge.tsx`:
   ```typescript
   import { cn } from '@shared/utils';

   interface BadgeProps {
     variant?: 'default' | 'epic' | 'ikon' | 'indy' | 'local' | 'success' | 'warning' | 'error';
     children: React.ReactNode;
     className?: string;
   }

   export function Badge({ variant = 'default', children, className }: BadgeProps) {
     const variantClasses = {
       default: 'bg-gray-100 text-gray-800',
       epic: 'bg-red-100 text-red-800',
       ikon: 'bg-orange-100 text-orange-800',
       indy: 'bg-purple-100 text-purple-800',
       local: 'bg-blue-100 text-blue-800',
       success: 'bg-green-100 text-green-800',
       warning: 'bg-yellow-100 text-yellow-800',
       error: 'bg-red-100 text-red-800',
     };

     return (
       <span className={cn(
         'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
         variantClasses[variant],
         className
       )}>
         {children}
       </span>
     );
   }
   ```

2. Add to `ui/primitives/index.ts` barrel export

## Testing
- `npm run build` passes
- Badge renders with correct styles for each variant

## Notes
- This component can be used to replace inline badge styles in future stories
- Existing badge implementations don't need to be updated in this story

## Estimated Effort
15 minutes
