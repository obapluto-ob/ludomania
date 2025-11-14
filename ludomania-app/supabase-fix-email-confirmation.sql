-- Fix: Mark all existing users as email confirmed
-- This prevents the confirmation email from being sent

UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Update display names for existing users
UPDATE auth.users
SET raw_user_meta_data = 
  raw_user_meta_data || 
  jsonb_build_object(
    'full_name', p.username,
    'display_name', p.username,
    'username', p.username
  )
FROM public.profiles p
WHERE auth.users.id = p.id;

-- Verify the update
SELECT 
  email,
  email_confirmed_at,
  raw_user_meta_data->>'username' as username,
  raw_user_meta_data->>'display_name' as display_name
FROM auth.users;

