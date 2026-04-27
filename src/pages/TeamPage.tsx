import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Link as LinkIcon, Users, Sparkles, GitCompare } from "lucide-react";
import { ShapeRadar } from "@/components/ShapeRadar";
import {
  CATEGORIES,
  COMPETENCIES,
  COMPETENCIES_BY_CATEGORY,
  LEVELS,
  archetypeFor,
  categoryAverage,
  emptyScores,
  overallAverage,
  type Scores,
} from "@/data/rubric";

interface TeamRow {
  id: string;
  name: string;
  owner_id: string;
}
interface Member {
  user_id: string;
  email: string;
  role: "owner" | "member";
}
interface AssessmentRow {
  id?: string;
  team_id: string;
  user_id: string;
  email: string;
  scores: Scores;
}

// Palette for distinguishing members on the radar
const MEMBER_COLORS = [
  "hsl(243 75% 65%)",
  "hsl(152 70% 55%)",
  "hsl(35 92% 62%)",
  "hsl(280 75% 65%)",
  "hsl(199 91% 65%)",
  "hsl(340 82% 65%)",
  "hsl(60 90% 60%)",
  "hsl(170 70% 50%)",
];

const TeamPage = () => {
  const { id: teamId } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState<TeamRow | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const load = async () => {
    if (!teamId) return;
    setLoading(true);
    const [{ data: t }, { data: m }, { data: a }] = await Promise.all([
      supabase.from("teams").select("*").eq("id", teamId).maybeSingle(),
      supabase.from("team_members").select("user_id, email, role").eq("team_id", teamId),
      supabase.from("assessments").select("*").eq("team_id", teamId),
    ]);
    if (!t) {
      toast.error("Team not found or access denied");
      navigate("/dashboard");
      return;
    }
    setTeam(t as TeamRow);
    setMembers((m as Member[]) || []);
    setAssessments(
      ((a as unknown as AssessmentRow[]) || []).map((row) => ({
        ...row,
        scores: { ...emptyScores(), ...(row.scores || {}) },
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    if (user && teamId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, teamId]);

  const myAssessment = useMemo(
    () => assessments.find((a) => a.user_id === user?.id),
    [assessments, user],
  );

  const saveScore = async (compId: string, level: number) => {
    if (!user || !teamId) return;
    const newScores = { ...(myAssessment?.scores || emptyScores()), [compId]: level };
    // Optimistic
    setAssessments((prev) => {
      const others = prev.filter((a) => a.user_id !== user.id);
      return [
        ...others,
        {
          team_id: teamId,
          user_id: user.id,
          email: user.email || "",
          scores: newScores,
        },
      ];
    });
    const { error } = await supabase
      .from("assessments")
      .upsert(
        {
          team_id: teamId,
          user_id: user.id,
          email: user.email || "",
          scores: newScores,
        },
        { onConflict: "team_id,user_id" },
      );
    if (error) toast.error(error.message);
  };

  const createInvite = async () => {
    if (!teamId || !user) return;
    const { data, error } = await supabase
      .from("invites")
      .insert({ team_id: teamId, created_by: user.id })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    const url = `${window.location.origin}/join/${data.token}`;
    setInviteUrl(url);
  };

  const copyInvite = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied");
  };

  if (loading || !team) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="container py-20 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const isOwner = team.owner_id === user?.id;
  const myScores = myAssessment?.scores || emptyScores();
  const myArchetype = archetypeFor(myScores);
  const myComplete = COMPETENCIES.every((c) => (myScores[c.id] || 0) > 0);

  // Build radar series for the team — only members who have scored at least one
  const teamSeries = assessments
    .filter((a) => Object.values(a.scores).some((v) => v > 0))
    .map((a, i) => ({
      label: a.user_id === user?.id ? "You" : (a.email.split("@")[0] || `Member ${i + 1}`),
      scores: a.scores,
      color: a.user_id === user?.id ? "hsl(var(--primary-glow))" : MEMBER_COLORS[i % MEMBER_COLORS.length],
    }));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container py-10">
        {/* Team header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Team · {members.length} member{members.length === 1 ? "" : "s"}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">{team.name}</h1>
          </div>
          <Dialog
            onOpenChange={(o) => {
              if (o && !inviteUrl) createInvite();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <LinkIcon className="mr-1.5 h-4 w-4" /> Invite teammates
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to {team.name}</DialogTitle>
                <DialogDescription>
                  Share this link with your team. Anyone with the link can join and add their assessment.
                </DialogDescription>
              </DialogHeader>
              {inviteUrl ? (
                <div className="flex items-center gap-2 rounded-md border border-border bg-surface p-2">
                  <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs">{inviteUrl}</code>
                  <Button size="sm" variant="ghost" onClick={copyInvite}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Generating link…</p>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="assess">
          <TabsList>
            <TabsTrigger value="assess">My assessment</TabsTrigger>
            <TabsTrigger value="team">Team shape</TabsTrigger>
            <TabsTrigger value="calibrate">Calibrate</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* MY ASSESSMENT */}
          <TabsContent value="assess" className="mt-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-8">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Pick your level on each competency
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">
                    {myComplete ? "Refine your assessment" : "Assess yourself"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Be honest. The point isn't to look good — it's to surface gaps.
                  </p>
                </div>

                {CATEGORIES.map((cat) => (
                  <section key={cat.id}>
                    <header className="mb-3 flex items-center gap-2 border-b border-border pb-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(var(--cat-${cat.id}))` }} />
                      <h3 className="font-display text-lg font-semibold">{cat.name}</h3>
                    </header>
                    <div className="space-y-3">
                      {COMPETENCIES_BY_CATEGORY[cat.id].map((comp) => {
                        const lvl = myScores[comp.id] || 0;
                        return (
                          <div
                            key={comp.id}
                            className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-medium">{comp.name}</h4>
                                  {comp.isNew && (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary-glow">
                                      <Sparkles className="h-2.5 w-2.5" /> AI
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">{comp.summary}</p>
                              </div>
                              <span
                                className="shrink-0 rounded-md border border-border px-2 py-1 font-mono text-xs"
                                style={lvl ? { color: `hsl(var(--cat-${cat.id}))`, borderColor: `hsl(var(--cat-${cat.id}) / 0.5)` } : undefined}
                              >
                                {lvl ? `L${lvl}` : "—"}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {LEVELS.map((l) => {
                                const active = lvl === l.idx;
                                return (
                                  <button
                                    key={l.idx}
                                    type="button"
                                    onClick={() => saveScore(comp.id, l.idx)}
                                    className={`rounded-md border px-2.5 py-1 font-mono text-[11px] transition-all ${
                                      active
                                        ? "border-primary bg-primary/15 text-primary-glow shadow-glow"
                                        : "border-border bg-surface-elevated text-muted-foreground hover:border-border-strong hover:text-foreground"
                                    }`}
                                    style={active ? { borderColor: `hsl(var(--cat-${cat.id}))` } : undefined}
                                    title={l.full}
                                  >
                                    {l.label}
                                  </button>
                                );
                              })}
                            </div>

                            {lvl > 0 && (
                              <p className="mt-3 rounded-md border border-border/60 bg-background/50 p-3 text-xs leading-relaxed text-foreground/85">
                                {comp.levels[lvl - 1]}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              {/* Sticky sidebar */}
              <aside className="lg:sticky lg:top-20 lg:h-fit space-y-4">
                <div className="rounded-xl border border-border bg-surface p-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Your shape</p>
                  <ShapeRadar
                    series={[{ label: "You", scores: myScores, color: "hsl(var(--primary-glow))" }]}
                    height={260}
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
                    {CATEGORIES.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(var(--cat-${c.id}))` }} />
                          {c.name.replace("Customer & Model Insight", "Insight").replace("Product ", "")}
                        </span>
                        <span className="font-mono">{categoryAverage(myScores, c.id).toFixed(1)}</span>
                      </div>
                    ))}
                    <div className="col-span-2 mt-1 flex items-center justify-between border-t border-border pt-2 text-xs">
                      <span className="font-medium">Overall</span>
                      <span className="font-mono">{overallAverage(myScores).toFixed(1)} / 7</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary-glow">Your archetype</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{myArchetype.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{myArchetype.description}</p>
                </div>
              </aside>
            </div>
          </TabsContent>

          {/* TEAM SHAPE */}
          <TabsContent value="team" className="mt-8">
            {teamSeries.length === 0 ? (
              <EmptyState
                title="No assessments yet"
                body="Once you and your teammates submit scores, the team's combined shape will appear here."
              />
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="rounded-xl border border-border bg-surface p-6">
                  <ShapeRadar series={teamSeries} height={500} />
                </div>
                <div className="space-y-4">
                  <TeamGapCard assessments={assessments} />
                  <ArchetypesCard assessments={assessments} userId={user?.id} />
                </div>
              </div>
            )}
          </TabsContent>

          {/* CALIBRATE */}
          <TabsContent value="calibrate" className="mt-8">
            <CalibrateView assessments={assessments} userId={user?.id} />
          </TabsContent>

          {/* MEMBERS */}
          <TabsContent value="members" className="mt-8">
            <div className="rounded-xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" /> {members.length} member{members.length === 1 ? "" : "s"}
                </h3>
              </div>
              <ul>
                {members.map((m) => {
                  const a = assessments.find((x) => x.user_id === m.user_id);
                  const filled = a ? Object.values(a.scores).filter((v) => v > 0).length : 0;
                  return (
                    <li key={m.user_id} className="flex items-center justify-between border-b border-border/60 p-4 last:border-0">
                      <div>
                        <div className="font-medium">{m.email}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {m.role === "owner" ? "Owner" : "Member"} · {filled}/{COMPETENCIES.length} competencies scored
                        </div>
                      </div>
                      {a && (
                        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {overallAverage(a.scores).toFixed(1)} avg
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {isOwner && (
                <div className="border-t border-border p-4 text-xs text-muted-foreground">
                  You're the owner. Generate an invite link from the top right to add more teammates.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const EmptyState = ({ title, body }: { title: string; body: string }) => (
  <div className="rounded-xl border border-dashed border-border-strong bg-surface/40 p-12 text-center">
    <h3 className="font-display text-xl font-semibold">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{body}</p>
  </div>
);

const TeamGapCard = ({ assessments }: { assessments: AssessmentRow[] }) => {
  const valid = assessments.filter((a) => Object.values(a.scores).some((v) => v > 0));
  if (!valid.length) return null;

  // Average per competency across the team
  const avgs = COMPETENCIES.map((c) => ({
    comp: c,
    avg: valid.reduce((s, a) => s + (a.scores[c.id] || 0), 0) / valid.length,
  }));
  const sorted = [...avgs].sort((a, b) => a.avg - b.avg);
  const weakest = sorted.slice(0, 3);
  const strongest = [...sorted].reverse().slice(0, 3);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Team gaps</p>
      <h3 className="mt-1 font-display text-lg font-semibold">Where to focus</h3>
      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-warning">Weakest</p>
          {weakest.map((w) => (
            <div key={w.comp.id} className="mt-1 flex items-center justify-between text-xs">
              <span className="text-foreground/85">{w.comp.name}</span>
              <span className="font-mono text-muted-foreground">{w.avg.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-success">Strongest</p>
          {strongest.map((w) => (
            <div key={w.comp.id} className="mt-1 flex items-center justify-between text-xs">
              <span className="text-foreground/85">{w.comp.name}</span>
              <span className="font-mono text-muted-foreground">{w.avg.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ArchetypesCard = ({ assessments, userId }: { assessments: AssessmentRow[]; userId?: string }) => {
  const valid = assessments.filter((a) => Object.values(a.scores).some((v) => v > 0));
  if (!valid.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Archetype distribution</p>
      <h3 className="mt-1 font-display text-lg font-semibold">Your team's shape</h3>
      <div className="mt-3 space-y-2">
        {valid.map((a) => {
          const arch = archetypeFor(a.scores);
          const isMe = a.user_id === userId;
          return (
            <div key={a.user_id} className="flex items-center justify-between rounded-md border border-border/60 p-2 text-xs">
              <span className={`truncate ${isMe ? "text-primary-glow" : "text-foreground/85"}`}>
                {isMe ? "You" : a.email.split("@")[0]}
              </span>
              <span className="font-mono text-muted-foreground">{arch.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalibrateView = ({ assessments, userId }: { assessments: AssessmentRow[]; userId?: string }) => {
  const valid = assessments.filter((a) => Object.values(a.scores).some((v) => v > 0));
  const [aId, setAId] = useState<string>("");
  const [bId, setBId] = useState<string>("");
  const [compId, setCompId] = useState<string>(COMPETENCIES[0].id);

  useEffect(() => {
    if (valid.length && !aId) setAId(userId && valid.find((v) => v.user_id === userId) ? userId : valid[0].user_id);
    if (valid.length > 1 && !bId) {
      const other = valid.find((v) => v.user_id !== aId);
      if (other) setBId(other.user_id);
    }
  }, [valid, userId, aId, bId]);

  if (valid.length < 2) {
    return (
      <EmptyState
        title="Need at least 2 assessments to calibrate"
        body="Calibration is most useful when you can compare two team members on the same competency. Invite teammates and have them submit assessments."
      />
    );
  }

  const a = valid.find((v) => v.user_id === aId);
  const b = valid.find((v) => v.user_id === bId);
  const comp = COMPETENCIES.find((c) => c.id === compId)!;
  const aLvl = a?.scores[compId] || 0;
  const bLvl = b?.scores[compId] || 0;
  const gap = Math.abs(aLvl - bLvl);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-primary-glow" />
          <h3 className="font-display text-lg font-semibold">Side-by-side calibration</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare any two members on a single competency. Use this to align in calibration meetings.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Person A</label>
            <Select value={aId} onValueChange={setAId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {valid.map((v) => (
                  <SelectItem key={v.user_id} value={v.user_id}>
                    {v.user_id === userId ? "You" : v.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Person B</label>
            <Select value={bId} onValueChange={setBId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {valid.map((v) => (
                  <SelectItem key={v.user_id} value={v.user_id}>
                    {v.user_id === userId ? "You" : v.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Competency</label>
            <Select value={compId} onValueChange={setCompId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COMPETENCIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <PersonLevelCard label={a?.user_id === userId ? "You" : a?.email || ""} level={aLvl} compName={comp.name} text={aLvl ? comp.levels[aLvl - 1] : "Not yet scored"} catId={comp.category} />
        <div className="flex items-center justify-center">
          <div className={`rounded-full border px-3 py-1 font-mono text-xs ${gap === 0 ? "border-success/50 text-success" : gap >= 2 ? "border-warning/50 text-warning" : "border-border text-muted-foreground"}`}>
            {gap === 0 ? "aligned" : `Δ ${gap} level${gap === 1 ? "" : "s"}`}
          </div>
        </div>
        <PersonLevelCard label={b?.user_id === userId ? "You" : b?.email || ""} level={bLvl} compName={comp.name} text={bLvl ? comp.levels[bLvl - 1] : "Not yet scored"} catId={comp.category} />
      </div>

      {/* Full ladder reference */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Full ladder · {comp.name}</p>
        <div className="mt-3 space-y-1.5">
          {LEVELS.map((l) => (
            <div key={l.idx} className="flex items-start gap-3 rounded-md border border-border/60 bg-surface-elevated p-3">
              <span className="shrink-0 rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">L{l.idx} · {l.label}</span>
              <span className="text-xs text-foreground/85">{comp.levels[l.idx - 1]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PersonLevelCard = ({ label, level, compName, text, catId }: { label: string; level: number; compName: string; text: string; catId: string }) => (
  <div className="rounded-xl border border-border bg-surface p-5">
    <div className="flex items-center justify-between">
      <span className="font-display text-sm font-medium truncate">{label}</span>
      <span
        className="rounded-md border px-2 py-0.5 font-mono text-xs"
        style={level ? { color: `hsl(var(--cat-${catId}))`, borderColor: `hsl(var(--cat-${catId}) / 0.5)` } : { color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--border))" }}
      >
        {level ? `L${level}` : "—"}
      </span>
    </div>
    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{compName}</p>
    <p className="mt-3 text-sm leading-relaxed text-foreground/90">{text}</p>
  </div>
);

export default TeamPage;
