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
  if (["pdf"].includes(ext)) return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx", "csv"].includes(ext)) return "spreadsheet";
  if (["ppt", "pptx"].includes(ext)) return "presentation";
  return "file";
}

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