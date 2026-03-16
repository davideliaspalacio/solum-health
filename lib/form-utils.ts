import type { FormDataMap, FieldData } from "@/types";

const DEFAULT_FIELD: FieldData = {
  value: null,
  confidence: "missing",
  needs_review: false,
  reason: null,
};

export function getField(
  formData: FormDataMap,
  key: string,
): FieldData {
  return formData[key] ?? { ...DEFAULT_FIELD };
}

export function updateFieldValue(
  formData: FormDataMap,
  key: string,
  value: string,
): FormDataMap {
  const existing = formData[key] ?? { ...DEFAULT_FIELD };
  return {
    ...formData,
    [key]: {
      ...existing,
      value: value || null,
      confidence: value ? "high" : "missing",
      needs_review: false,
    },
  };
}

export interface TableRow {
  index: number;
  cells: Record<string, FieldData>;
}

export function extractTableRows(
  formData: FormDataMap,
  prefix: string,
  columnKeys: string[],
): TableRow[] {
  const indexSet = new Set<number>();
  const pattern = new RegExp(`^${escapeRegex(prefix)}\\.(\\d+)\\.`);

  for (const key of Object.keys(formData)) {
    const match = key.match(pattern);
    if (match) {
      indexSet.add(parseInt(match[1], 10));
    }
  }

  const indices = Array.from(indexSet).sort((a, b) => a - b);

  return indices.map((index) => {
    const cells: Record<string, FieldData> = {};
    for (const col of columnKeys) {
      const key = `${prefix}.${index}.${col}`;
      cells[col] = formData[key] ?? { ...DEFAULT_FIELD };
    }
    return { index, cells };
  });
}

export function addTableRow(
  formData: FormDataMap,
  prefix: string,
  columnKeys: string[],
): FormDataMap {
  const pattern = new RegExp(`^${escapeRegex(prefix)}\\.(\\d+)\\.`);
  let maxIndex = -1;

  for (const key of Object.keys(formData)) {
    const match = key.match(pattern);
    if (match) {
      maxIndex = Math.max(maxIndex, parseInt(match[1], 10));
    }
  }

  const newIndex = maxIndex + 1;
  const updated = { ...formData };

  for (const col of columnKeys) {
    updated[`${prefix}.${newIndex}.${col}`] = { ...DEFAULT_FIELD };
  }

  return updated;
}

export function removeTableRow(
  formData: FormDataMap,
  prefix: string,
  rowIndex: number,
): FormDataMap {
  const updated = { ...formData };
  const rowPrefix = `${prefix}.${rowIndex}.`;

  for (const key of Object.keys(updated)) {
    if (key.startsWith(rowPrefix)) {
      delete updated[key];
    }
  }

  return updated;
}

export function updateTableCell(
  formData: FormDataMap,
  prefix: string,
  rowIndex: number,
  columnKey: string,
  value: string,
): FormDataMap {
  const key = `${prefix}.${rowIndex}.${columnKey}`;
  return updateFieldValue(formData, key, value);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getConfidenceColor(
  confidence: FieldData["confidence"],
): string {
  switch (confidence) {
    case "high":
      return "var(--confidence-high)";
    case "medium":
      return "var(--confidence-medium)";
    case "low":
      return "var(--confidence-low)";
    case "missing":
      return "var(--confidence-missing)";
  }
}

export function getConfidenceBg(
  confidence: FieldData["confidence"],
): string {
  switch (confidence) {
    case "high":
      return "bg-emerald-50";
    case "medium":
      return "bg-amber-50";
    case "low":
      return "bg-red-50";
    case "missing":
      return "bg-slate-50";
  }
}

export function getConfidenceBorder(
  confidence: FieldData["confidence"],
): string {
  switch (confidence) {
    case "high":
      return "border-l-emerald-500";
    case "medium":
      return "border-l-amber-500";
    case "low":
      return "border-l-red-500";
    case "missing":
      return "border-l-slate-300";
  }
}

export function getConfidenceLabel(
  confidence: FieldData["confidence"],
): string {
  switch (confidence) {
    case "high":
      return "High confidence";
    case "medium":
      return "Medium — needs verification";
    case "low":
      return "Low — likely incorrect";
    case "missing":
      return "Not found in documents";
  }
}
