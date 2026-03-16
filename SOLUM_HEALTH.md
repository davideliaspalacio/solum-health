# Solum Health — Frontend Technical Documentation

## Overview

Solum Health is a medical document processing system that uses AI (GPT-4o-mini) to extract structured data from clinical documents and auto-fill a **"Request for Approval of Services"** form. This frontend provides the complete user interface: document upload, AI extraction with real-time feedback, interactive form editing with confidence indicators, PDF generation, and an analytics dashboard.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui (base-nova) | Built on @base-ui/react |
| Icons | lucide-react | 0.577.0 |
| CSS Utilities | class-variance-authority, clsx, tailwind-merge | — |

**Backend**: FastAPI (Python) at `http://localhost:8000` — the frontend communicates exclusively through the REST API, never directly with Supabase.

---

## Architecture

```
app/
├── layout.tsx                 # Root layout (fonts, TooltipProvider)
├── page.tsx                   # Main 3-step workflow (client component)
├── globals.css                # Theme, animations, custom properties
└── analytics/
    └── page.tsx               # Analytics dashboard page

components/
├── StepIndicator.tsx          # 3-step progress bar
├── Confirmation.tsx           # Approval success + inline PDF viewer
├── ui/                        # shadcn/ui primitives (12 components)
├── upload/
│   └── UploadZone.tsx         # Drag-and-drop + extraction skeleton
├── form/
│   ├── FormReview.tsx         # Main review container (2-col layout)
│   ├── FormSection.tsx        # Single section renderer (Header, A–G)
│   ├── FieldInput.tsx         # Individual field with confidence UI
│   ├── EditableTable.tsx      # Dynamic table (medications, assessments)
│   └── ConfidenceBar.tsx      # Stacked confidence summary bar
├── documents/
│   └── DocumentViewer.tsx     # Source document sidebar with zoom modal
└── analytics/
    └── Dashboard.tsx          # KPI cards, charts, expandable AI call log

lib/
├── api.ts                     # API client (fetch wrapper, all endpoints)
├── form-config.ts             # Form section/field definitions
├── form-utils.ts              # Field manipulation, table parsing, confidence helpers
└── utils.ts                   # cn() utility (clsx + tailwind-merge)

types/
└── index.ts                   # TypeScript interfaces for all API schemas
```

---

## Application Flow

### Step 1: Upload Documents

**Component**: `UploadZone`

1. User drags-and-drops or browses files (max 6 files, PDF/PNG/JPG, 10MB each)
2. Files are validated client-side (type, size, count)
3. On "Extract Data" click:
   - `POST /api/documents/upload` — uploads files, receives `document_ids` and `thumbnails`
   - `POST /api/documents/extract` — triggers AI extraction, receives `form_id`
4. During extraction (5–15s), an **animated skeleton** simulates the form being built:
   - **Phase 1** (0–2.5s): "Reading documents..." — scan line sweeps over skeleton sections
   - **Phase 2** (2.5–6s): "Extracting structured data..." — AI analyzing content
   - **Phase 3** (6s+): "Filling out the form..." — fields fill one-by-one with confidence colors
5. A live confidence tally updates in real-time showing high/medium/low/missing counts

### Step 2: Review & Edit Form

**Component**: `FormReview` → `FormSection` → `FieldInput` / `EditableTable`

1. Form data loaded via `GET /api/forms/{form_id}`
2. Layout: form sections on left (~75%), source documents on right (~25%)
3. Each field displays:
   - **Left border** color-coded by confidence (emerald/amber/red/gray)
   - **Warning icon** if `needs_review` is true
   - **Info tooltip** showing the AI's `reason` for that extraction
   - **Confidence label** on hover (e.g., "Low — likely incorrect")
4. Table fields (medications, assessment tools) render as editable tables with add/remove row
5. **Sticky action bar** at bottom with: Download PDF | Save Changes | Approve Form
6. Save calls `PUT /api/forms/{form_id}` with the entire `form_data` object
7. Approve calls save first, then `PUT /api/forms/{form_id}/approve`

### Step 3: Confirmation

**Component**: `Confirmation`

1. Success header with corrections count
2. **Inline PDF preview**: fetches PDF as blob via `GET /api/forms/{form_id}/pdf`, creates object URL, renders in iframe
3. Download button and links to process new documents or view analytics

---

## Data Model

### Field Structure

Every extracted field follows this schema:

```typescript
interface FieldData {
  value: string | null;          // Extracted text value
  confidence: "high" | "medium" | "low" | "missing";
  needs_review: boolean;         // AI flagged for human review
  reason: string | null;         // Why AI assigned this confidence
}
```

### Flat Dot-Notation Keys

Fields use flat keys like `section_a.member_name`, not nested objects. Table fields use indexed notation: `section_e.medications.0.medication`.

The `form-utils.ts` module provides utilities to:
- Parse flat keys into table rows (`extractTableRows`)
- Add/remove/update rows while maintaining the flat structure
- Convert back to flat notation when saving

### Form Sections

| Section | ID | Fields | Description |
|---------|-----|--------|-------------|
| Header | `header` | 4 | Payer info, request date |
| Section A | `section_a` | 7 | Member name, DOB, gender, ID, address |
| Section B | `section_b` | 7 | Requesting provider, NPI, facility |
| Section C | `section_c` | 3 | Referring provider (if different) |
| Section D | `section_d` | 9 | Service type, CPT/ICD-10 codes, dates |
| Section E | `section_e` | 3 fields + 2 tables | Symptoms, history, medications table, assessments table |
| Section F | `section_f` | 2 | Medical necessity, risk assessment |
| Section G | `section_g` | 4 | Provider signature, license |

---

## API Client (`lib/api.ts`)

All communication goes through a centralized fetch wrapper with automatic error handling.

```typescript
const api = {
  uploadDocuments(files: File[]): Promise<UploadResponse>
  // POST /api/documents/upload (multipart/form-data)

  extractDocuments(documentIds: string[]): Promise<ExtractResponse>
  // POST /api/documents/extract

  getForm(formId: string): Promise<FormResponse>
  // GET /api/forms/{form_id}

  updateForm(formId: string, formData: FormDataMap): Promise<FormUpdateResponse>
  // PUT /api/forms/{form_id}

  approveForm(formId: string): Promise<ApproveResponse>
  // PUT /api/forms/{form_id}/approve

  getFormPdfUrl(formId: string): string
  // Returns URL for GET /api/forms/{form_id}/pdf

  getAccuracyAnalytics(): Promise<AccuracyAnalytics>
  // GET /api/analytics/accuracy

  getAIUsageAnalytics(): Promise<AIUsageAnalytics>
  // GET /api/analytics/ai-usage
}
```

The base URL defaults to `http://localhost:8000` and can be overridden via `NEXT_PUBLIC_API_URL`.

Content-Type is set automatically: `application/json` for JSON bodies, omitted for `FormData` (file uploads).

---

## Confidence System

Confidence is the core UX differentiator. Every field carries a confidence level that drives visual treatment:

| Level | Border Color | Background | Behavior |
|-------|-------------|------------|----------|
| **High** | Emerald (`#059669`) | `emerald-50` | Subtle green tint, no action needed |
| **Medium** | Amber (`#d97706`) | `amber-50` | Yellow warning, verify recommended |
| **Low** | Red (`#dc2626`) | `red-50` | Red alert, likely incorrect, pulsing indicator |
| **Missing** | Slate (`#94a3b8`) | `slate-50` | Gray, empty placeholder, "Not found" label |

Additional indicators:
- `needs_review: true` → amber warning triangle icon
- `reason` text → info icon with tooltip showing the AI's explanation
- Focus glow: field border glow matches confidence color on focus

### Confidence Bar

A horizontal stacked bar at the top of the form shows the proportion of high/medium/low/missing fields with a legend and counts.

---

## Extraction Skeleton Animation

During AI processing, instead of a generic spinner, the UI shows an animated skeleton that mirrors the actual form structure:

1. **8 skeleton sections** match the real form (Header, A–G) with correct field counts
2. **Scan line**: a glowing teal line sweeps vertically during phases 1–2
3. **Shimmer effect**: unfilled fields pulse with a gradient shimmer
4. **Progressive fill**: fields turn colored one-by-one based on a simulated confidence distribution (~45% high, ~25% medium, ~15% low, ~15% missing)
5. **Live tally**: confidence counts update in real-time as fields fill
6. **Low/missing warnings**: fields that fill as low get a pulsing red dot with "Low confidence" text

This makes the 5–15 second wait feel shorter because the user sees constant visual progress.

---

## Analytics Dashboard

**Route**: `/analytics`

### KPI Cards
- **Global Accuracy** — percentage of fields that didn't need correction
- **Total Forms** — number of forms processed
- **Total AI Cost** — cumulative GPT-4o-mini API cost in USD
- **Avg Duration** — average extraction time per document

### Charts
- **Corrections by Section** — horizontal bar chart showing which sections get the most corrections
- **Corrections by Confidence Level** — bar chart with confidence colors

### AI Usage
- **By Model** — cards showing call count, token usage, and cost per model
- **Recent AI Calls** — table with expandable rows showing:
  - Call ID, Document ID (monospace, truncated)
  - Document type, status (color-coded badge)
  - Total tokens, estimated cost (6 decimal places), duration (ms + seconds)

---

## Design System

### Typography
- **Body**: Plus Jakarta Sans — geometric, clean, modern
- **Display/Headings**: DM Serif Display — editorial, warm, authoritative
- Applied via CSS custom properties (`--font-sans`, `--font-serif`)

### Color Theme (OKLch)

The theme uses OKLch color space for perceptually uniform colors:

| Role | Value | Hex Approx |
|------|-------|-----------|
| Primary | `oklch(0.35 0.10 250)` | Deep navy blue |
| Primary Foreground | `oklch(0.98 0.005 250)` | White |
| Accent | `oklch(0.55 0.14 195)` | Teal/cyan |
| Background | `oklch(0.975 0.006 250)` | Very light blue-gray |
| Card | `oklch(1 0 0)` | Pure white |
| Foreground | `oklch(0.18 0.03 255)` | Near-black blue |
| Muted | `oklch(0.50 0.02 250)` | Mid-gray |
| Border | `oklch(0.90 0.01 250)` | Light gray |

### Animations

All defined in `globals.css` with CSS `@keyframes`:

| Class | Effect | Duration |
|-------|--------|----------|
| `.animate-fade-in-up` | Fade in + slide up 12px | 0.5s |
| `.animate-fade-in` | Fade in | 0.4s |
| `.animate-slide-in-right` | Fade in + slide from right 20px | 0.4s |
| `.animate-pulse-soft` | Gentle opacity pulse | 2s infinite |
| `.animate-scale-in` | Fade in + scale from 95% | 0.3s |
| `.skeleton-shimmer` | Gradient sweep loading effect | 1.5s infinite |
| `.scan-line` | Glowing horizontal scan line | 2.5s infinite |
| `.stagger-1` to `.stagger-8` | Staggered animation delays (50ms increments) | — |

---

## Component Interaction Diagram

```
HomePage (page.tsx)
│
├── step=1 ─→ UploadZone
│                ├── POST /api/documents/upload
│                ├── POST /api/documents/extract
│                └── ExtractionSkeleton (animated loading)
│
├── step=2 ─→ FormReview
│                ├── GET /api/forms/{form_id}
│                ├── ConfidenceBar
│                ├── FormSection[] (Header, A–G)
│                │     ├── FieldInput[] (text, textarea, select)
│                │     └── EditableTable[] (medications, assessments)
│                ├── DocumentViewer (sidebar)
│                │     └── Dialog (zoom modal)
│                ├── PUT /api/forms/{form_id}       ← Save
│                ├── GET /api/forms/{form_id}/pdf   ← Download PDF
│                └── PUT /api/forms/{form_id}/approve ← Approve
│
└── step=3 ─→ Confirmation
                 ├── GET /api/forms/{form_id}/pdf (blob → iframe)
                 └── Links: New Form, Analytics

AnalyticsPage (/analytics)
└── Dashboard
     ├── GET /api/analytics/accuracy
     ├── GET /api/analytics/ai-usage
     ├── StatCards (4 KPIs)
     ├── Bar Charts (corrections)
     ├── Model Usage Cards
     └── AICallRow[] (expandable table)
```

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Start dev server (port 3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

**Requirements**: The FastAPI backend must be running at `http://localhost:8000` (or set `NEXT_PUBLIC_API_URL`).

---

## Key Implementation Details

1. **No Supabase client** — all data flows through the FastAPI backend
2. **CORS** — backend allows `http://localhost:3000`
3. **Flat form data** — `form_data` is a flat `Record<string, FieldData>` with dot-notation keys, not nested objects
4. **Table field parsing** — `form-utils.ts` handles converting between flat `section_e.medications.0.medication` keys and table row arrays
5. **Full save** — `PUT /api/forms/{form_id}` always sends ALL fields, not just changed ones
6. **PDF as blob** — the PDF endpoint returns `Content-Disposition: attachment`, so the Confirmation component fetches it as a blob and creates an object URL for iframe rendering
7. **Confidence drives UX** — every visual treatment (borders, backgrounds, icons, tooltips, glow effects) is derived from the `confidence` field
