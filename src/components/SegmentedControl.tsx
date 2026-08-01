import './SegmentedControl.css';

export type Segment = { key: string; label: string };

type Props = {
  segments: [Segment, Segment];
  value: string;
  onChange: (key: string) => void;
};

export function SegmentedControl({ segments, value, onChange }: Props) {
  const activeIndex = segments.findIndex((s) => s.key === value);

  return (
    <div className="segmented-control">
      <div
        className="segmented-control__thumb"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {segments.map((s) => (
        <button
          key={s.key}
          type="button"
          className={
            'segmented-control__item' +
            (s.key === value ? ' segmented-control__item--active' : '')
          }
          onClick={() => onChange(s.key)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
