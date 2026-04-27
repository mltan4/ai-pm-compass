import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { COMPETENCIES, type Scores } from "@/data/rubric";

interface Series {
  label: string;
  scores: Scores;
  color: string; // hsl string e.g. "hsl(243 75% 59%)"
}

interface Props {
  series: Series[];
  height?: number;
}

export const ShapeRadar = ({ series, height = 420 }: Props) => {
  // One row per competency; each series gets a key
  const data = COMPETENCIES.map((c) => {
    const row: Record<string, string | number> = { competency: shortName(c.name) };
    series.forEach((s) => {
      row[s.label] = s.scores[c.id] ?? 0;
    });
    return row;
  });

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="78%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="competency"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "DM Sans" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 7]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
            tickCount={8}
            stroke="hsl(var(--border))"
          />
          {series.map((s) => (
            <Radar
              key={s.label}
              name={s.label}
              dataKey={s.label}
              stroke={s.color}
              fill={s.color}
              fillOpacity={series.length > 1 ? 0.15 : 0.3}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          {series.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: "DM Sans" }}
              iconType="circle"
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

function shortName(n: string): string {
  // Trim long names for radar legibility
  return n
    .replace("Specification", "Spec")
    .replace("& AI Behavior ", "")
    .replace("Voice of the Customer", "VoC")
    .replace("UX Design for Non-Determinism", "UX (Non-Det)")
    .replace("Quality, Evals & Red-Teaming", "Quality & Evals")
    .replace("Business Outcome Ownership", "Outcomes")
    .replace("Product Vision & Roadmapping", "Vision")
    .replace("Stakeholder Management", "Stakeholders")
    .replace("Team Leadership", "Leadership")
    .replace("Managing Up", "Managing Up")
    .replace("AI Ethics, Safety & Trust", "Trust & Safety")
    .replace("Prompt & Context Engineering", "Prompts & Context")
    .replace("Fluency with Data", "Data");
}
