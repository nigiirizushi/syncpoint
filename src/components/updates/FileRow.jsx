import { useRef, useState } from "react";
import {
  FileText, Image, FileSpreadsheet, File, Download,
  Trash2, RefreshCw, Loader2, UploadCloud,
} from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatFileSize, getFileIcon, downloadFile, ACCEPTED_FILE_TYPES } from "@/lib/helpers";
import { isNew } from "@/lib/helpers";

const iconMap = {
  pdf: FileText,
  image: Image,
  word: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: FileText,
  file: File,
};

// Colour-coded extension pill
function ExtBadge({ filename }) {
  if (!filename) return null;
  const ext = filename.split(".").pop().toLowerCase();
  const colours = {
    docx: "bg-blue-50 text-blue-600 border-blue-200",
    doc:  "bg-blue-50 text-blue-600 border-blue-200",
    xlsx: "bg-emerald-50 text-emerald-700 border-emerald-200",
    xls:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    csv:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    pptx: "bg-orange-50 text-orange-600 border-orange-200",
    ppt:  "bg-orange-50 text-orange-600 border-orange-200",
    pdf:  "bg-red-50 text-red-600 border-red-200",
    jpg:  "bg-purple-50 text-purple-600 border-purple-200",
    jpeg: "bg-purple-50 text-purple-600 border-purple-200",
    png:  "bg-purple-50 text-purple-600 border-purple-200",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border flex-shrink-0 ${colours[ext] || "bg-muted text-muted-foreground border-border"}`}>
      {ext}
    </span>
  );
}

export default function FileRow({
  file,            // { url, name, size, index }
  isNew: fresh,
  canDelete,
  canReupload,
  onDelete,
  onReupload,      // (file: File) => void  — called with the new File object
}) {
  const inputRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [reuploading, setReuploading] = useState(false);

  const type = getFileIcon(file.name);
  const Icon = iconMap[type] || File;

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    await downloadFile(file.url, file.name);
    setDownloading(false);
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setReuploading(true);
    await onReupload(file, selected);
    setReuploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg group">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />

      <span className="text-sm font-medium truncate flex-1 min-w-0">{file.name}</span>

      <ExtBadge filename={file.name} />

      {fresh && (
        <StatusBadge status="new" className="text-[10px] px-1.5 py-0 flex-shrink-0" />
      )}

      <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">
        {formatFileSize(file.size)}
      </span>

      {/* Download — fetch+blob so mobile gets correct MIME type */}
      <button
        onClick={handleDownload}
        title="Download"
        className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
        disabled={downloading}
      >
        {downloading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Download className="w-3.5 h-3.5" />}
      </button>

      {/* Re-upload new version */}
      {canReupload && (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            title="Upload new version"
            className="text-muted-foreground hover:text-primary transition-colors p-1 flex-shrink-0 opacity-0 group-hover:opacity-100"
            disabled={reuploading}
          >
            {reuploading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <UploadCloud className="w-3.5 h-3.5" />}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}

      {/* Delete */}
      {canDelete && (
        <button
          onClick={() => onDelete()}
          title="Remove file"
          className="text-muted-foreground hover:text-destructive transition-colors p-1 flex-shrink-0 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}