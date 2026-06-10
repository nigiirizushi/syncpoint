import { Link } from "react-router-dom";
import { Folder, MessageSquare, FileText } from "lucide-react";
import FreshDot from "@/components/shared/FreshDot";
import StatusBadge from "@/components/shared/StatusBadge";
import RelativeDate from "@/components/shared/RelativeDate";
import { isNew } from "@/lib/helpers";

export default function ProjectCard({ project, topics, updates, isAdmin }) {
  const projectUpdates = updates.filter((u) => u.project_id === project.id);
  const projectTopics = topics.filter((t) => t.project_id === project.id);
  const pendingDecisions = projectUpdates.filter(
    (u) => u.needs_decision && u.decision_status === "pending"
  ).length;
  const totalFiles = projectUpdates.reduce(
    (sum, u) => sum + (u.file_urls?.length || 0),
    0
  );
  const hasNew = projectUpdates.some((u) => isNew(u.created_date));
  const lastUpdate = projectUpdates.length
    ? projectUpdates.reduce((a, b) =>
        new Date(a.created_date) > new Date(b.created_date) ? a : b
      )
    : null;

  return (
    <Link
      to={`/project/${project.id}`}
      className="group block bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all duration-200 overflow-hidden"
    >
      <div className="h-1.5" style={{ backgroundColor: project.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {hasNew && <FreshDot className="flex-shrink-0" />}
            <h3 className="font-semibold text-foreground truncate text-base group-hover:text-primary/80 transition-colors">
              {project.name}
            </h3>
          </div>
          {isAdmin && pendingDecisions > 0 && (
            <StatusBadge status="waiting" count={pendingDecisions} className="flex-shrink-0" />
          )}
          {isAdmin && pendingDecisions === 0 && projectUpdates.length > 0 && (
            <StatusBadge status="clear" className="flex-shrink-0" />
          )}
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5" />
            {projectTopics.length}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            {projectUpdates.length}
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {totalFiles}
          </span>
          {lastUpdate && (
            <span className="ml-auto">
              <RelativeDate date={lastUpdate.created_date} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}