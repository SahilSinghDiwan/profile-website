import type { Project } from "../types";

export const projects: Project[] = [
  {
    slug: "incident-resolution-assistant",
    title: "Incident Resolution Assistant",
    description:
      "Architected a Python-based microservices platform integrating with ITSM systems to assist SREs. Scaled from a 20-user POC to a 200+ SRE beta, processing live incident streams. Cut time-to-find a similar prior incident from 15–20 min to ~5 min (~70%).",
    technologies: ["Python", "Microservices", "Kubernetes", "Helm"],
    impact: "20-user POC → 200+ SRE beta · triage ~70% faster",
    category: "GenAI / Microservices",
    pinned: true,
  },
  {
    slug: "real-time-log-analysis-pipeline",
    title: "Real-Time Log Analysis Pipeline",
    description:
      "Engineered an event-driven pipeline for real-time log fetching, achieving high-accuracy automated root cause identification across live incident streams.",
    technologies: ["Apache Kafka", "Elasticsearch", "Python"],
    impact: "Automated root-cause surfacing on live incident streams",
    category: "Performance Optimization",
    pinned: true,
  },
  {
    slug: "hybrid-retrieval-system",
    title: "Hybrid Retrieval System",
    description:
      "Designed a hybrid retrieval system to overcome data ambiguity, orchestrating full-stack deployment on Kubernetes using custom Helm charts.",
    technologies: ["FAISS", "Elasticsearch", "Kubernetes", "Helm"],
    impact: "Retrieval recall roughly doubled: ~30% → ~80%",
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
    title: "Convogene — Live RAG Product",
    description:
      "Built and shipped a live, public RAG chatbot (convogene.ai) that answers detailed questions about a semiconductor client's processor lineup. Scheduled scraping via LangGraph/LangChain plus two-layer guardrails — data filtering to exclude embargoed material, and prompt guardrails — drove hallucinations from frequent to near-zero. Deployed on Microsoft Azure.",
    technologies: ["LangChain", "RAG", "Microsoft Azure", "Python"],
    impact: "Live in production — hallucinations frequent → near-zero",
    category: "RAG Architecture",
    demoUrl: "https://convogene.ai",
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
