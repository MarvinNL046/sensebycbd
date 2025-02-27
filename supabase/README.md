# Supabase Setup for SenseBy CBD

This directory contains the database schema and setup instructions for the Supabase backend of the SenseBy CBD webshop.

## Setup Instructions

### 1. Create a Supabase Project

If you haven't already, create a new project on [Supabase](https://supabase.com):

1. Sign in to your Supabase account
2. Click "New Project"
3. Enter project details and create the project
4. Note down the project URL and anon/public API key

### 2. Set Up Environment Variables

Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `schema.sql` into the editor
5. Run the query to create all tables, policies, and functions

### 4. Enable Authentication

1. Go to Authentication settings in your Supabase dashboard
2. Under "Email Auth", make sure "Enable Email Signup" is turned on
3. Configure any additional auth providers as needed

### 5. Set Up Storage

1. Go to Storage in your Supabase dashboard
2. Create the following buckets:
   - `product-images`: for product images
   - `category-images`: for category images
   - `user-uploads`: for user-uploaded content
3. Set the privacy settings:
   - `product-images`: Public (anyone can read)
   - `category-images`: Public (anyone can read)
   - `user-uploads`: Private (only authenticated users can read their own uploads)

## Database Schema

The database consists of the following tables:

- `users`: Extended user profiles linked to Supabase auth
- `categories`: Product categories
- `products`: Product listings
- `orders`: Customer orders
- `order_items`: Individual items in orders
- `reviews`: Product reviews
- `feedback`: Customer feedback

Each table has appropriate Row Level Security (RLS) policies to ensure data security.

## Row Level Security

The schema includes RLS policies to ensure:

- Users can only access their own data
- Products and categories are publicly readable
- Only admins can modify products and categories
- Users can create and view their own orders
- Reviews are publicly readable but only editable by their authors

## Triggers

A trigger is set up to automatically create a user profile in the `users` table when a new user signs up through Supabase Auth.

## Indexes

Indexes are created on frequently queried columns to improve performance.

## Sample Data

We've included a sample data file (`sample-data.sql`) that you can use to populate the database with test data:

1. First, execute the `schema.sql` file to create the database structure
2. Create an admin user through the Supabase Auth UI or API
3. Execute the `sample-data.sql` file to populate the database with sample categories and products

The sample data includes:
- 5 product categories (CBD Oils, Topicals, Edibles, Capsules, Pet CBD)
- 7 products with detailed descriptions and specifications
- Sample images from Unsplash

To add the admin user:
1. Sign up a new user with email "admin@sensebycbd.com" through your application
2. The trigger will automatically create a user profile
3. The sample data SQL will update this user to have admin privileges

Note: The sample reviews are commented out because they require actual user IDs. You can uncomment and modify them once you have created some test users.
