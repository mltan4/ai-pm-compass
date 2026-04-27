import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users } from "lucide-react";

const Join = () => {
  const { token } = useParams<{ token: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState<string>("");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const lookup = async () => {
      if (!token) return;
      const { data: invite, error } = await supabase
        .from("invites")
        .select("team_id, teams!inner(id, name)")
        .eq("token", token)
        .maybeSingle();
      if (error || !invite) {
        setErr("This invite link is invalid or has expired.");
        return;
      }
      const joined = invite as unknown as { team_id: string; teams: { name: string } };
      setTeamName(joined.teams.name);
      setTeamId(joined.team_id);
    };
    lookup();
  }, [token]);

  const accept = async () => {
    if (!user || !teamId) return;
    setBusy(true);
    const { error } = await supabase
      .from("team_members")
      .insert({ team_id: teamId, user_id: user.id, email: user.email || "", role: "member" });
    setBusy(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error(error.message);
      return;
    }
    toast.success(`Joined ${teamName}`);
    navigate(`/team/${teamId}`);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-elevated">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          {err ? (
            <>
              <h1 className="mt-5 font-display text-2xl font-semibold">Invite not found</h1>
              <p className="mt-2 text-sm text-muted-foreground">{err}</p>
              <Button className="mt-6" onClick={() => navigate("/")}>Go home</Button>
            </>
          ) : !teamName ? (
            <p className="mt-6 text-sm text-muted-foreground">Looking up invite…</p>
          ) : (
            <>
              <h1 className="mt-5 font-display text-2xl font-semibold">Join {teamName}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                You've been invited to calibrate with this team.
              </p>
              {loading ? (
                <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
              ) : user ? (
                <Button className="mt-6 w-full bg-gradient-primary hover:opacity-90" onClick={accept} disabled={busy}>
                  {busy ? "Joining…" : `Join as ${user.email}`}
                </Button>
              ) : (
                <>
                  <p className="mt-6 text-sm text-muted-foreground">Sign in or create an account to accept.</p>
                  <Button className="mt-3 w-full" onClick={() => navigate(`/auth?next=/join/${token}`)}>
                    Sign in to continue
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Join;
