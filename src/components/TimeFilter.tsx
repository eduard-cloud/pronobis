import { Chip } from './Chip';
import type { TimeBucket } from '../utils/eventTime';
import './TimeFilter.css';

type Props = {
  bucket: TimeBucket;
  onBucketChange: (bucket: TimeBucket) => void;
  counts: Record<TimeBucket, number>;
};

const BUCKETS: { key: TimeBucket; label: string }[] = [
  { key: 'now', label: 'Now' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
];

// Bucketing by time is the real overload control — it does more for
// cognitive load on a national events map than any per-pin tweak.
export function TimeFilter({ bucket, onBucketChange, counts }: Props) {
  return (
    <div className="time-filter">
      {BUCKETS.map(({ key, label }) => (
        <Chip key={key} variant="ink" selected={bucket === key} onClick={() => onBucketChange(key)}>
          {label}
          {bucket === key ? ` ${counts[key]}` : ''}
        </Chip>
      ))}
    </div>
  );
}
