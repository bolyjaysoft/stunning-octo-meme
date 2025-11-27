-- Add missing columns to corp_members table if they don't exist
DO $$
BEGIN
    -- Add change_of_names
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corp_members' AND column_name = 'change_of_names') THEN
        ALTER TABLE corp_members ADD COLUMN change_of_names TEXT;
    END IF;

    -- Add higher_institutions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corp_members' AND column_name = 'higher_institutions') THEN
        ALTER TABLE corp_members ADD COLUMN higher_institutions TEXT;
    END IF;

    -- Add qualifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corp_members' AND column_name = 'qualifications') THEN
        ALTER TABLE corp_members ADD COLUMN qualifications TEXT;
    END IF;

    -- Add state_of_origin
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corp_members' AND column_name = 'state_of_origin') THEN
        ALTER TABLE corp_members ADD COLUMN state_of_origin TEXT;
    END IF;

    -- Add state_of_deployment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corp_members' AND column_name = 'state_of_deployment') THEN
        ALTER TABLE corp_members ADD COLUMN state_of_deployment TEXT;
    END IF;

    -- Add period_covered_batch
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corp_members' AND column_name = 'period_covered_batch') THEN
        ALTER TABLE corp_members ADD COLUMN period_covered_batch TEXT;
    END IF;

    -- Add period_covered_from
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corp_members' AND column_name = 'period_covered_from') THEN
        ALTER TABLE corp_members ADD COLUMN period_covered_from DATE;
    END IF;

    -- Add period_covered_to
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corp_members' AND column_name = 'period_covered_to') THEN
        ALTER TABLE corp_members ADD COLUMN period_covered_to DATE;
    END IF;
    
    -- Add gsm_phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'corp_members' AND column_name = 'gsm_phone') THEN
        ALTER TABLE corp_members ADD COLUMN gsm_phone TEXT;
    END IF;

END $$;

-- Re-apply check constraints to ensure data integrity
DO $$
BEGIN
    -- Drop existing constraints if they exist to avoid errors when re-adding
    ALTER TABLE corp_members DROP CONSTRAINT IF EXISTS corp_members_state_check;
    ALTER TABLE corp_members DROP CONSTRAINT IF EXISTS corp_members_state_of_deployment_check;
    ALTER TABLE corp_members DROP CONSTRAINT IF EXISTS corp_members_period_covered_batch_check;
    ALTER TABLE corp_members DROP CONSTRAINT IF EXISTS corp_members_platoon_check;
    ALTER TABLE corp_members DROP CONSTRAINT IF EXISTS corp_members_state_code_check;
    ALTER TABLE corp_members DROP CONSTRAINT IF EXISTS corp_members_nysc_call_up_no_check;
    
    -- Add constraints
    ALTER TABLE corp_members ADD CONSTRAINT corp_members_state_check CHECK (state IN ('Lagos', 'Ondo'));
    ALTER TABLE corp_members ADD CONSTRAINT corp_members_state_of_deployment_check CHECK (state_of_deployment IN ('Lagos', 'Ondo'));
    ALTER TABLE corp_members ADD CONSTRAINT corp_members_period_covered_batch_check CHECK (period_covered_batch IN ('Batch A', 'Batch B', 'Batch C'));
    ALTER TABLE corp_members ADD CONSTRAINT corp_members_platoon_check CHECK (platoon >= 1 AND platoon <= 10);
    ALTER TABLE corp_members ADD CONSTRAINT corp_members_state_code_check CHECK (state_code ~ '^(LA|OD)/25C/[0-9]{4}$');
    ALTER TABLE corp_members ADD CONSTRAINT corp_members_nysc_call_up_no_check CHECK (nysc_call_up_no ~ '^NYSC/');
END $$;
