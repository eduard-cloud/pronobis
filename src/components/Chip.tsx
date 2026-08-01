import './Chip.css';

type Variant = 'cyan' | 'orange' | 'outline' | 'ink';

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  selected?: boolean;
  onClick?: () => void;
};

export function Chip({ children, variant = 'outline', selected, onClick }: Props) {
  const classes =
    `chip chip--${variant}` + (selected ? ' chip--selected' : '') + (onClick ? ' chip--tappable' : '');

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {children}
      </button>
    );
  }

  return <span className={classes}>{children}</span>;
}
