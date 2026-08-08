type BilingualLabelProps = {
  primary: string;
  secondary: string;
  /** Stack on very small screens if line is long */
  stack?: boolean;
  primaryClassName?: string;
  secondaryClassName?: string;
  className?: string;
};

/** Renders "Primary / secondary" consistently across the app */
export default function BilingualLabel({
  primary,
  secondary,
  stack = false,
  primaryClassName = 'font-semibold',
  secondaryClassName = 'font-normal text-graphite-600',
  className = '',
}: BilingualLabelProps) {
  if (stack) {
    return (
      <span className={`inline-flex flex-col items-center leading-tight ${className}`}>
        <span className={primaryClassName}>{primary}</span>
        <span className={`text-xs mt-0.5 ${secondaryClassName}`}>{secondary}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-baseline justify-center gap-x-1.5 gap-y-0 text-center ${className}`}>
      <span className={primaryClassName}>{primary}</span>
      <span className="text-graphite-400 font-normal select-none" aria-hidden>
        /
      </span>
      <span className={`text-sm ${secondaryClassName}`}>{secondary}</span>
    </span>
  );
}
