-- Rename existing columns to match form data
ALTER TABLE corp_members RENAME COLUMN institution TO higher_institutions;
ALTER TABLE corp_members RENAME COLUMN qualification TO qualification_with_specialisation;
ALTER TABLE corp_members RENAME COLUMN grade TO class_of_degree;
ALTER TABLE corp_members RENAME COLUMN graduation_year TO year_of_graduation;

-- Add missing columns that are present in the form or profile page
ALTER TABLE corp_members ADD COLUMN IF NOT EXISTS change_of_names text;
ALTER TABLE corp_members ADD COLUMN IF NOT EXISTS state_of_origin text;
ALTER TABLE corp_members ADD COLUMN IF NOT EXISTS period_covered_from text;
ALTER TABLE corp_members ADD COLUMN IF NOT EXISTS period_covered_to text;

-- Make discipline nullable since it's not in the form
ALTER TABLE corp_members ALTER COLUMN discipline DROP NOT NULL;
