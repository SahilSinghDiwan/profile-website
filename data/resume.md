# Sahil Singh Diwan

Bengaluru, India | +91 800-7192-680 | [diwan.sahilsingh@gmail.com](mailto:diwan.sahilsingh@gmail.com)
[LinkedIn](https://linkedin.com/in/diwan-sahil) | [GitHub](https://github.com/SahilSinghDiwan) | [Portfolio](https://myprofile.sahildiwan.in) | [Live demo: convogene.ai](https://convogene.ai)

---

## Professional Summary

AI/GenAI Engineer with 5 years across software and applied AI engineering, the last two-plus taking **LLM & RAG systems from POC to production at scale**. Scaled a GenAI incident-resolution platform from a 20-user POC to a 200+-SRE beta and cut incident-triage time ~70%; rebuilt failing semantic search as hybrid retrieval to roughly double recall; and shipped a live, near-zero-hallucination RAG product. Production GenAI on Kafka, Kubernetes, and Airflow — not notebooks. Most recently built **agentic developer tooling** (LLM-driven test generation and code understanding).

---

## Technical Skills

- **AI / GenAI:** RAG Pipelines, Hybrid Retrieval, LLM Integration, Prompt Engineering & Guardrails, Agentic Systems, Model Fine-Tuning, LangChain, LangGraph, PyTorch
- **Vector Search & Retrieval:** FAISS, Milvus, ChromaDB, Elasticsearch
- **Data & Event Streaming:** Apache Kafka, Apache Airflow, Pandas, NumPy
- **Backend & Integrations:** Python, FastAPI, Flask, Async Python, Microservices, REST APIs, ServiceNow / Jira Integrations
- **Test Automation & Tooling:** LLM-based test generation, self-healing test loops, call-graph analysis, Allure, Playwright, Claude Code, Cursor
- **Cloud & DevOps:** Docker, Kubernetes, Helm, GitHub Actions, Microsoft Azure, AWS, GCP
- **Databases:** MongoDB, MySQL

---

## Professional Experience

### Infobell IT Solutions — *Software Engineer, AI*
**March 2024 – October 2026 | Bengaluru, India**

- **AI Test-Automation Platform (agentic):** Co-led an agentic platform, taken into alpha with a global semiconductor client, that cloned a repository, used LLMs to map its signatures, call graph, and workflows, then generated test suites (API, workflow, security/edge-case) under budget-driven or coverage-driven modes. Owned the execution layer: execution architecture, an LLM self-healing loop that repairs tests mid-run, GitHub Actions CI/CD, credentials and role-based access control, Allure reporting, and a model layer supporting on-premises LLMs plus Vertex AI and Azure.
- **Test-Automation, cont.:** Added an LLM self-review loop to correct schema-mismatched generated tests, PR blast-radius analysis (1/2/3-hop impact), and a specification-coverage "certification" scoring PRD coverage, security, and API surface. Playwright-driven front-end testing was planned for a later phase.
- **Incident Resolution Assistant:** Built the retrieval engine and event-driven pipeline for an enterprise SRE incident-resolution assistant on a major public cloud; scaled from a 20-user POC to a **200+-SRE beta**, and **cut time-to-find similar incidents ~70% (15–20 min → ~5 min, measured with SREs).** Delivered to production and transitioned ownership to the client's in-house team.
- **Advanced Retrieval:** Diagnosed the failure of semantic (cosine) search on near-duplicate incident data and rebuilt it as **hybrid retrieval** with structured filtering and identifier masking (a privacy-preserving design), **roughly doubling similar-incident recall (~30% → ~80%).** Deployed on Kubernetes with custom Helm charts.
- **Event Pipeline:** Engineered a Kafka + Elasticsearch pipeline ingesting incidents from ServiceNow into fan-out services — summarization, resolution-step generation grounded on incident data and GitHub runbooks, related-incident surfacing, and change analysis.
- **Convogene.ai (shipped RAG product):** Built and deployed a live RAG chatbot ([convogene.ai](https://convogene.ai)) answering detailed processor-lineup questions for a semiconductor client; scheduled scraping via LangGraph/LangChain with two-layer (data + prompt) guardrails, driving hallucinations from frequent to **near-zero** in practice. Deployed on Microsoft Azure.
- **Kernel Backporting Automation:** Built tooling to accelerate multi-month Linux-kernel patch backporting, auto-applying ordered patch sequences and localizing failures for engineer review across patch sets of 5–120 patches.
- **Cloud-Native Anomaly Detection:** Built and deployed an automated anomaly-detection system on Apache Airflow, processing data-center-scale datasets on a Kubernetes cluster.
- **Multimodal AI (range):** Fine-tuned an instruct-pix2pix model and owned application rollout for a generative-media solution.

### India STEM Foundation — *Master Trainer, AI & Python*
**August 2022 – August 2023 | Remote & On-site, India**

- Led online Python and AI training for an international student base (USA, UK, Singapore, India); designed hands-on robotics curricula (Python, C, Raspberry Pi, Arduino), translating complex concepts into accessible modules.

### Koderoom — *Junior Software Developer*
**June 2020 – June 2022 | Remote, India**

- Built and maintained backend APIs for a legal contract-management platform — document parsing, data structuring, and secure retrieval of sensitive contracts.

---

## Education

**Centre for Development of Advanced Computing (C-DAC)** — Post Graduate Diploma (6 Months), Sep 2023 – Feb 2024

**G H Raisoni Academy of Engineering and Technology** — B.E., Mechanical Engineering, 2015 – 2018 | Nagpur, India

---

## Certifications

- **Claude Certified Architect, Foundations** (Anthropic), issued Aug 2026, valid to Aug 2027. Practitioner level in progress.
- IBM Cloud Advocate Essentials (Dec 2025)
