import type { Env } from "../index";
import { createKvCache, CORPUS_VERSION } from "../lib/cache";

interface ProjectSummaryResponse {
  summary: string;
  generatedAt: string;
}

// Minimal project metadata duplicated from frontend
const projectMetadata: Record<string, { title: string; description: string; technologies: string[] }> = {
  "incident-resolution-assistant": {
    title: "Incident Resolution Assistant",
    description:
      "Architected a Python-based microservices platform integrating with ITSM systems to assist SREs. Scaled from a 20-user POC to a production tool supporting 200+ SREs, processing live incident streams.",
    technologies: ["Python", "Microservices", "Kubernetes", "Helm"],
  },
  "real-time-log-analysis-pipeline": {
    title: "Real-Time Log Analysis Pipeline",
    description:
      "Engineered an event-driven pipeline for real-time log fetching, achieving high-accuracy automated root cause identification across live incident streams.",
    technologies: ["Apache Kafka", "Elasticsearch", "Python"],
  },
  "hybrid-retrieval-system": {
    title: "Hybrid Retrieval System",
    description:
      "Designed a hybrid retrieval system to overcome data ambiguity, orchestrating full-stack deployment on Kubernetes using custom Helm charts.",
    technologies: ["FAISS", "Elasticsearch", "Kubernetes", "Helm"],
  },
  "cloud-native-anomaly-detection": {
    title: "Cloud-Native Anomaly Detection",
    description:
      "Built and deployed an automated anomaly detection system utilizing Airflow pipelines to process data-center-scale datasets on a Kubernetes cluster.",
    technologies: ["Apache Airflow", "Kubernetes", "Python"],
  },
  "rag-chatbot-with-live-internet-access": {
    title: "RAG Chatbot with Live Internet Access",
    description:
      "Architected a customized RAG chatbot with live internet access for dynamic data enrichment. Validated through rigorous ground-truth manual testing and deployed on Microsoft Azure.",
    technologies: ["LangChain", "RAG", "Microsoft Azure", "Python"],
  },
  "multimodal-ai-generation": {
    title: "Multimodal AI Generation",
    description:
      "Owned the end-to-end lifecycle for a generative AI solution, successfully fine-tuning an instruct-pix2pix model and managing the final application rollout.",
    technologies: ["PyTorch", "instruct-pix2pix", "Fine-Tuning"],
  },
};

async function generateSummary(slug: string, metadata: typeof projectMetadata[string]): Promise<string> {
  // If no OpenAI key, return a fallback summary based on the description
  // This is used for testing without API key
  const words = metadata.description.split(" ");
  const fallback = words.slice(0, 20).join(" ") + "...";
  return fallback;
}

export async function handleProjectSummary(request: Request, env: Env, slug: string): Promise<Response> {
  const metadata = projectMetadata[slug];

  if (!metadata) {
    return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
  }

  // Cache key: summary:<slug>:<version>
  const cacheKey = `summary:${slug}:${CORPUS_VERSION}`;
  const cache = createKvCache<ProjectSummaryResponse>(env.CACHE);
  const cached = await cache.get(cacheKey);

  if (cached) {
    return new Response(JSON.stringify(cached), { status: 200 });
  }

  // Generate or fetch summary
  let summary: string;
  if (env.OPENAI_API_KEY) {
    // Call OpenAI to generate summary
    try {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a technical writer. Generate a concise (~120 word) case study summary of the project based on the provided information.",
            },
            {
              role: "user",
              content: `Project: ${metadata.title}\n\nDescription: ${metadata.description}\n\nTechnologies: ${metadata.technologies.join(", ")}\n\nProvide a 1-paragraph summary suitable for a portfolio.`,
            },
          ],
          max_tokens: 150,
        }),
      });

      if (!openaiRes.ok) {
        summary = await generateSummary(slug, metadata);
      } else {
        const data = (await openaiRes.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        summary = data.choices[0]?.message.content ?? (await generateSummary(slug, metadata));
      }
    } catch {
      summary = await generateSummary(slug, metadata);
    }
  } else {
    summary = await generateSummary(slug, metadata);
  }

  const response: ProjectSummaryResponse = {
    summary,
    generatedAt: new Date().toISOString(),
  };

  // Cache for 30 days
  await cache.set(cacheKey, response, 30 * 24 * 60 * 60);

  return new Response(JSON.stringify(response), { status: 200 });
}
