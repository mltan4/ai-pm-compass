import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code2, Sparkles, Layers, Database, Palette } from "lucide-react";

export const DevDocsBubble = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          aria-label="Open Dev Docs"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-primary p-0 shadow-elevated hover:opacity-90"
        >
          <Code2 className="h-6 w-6 text-primary-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Sparkles className="h-5 w-5 text-primary-glow" />
            Dev Docs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2 text-sm leading-relaxed">
          <section>
            <h3 className="font-display text-base font-semibold">What is this?</h3>
            <p className="mt-1 text-muted-foreground">
              An interactive scoring rubric for product managers in the AI era — 16 competencies across 4 pillars,
              each with 7 levels. Browse the rubric, filter by level or AI-focus, and (with an account) calibrate
              alongside your team.
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-display text-base font-semibold">
              <Layers className="h-4 w-4 text-primary-glow" /> Tech stack
            </h3>
            <ul className="mt-2 space-y-1.5 text-muted-foreground">
              <li>• <span className="text-foreground">React + Vite + TypeScript</span> — fast dev loop, type-safe UI</li>
              <li>• <span className="text-foreground">Tailwind CSS</span> with a semantic HSL token system</li>
              <li>• <span className="text-foreground">shadcn/ui</span> (Radix primitives) for accessible components</li>
              <li>• <span className="text-foreground">React Router</span> for client-side navigation</li>
              <li>• <span className="text-foreground">Lovable Cloud</span> (Postgres + Auth + Row-Level Security) for teams &amp; assessments</li>
              <li>• <span className="text-foreground">Custom SVG radar chart</span> for visualizing a PM's shape</li>
            </ul>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-display text-base font-semibold">
              <Palette className="h-4 w-4 text-primary-glow" /> An interesting design choice
            </h3>
            <p className="mt-1 text-muted-foreground">
              Every color in the app is a <span className="text-foreground">semantic token</span> — never a raw
              Tailwind color. The four competency pillars each get their own HSL CSS variable
              (<code className="rounded bg-surface px-1 py-0.5 font-mono text-xs">--cat-execution</code>,{" "}
              <code className="rounded bg-surface px-1 py-0.5 font-mono text-xs">--cat-insight</code>, …).
              That single source of truth flows through cards, the matrix headers, and the radar chart — so a
              one-line change re-themes the entire app consistently.
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 font-display text-base font-semibold">
              <Database className="h-4 w-4 text-primary-glow" /> How the data flows
            </h3>
            <p className="mt-1 text-muted-foreground">
              The rubric itself is static TypeScript data (versioned in the repo). Team and assessment data live
              in Postgres, protected by Row-Level Security so members only see their own team's results.
            </p>
          </section>

          <p className="pt-2 text-xs text-muted-foreground">
            Inspired by Ravi Mehta's Product Competency Toolkit — reimagined for evals, agents, and
            non-determinism.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
