import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, AlertTriangle, FolderOpen } from "lucide-react";
import TopicCard from "@/components/topics/TopicCard";
import CreateTopicDialog from "@/components/topics/CreateTopicDialog";
import EmptyState from "@/components/shared/EmptyState";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
  });

  const { data: topics = [] } = useQuery({
    queryKey: ["topics", projectId],
    queryFn: () => base44.entities.Topic.filter({ project_id: projectId }),
  });

  const { data: updates = [] } = useQuery({
    queryKey: ["updates", projectId],
    queryFn: () => base44.entities.Update.filter({ project_id: projectId }, "-created_date"),
  });

  const createTopic = useMutation({
    mutationFn: (name) =>
      base44.entities.Topic.create({ name, project_id: projectId, is_default: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["topics", projectId] }),
  });

  if (isLoading || !project) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const pendingDecisions = updates.filter(
    (u) => u.needs_decision && u.decision_status === "pending"
  ).length;

  const sortedTopics = [...topics].sort((a, b) => {
    if (a.is_default) return -1;
    if (b.is_default) return 1;
    return new Date(a.created_date) - new Date(b.created_date);
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="h-1.5" style={{ backgroundColor: project.color }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Projects
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowCreateTopic(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New topic
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {pendingDecisions > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm font-medium text-amber-800">
              {pendingDecisions} item{pendingDecisions !== 1 ? "s" : ""} need{pendingDecisions === 1 ? "s" : ""} your decision
            </p>
          </div>
        )}

        {sortedTopics.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No topics yet"
            description="Topics help organise files and updates within a project."
          />
        ) : (
          <div className="grid gap-2">
            {sortedTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                updates={updates}
                projectId={projectId}
              />
            ))}
          </div>
        )}
      </main>

      <CreateTopicDialog
        open={showCreateTopic}
        onOpenChange={setShowCreateTopic}
        onSubmit={createTopic.mutateAsync}
      />
    </div>
  );
}