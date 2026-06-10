import { formatDistanceToNow, isToday, isYesterday, differenceInHours } from "date-fns";

export default function RelativeDate({ date }) {
  if (!date) return null;
  const d = new Date(date);
  const hours = differenceInHours(new Date(), d);

  let text;
  if (hours < 1) text = "Just now";
  else if (isToday(d)) text = "Today";
  else if (isYesterday(d)) text = "Yesterday";
  else text = formatDistanceToNow(d, { addSuffix: true });

  return <span className="text-muted-foreground text-sm">{text}</span>;
}