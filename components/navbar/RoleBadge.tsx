import { roleBadgeLabel, type SessionRole } from '@/lib/session-role';
import { cn } from '@/lib/cn';

export default function RoleBadge({ role }: { role: SessionRole }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5',
        'text-2xs font-bold uppercase tracking-wider whitespace-nowrap',
        role === 'seller'
          ? 'border-steel-400/50 bg-steel-500/15 text-steel-200'
          : 'border-rebar-500/50 bg-rebar-600/20 text-rebar-200'
      )}
      title={role === 'seller' ? 'Seller mode' : 'Buyer mode'}
    >
      {roleBadgeLabel(role)}
    </span>
  );
}
