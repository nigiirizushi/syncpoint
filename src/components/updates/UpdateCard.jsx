import { useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import RelativeDate from "@/components/shared/RelativeDate";
import FileRow from "@/components/updates/FileRow";
import { isNew } from "@/lib/helpers";

export default function UpdateCard({
  update,
  isAdmin,
  currentUserId,
  onDecision,
  onDeleteFile,
  onReupload,
}) {
  const deletedIndices = update.deleted_file_indices || [];
  const files = (update.file_urls || [])
    .map((url, i) => ({
      url,
      name: update.file_names?.[i] || "File",
      size: update.file_sizes?.[i] || 0,
      index: i,
      isDeleted: deletedIndices.includes(i),
    }))
    .filter((f) => !f.isDeleted);

  const canEdit = isAdmin || update.created_by_id === currentUserId;
  const updateIsNew = isNew(update.created_date);

  // Version re-upload tag — show if this update was a re-upload of a prior file
  const isVersion = !!update.version_of_file;

  return (
    <div className={`bg-card rounded-2xl border p-5 space-y-3 transition-colors ${
      updateIsNew ? "border-emerald-200/80" : "border-border/60"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{update.author_name}</span>
              {isVersion && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded">
                  new version
                </span>
              )}
              {updateIsNew && <StatusBadge status="new" />}
            </div>
            <RelativeDate date={update.created_date} />
          </div>
        </div>

        {update.needs_decision && (
          <StatusBadge
            status={update.decision_status === "pending" ? "pending" : update.decision_status}
          />
        )}
      </div>

      {/* Version context */}
      {isVersion && (
        <p className="text-xs text-muted-foreground bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2">
          New version of <span className="font-medium">{update.version_of_file}</span>
        </p>
      )}

      {/* Note text */}
      {update.text && (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {update.text}
        </p>
      )}

      {/* Files */}
      {files.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {files.map((file) => (
            <FileRow
              key={file.index}
              file={file}
              isNew={updateIsNew}
              canDelete={canEdit}
              canReupload={canEdit}
              onDelete={() => onDeleteFile(update, file.index)}
              onReupload={(f, newFile) => onReupload(update, f, newFile)}
            />
          ))}
        </div>
      )}

      {/* Decision result */}
      {update.needs_decision && update.decision_status !== "pending" && (
        <div className="mt-2 p-3 bg-muted/50 rounded-xl border border-border/40">
          <p className="text-xs text-muted-foreground mb-1">
            Decision by {update.decided_by} · <RelativeDate date={update.decided_at} />
          </p>
          {update.decision_note && (
            <p className="text-sm text-foreground">{update.decision_note}</p>
          )}
        </div>
      )}

      {/* Admin decision actions */}
      {isAdmin && update.needs_decision && update.decision_status === "pending" && (
        <DecisionActions update={update} onDecision={onDecision} />
      )}
    </div>
  );
}

function DecisionActions({ update, onDecision }) {
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDecision = async (status) => {
    setLoading(true);
    await onDecision(update, status, note.trim());
    setLoading(false);
    setShowNote(false);
    setNote("");
  };

  return (
    <div className="pt-2 border-t border-border/40 space-y-3">
      {showNote && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)..."
          className="w-full text-sm p-2.5 bg-muted/50 rounded-lg border-0 resize-none min-h-[60px] focus:outline-none focus:ring-1 focus:ring-ring"
        />
      )}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => handleDecision("approved")}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleDecision("rejected")}
          disabled={loading}
        >
          Reject
        </Button>
        {!showNote ? (
          <Button size="sm" variant="outline" onClick={() => setShowNote(true)}>
            Add note
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => handleDecision("noted")} disabled={loading}>
            Save note
          </Button>
        )}
      </div>
    </div>
  );
}