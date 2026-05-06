import type { Project } from "../types";

export const projects: Project[] = [
  {
    slug: "incident-resolution-assistant",
    title: "Incident Resolution Assistant",
    description:
      "Architected a Python-based microservices platform integrating with ITSM systems to assist SREs. Scaled from a 20-user POC to a production tool supporting 200+ SREs, processing live incident streams.",
    technologies: ["Python", "Microservices", "Kubernetes", "Helm"],
    impact: "Scaled POC → production for 200+ SREs",
    category: "GenAI / Microservices",
    pinned: true,
  },
  {
    slug: "real-time-log-analysis-pipeline",
    title: "Real-Time Log Analysis Pipeline",
    description:
      "Engineered an event-driven pipeline for real-time log fetching, achieving high-accuracy automated root cause identification across live incident streams.",
    technologies: ["Apache Kafka", "Elasticsearch", "Python"],
    impact: "90% RCA accuracy, 40–60% MTTR reduction",
    category: "Performance Optimization",
    pinned: true,
  },
  {
    slug: "hybrid-retrieval-system",
    title: "Hybrid Retrieval System",
    description:
      "Designed a hybrid retrieval system to overcome data ambiguity, orchestrating full-stack deployment on Kubernetes using custom Helm charts.",
    technologies: ["FAISS", "Elasticsearch", "Kubernetes", "Helm"],
    impact: "Similar-incident recall: 30% → 80%+",
    category: "Advanced Retrieval",
  },
  {
    slug: "cloud-native-anomaly-detection",
    title: "Cloud-Native Anomaly Detection",
    description:
      "Built and deployed an automated anomaly detection system utilizing Airflow pipelines to process data-center-scale datasets on a Kubernetes cluster.",
    technologies: ["Apache Airflow", "Kubernetes", "Python"],
    impact: "Data-center-scale dataset processing",
    category: "MLOps",
  },
  {
    slug: "rag-chatbot-with-live-internet-access",
    title: "RAG Chatbot with Live Internet Access",
    description:
      "Architected a customized RAG chatbot with live internet access for dynamic data enrichment. Validated through rigorous ground-truth manual testing and deployed on Microsoft Azure.",
    technologies: ["LangChain", "RAG", "Microsoft Azure", "Python"],
    impact: "50% better response quality, near-zero hallucination",
    category: "RAG Architecture",
    pinned: true,
  },
  {
    slug: "multimodal-ai-generation",
    title: "Multimodal AI Generation",
    description:
      "Owned the end-to-end lifecycle for a generative AI solution, successfully fine-tuning an instruct-pix2pix model and managing the final application rollout.",
    technologies: ["PyTorch", "instruct-pix2pix", "Fine-Tuning"],
    impact: "Successful fine-tune & production rollout",
    category: "Multimodal AI",
  },
];

export function findProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
