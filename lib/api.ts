import type {
  UploadResponse,
  ExtractResponse,
  FormResponse,
  FormUpdateResponse,
  ApproveResponse,
  FormDataMap,
  AccuracyAnalytics,
  AIUsageAnalytics,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new ApiError(res.status, `${res.status}: ${text}`);
  }

  return res.json();
}

export const api = {
  uploadDocuments(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return request("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
  },

  extractDocuments(documentIds: string[]): Promise<ExtractResponse> {
    return request("/api/documents/extract", {
      method: "POST",
      body: JSON.stringify({ document_ids: documentIds }),
    });
  },

  getForm(formId: string): Promise<FormResponse> {
    return request(`/api/forms/${formId}`);
  },

  updateForm(
    formId: string,
    formData: FormDataMap,
  ): Promise<FormUpdateResponse> {
    return request(`/api/forms/${formId}`, {
      method: "PUT",
      body: JSON.stringify({ form_data: formData }),
    });
  },

  approveForm(formId: string): Promise<ApproveResponse> {
    return request(`/api/forms/${formId}/approve`, {
      method: "PUT",
    });
  },

  getFormPdfUrl(formId: string): string {
    return `${BASE_URL}/api/forms/${formId}/pdf`;
  },

  getAccuracyAnalytics(): Promise<AccuracyAnalytics> {
    return request("/api/analytics/accuracy");
  },

  getAIUsageAnalytics(): Promise<AIUsageAnalytics> {
    return request("/api/analytics/ai-usage");
  },
};
