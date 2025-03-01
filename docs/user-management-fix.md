# User Management Fix

This document explains how to fix the issue with users not showing up in the admin dashboard.

## The Issue

The problem was that while users were being created in Supabase's authentication system, they weren't being properly displayed in the admin dashboard. This was due to two issues:

1. The database trigger that should automatically add users to the `public.users` table when they register wasn't working correctly.
2. The Row Level Security (RLS) policies on the `users` table didn't allow admins to view all users.

## The Solution

We created several scripts to fix these issues:

### 1. Fix the User Trigger

The `scripts/sync-users.js` script synchronizes users from the auth system to the `public.users` table. This ensures that all users who have registered are properly added to the `public.users` table.

```bash
node scripts/sync-users.js
```

### 2. Add Admin Policies

The `supabase/migrations/20250302_add_admin_users_policy.sql` migration adds RLS policies that allow admins to view and update all users. It also makes a specific user an admin.

You can apply this migration using the `scripts/apply-admin-policy.js` script:

```bash
node scripts/apply-admin-policy.js
```

### 3. Make a User an Admin

The `scripts/make-user-admin.js` script makes a specific user an admin:

```bash
node scripts/make-user-admin.js your-email@example.com
```

## Verifying the Fix

After applying these fixes, you should be able to see all users in your admin dashboard at:

```
https://www.sensebycbd.com/admin/users
```

## Future Considerations

To ensure this doesn't happen again:

1. Make sure the database trigger is properly installed and working.
2. Make sure the RLS policies allow admins to view and update all users.
3. Make sure at least one user is an admin.

If you need to add more admin users in the future, you can use the `scripts/make-user-admin.js` script.
