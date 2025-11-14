-- Update Supabase auth users to show username as display name
-- This updates the raw_user_meta_data to include full_name and display_name

-- Update all existing users to have display name from profiles table
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
  raw_user_meta_data->>'username' as username,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'display_name' as display_name
FROM auth.users;

