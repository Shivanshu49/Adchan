interface MockBadgeProps {
  hi?: string;
  en?: string;
  tone?: "red" | "ink" | "ochre";
}


export default function MockBadge({
  hi = "नमूना",
  en = "MOCKED",
  tone = "red",
}: MockBadgeProps) {
  return (
    <span className={`mock-badge mock-badge-${tone}`}>
      {hi} · <span lang="en">{en}</span>
    </span>
  );
}
