export type CategoryId = "execution" | "insight" | "strategy" | "influence";

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  colorVar: string; // tailwind color name e.g. category-execution
}

export interface Competency {
  id: string;
  name: string;
  category: CategoryId;
  isNew?: boolean; // new for AI era
  summary: string;
  // 7 levels: indexes 1..7 used; index 0 = "not yet"
  levels: string[]; // length 7, level 1..7
}

export const LEVELS = [
  { idx: 1, label: "APM", full: "Associate PM" },
  { idx: 2, label: "PM", full: "Product Manager" },
  { idx: 3, label: "Sr PM", full: "Senior PM" },
  { idx: 4, label: "Group PM", full: "Group PM" },
  { idx: 5, label: "Director", full: "Director of Product" },
  { idx: 6, label: "VP", full: "VP Product" },
  { idx: 7, label: "CPO", full: "Chief Product Officer" },
] as const;

export const CATEGORIES: Category[] = [
  {
    id: "execution",
    name: "Product Execution",
    tagline: "Ship the right thing, with AI in the loop.",
    colorVar: "category-execution",
  },
  {
    id: "insight",
    name: "Customer & Model Insight",
    tagline: "Know your users — and know your models.",
    colorVar: "category-insight",
  },
  {
    id: "strategy",
    name: "Product Strategy",
    tagline: "Build durable value when models commoditize weekly.",
    colorVar: "category-strategy",
  },
  {
    id: "influence",
    name: "Influencing People",
    tagline: "Lead humans + AI agents toward outcomes.",
    colorVar: "category-influence",
  },
];

// Helper to keep level arrays compact
const L = (apm: string, pm: string, sr: string, gpm: string, dir: string, vp: string, cpo: string) =>
  [apm, pm, sr, gpm, dir, vp, cpo];

export const COMPETENCIES: Competency[] = [
  // ============ EXECUTION ============
  {
    id: "feature-spec",
    name: "Feature & AI Behavior Specification",
    category: "execution",
    summary:
      "Writes specs that define not just UI and logic but model behavior, fallbacks, evals, and failure modes.",
    levels: L(
      "Writes clear specs for small features with engineer guidance. Documents acceptance criteria.",
      "Owns specs end-to-end including edge cases. Specifies AI prompts at a basic level and lists obvious failure modes.",
      "Specs include eval criteria, system prompts, tool definitions, latency/cost budgets, and graceful degradation paths.",
      "Defines spec patterns for the team. Reviews complex AI behaviors and ensures specs cover safety, abuse, and hallucination handling.",
      "Sets organizational standards for AI product specs. Ensures consistency in how non-determinism is documented and tested.",
      "Establishes spec rigor across product orgs. Specs are referenced as the source of truth for engineering, legal, and policy.",
      "Defines what 'good' looks like for AI product documentation industry-wide. Coaches other leaders.",
    ),
  },
  {
    id: "delivery",
    name: "Product Delivery",
    category: "execution",
    summary:
      "Ships fast and reliably using AI-augmented dev workflows; balances vibe-coded prototypes with production rigor.",
    levels: L(
      "Delivers small features on time with help. Uses AI tools (Cursor, Claude) for personal productivity.",
      "Owns sprint delivery for a feature area. Prototypes with AI tools to de-risk decisions.",
      "Compresses cycle time using AI dev workflows. Knows when prototype-grade is enough vs when to invest in production code.",
      "Optimizes team throughput. Establishes prototype→prod handoff patterns; PMs on the team can ship working demos.",
      "Drives delivery velocity org-wide. AI tooling decisions (eval infra, agent frameworks, vibe-coding norms) are part of the operating model.",
      "Sets the bar for shipping cadence and quality. Org consistently outpaces peers because of disciplined AI-augmented workflows.",
      "Defines delivery culture for the company. Industry recognizes the org for shipping pace and quality.",
    ),
  },
  {
    id: "qa-evals",
    name: "Quality, Evals & Red-Teaming",
    category: "execution",
    isNew: true,
    summary:
      "Designs evals, red-teams AI features, and treats hallucinations and unsafe outputs as first-class quality bugs.",
    levels: L(
      "Tests features manually. Aware that AI outputs need different testing than deterministic code.",
      "Writes basic eval cases (golden inputs, expected behaviors). Files hallucination and safety bugs.",
      "Owns the eval suite for their feature. Uses LLM-as-judge, golden datasets, and offline+online evals. Red-teams before launch.",
      "Builds eval infra that scales across features. Defines acceptance bars for accuracy, safety, and latency.",
      "Sets quality bar for AI products org-wide. Owns the trade-off framework between capability, safety, latency, and cost.",
      "Evals and safety are board-level metrics owned by the product org. Establishes external red-teaming relationships.",
      "Influences industry standards for AI product quality and safety.",
    ),
  },

  // ============ INSIGHT ============
  {
    id: "data",
    name: "Fluency with Data",
    category: "insight",
    summary:
      "Pulls insight from product data using SQL, semantic search, and AI-assisted analysis. Knows when LLMs are reliable analysts and when they aren't.",
    levels: L(
      "Reads dashboards. Asks for analyst help on most questions. Uses AI copilots for basic queries.",
      "Writes own SQL or uses AI text-to-SQL effectively. Validates AI-generated analysis against ground truth.",
      "Designs experiments and instrumentation. Uses AI to accelerate exploration but verifies critical claims independently.",
      "Sets data culture for the team. Defines what gets logged for AI features (traces, costs, eval outcomes, user feedback signals).",
      "Owns measurement strategy across the org including AI-specific telemetry (token usage, eval drift, model performance).",
      "Data is a competitive advantage. Org has best-in-class AI observability and feedback loops.",
      "Defines measurement frameworks adopted across the industry.",
    ),
  },
  {
    id: "voc",
    name: "Voice of the Customer",
    category: "insight",
    summary:
      "Knows their users deeply. Uses AI to synthesize feedback at scale but still talks to humans directly.",
    levels: L(
      "Reads support tickets and reviews. Sits in on user research occasionally.",
      "Runs own user interviews. Uses AI to summarize transcripts but reads originals for nuance.",
      "Synthesizes signal from quant, qual, and AI-clustered feedback. Detects emerging pain across thousands of conversations.",
      "Builds research practice for the team. Ensures team doesn't outsource empathy entirely to AI summaries.",
      "Customer obsession is a team value. Org-wide systems combine AI scale with human depth.",
      "Customer insight drives strategy at the highest level. Org is known for understanding users better than competitors.",
      "Industry-recognized perspective on customer needs.",
    ),
  },
  {
    id: "ux",
    name: "UX Design for Non-Determinism",
    category: "insight",
    isNew: true,
    summary:
      "Designs interfaces for probabilistic outputs: chat, agents, generative UI, and graceful failure.",
    levels: L(
      "Has design taste. Can review mocks for static UI.",
      "Partners with design on flows. Understands chat and basic generative UI patterns.",
      "Designs for non-deterministic output: progressive disclosure, citations, streaming, undo, controllable agents, gracefully wrong answers.",
      "Sets UX patterns for AI features in the team. Knows when chat is wrong and when canvas/forms/agents are right.",
      "Defines AI UX system across the org. Pushes the field forward with novel interaction patterns.",
      "Org's AI UX is referenced as best-in-class. Strong opinions on agentic UX shape industry conversation.",
      "Defines the next paradigm of human-AI interaction.",
    ),
  },
  {
    id: "ai-product-sense",
    name: "AI Product Sense",
    category: "insight",
    isNew: true,
    summary:
      "Intuitive grasp of what current models can and can't do. Picks the right capability for the right job.",
    levels: L(
      "Knows the major model providers exist. Can describe what an LLM does at a high level.",
      "Has used multiple models hands-on. Knows the rough capability ranking and cost differences.",
      "Maps product problems to capabilities (RAG, tool use, fine-tune, agent, classifier). Picks the cheapest/simplest thing that works.",
      "Coaches the team on capability selection. Tracks model releases and re-evaluates architecture decisions.",
      "Sets the org's view on which capabilities to invest in vs wait on. Makes build-vs-wrap calls confidently.",
      "Org's capability bets consistently anticipate the market. Strong relationships with model labs.",
      "Shapes the industry's understanding of what AI products are possible.",
    ),
  },

  // ============ STRATEGY ============
  {
    id: "outcomes",
    name: "Business Outcome Ownership",
    category: "strategy",
    summary:
      "Owns metrics that matter. Doesn't hide behind 'engagement' when models commoditize.",
    levels: L(
      "Owns a feature metric. Understands how it ladders to a team goal.",
      "Owns team-level outcomes. Can defend trade-offs.",
      "Owns a product line outcome. Tracks AI-specific metrics (cost per task, automation rate, quality).",
      "Owns multi-team outcomes including unit economics of AI features (margin, COGS, capability lift).",
      "Owns business unit P&L. Defines how AI investment translates to durable revenue.",
      "Owns company-wide outcomes. AI strategy is tied directly to enterprise value.",
      "Defines the AI-era P&L narrative for the company and investors.",
    ),
  },
  {
    id: "vision",
    name: "Product Vision & Roadmapping",
    category: "strategy",
    summary:
      "Crafts a vision that survives capability shifts. Roadmaps assume models will get 10x cheaper or 10x more capable.",
    levels: L(
      "Contributes to feature roadmap. Understands the team vision.",
      "Owns roadmap for a feature area. Vision considers near-term AI capability changes.",
      "Owns multi-quarter roadmap. Builds in optionality for capability jumps and cost collapses.",
      "Owns product vision for a major surface. Designs roadmap to compound regardless of who wins the model race.",
      "Owns org-level vision. Distinguishes between durable moats and capabilities that will be commoditized.",
      "Owns company product vision. Anticipates AI-era platform shifts (agents-as-users, generative everything).",
      "Defines industry-defining vision for the AI era.",
    ),
  },
  {
    id: "strategic-impact",
    name: "Strategic Impact",
    category: "strategy",
    summary:
      "Makes decisions that change the company's trajectory in the AI era — including hard build-vs-wrap and moat questions.",
    levels: L(
      "Impact is local to feature area.",
      "Influences team-level decisions. Identifies opportunities others miss.",
      "Drives strategic shifts in their area. Knows when to wrap a model, fine-tune, or build proprietary infra.",
      "Multi-team impact. Architects bets that depend on data, distribution, or workflow lock-in — not raw model quality.",
      "Org-level strategic impact. Decisions shape moats: data flywheels, integrations, agent ecosystems.",
      "Company-level strategic impact. AI strategy is a board-level differentiator.",
      "Industry-level impact. Shapes what categories are possible.",
    ),
  },
  {
    id: "prompt-context",
    name: "Prompt & Context Engineering",
    category: "strategy",
    isNew: true,
    summary:
      "Treats prompts, RAG architecture, tool definitions, and agent design as product strategy — not engineering plumbing.",
    levels: L(
      "Has written prompts in ChatGPT. Aware that prompt quality matters.",
      "Iterates on system prompts for own features. Knows the basic RAG pattern.",
      "Designs context strategies: retrieval, tool catalogs, memory, multi-step planning. Knows when to add structure vs trust the model.",
      "Sets prompt and context patterns for the team. Owns the prompt library and tool taxonomy.",
      "Org's context architecture is a strategic asset. Defines how product capabilities compose.",
      "Context engineering is a moat — proprietary tool ecosystems, retrieval graphs, or agent protocols.",
      "Defines new patterns for context and agent architecture adopted across the field.",
    ),
  },

  // ============ INFLUENCE ============
  {
    id: "stakeholders",
    name: "Stakeholder Management",
    category: "influence",
    summary:
      "Aligns engineering, design, ML/research, legal, policy, and GTM around AI bets that include real risk.",
    levels: L(
      "Communicates clearly with immediate teammates.",
      "Builds trust with cross-functional partners on a feature.",
      "Manages stakeholders across functions including ML/research, legal, and policy. Translates capability talk to business talk.",
      "Aligns multiple teams. Negotiates AI risk trade-offs (cost, safety, latency, capability) with senior partners.",
      "Trusted advisor to executives across functions. Aligns the company on hard AI calls.",
      "Industry-level relationships with model labs, regulators, and partners.",
      "Shapes industry-level alignment on AI product norms.",
    ),
  },
  {
    id: "leadership",
    name: "Team Leadership",
    category: "influence",
    summary:
      "Leads humans well in a world where individual leverage is 10x — and where some of the team is non-human.",
    levels: L(
      "Leads by example on own work.",
      "Mentors APMs. Helps teammates use AI tools effectively.",
      "Leads pods including engineers, designers, and ML. Coaches team to wield AI for leverage without losing craft.",
      "Manages PMs. Develops their AI product judgment, not just delivery skills.",
      "Builds PM org. Defines what 'great PM' looks like in the AI era and hires/develops to that bar.",
      "Builds product orgs. Org culture is known for AI-native thinking and human craft together.",
      "Industry-recognized people leader. Develops other CPOs.",
    ),
  },
  {
    id: "managing-up",
    name: "Managing Up",
    category: "influence",
    summary:
      "Keeps leadership confident in the AI bet — including the messy parts: cost, safety, hype vs reality.",
    levels: L(
      "Keeps manager informed of progress and blockers.",
      "Brings recommendations, not just status. Translates technical AI nuance for non-technical leaders.",
      "Trusted by senior leaders. Calibrates their hype expectations to reality without losing their support.",
      "Manages director+ relationships. Helps leadership separate signal from AI noise.",
      "Trusted advisor to C-suite. Owns the narrative on AI investment outcomes — wins and losses.",
      "Trusted advisor to CEO and board. Owns the AI strategy narrative externally.",
      "Owns the industry narrative.",
    ),
  },
  {
    id: "trust-ethics",
    name: "AI Ethics, Safety & Trust",
    category: "influence",
    isNew: true,
    summary:
      "Designs for user trust calibration, transparency, and safety. Treats trust as a product feature.",
    levels: L(
      "Aware that AI has bias, safety, and trust issues. Flags concerns when noticed.",
      "Designs basic trust signals: citations, confidence, undo. Considers obvious harms before launch.",
      "Owns trust UX: calibrated confidence, transparent uncertainty, user-in-the-loop controls. Runs pre-launch harm reviews.",
      "Defines trust and safety standards for the team. Partners with policy and legal proactively.",
      "Sets org-wide trust posture. Org is known for shipping AI users actually trust.",
      "Trust is a competitive moat. Company sets the bar for safe, trustworthy AI products.",
      "Influences industry and regulatory norms for AI trust.",
    ),
  },
];

export const COMPETENCIES_BY_CATEGORY: Record<CategoryId, Competency[]> = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id] = COMPETENCIES.filter((c) => c.category === cat.id);
    return acc;
  },
  {} as Record<CategoryId, Competency[]>,
);

export type Scores = Record<string, number>; // competencyId -> 0..7

export function emptyScores(): Scores {
  return COMPETENCIES.reduce((acc, c) => ({ ...acc, [c.id]: 0 }), {});
}

export function categoryAverage(scores: Scores, cat: CategoryId): number {
  const items = COMPETENCIES_BY_CATEGORY[cat];
  if (!items.length) return 0;
  const sum = items.reduce((s, c) => s + (scores[c.id] || 0), 0);
  return sum / items.length;
}

export function overallAverage(scores: Scores): number {
  const vals = COMPETENCIES.map((c) => scores[c.id] || 0);
  if (!vals.length) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

// Archetype detection based on category strengths
export interface Archetype {
  name: string;
  description: string;
}

export function archetypeFor(scores: Scores): Archetype {
  const cats = CATEGORIES.map((c) => ({ id: c.id, avg: categoryAverage(scores, c.id) }));
  cats.sort((a, b) => b.avg - a.avg);
  const top = cats[0]?.id;
  const second = cats[1]?.id;

  const map: Record<string, Archetype> = {
    "execution-insight": {
      name: "AI-Native Builder",
      description: "Ships fast with deep model intuition. Prototype-to-prod compressed.",
    },
    "insight-execution": {
      name: "Eval-Driven PM",
      description: "Quality is a moat. Lives in evals, traces, and user feedback loops.",
    },
    "strategy-insight": {
      name: "Capability Strategist",
      description: "Picks the right bets when the model landscape shifts weekly.",
    },
    "insight-strategy": {
      name: "Model Whisperer",
      description: "Translates capability into durable product strategy.",
    },
    "execution-strategy": {
      name: "Agent Architect",
      description: "Builds compounding systems — agents, tools, retrieval — that get better over time.",
    },
    "strategy-execution": {
      name: "Platform Operator",
      description: "Scales AI bets with rigor. Builds the operating system around the model.",
    },
    "influence-strategy": {
      name: "AI Era Leader",
      description: "Aligns orgs, partners, and policy around bets that shape the company's future.",
    },
    "strategy-influence": {
      name: "Visionary CPO",
      description: "Defines where the company plays in the AI era.",
    },
    "influence-execution": {
      name: "Calibrator",
      description: "Keeps teams shipping and aligned through the chaos of weekly capability shifts.",
    },
    "execution-influence": {
      name: "Lead-by-Shipping PM",
      description: "Leads via working demos and shipped product, not slideware.",
    },
    "influence-insight": {
      name: "Trust Builder",
      description: "Translates AI nuance to leadership and users. Makes the bets believable.",
    },
    "insight-influence": {
      name: "Customer Advocate",
      description: "Represents user reality in every AI decision room.",
    },
  };

  const key = `${top}-${second}`;
  return (
    map[key] || {
      name: "Generalist",
      description: "Well-rounded across the four pillars of AI-era PM craft.",
    }
  );
}
