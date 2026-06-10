import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import EmptyState from "@/components/shared/EmptyState";

export default function Projects() {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const { data: topics = [] } = useQuery({
    queryKey: ["topics"],
    queryFn: () => base44.entities.Topic.list(),
  });

  const { data: updates = [] } = useQuery({
    queryKey: ["updates"],
    queryFn: () => base44.entities.Update.list("-created_date"),
  });

  const createProject = useMutation({
    mutationFn: async (data) => {
      const project = await base44.entities.Project.create(data);
      await base44.entities.Topic.create({
        name: "General",
        project_id: project.id,
        is_default: true,
      });
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });

  const isAdmin = user?.role === "admin";
  const activeProjects = projects.filter((p) => !p.is_archived);

  if (loadingProjects) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">
              {activeProjects.length} active project{activeProjects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New project
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {activeProjects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No projects yet"
            description="Create your first project to start tracking updates and decisions."
          >
            <Button onClick={() => setShowCreate(true)} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New project
            </Button>
          </EmptyState>
        ) : (
          <div className="grid gap-3">
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                topics={topics}
                updates={updates}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </main>

      <CreateProjectDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={createProject.mutateAsync}
        existingColors={projects.map((p) => p.color)}
      />
    </div>
  );
}