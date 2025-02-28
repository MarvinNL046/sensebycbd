# Order System Implementation

This document explains the implementation of the order system in the SenseBy CBD webshop.

## Overview

The order system allows users to place orders, which are stored in the database. The system also awards loyalty points to users based on their order total.

## Changes Made

1. **Updated Checkout Page**
   - Modified `pages/checkout.tsx` to use the `createOrder` function from `lib/db.ts` instead of just simulating order processing
   - Added proper shipping and payment information collection
   - Used the real order ID from the database instead of generating a random number

2. **Updated Account Page**
   - Enhanced `pages/account/index.tsx` to refresh data when the page is focused or when navigating back to the account page
   - This ensures that new orders and loyalty points are displayed immediately after placing an order

3. **Database Migration**
   - Created a migration script in `supabase/migrations/20250228_update_orders_table.sql` to update the orders table structure
   - The migration renames and adds columns to match what's expected by the `createOrder` function

## How to Test

1. **Run the Database Migration**
   - Log in to your Supabase dashboard
   - Go to the SQL Editor
   - Copy the contents of `supabase/migrations/20250228_update_orders_table.sql`
   - Paste it into the SQL Editor and run it

2. **Test the Order Process**
   - Add products to your cart
   - Go to the checkout page
   - Fill in your shipping and payment information
   - Place the order
   - Verify that you're redirected to the confirmation page with an order number

3. **Verify Order History and Loyalty Points**
   - Go to your account page
   - Check the Orders tab to see your new order
   - Check the Loyalty Points tab to see your updated points balance

## Troubleshooting

If you encounter any issues:

1. **Check the Browser Console**
   - Open the browser developer tools (F12)
   - Look for any error messages in the console

2. **Check the Supabase Database**
   - Log in to your Supabase dashboard
   - Go to the Table Editor
   - Check the `orders` and `order_items` tables to see if your order was created
   - Check the `users` table to see if your loyalty points were updated

3. **Common Issues**
   - If orders are not being created, make sure you've run the database migration
   - If loyalty points are not being awarded, check the `createOrder` function in `lib/db.ts`
   - If the account page is not refreshing, try manually refreshing the page
