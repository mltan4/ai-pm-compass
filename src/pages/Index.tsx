import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { CATEGORIES, COMPETENCIES } from "@/data/rubric";
import { ArrowRight, Sparkles, Users, BarChart3, Layers } from "lucide-react";

const Index = () => {
  const newCount = COMPETENCIES.filter((c) => c.isNew).length;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.15]" />
        <div className="bg-gradient-hero pointer-events-none absolute inset-0" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary-glow" />
              v1 · {COMPETENCIES.length} competencies · {newCount} AI-native
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              PM Levels<br />
              <span className="text-gradient">for the AI Era.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              An interactive scoring rubric for product managers in a world where AI is a teammate. Inspired by
              Ravi Mehta's 12 competencies — reimagined for evals, agents, and non-determinism.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild className="bg-gradient-primary hover:opacity-90">
                <Link to="/rubric">
                  Explore the rubric <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="container py-20">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Four pillars</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            Sixteen competencies. Seven levels. One operating system for PM craft in the AI era.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <article
              key={cat.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface p-6 transition-all hover:border-border-strong hover:bg-surface-elevated"
            >
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(to right, transparent, hsl(var(--cat-${cat.id})), transparent)` }}
              />
              <span
                className="font-mono text-xs"
                style={{ color: `hsl(var(--cat-${cat.id}))` }}
              >
                0{i + 1}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">{cat.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{cat.tagline}</p>
            </article>
          ))}
        </div>
      </section>

      {/* What's new */}
      <section className="container py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">What's new</p>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              The original 12 — reimagined.<br />
              Plus 4 net-new for the AI era.
            </h2>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Quality means evals and red-teaming. Spec means defining model behavior. UX means designing for
              non-deterministic outputs. And new competencies — AI Product Sense, Prompt & Context Engineering,
              Quality & Evals, Trust & Safety — sit alongside the classics.
            </p>
          </div>
          <div className="grid gap-3">
            {COMPETENCIES.filter((c) => c.isNew).map((c) => (
              <div key={c.id} className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
                  <span className="font-display font-semibold">{c.name}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-20">
        <div className="mb-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            From self-assessment to team calibration.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Layers, title: "Self-assess", body: "Pick your level on each of 16 competencies. Get your shape." },
            { icon: Users, title: "Calibrate as a team", body: "Invite your team. Compare profiles side-by-side. Surface gaps." },
            { icon: BarChart3, title: "Find your archetype", body: "Discover whether you're an Agent Architect, Eval-Driven PM, or Capability Strategist." },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-6">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/15">
                <s.icon className="h-5 w-5 text-primary-glow" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-24 pt-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-gradient-primary p-12 text-center shadow-elevated">
          <h2 className="font-display text-3xl font-semibold text-primary-foreground md:text-4xl">
            Explore the PM Levels rubric.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Build a shared language for what good looks like in the AI era.
          </p>
          <Button size="lg" variant="secondary" asChild className="mt-6">
            <Link to="/rubric">Browse all competencies <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="font-mono">PM/AI Rubric v1.0</span>
          <span>
            Inspired by Ravi Mehta's <a href="https://www.ravi-mehta.com/toolkit" target="_blank" rel="noreferrer" className="underline hover:text-foreground">Product Competency Toolkit</a>.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
