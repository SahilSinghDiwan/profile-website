import type { ExperienceJob } from "../types";

export const experience: ExperienceJob[] = [
  {
    role: "Software Engineer - AI",
    company: "Infobell IT Solutions",
    location: "Bengaluru, India",
    period: "March 2024 - Present",
    bullets: [
      "Built the retrieval engine and Python microservices behind an AI incident-resolution assistant; scaled it from a 20-user POC to a 200+ SRE beta and cut time-to-find similar incidents ~70% (15–20 min → ~5 min).",
      "Engineered a Kafka + Elasticsearch event-driven pipeline (ServiceNow ingestion → summarization, resolution-step generation, related-incident surfacing), with confidentiality-preserving masking of region/time/identifiers so matching ran on incident semantics.",
      "Rebuilt failing cosine search as hybrid retrieval (semantic + structured filtering + identifier masking) on near-duplicate incident data, roughly doubling recall (~30% → ~80%); deployed full-stack on Kubernetes with custom Helm charts.",
      "Built a cloud-native anomaly detection system on Airflow + Kubernetes for data-center-scale datasets.",
      "Built and shipped convogene.ai, a live public RAG chatbot; two-layer guardrails (scraped-data filtering + prompt) drove hallucinations from frequent to near-zero. Deployed on Microsoft Azure.",
      "Owned end-to-end multimodal AI generative solution; fine-tuned an instruct-pix2pix model and managed the final application rollout.",
    ],
    tech: [
      "Python",
      "RAG",
      "LangChain",
      "Kafka",
      "Elasticsearch",
      "FAISS",
      "Kubernetes",
      "Helm",
      "Airflow",
      "Microsoft Azure",
      "PyTorch",
    ],
  },
  {
    role: "Master Trainer - AI & Python",
    company: "India STEM Foundation",
    location: "Remote & On-site, India",
    period: "August 2022 - August 2023",
    bullets: [
      "Led Python and Artificial Intelligence training programs for an international student base across the USA, UK, Singapore, and India.",
      "Designed hands-on hardware/software integration curricula focused on robotics with Python, C, Raspberry Pi, and Arduino.",
      "Mentored students through end-to-end technical projects, translating complex software concepts into accessible learning modules.",
    ],
    tech: ["Python", "AI/ML", "C", "Raspberry Pi", "Arduino", "Robotics"],
  },
  {
    role: "Junior Software Developer",
    company: "Koderoom",
    location: "Bengaluru, India",
    period: "June 2020 - June 2022",
    bullets: [
      "Developed core backend features for a legal contract management platform handling complex documents for legal cases.",
      "Built and maintained backend APIs supporting document parsing, data structuring, and secure retrieval of sensitive legal contracts.",
      "Collaborated with cross-functional teams to streamline platform performance and ensure reliable document processing workflows.",
    ],
    tech: ["Python", "REST APIs", "Backend", "Document Parsing"],
  },
];
