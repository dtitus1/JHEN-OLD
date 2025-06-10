/*
  # Start/Sit Tool Database Support

  1. New Tables
    - `start_sit_notes` - Custom notes and overrides for players
    - `matchup_data` - Weekly matchup information and ratings
    - `player_projections` - Custom projection overrides

  2. Features
    - Admin-editable player notes
    - Custom matchup ratings
    - Projection overrides
    - Weekly updates and scheduling
*/

-- Start/Sit Notes table
CREATE TABLE IF NOT EXISTS start_sit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL,
  week integer NOT NULL,
  season integer NOT NULL,
  custom_note text,
  recommendation_override text CHECK (recommendation_override IN ('start', 'sit', 'flex')),
  confidence_override text CHECK (confidence_override IN ('high', 'medium', 'low')),
  projection_override numeric,
  matchup_rating_override text CHECK (matchup_rating_override IN ('excellent', 'good', 'average', 'poor', 'terrible')),
  risk_level_override text CHECK (risk_level_override IN ('low', 'medium', 'high')),
  reasoning_override text[],
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id, week, season)
);

-- Matchup Data table
CREATE TABLE IF NOT EXISTS matchup_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week integer NOT NULL,
  season integer NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  game_script text,
  weather_conditions text,
  total_points_projection numeric,
  pace_rating text,
  defensive_rankings jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(week, season, home_team, away_team)
);

-- Player Projections table
CREATE TABLE IF NOT EXISTS player_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL,
  week integer NOT NULL,
  season integer NOT NULL,
  projected_points numeric NOT NULL,
  floor_points numeric,
  ceiling_points numeric,
  target_share numeric,
  snap_percentage numeric,
  red_zone_targets integer,
  carries integer,
  receiving_yards numeric,
  rushing_yards numeric,
  touchdowns numeric,
  source text DEFAULT 'manual',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id, week, season, source)
);

-- Enable RLS
ALTER TABLE start_sit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchup_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_projections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Start/Sit notes are viewable by everyone"
  ON start_sit_notes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage start/sit notes"
  ON start_sit_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier = 'admin'
    )
  );

CREATE POLICY "Matchup data is viewable by everyone"
  ON matchup_data FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage matchup data"
  ON matchup_data FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier = 'admin'
    )
  );

CREATE POLICY "Player projections are viewable by everyone"
  ON player_projections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage player projections"
  ON player_projections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_tier = 'admin'
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_start_sit_notes_updated_at 
  BEFORE UPDATE ON start_sit_notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matchup_data_updated_at 
  BEFORE UPDATE ON matchup_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_projections_updated_at 
  BEFORE UPDATE ON player_projections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();