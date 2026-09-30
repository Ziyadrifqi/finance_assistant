import { SOURCE_TYPE_ICON, SourceType } from "@/lib/sources";

interface SourceBadgeProps {
  name: string;
  type: SourceType | null;
  color: string;
  /** Teks tambahan di belakang nama, mis. nominal */
  extra?: string;
}

export function SourceBadge({ name, type, color, extra }: SourceBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold border max-w-full"
      style={{ backgroundColor: `${color}14`, borderColor: `${color}30`, color }}
    >
      <span>{type ? SOURCE_TYPE_ICON[type] : "❔"}</span>
      <span className="truncate">{name}</span>
      {extra && <span className="opacity-80 font-medium shrink-0">· {extra}</span>}
    </span>
  );
}