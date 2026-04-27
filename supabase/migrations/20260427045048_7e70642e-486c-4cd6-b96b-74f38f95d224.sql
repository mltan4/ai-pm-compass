
-- Helper: updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members
CREATE TYPE public.team_role AS ENUM ('owner','member');
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.team_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);

-- Security definer helper to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_team_member(_team_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_team_owner(_team_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = _team_id AND owner_id = _user_id
  );
$$;

-- Teams policies
CREATE POLICY "Members can view their teams" ON public.teams
  FOR SELECT TO authenticated
  USING (public.is_team_member(id, auth.uid()) OR owner_id = auth.uid());
CREATE POLICY "Authenticated users can create teams" ON public.teams
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their team" ON public.teams
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete their team" ON public.teams
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Team members policies
CREATE POLICY "Members can view team roster" ON public.team_members
  FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "Owners can add members" ON public.team_members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_owner(team_id, auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Owners can remove members" ON public.team_members
  FOR DELETE TO authenticated
  USING (public.is_team_owner(team_id, auth.uid()) OR user_id = auth.uid());

-- Invites
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18), 'hex'),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_invites_token ON public.invites(token);

CREATE POLICY "Anyone can view invite by token" ON public.invites
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners can create invites" ON public.invites
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_owner(team_id, auth.uid()) AND created_by = auth.uid());
CREATE POLICY "Owners can delete invites" ON public.invites
  FOR DELETE TO authenticated
  USING (public.is_team_owner(team_id, auth.uid()));

-- Assessments
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_assessments_team ON public.assessments(team_id);

CREATE POLICY "Members can view team assessments" ON public.assessments
  FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "Users can create their own assessment" ON public.assessments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_team_member(team_id, auth.uid()));
CREATE POLICY "Users can update their own assessment" ON public.assessments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own assessment" ON public.assessments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Triggers
CREATE TRIGGER trg_teams_updated BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_assessments_updated BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-add team owner as a member on team creation
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_email TEXT;
BEGIN
  SELECT email INTO owner_email FROM auth.users WHERE id = NEW.owner_id;
  INSERT INTO public.team_members (team_id, user_id, email, role)
  VALUES (NEW.id, NEW.owner_id, COALESCE(owner_email, ''), 'owner');
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_team_owner_member AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_member();
