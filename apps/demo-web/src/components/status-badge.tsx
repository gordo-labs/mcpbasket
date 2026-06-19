import { statusTone } from "@/features/basket/format";

interface StatusBadgeProps {
  children: React.ReactNode;
  status?: string;
}

export function StatusBadge({ children, status }: StatusBadgeProps) {
  return (
    <span className={`h-7 rounded-full border px-2.5 pt-1 text-xs ${statusTone(status)}`}>
      {children}
    </span>
  );
}
