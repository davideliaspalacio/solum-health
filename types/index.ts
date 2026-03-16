export interface FieldData {
  value: string | null;
  confidence: "high" | "medium" | "low" | "missing";
  needs_review: boolean;
  reason: string | null;
}

export type FormDataMap = Record<string, FieldData>;

export interface UploadResponse {
  document_ids: string[];
  thumbnails: string[];
}

export interface ExtractResponse {
  form_id: string;
  merged_data: FormDataMap;
  confidence: ConfidenceSummary;
}

export interface ConfidenceSummary {
  high: number;
  medium: number;
  low: number;
  missing: number;
}

export interface SourceDocument {
  id: string;
  filename: string;
  original_url: string;
  image_urls: string[];
  doc_type: string;
  status: string;
  page_count: number;
  file_size_bytes: number;
  created_at: string;
}

export interface FormResponse {
  id: string;
  form_type: string;
  form_data: FormDataMap;
  original_form_data: FormDataMap;
  status: "draft" | "in_review" | "approved";
  confidence_summary: ConfidenceSummary;
  source_documents: SourceDocument[];
  created_at: string;
  updated_at: string;
  approved_at: string | null;
}

export interface FormUpdateResponse {
  corrections_count: number;
  form: FormResponse;
}

export interface ApproveResponse {
  status: "approved";
  approved_at: string;
}

export interface AccuracyAnalytics {
  global_accuracy: number;
  by_field_section: Record<string, number>;
  by_doc_type: Record<string, number>;
  by_confidence: Record<string, number>;
  total_forms: number;
  total_corrections: number;
}

export interface AIUsageAnalytics {
  total_cost_usd: number;
  total_tokens: number;
  avg_tokens_per_doc: number;
  avg_duration_ms: number;
  by_doc_type: Record<
    string,
    { count: number; tokens: number; cost: number }
  >;
  by_model: Record<string, { count: number; tokens: number; cost: number }>;
  recent_calls: Array<{
    id: string;
    document_id: string;
    doc_type: string;
    total_tokens: number;
    estimated_cost: number;
    duration_ms: number;
    status: string;
  }>;
}
