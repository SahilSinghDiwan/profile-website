import type { ExperienceJob } from "../types";

export const experience: ExperienceJob[] = [
  {
    role: "Software Engineer - AI",
    company: "Infobell IT Solutions",
    location: "Bengaluru, India",
    period: "March 2024 - Present",
    bullets: [
      "Architected a Python-based microservices Incident Resolution Assistant; scaled from a 20-user POC to 200+ SREs in production, processing live incident streams.",
      "Engineered a Kafka + Elasticsearch event-driven pipeline; 90% accuracy in automated root cause identification, 40–60% MTTR reduction.",
      "Designed a hybrid retrieval system boosting similar-incident recall from 30% to 80%+; deployed full-stack on Kubernetes with custom Helm charts.",
      "Built a cloud-native anomaly detection system on Airflow + Kubernetes for data-center-scale datasets.",
      "Architected a customized RAG chatbot with live internet access; 50% better response quality, near-zero hallucination, deployed on Microsoft Azure.",
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
