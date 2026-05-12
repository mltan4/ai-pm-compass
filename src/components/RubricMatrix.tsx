import { CATEGORIES, COMPETENCIES_BY_CATEGORY, LEVELS, type Competency } from "@/data/rubric";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

interface Props {
  scores?: Record<string, number>;
  onCellClick?: (competencyId: string, level: number) => void;
  interactive?: boolean;
  levelFilter?: number[];
  aiOnly?: boolean;
}

export const RubricMatrix = ({ scores, onCellClick, interactive = false, levelFilter, aiOnly }: Props) => {
  const [open, setOpen] = useState<{ comp: Competency; level: number } | null>(null);
  const visibleLevels = LEVELS.filter((l) => !levelFilter || levelFilter.length === 0 || levelFilter.includes(l.idx));

  return (
    <div className="space-y-10">
      {CATEGORIES.map((cat) => {
        const comps = COMPETENCIES_BY_CATEGORY[cat.id].filter((c) => !aiOnly || c.isNew);
        if (comps.length === 0) return null;
        return (
        <section key={cat.id} className="animate-fade-in">
          <header className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: `hsl(var(--cat-${cat.id}))` }}
                />
                <h2 className="font-display text-xl font-semibold">{cat.name}</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{cat.tagline}</p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {comps.length} competencies
            </span>
          </header>

          <div className="overflow-x-auto rounded-lg border border-border bg-surface/50">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/50">
                  <th className="sticky left-0 z-10 w-[260px] bg-surface-elevated/80 p-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground backdrop-blur">
                    Competency
                  </th>
                  {visibleLevels.map((l) => (
                    <th
                      key={l.idx}
                      className="p-3 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      <div>{l.label}</div>
                      <div className="mt-0.5 text-[10px] normal-case tracking-normal opacity-60">
                        L{l.idx}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comps.map((comp) => {
                  const userLevel = scores?.[comp.id] ?? 0;
                  return (
                    <tr key={comp.id} className="border-b border-border/60 last:border-0">
                      <td className="sticky left-0 z-10 bg-surface/80 p-3 align-top backdrop-blur">
                        <div className="flex items-start gap-1.5">
                          <div className="font-medium leading-tight">{comp.name}</div>
                          {comp.isNew && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary-glow">
                              <Sparkles className="h-2.5 w-2.5" /> AI
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{comp.summary}</p>
                      </td>
                      {visibleLevels.map((l) => {
                        const isUser = userLevel === l.idx;
                        const isUnder = userLevel > 0 && l.idx <= userLevel;
                        return (
                          <td
                            key={l.idx}
                            className="p-1 align-top"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                interactive && onCellClick
                                  ? onCellClick(comp.id, l.idx)
                                  : setOpen({ comp, level: l.idx })
                              }
                              className={`group relative h-full min-h-[78px] w-full rounded-md border p-2 text-left text-[11px] leading-snug transition-all
                                ${isUser
                                  ? "border-primary bg-primary/15 shadow-glow"
                                  : isUnder
                                  ? "border-primary/30 bg-primary/5"
                                  : "border-border/60 bg-surface hover:border-border-strong hover:bg-surface-hover"}`}
                              style={isUser ? { borderColor: `hsl(var(--cat-${cat.id}))` } : undefined}
                            >
                              <span className="line-clamp-4 text-foreground/85 group-hover:text-foreground">
                                {comp.levels[l.idx - 1]}
                              </span>
                              {isUser && (
                                <span
                                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: `hsl(var(--cat-${cat.id}))` }}
                                />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        );
      })}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{open.comp.name}</DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  Level {open.level} · {LEVELS[open.level - 1].full}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm leading-relaxed text-foreground/90">{open.comp.levels[open.level - 1]}</p>
              <p className="border-t border-border pt-3 text-xs text-muted-foreground">{open.comp.summary}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
