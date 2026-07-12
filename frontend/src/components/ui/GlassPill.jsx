import React from 'react';

/**
 * GlassPill — Large, airy input dùng chung cho auth & các form premium.
 * Pill-shape, glyph slot trái, focus ring warm.
 */
const GlassPill = React.forwardRef(function GlassPill(
  { icon: Icon, className = '', label, error, ...inputProps },
  ref,
) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={inputProps.id} className="text-label-caps text-primary-deep/80 ml-1">
          {label}
        </label>
      )}
      <div className="group relative">
        {Icon && (
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-subtle group-focus-within:text-primary transition-colors duration-300">
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
        <input
          ref={ref}
          {...inputProps}
          className={[
            'w-full rounded-[var(--radius-pill)] glass-input',
            'h-14 pl-14 pr-14 py-2 outline-none',
            'font-medium text-[15px] text-ink placeholder:text-ink-subtle/70',
            'transition-all duration-300',
            'focus:bg-white focus:ring-glass-focus',
            error ? 'ring-2 ring-[var(--color-danger)]/60' : '',
          ].join(' ')}
        />
      </div>
      {error && <p className="text-xs text-[var(--color-danger)] ml-2 font-medium">{error}</p>}
    </div>
  );
});

export default GlassPill;
