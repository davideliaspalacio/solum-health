"use client";

import type { FormDataMap } from "@/types";
import type { SectionConfig } from "@/lib/form-config";
import { getField, updateFieldValue } from "@/lib/form-utils";
import { FieldInput } from "./FieldInput";
import { EditableTable } from "./EditableTable";

interface FormSectionProps {
  config: SectionConfig;
  formData: FormDataMap;
  onChange: (updated: FormDataMap) => void;
  index: number;
}

export function FormSection({
  config,
  formData,
  onChange,
  index,
}: FormSectionProps) {
  const handleFieldChange = (key: string, value: string) => {
    onChange(updateFieldValue(formData, key, value));
  };

  const isTextareaSection = config.fields.every((f) => f.type === "textarea");

  return (
    <div
      className={`animate-fade-in-up rounded-xl border bg-card overflow-hidden`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Section header */}
      <div className="border-b bg-muted/30 px-5 py-3">
        <div className="flex items-baseline gap-2">
          <h3
            className="text-base font-bold tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {config.title}
          </h3>
          {config.subtitle && (
            <span className="text-sm text-muted-foreground">
              {config.subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="p-5">
        <div
          className={
            isTextareaSection
              ? "space-y-3"
              : "grid grid-cols-1 md:grid-cols-2 gap-3"
          }
        >
          {config.fields.map((fieldConfig) => {
            const field = getField(formData, fieldConfig.key);
            return (
              <div
                key={fieldConfig.key}
                className={
                  fieldConfig.type === "textarea" ? "md:col-span-2" : ""
                }
              >
                <FieldInput
                  config={fieldConfig}
                  field={field}
                  onChange={(value) =>
                    handleFieldChange(fieldConfig.key, value)
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Tables */}
        {config.tables && config.tables.length > 0 && (
          <div className="mt-5 space-y-5 border-t pt-5">
            {config.tables.map((tableConfig) => (
              <EditableTable
                key={tableConfig.id}
                config={tableConfig}
                formData={formData}
                onChange={onChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
