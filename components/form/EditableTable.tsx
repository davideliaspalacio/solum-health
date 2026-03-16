"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FormDataMap } from "@/types";
import type { TableConfig } from "@/lib/form-config";
import {
  extractTableRows,
  addTableRow,
  removeTableRow,
  updateTableCell,
  getConfidenceBorder,
} from "@/lib/form-utils";

interface EditableTableProps {
  config: TableConfig;
  formData: FormDataMap;
  onChange: (updated: FormDataMap) => void;
}

export function EditableTable({
  config,
  formData,
  onChange,
}: EditableTableProps) {
  const columnKeys = config.columns.map((c) => c.key);
  const rows = extractTableRows(formData, config.prefix, columnKeys);

  const handleCellChange = (
    rowIndex: number,
    columnKey: string,
    value: string,
  ) => {
    onChange(updateTableCell(formData, config.prefix, rowIndex, columnKey, value));
  };

  const handleAddRow = () => {
    onChange(addTableRow(formData, config.prefix, columnKeys));
  };

  const handleRemoveRow = (rowIndex: number) => {
    onChange(removeTableRow(formData, config.prefix, rowIndex));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {config.title}
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="h-7 gap-1 text-xs"
        >
          <Plus className="h-3 w-3" />
          Add Row
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {config.columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="text-xs font-semibold uppercase tracking-wider h-9"
                >
                  {col.label}
                </TableHead>
              ))}
              <TableHead className="w-10 h-9" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={config.columns.length + 1}
                  className="text-center text-sm text-muted-foreground py-6"
                >
                  No entries. Click &ldquo;Add Row&rdquo; to add one.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.index}>
                  {config.columns.map((col) => {
                    const cell = row.cells[col.key];
                    const borderColor = getConfidenceBorder(cell.confidence);
                    return (
                      <TableCell key={col.key} className="py-1 px-2">
                        <div className={`border-l-2 pl-2 ${borderColor}`}>
                          <Input
                            value={cell.value ?? ""}
                            onChange={(e) =>
                              handleCellChange(
                                row.index,
                                col.key,
                                e.target.value,
                              )
                            }
                            placeholder="—"
                            className="border-0 bg-transparent p-0 h-auto shadow-none focus-visible:ring-0 text-sm"
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="py-1 px-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.index)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
