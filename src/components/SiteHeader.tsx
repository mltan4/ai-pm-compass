import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

export const SiteHeader = () => {
  const { user } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span>PM<span className="text-muted-foreground">/</span>AI</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/rubric" className={`rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-surface ${loc.pathname === "/rubric" ? "text-foreground" : "text-muted-foreground"}`}>Rubric</Link>
          {user && (
            <Link to="/dashboard" className={`rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-surface ${loc.pathname.startsWith("/dashboard") || loc.pathname.startsWith("/team") ? "text-foreground" : "text-muted-foreground"}`}>Teams</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/auth">Sign in</Link></Button>
              <Button size="sm" asChild className="bg-gradient-primary hover:opacity-90"><Link to="/auth">Get started</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
