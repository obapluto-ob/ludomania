-- Create storage bucket for transaction proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('transaction-proofs', 'transaction-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for transaction-proofs bucket
CREATE POLICY "Users can upload their own transaction proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'transaction-proofs' AND
  (storage.foldername(name))[1] = 'deposit-proofs'
);

CREATE POLICY "Anyone can view transaction proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'transaction-proofs');

CREATE POLICY "Users can update their own transaction proofs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'transaction-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own transaction proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'transaction-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

