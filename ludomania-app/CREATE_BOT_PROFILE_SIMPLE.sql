-- Create bot profile (simple version)
INSERT INTO profiles (
  id,
  username,
  wallet_balance
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Bot',
  0
)
ON CONFLICT (id) DO UPDATE SET
  username = 'Bot';

