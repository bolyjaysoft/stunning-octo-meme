-- Create corp_members table
CREATE TABLE IF NOT EXISTS public.corp_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL CHECK (state_code ~ '^(LA|OD)/25C/[0-9]{4}$'),
  state TEXT NOT NULL CHECK (state IN ('Lagos', 'Ondo')),
  platoon INTEGER NOT NULL CHECK (platoon >= 1 AND platoon <= 10),
  nysc_call_up_no TEXT NOT NULL CHECK (nysc_call_up_no ~ '^NYSC/'),
  name_surname TEXT,
  name_other TEXT,
  change_of_names TEXT,
  higher_institutions TEXT,
  qualifications TEXT,
  state_of_origin TEXT,
  state_of_deployment TEXT CHECK (state_of_deployment IN ('Lagos', 'Ondo')),
  period_covered_batch TEXT CHECK (period_covered_batch IN ('Batch A', 'Batch B', 'Batch C')),
  period_covered_from DATE,
  period_covered_to DATE,
  gsm_phone TEXT CHECK (gsm_phone ~ '^\+234[0-9]{10}$'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create squad_instructor_ratings table (Part II)
CREATE TABLE IF NOT EXISTS public.squad_instructor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corp_member_id UUID NOT NULL REFERENCES public.corp_members(id) ON DELETE CASCADE,
  instructor_name TEXT NOT NULL,
  platoon INTEGER NOT NULL CHECK (platoon >= 1 AND platoon <= 10),
  instructor_type TEXT NOT NULL CHECK (instructor_type IN ('Man O''War', 'Squad')),
  
  -- Award of Marks (10 categories)
  appearance_bearing_physique INTEGER CHECK (appearance_bearing_physique >= 0 AND appearance_bearing_physique <= 10),
  punctuality_regularity INTEGER CHECK (punctuality_regularity >= 0 AND punctuality_regularity <= 10),
  camp_civics_knowledge INTEGER CHECK (camp_civics_knowledge >= 0 AND camp_civics_knowledge <= 10),
  civil_orientation INTEGER CHECK (civil_orientation >= 0 AND civil_orientation <= 10),
  state_of_duty INTEGER CHECK (state_of_duty >= 0 AND state_of_duty <= 10),
  initiative_resourcefulness INTEGER CHECK (initiative_resourcefulness >= 0 AND initiative_resourcefulness <= 10),
  team_work INTEGER CHECK (team_work >= 0 AND team_work <= 10),
  command_leadership INTEGER CHECK (command_leadership >= 0 AND command_leadership <= 10),
  discipline INTEGER CHECK (discipline >= 0 AND discipline <= 10),
  special_contribution TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create man_o_war_ratings table (Part II - separate for Man O'War)
CREATE TABLE IF NOT EXISTS public.man_o_war_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corp_member_id UUID NOT NULL REFERENCES public.corp_members(id) ON DELETE CASCADE,
  instructor_name TEXT NOT NULL,
  
  -- Scores by Man O'War Instructor
  scores_by_man_instructor INTEGER CHECK (scores_by_man_instructor >= 0 AND scores_by_man_instructor <= 80),
  scores_by_squad_instructor INTEGER CHECK (scores_by_squad_instructor >= 0 AND scores_by_squad_instructor <= 80),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create commandant_ratings table (Part III)
CREATE TABLE IF NOT EXISTS public.commandant_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corp_member_id UUID NOT NULL REFERENCES public.corp_members(id) ON DELETE CASCADE,
  commandant_name TEXT NOT NULL,
  
  -- Camp Commandant section
  general_assessment TEXT,
  support_training_programs BOOLEAN,
  signature_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.corp_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_instructor_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.man_o_war_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandant_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow public read/write for now - no auth required per user request)
CREATE POLICY "Allow public insert corp_members" ON public.corp_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select corp_members" ON public.corp_members FOR SELECT USING (true);
CREATE POLICY "Allow public update corp_members" ON public.corp_members FOR UPDATE USING (true);

CREATE POLICY "Allow public insert squad_ratings" ON public.squad_instructor_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select squad_ratings" ON public.squad_instructor_ratings FOR SELECT USING (true);
CREATE POLICY "Allow public update squad_ratings" ON public.squad_instructor_ratings FOR UPDATE USING (true);

CREATE POLICY "Allow public insert mow_ratings" ON public.man_o_war_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select mow_ratings" ON public.man_o_war_ratings FOR SELECT USING (true);
CREATE POLICY "Allow public update mow_ratings" ON public.man_o_war_ratings FOR UPDATE USING (true);

CREATE POLICY "Allow public insert commandant_ratings" ON public.commandant_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select commandant_ratings" ON public.commandant_ratings FOR SELECT USING (true);
CREATE POLICY "Allow public update commandant_ratings" ON public.commandant_ratings FOR UPDATE USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_corp_members_state ON public.corp_members(state);
CREATE INDEX idx_corp_members_platoon ON public.corp_members(platoon);
CREATE INDEX idx_corp_members_state_code ON public.corp_members(state_code);
CREATE INDEX idx_squad_ratings_corp_member ON public.squad_instructor_ratings(corp_member_id);
CREATE INDEX idx_squad_ratings_platoon ON public.squad_instructor_ratings(platoon);
CREATE INDEX idx_mow_ratings_corp_member ON public.man_o_war_ratings(corp_member_id);
CREATE INDEX idx_commandant_ratings_corp_member ON public.commandant_ratings(corp_member_id);
