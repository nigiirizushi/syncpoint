import { cn } from "@/lib/utils";

export default function FreshDot({ className }) {
  return (
    <span
      className={cn(
        "inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20",
        className
      )}
    />
  );
}