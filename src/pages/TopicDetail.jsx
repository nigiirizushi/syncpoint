import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploadArea from "@/components/updates/FileUploadArea";
import UpdateCard from "@/components/updates/UpdateCard";
import EmptyState from "@/components/shared/EmptyState";

export default function TopicDetail() {
  const { projectId, topicId } = useParams();
  const [filter, setFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
  });

  const { data: topic } = useQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const topics = await base44.entities.Topic.filter({ id: topicId });
      return topics[0];
    },
  });

  const { data: updates = [] } = useQuery({
    queryKey: ["updates", topicId],
    queryFn: () => base44.entities.Update.filter({ topic_id: topicId }, "-created_date"),
  });

  const createUpdate = useMutation({
    mutationFn: (data) =>
      base44.entities.Update.create({
        ...data,
        project_id: projectId,
        topic_id: topicId,
        author_name: user?.full_name || "Unknown",
        decision_status: data.needs_decision ? "pending" : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["updates"] });
    },
  });

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    await createUpdate.mutateAsync(data);
    setIsSubmitting(false);
  };

  const handleDecision = async (update, status, note) => {
    await base44.entities.Update.update(update.id, {
      decision_status: status,
      decision_note: note || undefined,
      decided_by: user?.full_name || "Unknown",
      decided_at: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ["updates"] });
  };

  const handleDeleteFile = async (update, fileIndex) => {
    const currentDeleted = update.deleted_file_indices || [];
    const currentDates = update.deleted_file_dates || [];
    await base44.entities.Update.update(update.id, {
      deleted_file_indices: [...currentDeleted, fileIndex],
      deleted_file_dates: [...currentDates, new Date().toISOString()],
    });
    queryClient.invalidateQueries({ queryKey: ["updates"] });
  };

  const isAdmin = user?.role === "admin";

  const filteredUpdates = updates.filter((u) => {
    if (filter === "decisions") return u.needs_decision;
    if (filter === "pending") return u.needs_decision && u.decision_status === "pending";
    return true;
  });

  if (!project || !topic) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="h-1.5" style={{ backgroundColor: project.color }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to={`/project/${projectId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            {project.name}
          </Link>
          <h1 className="text-xl font-bold text-foreground tracking-tight">{topic.name}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <FileUploadArea onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        <div className="flex items-center justify-between">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="decisions" className="text-xs">Decisions</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="text-xs text-muted-foreground">
            {filteredUpdates.length} update{filteredUpdates.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredUpdates.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No updates yet"
            description="Post your first update or upload files above."
          />
        ) : (
          <div className="space-y-3">
            {filteredUpdates.map((update) => (
              <UpdateCard
                key={update.id}
                update={update}
                isAdmin={isAdmin}
                currentUserId={user?.id}
                onDecision={handleDecision}
                onDeleteFile={handleDeleteFile}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}