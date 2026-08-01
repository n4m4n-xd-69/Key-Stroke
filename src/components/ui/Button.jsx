import { forwardRef, useCallback, useRef, useState } from 'react';
import { cx } from '../../lib/format.js';

const VARIANTS = {
  primary:
    'bg-ink text-bg hover:bg-ink/90 shadow-sm dark:bg-brand-solid dark:text-brand-ink dark:hover:bg-brand-solid/90',
  brand:
    'bg-brand-solid text-brand-ink hover:brightness-105 shadow-sm',
  secondary:
    'bg-surface text-ink border border-line hover:border-line-strong hover:bg-subtle',
  ghost: 'text-ink-2 hover:text-ink hover:bg-subtle',
  quiet: 'text-ink-3 hover:text-ink',
  danger: 'bg-bad text-white hover:brightness-110',
};

const SIZES = {
  sm: 'h-[32px] px-2 text-xs gap-0.5 rounded-xs',
  md: 'h-[40px] px-2.5 text-sm gap-1 rounded-sm',
  lg: 'h-[48px] px-3 text-base gap-1 rounded-md',
};

/**
 * The one button. Ripple origin follows the pointer, which is what makes the
 * effect read as a response rather than a decoration.
 */
const Button = forwardRef(function Button(
  { as: Tag = 'button', variant = 'secondary', size = 'md', icon: Icon, iconRight: IconRight, className, children, ripple = true, ...props },
  ref,
) {
  const [ripples, setRipples] = useState([]);
  const nextId = useRef(0);

  const onPointerDown = useCallback(
    (event) => {
      props.onPointerDown?.(event);
      if (!ripple || props.disabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const id = nextId.current++;
      setRipples((r) => [...r, { id, x: event.clientX - rect.left, y: event.clientY - rect.top }]);
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 600);
    },
    [ripple, props],
  );

  return (
    <Tag
      ref={ref}
      {...props}
      onPointerDown={onPointerDown}
      className={cx(
        'relative inline-flex select-none items-center justify-center overflow-hidden font-semibold',
        'transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-out',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {Icon ? <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.2} aria-hidden /> : null}
      {children}
      {IconRight ? <IconRight size={size === 'sm' ? 14 : 16} strokeWidth={2.2} aria-hidden /> : null}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          className="pointer-events-none absolute h-[24px] w-[24px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-current opacity-20 animate-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </Tag>
  );
});

export default Button;

export function IconButton({ label, icon: Icon, className, size = 'md', ...props }) {
  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={label}
      title={label}
      className={cx('aspect-square !px-0', className)}
      {...props}
    >
      <Icon size={16} strokeWidth={2.2} aria-hidden />
    </Button>
  );
}
