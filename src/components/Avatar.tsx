import './Avatar.css';

type Props = {
  src: string;
  alt: string;
  size?: number;
  ring?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export function Avatar({
  src,
  alt,
  size = 44,
  ring = true,
  onClick,
  className,
  style,
}: Props) {
  const classes =
    'avatar' + (ring ? ' avatar--ring' : '') + (className ? ` ${className}` : '');
  const dims = { width: size, height: size, ...style };

  if (onClick) {
    return (
      <button type="button" className={classes} style={dims} onClick={onClick}>
        <img src={src} alt={alt} width={size} height={size} />
      </button>
    );
  }

  return (
    <div className={classes} style={dims}>
      <img src={src} alt={alt} width={size} height={size} />
    </div>
  );
}
