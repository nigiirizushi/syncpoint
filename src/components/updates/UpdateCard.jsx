import { useState } from "react";
import { FileText, Image, FileSpreadsheet, File, Download, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import FreshDot from "@/components/shared/FreshDot";
import RelativeDate from "@/components/shared/RelativeDate";
import { formatFileSize, getFileIcon, isNew } from "@/lib/helpers";

const iconMap = {
  pdf: FileText,
  image: Image,
  word: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: FileText,
  file: File,
};

export default function UpdateCard({ update, isAdmin, currentUserId, onDecision, onDeleteFile }) {
  const deletedIndices = update.deleted_file_indices || [];
  const files = (update.file_urls || []).map((url, i) => ({
    url,
    name: update.file_names?.[i] || "File",
    size: update.file_sizes?.[i] || 0,
    index: i,
    isDeleted: deletedIndices.includes(i),
  })).filter((f) => !f.isDeleted);

  const canDeleteFile = (fileIndex) => {
    return isAdmin || update.created_by_id === currentUserId;
  };

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <span className="text-sm font-medium">{update.author_name}</span>
            <div className="flex items-center gap-2">
              <RelativeDate date={update.created_date} />
              {isNew(update.created_date) && <StatusBadge status="new" />}
            </div>
          </div>
        </div>

        {update.needs_decision && (
          <StatusBadge
            status={update.decision_status === "pending" ? "pending" : update.decision_status}
          />
        )}
      </div>

      {update.text && (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {update.text}
        </p>
      )}

      {files.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {files.map((file) => {
            const type = getFileIcon(file.name);
            const Icon = iconMap[type] || File;
            return (
              <div
                key={file.index}
                className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-lg group"
              >
                <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                {isNew(update.created_date) && (
                  <StatusBadge status="new" className="text-[10px] px-1.5 py-0" />
                )}
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                {canDeleteFile(file.index) && (
                  <button
                    onClick={() => onDeleteFile(update, file.index)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {update.decision_status !== "pending" && update.needs_decision && (
        <div className="mt-2 p-3 bg-muted/50 rounded-xl border border-border/40">
          <p className="text-xs text-muted-foreground mb-1">
            Decision by {update.decided_by} · <RelativeDate date={update.decided_at} />
          </p>
          {update.decision_note && (
            <p className="text-sm text-foreground">{update.decision_note}</p>
          )}
        </div>
      )}

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
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDecision("noted")}
            disabled={loading}
          >
            Save note
          </Button>
        )}
      </div>
    </div>
  );
}