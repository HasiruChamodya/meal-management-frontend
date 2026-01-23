import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "approved" | "pending" | "rejected"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    approved: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  }

  const labels = {
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold",
        variants[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  )
}
