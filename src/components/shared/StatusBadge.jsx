import { cn } from "@/lib/utils";

const variants = {
  new: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  noted: "bg-blue-50 text-blue-700 border-blue-200",
  waiting: "bg-amber-50 text-amber-700 border-amber-200",
  clear: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const labels = {
  new: "New",
  pending: "Needs decision",
  approved: "Approved",
  rejected: "Rejected",
  noted: "Noted",
  waiting: "waiting",
  clear: "All clear",
};

export default function StatusBadge({ status, count, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border",
        variants[status] || variants.pending,
        className
      )}
    >
      {count !== undefined && <span className="font-semibold">{count}</span>}
      {labels[status] || status}
    </span>
  );
}