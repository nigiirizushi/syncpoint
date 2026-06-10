import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, Image, FileSpreadsheet, File, AlertTriangle, Loader2 } from "lucide-react";
import { formatFileSize, getFileIcon, ACCEPTED_FILE_TYPES, ACCEPTED_FILE_LABEL } from "@/lib/helpers";
import { base44 } from "@/api/base44Client";

const iconMap = {
  pdf: FileText,
  image: Image,
  word: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: FileText,
  file: File,
};

export default function FileUploadArea({ onSubmit, isSubmitting }) {
  const [note, setNote] = useState("");
  const [needsDecision, setNeedsDecision] = useState(false);
  const [stagedFiles, setStagedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setStagedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStaged = (index) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!note.trim() && stagedFiles.length === 0) return;

    const uploadedUrls = [];
    const uploadedNames = [];
    const uploadedSizes = [];

    for (const file of stagedFiles) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedUrls.push(file_url);
      uploadedNames.push(file.name);
      uploadedSizes.push(file.size);
    }

    await onSubmit({
      text: note.trim(),
      needs_decision: needsDecision,
      file_urls: uploadedUrls,
      file_names: uploadedNames,
      file_sizes: uploadedSizes,
    });

    setNote("");
    setNeedsDecision(false);
    setStagedFiles([]);
  };

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4">
      <Textarea
        placeholder="Write an update or describe the files..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-1 rounded-xl p-3"
      />

      {stagedFiles.length > 0 && (
        <div className="space-y-2">
          {stagedFiles.map((file, i) => {
            const type = getFileIcon(file.name);
            const Icon = iconMap[type] || File;
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 bg-muted/40 rounded-lg"
              >
                <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                <button
                  onClick={() => removeStaged(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Choose files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES}
            className="hidden"
            onChange={handleFileSelect}
          />
          <span className="text-xs text-muted-foreground hidden sm:block">{ACCEPTED_FILE_LABEL}</span>

          <div className="flex items-center gap-2">
            <Switch
              id="needs-decision"
              checked={needsDecision}
              onCheckedChange={setNeedsDecision}
            />
            <Label htmlFor="needs-decision" className="text-sm flex items-center gap-1.5 cursor-pointer">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Needs decision
            </Label>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (!note.trim() && stagedFiles.length === 0)}
          size="sm"
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Uploading...
            </>
          ) : (
            "Post update"
          )}
        </Button>
      </div>
    </div>
  );
}