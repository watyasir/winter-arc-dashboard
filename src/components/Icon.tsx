/** Small stroke icons used by the sidebar, tree and status marks. */
const paths = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  board: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  snowflake: "M12 2v20M4.9 6.9l14.2 10.2M19.1 6.9 4.9 17.1",
  check: "M5 12.5l4.5 4.5L19 7.5",
  alert: "M12 7v6M12 17h.01",
  chevronDown: "M6 9l6 6 6-6",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5",
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 13,
  strokeWidth = 2.4,
  className = "stroke-current",
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}
