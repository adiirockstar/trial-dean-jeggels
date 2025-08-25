/*
  # Fix RLS policies for anonymous users

  1. Storage Bucket
    - Create codex-uploads bucket if it doesn't exist
    - Add policy for anonymous users to upload files
    
  2. Security Updates
    - Update codex_submissions table policies to allow anonymous inserts
    - Ensure anonymous users can upload files to storage
*/

-- Create storage bucket for codex uploads if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'codex-uploads',
  'codex-uploads', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Update codex_submissions policies to allow anonymous users
DROP POLICY IF EXISTS "Users can insert their own codex submissions" ON codex_submissions;
DROP POLICY IF EXISTS "Users can read their own codex submissions" ON codex_submissions;

-- Allow anonymous users to insert codex submissions
CREATE POLICY "Anonymous users can insert codex submissions"
  ON codex_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read all codex submissions (for admin purposes)
CREATE POLICY "Authenticated users can read codex submissions"
  ON codex_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create storage policies for codex-uploads bucket
CREATE POLICY "Anonymous users can upload to codex-uploads"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'codex-uploads');

CREATE POLICY "Anonymous users can read from codex-uploads"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'codex-uploads');