import { SiteHeader } from "@/components/SiteHeader";
import { RubricMatrix } from "@/components/RubricMatrix";
import { COMPETENCIES, LEVELS } from "@/data/rubric";

const RubricPage = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container py-12">
        <div className="mb-10 max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">The full rubric</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {COMPETENCIES.length} competencies × {LEVELS.length} levels.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Click any cell to read the full level expectation. Use this as a reference, in 1:1s, for hiring loops, or for your team's calibration discussions.
          </p>
        </div>
        <RubricMatrix />
      </div>
    </div>
  );
};

export default RubricPage;
