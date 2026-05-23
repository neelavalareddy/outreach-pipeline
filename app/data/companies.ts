export type Company = {
  id: string;
  name: string;
  industry: string;
  founded: number;
  size: string;
  revenue: string;
  location: string;
  contact: {
    name: string;
    title: string;
    email: string;
  };
  automationOps: string[];
  emailDocUrl: string;
  status: "Not Sent" | "Sent" | "Replied" | "Meeting Booked" | "Closed";
  lastContacted?: string;
  followUpDate?: string;
  notes?: string;
  automationScore: number;
};

export const initialCompanies: Company[] = [
  {
    id: "ipwatchdog",
    name: "IPWatchdog Inc",
    industry: "IP Law Publishing",
    founded: 2004,
    size: "11–50",
    revenue: "$5M–10M",
    location: "Ashburn, VA",
    contact: { name: "Renee C. Quinn", title: "COO / CFO", email: "renee.quinn@ipwatchdog.com" },
    automationOps: [
      "Article auto-tagging by patent type + jurisdiction",
      "AI-drafted LinkedIn/X summaries per post",
      "Email triage + pre-drafted replies",
      "Automated weekly digest assembly",
    ],
    emailDocUrl: "https://docs.google.com/document/d/12O-qL5MUmCsQyBTlFKT5BjouahPi2htcDlnajc4bdG8/edit",
    status: "Not Sent",
    automationScore: 8,
  },
  {
    id: "concurrences",
    name: "Concurrences",
    industry: "Antitrust Legal Publishing",
    founded: 2004,
    size: "11–50",
    revenue: "$5M–10M",
    location: "New York, NY",
    contact: { name: "Anton Bossenbroek", title: "CTO / Head of AI", email: "anton.bossenbroek@concurrences.com" },
    automationOps: [
      "RAG natural language search over full archive",
      "FR/EN multilingual summarization pipeline on publish",
      "Subscriber jurisdiction + topic watchlist alerts",
      "Conference recap auto-drafting",
    ],
    emailDocUrl: "https://docs.google.com/document/d/1fzOoXjmTHxcmWoFFUTVtKkPz5bK2QW521BqIRoh1tjY/edit",
    status: "Not Sent",
    automationScore: 9,
  },
  {
    id: "ltdglobal",
    name: "LTD Global LLC",
    industry: "Accounting + HR Consulting",
    founded: 2003,
    size: "11–50",
    revenue: "$1M–5M",
    location: "Pleasanton, CA",
    contact: { name: "Lili Tarachand", title: "Founder / CEO", email: "lili.tarachand@ltdglobal.com" },
    automationOps: [
      "Cross-client QuickBooks anomaly + duplicate flagging",
      "Document intake classification (invoices/pay stubs/tax forms)",
      "Auto-generated monthly client report drafts",
      "HR onboarding workflow automation",
    ],
    emailDocUrl: "https://docs.google.com/document/d/1CSHndVYnmPL89f-YJYVvSlToR2_OZglboWBHGJWbCdE/edit",
    status: "Not Sent",
    automationScore: 9,
  },
];
