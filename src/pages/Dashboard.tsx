import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Users, ArrowRight } from "lucide-react";

interface TeamRow {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const load = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setTeams(data || []);
    if (data && data.length) {
      const { data: mems } = await supabase
        .from("team_members")
        .select("team_id")
        .in("team_id", data.map((t) => t.id));
      const counts: Record<string, number> = {};
      (mems || []).forEach((m) => {
        counts[m.team_id] = (counts[m.team_id] || 0) + 1;
      });
      setMemberCounts(counts);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("teams")
      .insert({ name: name.trim(), owner_id: user.id })
      .select()
      .single();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    setName("");
    toast.success("Team created");
    navigate(`/team/${data.id}`);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container py-12">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Your teams</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Calibration workspaces</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="mr-1 h-4 w-4" /> New team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a team</DialogTitle>
              </DialogHeader>
              <form onSubmit={create} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="team-name">Team name</Label>
                  <Input
                    id="team-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Growth PMs at Acme"
                    autoFocus
                  />
                </div>
                <Button type="submit" disabled={busy || !name.trim()} className="w-full">
                  {busy ? "Creating…" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {teams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-strong bg-surface/40 p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-semibold">No teams yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create a team to start calibrating.</p>
            <Button onClick={() => setOpen(true)} className="mt-5">
              <Plus className="mr-1 h-4 w-4" /> Create your first team
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => (
              <Link
                key={t.id}
                to={`/team/${t.id}`}
                className="group rounded-xl border border-border bg-surface p-6 transition-all hover:border-border-strong hover:bg-surface-elevated"
              >
                <div className="flex items-start justify-between">
                  <h2 className="font-display text-lg font-semibold">{t.name}</h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">{memberCounts[t.id] || 1} member{(memberCounts[t.id] || 1) === 1 ? "" : "s"}</span>
                  {t.owner_id === user?.id && (
                    <span className="rounded-full border border-border px-2 py-0.5 font-mono uppercase tracking-wider">Owner</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
