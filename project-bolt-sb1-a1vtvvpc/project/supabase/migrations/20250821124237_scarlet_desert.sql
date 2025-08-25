/*
  # Personal Codex Agent Submissions Schema

  1. New Tables
    - `codex_submissions`
      - `id` (uuid, primary key)
      - `cv` (jsonb) - CV content as string or object with file metadata
      - `supporting_docs` (jsonb) - Supporting documents as single object or array
      - `mode` (text) - Agent interaction mode
      - `message` (text) - Initial user message
      - `session_id` (text) - Unique session identifier
      - `created_at` (timestamp)

  2. Storage
    - Create `codex-uploads` bucket for file storage
    - Enable public access for uploaded files

  3. Security
    - Enable RLS on `codex_submissions` table
    - Add policies for authenticated access
*/

-- Create the codex submissions table
CREATE TABLE IF NOT EXISTS codex_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv jsonb NOT NULL,
  supporting_docs jsonb DEFAULT '[]'::jsonb,
  mode text NOT NULL DEFAULT 'interview',
  message text NOT NULL DEFAULT 'Hello! Tell me about yourself.',
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE codex_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own codex submissions"
  ON codex_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own codex submissions"
  ON codex_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create storage bucket for codex uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('codex-uploads', 'codex-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Authenticated users can upload codex files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'codex-uploads');

CREATE POLICY "Authenticated users can view codex files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'codex-uploads');

CREATE POLICY "Public can view codex files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'codex-uploads');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_codex_submissions_session_id ON codex_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_codex_submissions_created_at ON codex_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_codex_submissions_mode ON codex_submissions(mode);