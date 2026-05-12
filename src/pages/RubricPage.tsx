import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { RubricMatrix } from "@/components/RubricMatrix";
import { COMPETENCIES, LEVELS } from "@/data/rubric";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, Filter, Sparkles, X } from "lucide-react";

const RubricPage = () => {
  const [levelFilter, setLevelFilter] = useState<number[]>([]);
  const [aiOnly, setAiOnly] = useState(false);

  const toggleLevel = (idx: number) =>
    setLevelFilter((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));

  const aiCount = COMPETENCIES.filter((c) => c.isNew).length;
  const hasFilters = levelFilter.length > 0 || aiOnly;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container py-12">
        <div className="mb-8 max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">The full rubric</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {COMPETENCIES.length} competencies × {LEVELS.length} levels.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Click any cell to read the full level expectation. Use this as a reference, in 1:1s, for hiring loops, or for your team's calibration discussions.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface/50 p-3">
          <div className="flex items-center gap-2 pl-1 pr-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filters
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Levels
                {levelFilter.length > 0 && (
                  <span className="rounded-full bg-primary/20 px-1.5 font-mono text-[10px] text-primary-glow">
                    {levelFilter.length}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-2">
              <div className="space-y-1">
                {LEVELS.map((l) => (
                  <label
                    key={l.idx}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-surface-hover"
                  >
                    <Checkbox
                      checked={levelFilter.includes(l.idx)}
                      onCheckedChange={() => toggleLevel(l.idx)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{l.label}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">L{l.idx} · {l.full}</div>
                    </div>
                  </label>
                ))}
                {levelFilter.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 w-full"
                    onClick={() => setLevelFilter([])}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
            <Label htmlFor="ai-only" className="cursor-pointer text-sm">
              AI-focus only
              <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">({aiCount})</span>
            </Label>
            <Switch id="ai-only" checked={aiOnly} onCheckedChange={setAiOnly} />
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLevelFilter([]);
                setAiOnly(false);
              }}
              className="ml-auto gap-1.5 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" /> Clear all
            </Button>
          )}
        </div>

        <RubricMatrix levelFilter={levelFilter} aiOnly={aiOnly} />
      </div>
    </div>
  );
};

export default RubricPage;
