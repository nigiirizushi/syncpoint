import { Link } from "react-router-dom";
import { Folder, FileText } from "lucide-react";
import FreshDot from "@/components/shared/FreshDot";
import RelativeDate from "@/components/shared/RelativeDate";
import { isNew } from "@/lib/helpers";

export default function TopicCard({ topic, updates, projectId }) {
  const topicUpdates = updates.filter((u) => u.topic_id === topic.id);
  const totalFiles = topicUpdates.reduce(
    (sum, u) => sum + (u.file_urls?.length || 0),
    0
  );
  const hasNew = topicUpdates.some((u) => isNew(u.created_date));
  const lastUpdate = topicUpdates.length
    ? topicUpdates.reduce((a, b) =>
        new Date(a.created_date) > new Date(b.created_date) ? a : b
      )
    : null;

  return (
    <Link
      to={`/project/${projectId}/topic/${topic.id}`}
      className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-border/60 hover:shadow-sm hover:border-border transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
        <Folder className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {hasNew && <FreshDot />}
          <h4 className="font-medium text-foreground truncate group-hover:text-primary/80 transition-colors">
            {topic.name}
          </h4>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {totalFiles} file{totalFiles !== 1 ? "s" : ""}
          </span>
          <span>{topicUpdates.length} update{topicUpdates.length !== 1 ? "s" : ""}</span>
          {lastUpdate && <RelativeDate date={lastUpdate.created_date} />}
        </div>
      </div>
    </Link>
  );
}