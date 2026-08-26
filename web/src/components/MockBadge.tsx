interface MockBadgeProps {
  hi?: string;
  en?: string;
}


export default function MockBadge({
  hi = "नमूना डेटा",
  en = "MOCKED",
}: MockBadgeProps) {
  return (
    <span className="mock-badge">
      {hi} · <span lang="en">{en}</span>
    </span>
  );
}
