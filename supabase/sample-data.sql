-- Sample data for SenseBy CBD webshop

-- First, let's create an admin user
-- Note: You need to create this user through Supabase Auth first, then update the is_admin flag
UPDATE public.users
SET is_admin = true
WHERE email = 'admin@sensebycbd.com';

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, image_url)
VALUES
  ('CBD Oils', 'cbd-oils', 'Premium CBD oils for daily use', 'https://picsum.photos/id/1/800/600'),
  ('Topicals', 'topicals', 'Creams and balms for targeted relief', 'https://picsum.photos/id/2/800/600'),
  ('Edibles', 'edibles', 'Delicious CBD-infused edibles', 'https://picsum.photos/id/3/800/600'),
  ('Capsules', 'capsules', 'Easy-to-take CBD capsules', 'https://picsum.photos/id/4/800/600'),
  ('Pet CBD', 'pet-cbd', 'CBD products for your furry friends', 'https://picsum.photos/id/5/800/600');

-- Insert sample products
INSERT INTO public.products (category_id, name, slug, description, price, sale_price, stock, image_url, specifications, is_featured)
VALUES
  -- CBD Oils
  (
    (SELECT id FROM public.categories WHERE slug = 'cbd-oils'),
    'Full Spectrum CBD Oil 1000mg',
    'full-spectrum-cbd-oil-1000mg',
    'Our premium full spectrum CBD oil contains the complete range of cannabinoids for maximum effect. This 1000mg strength is perfect for experienced users.',
    89.99,
    NULL,
    50,
    'https://picsum.photos/id/10/800/600',
    '{"strength": "1000mg", "volume": "30ml", "ingredients": "Hemp extract, MCT oil", "usage": "Place 1ml under tongue and hold for 60 seconds before swallowing"}',
    true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'cbd-oils'),
    'Broad Spectrum CBD Oil 500mg',
    'broad-spectrum-cbd-oil-500mg',
    'Our broad spectrum CBD oil offers all the benefits of full spectrum without THC. Perfect for those who want the entourage effect without THC.',
    59.99,
    49.99,
    75,
    'https://picsum.photos/id/11/800/600',
    '{"strength": "500mg", "volume": "30ml", "ingredients": "Hemp extract, MCT oil", "usage": "Place 0.5ml under tongue and hold for 60 seconds before swallowing"}',
    true
  ),
  
  -- Topicals
  (
    (SELECT id FROM public.categories WHERE slug = 'topicals'),
    'CBD Relief Cream 250mg',
    'cbd-relief-cream-250mg',
    'Our CBD relief cream provides targeted relief for sore muscles and joints. Apply directly to the affected area for quick relief.',
    39.99,
    NULL,
    100,
    'https://picsum.photos/id/12/800/600',
    '{"strength": "250mg", "volume": "60ml", "ingredients": "Hemp extract, Shea butter, Aloe vera, Essential oils", "usage": "Apply a small amount to affected area and massage gently"}',
    true
  ),
  (
    (SELECT id FROM public.categories WHERE slug = 'topicals'),
    'CBD Massage Oil 500mg',
    'cbd-massage-oil-500mg',
    'Our CBD massage oil is perfect for a relaxing massage. The CBD helps to reduce inflammation while the essential oils provide a calming aroma.',
    49.99,
    NULL,
    60,
    'https://picsum.photos/id/13/800/600',
    '{"strength": "500mg", "volume": "100ml", "ingredients": "Hemp extract, Jojoba oil, Lavender essential oil", "usage": "Apply liberally to skin and massage"}',
    false
  ),
  
  -- Edibles
  (
    (SELECT id FROM public.categories WHERE slug = 'edibles'),
    'CBD Gummies 300mg',
    'cbd-gummies-300mg',
    'Our delicious CBD gummies are a tasty way to get your daily dose of CBD. Each gummy contains 10mg of CBD.',
    29.99,
    NULL,
    120,
    'https://picsum.photos/id/14/800/600',
    '{"strength": "300mg", "count": "30 gummies", "ingredients": "Hemp extract, Sugar, Corn syrup, Gelatin", "usage": "Take 1-2 gummies daily"}',
    true
  ),
  
  -- Capsules
  (
    (SELECT id FROM public.categories WHERE slug = 'capsules'),
    'CBD Capsules 750mg',
    'cbd-capsules-750mg',
    'Our CBD capsules are an easy and convenient way to take CBD. Each capsule contains 25mg of CBD.',
    54.99,
    NULL,
    90,
    'https://picsum.photos/id/15/800/600',
    '{"strength": "750mg", "count": "30 capsules", "ingredients": "Hemp extract, MCT oil, Vegetable cellulose", "usage": "Take 1 capsule daily with water"}',
    false
  ),
  
  -- Pet CBD
  (
    (SELECT id FROM public.categories WHERE slug = 'pet-cbd'),
    'Pet CBD Oil 250mg',
    'pet-cbd-oil-250mg',
    'Our pet CBD oil is specially formulated for pets. It helps with anxiety, pain, and inflammation in pets.',
    44.99,
    39.99,
    80,
    'https://picsum.photos/id/16/800/600',
    '{"strength": "250mg", "volume": "30ml", "ingredients": "Hemp extract, MCT oil", "usage": "Add to pet food or directly into mouth. See dosing chart for weight-based dosing."}',
    true
  );

-- Insert sample reviews (you'll need to replace user_id with actual user IDs)
-- This is commented out because it requires actual user IDs
/*
INSERT INTO public.reviews (product_id, user_id, rating, comment)
VALUES
  (
    (SELECT id FROM public.products WHERE slug = 'full-spectrum-cbd-oil-1000mg'),
    'user-id-here',
    5,
    'This oil has been a game changer for my chronic pain. I sleep better and feel more relaxed during the day.'
  ),
  (
    (SELECT id FROM public.products WHERE slug = 'cbd-gummies-300mg'),
    'user-id-here',
    4,
    'Tasty and effective. I take two before bed and sleep like a baby.'
  );
*/

-- You can uncomment and run the above review insertions once you have actual user IDs
