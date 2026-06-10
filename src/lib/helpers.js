import { differenceInHours } from "date-fns";

export function isNew(dateStr) {
  if (!dateStr) return false;
  return differenceInHours(new Date(), new Date(dateStr)) <= 24;
}

export function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function getFileIcon(filename) {
  if (!filename) return "file";
  const ext = filename.split(".").pop().toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic", "heif"].includes(ext)) return "image";
  if (["doc", "docx", "odt", "rtf", "txt"].includes(ext)) return "word";
  if (["xls", "xlsx", "ods", "csv"].includes(ext)) return "spreadsheet";
  if (["ppt", "pptx", "odp"].includes(ext)) return "presentation";
  return "file";
}

// Maps file extensions to correct MIME types so browsers/mobile OSes
// hand files to the right editor (e.g. WPS Office, Adobe Acrobat).
export function getMimeType(filename) {
  if (!filename) return "application/octet-stream";
  const ext = filename.split(".").pop().toLowerCase();
  const map = {
    // Office Open XML
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Legacy Office
    doc: "application/msword",
    xls: "application/vnd.ms-excel",
    ppt: "application/vnd.ms-powerpoint",
    // OpenDocument
    odt: "application/vnd.oasis.opendocument.text",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    odp: "application/vnd.oasis.opendocument.presentation",
    // PDF
    pdf: "application/pdf",
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    heic: "image/heic",
    heif: "image/heif",
    // Text
    csv: "text/csv",
    txt: "text/plain",
    rtf: "application/rtf",
  };
  return map[ext] || "application/octet-stream";
}

/**
 * Download a file with the correct MIME type and filename so mobile OSes
 * (Android, iOS) hand it to the right editor (WPS Office, Acrobat, etc.)
 * Falls back to a plain anchor click on failure.
 */
export async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const mimeType = getMimeType(filename);
    const typedBlob = new Blob([blob], { type: mimeType });
    const objectUrl = URL.createObjectURL(typedBlob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  } catch {
    // Fallback: direct link open
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// Accepted file types for upload (everything WPS Office and common viewers handle)
export const ACCEPTED_FILE_TYPES =
  ".docx,.doc,.odt,.rtf,.txt," +
  ".xlsx,.xls,.ods,.csv," +
  ".pptx,.ppt,.odp," +
  ".pdf," +
  ".jpg,.jpeg,.png,.gif,.webp,.bmp,.heic,.heif,.svg";

export const ACCEPTED_FILE_LABEL = "docx · xlsx · pptx · pdf · images";

const PROJECT_COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#F97316",
  "#10B981", "#06B6D4", "#EAB308", "#EF4444",
  "#6366F1", "#14B8A6", "#F59E0B", "#84CC16",
];

export function getNextColor(existingColors = []) {
  const unused = PROJECT_COLORS.filter((c) => !existingColors.includes(c));
  if (unused.length > 0) return unused[0];
  return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
}