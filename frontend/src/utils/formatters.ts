import { CURRENCY_SYMBOLS } from '../config/constants';

export function formatCurrency(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount == null || !currency) return '—';
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? currency;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

export function formatRetainerRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined
): string {
  if (min == null || max == null || !currency) return '—';
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)} / month`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
