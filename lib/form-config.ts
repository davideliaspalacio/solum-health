export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  options?: string[];
  placeholder?: string;
}

export interface TableConfig {
  id: string;
  title: string;
  prefix: string;
  columns: { key: string; label: string }[];
}

export interface SectionConfig {
  id: string;
  title: string;
  subtitle?: string;
  fields: FieldConfig[];
  tables?: TableConfig[];
}

export const FORM_SECTIONS: SectionConfig[] = [
  {
    id: "header",
    title: "Header",
    subtitle: "Request for Approval of Services",
    fields: [
      { key: "header.payer", label: "Insurance Payer", type: "text" },
      {
        key: "header.date_of_request",
        label: "Date of Request",
        type: "text",
        placeholder: "MM/DD/YYYY",
      },
      { key: "header.payer_fax", label: "Payer Fax", type: "text" },
      { key: "header.payer_phone", label: "Payer Phone", type: "text" },
    ],
  },
  {
    id: "section_a",
    title: "Section A",
    subtitle: "Member Information",
    fields: [
      {
        key: "section_a.member_name",
        label: "Member Name",
        type: "text",
        placeholder: "Last, First, MI",
      },
      {
        key: "section_a.date_of_birth",
        label: "Date of Birth",
        type: "text",
        placeholder: "MM/DD/YYYY",
      },
      {
        key: "section_a.gender",
        label: "Gender",
        type: "select",
        options: ["Male", "Female", "Other"],
      },
      { key: "section_a.member_id", label: "Member ID", type: "text" },
      { key: "section_a.group_number", label: "Group Number", type: "text" },
      { key: "section_a.phone_number", label: "Phone Number", type: "text" },
      { key: "section_a.address", label: "Address", type: "text" },
    ],
  },
  {
    id: "section_b",
    title: "Section B",
    subtitle: "Requesting Provider Information",
    fields: [
      { key: "section_b.provider_name", label: "Provider Name", type: "text" },
      { key: "section_b.provider_npi", label: "NPI", type: "text" },
      {
        key: "section_b.facility_practice_name",
        label: "Facility / Practice Name",
        type: "text",
      },
      { key: "section_b.tax_id", label: "Tax ID", type: "text" },
      { key: "section_b.phone", label: "Phone", type: "text" },
      { key: "section_b.fax", label: "Fax", type: "text" },
      { key: "section_b.address", label: "Address", type: "text" },
    ],
  },
  {
    id: "section_c",
    title: "Section C",
    subtitle: "Referring Provider (if different)",
    fields: [
      {
        key: "section_c.referring_provider_name",
        label: "Referring Provider Name",
        type: "text",
      },
      {
        key: "section_c.referring_provider_npi",
        label: "Referring Provider NPI",
        type: "text",
      },
      { key: "section_c.phone", label: "Phone", type: "text" },
    ],
  },
  {
    id: "section_d",
    title: "Section D",
    subtitle: "Service Information",
    fields: [
      {
        key: "section_d.type_of_service",
        label: "Type of Service",
        type: "select",
        options: [
          "Outpatient",
          "Inpatient",
          "Intensive Outpatient",
          "Partial Hospitalization",
          "Residential",
          "Other",
        ],
      },
      {
        key: "section_d.service_setting",
        label: "Service Setting",
        type: "text",
      },
      {
        key: "section_d.cpt_hcpcs_codes",
        label: "CPT/HCPCS Codes",
        type: "text",
        placeholder: "Comma-separated",
      },
      {
        key: "section_d.icd10_diagnosis_codes",
        label: "ICD-10 Diagnosis Codes",
        type: "text",
        placeholder: "Comma-separated",
      },
      {
        key: "section_d.diagnosis_descriptions",
        label: "Diagnosis Descriptions",
        type: "textarea",
      },
      {
        key: "section_d.requested_start_date",
        label: "Requested Start Date",
        type: "text",
        placeholder: "MM/DD/YYYY",
      },
      {
        key: "section_d.requested_end_date",
        label: "Requested End Date",
        type: "text",
        placeholder: "MM/DD/YYYY",
      },
      {
        key: "section_d.number_of_sessions",
        label: "Number of Sessions",
        type: "text",
      },
      { key: "section_d.frequency", label: "Frequency", type: "text" },
    ],
  },
  {
    id: "section_e",
    title: "Section E",
    subtitle: "Clinical Information",
    fields: [
      {
        key: "section_e.presenting_symptoms",
        label: "Presenting Symptoms",
        type: "textarea",
      },
      {
        key: "section_e.relevant_clinical_history",
        label: "Relevant Clinical History",
        type: "textarea",
      },
      {
        key: "section_e.treatment_goals",
        label: "Treatment Goals",
        type: "textarea",
      },
    ],
    tables: [
      {
        id: "medications",
        title: "Current Medications",
        prefix: "section_e.medications",
        columns: [
          { key: "medication", label: "Medication" },
          { key: "dose", label: "Dose" },
          { key: "frequency", label: "Frequency" },
          { key: "prescriber", label: "Prescriber" },
        ],
      },
      {
        id: "assessment_tools",
        title: "Assessment Tools",
        prefix: "section_e.assessment_tools",
        columns: [
          { key: "tool", label: "Assessment Tool" },
          { key: "score", label: "Score" },
          { key: "date", label: "Date" },
        ],
      },
    ],
  },
  {
    id: "section_f",
    title: "Section F",
    subtitle: "Clinical Justification",
    fields: [
      {
        key: "section_f.medical_necessity",
        label: "Why is this level of care medically necessary?",
        type: "textarea",
      },
      {
        key: "section_f.risk_if_not_provided",
        label: "What is the risk if services are not provided?",
        type: "textarea",
      },
    ],
  },
  {
    id: "section_g",
    title: "Section G",
    subtitle: "Attestation",
    fields: [
      {
        key: "section_g.provider_signature",
        label: "Provider Signature",
        type: "text",
      },
      {
        key: "section_g.printed_name",
        label: "Printed Name",
        type: "text",
      },
      {
        key: "section_g.date",
        label: "Date",
        type: "text",
        placeholder: "MM/DD/YYYY",
      },
      {
        key: "section_g.license_number",
        label: "License Number",
        type: "text",
      },
    ],
  },
];
