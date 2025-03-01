-- Sample data for blog tables
-- Copy and paste this into the Supabase SQL editor after applying the blog tables

-- Insert blog categories
INSERT INTO public.blog_categories (id, name, slug, description, created_at)
VALUES
  (gen_random_uuid(), 'CBD News', 'cbd-news', 'Latest news and updates about CBD products and research', now()),
  (gen_random_uuid(), 'Health & Wellness', 'health-wellness', 'Articles about CBD for health and wellness', now()),
  (gen_random_uuid(), 'Product Guides', 'product-guides', 'Guides and information about CBD products', now()),
  (gen_random_uuid(), 'Research', 'research', 'Scientific research and studies about CBD', now());

-- Get category IDs for reference in blog posts
DO $$
DECLARE
  news_cat_id UUID;
  health_cat_id UUID;
  guides_cat_id UUID;
  research_cat_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO news_cat_id FROM public.blog_categories WHERE slug = 'cbd-news' LIMIT 1;
  SELECT id INTO health_cat_id FROM public.blog_categories WHERE slug = 'health-wellness' LIMIT 1;
  SELECT id INTO guides_cat_id FROM public.blog_categories WHERE slug = 'product-guides' LIMIT 1;
  SELECT id INTO research_cat_id FROM public.blog_categories WHERE slug = 'research' LIMIT 1;
  
  -- Get admin user ID (assuming there's at least one admin user)
  SELECT id INTO admin_user_id FROM public.users WHERE is_admin = true LIMIT 1;
  
  -- Insert blog posts
  INSERT INTO public.blog_posts (
    id, title, slug, content, excerpt, featured_image, 
    author_id, category_id, published, published_at, created_at, updated_at
  )
  VALUES
    (
      gen_random_uuid(),
      'New CBD Regulations: What They Mean for Consumers',
      'new-cbd-regulations-consumers',
      '<p>The CBD industry has seen significant regulatory changes in recent months. This article breaks down what these changes mean for consumers and how they might affect product availability and quality.</p><h2>Key Regulatory Changes</h2><p>The FDA has recently announced new guidelines for CBD products, focusing on:</p><ul><li>Product labeling requirements</li><li>THC content limitations</li><li>Manufacturing standards</li><li>Testing and quality control</li></ul><p>These changes aim to create a safer market for consumers while providing clearer guidelines for manufacturers.</p><h2>Impact on Consumers</h2><p>For consumers, these regulations mean greater transparency and safety. Products will now be required to undergo more rigorous testing, and labels must accurately reflect the contents. This is a positive step toward eliminating misleading claims and ensuring product quality.</p><p>However, these changes may also lead to price increases as manufacturers adapt to new requirements. Some smaller brands may struggle to meet the new standards, potentially reducing the variety of products available in the short term.</p><h2>What to Look For</h2><p>As a consumer, you should now look for products that:</p><ul><li>Display clear lab testing results</li><li>Provide detailed ingredient lists</li><li>Show compliance with new regulatory standards</li><li>Offer transparent information about sourcing and manufacturing</li></ul><p>By staying informed about these changes, you can make better decisions about the CBD products you purchase and use.</p>',
      'The CBD industry has seen significant regulatory changes in recent months. This article breaks down what these changes mean for consumers and how they might affect product availability and quality.',
      '/images/blog/cbd-regulations.jpg',
      admin_user_id,
      news_cat_id,
      true,
      '2025-03-01T12:00:00Z',
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'Latest Research on CBD and Anxiety',
      'latest-research-cbd-anxiety',
      '<p>Recent scientific studies have shown promising results regarding CBD''s potential effects on anxiety disorders. This article summarizes the latest research findings and what they might mean for those suffering from anxiety.</p><h2>Recent Studies</h2><p>Several peer-reviewed studies published in the last year have examined CBD''s effects on various anxiety disorders:</p><ul><li>A randomized controlled trial found that CBD significantly reduced symptoms in patients with generalized anxiety disorder compared to placebo</li><li>Another study observed reduced physiological markers of stress in participants who took CBD before public speaking tasks</li><li>Neuroimaging research has shown that CBD may affect activity in brain regions associated with anxiety responses</li></ul><p>While research is still ongoing, these findings suggest that CBD may have legitimate therapeutic potential for anxiety management.</p><h2>How CBD May Work for Anxiety</h2><p>Scientists believe CBD may help with anxiety through several mechanisms:</p><ul><li>Interaction with serotonin receptors in the brain</li><li>Modulation of the endocannabinoid system</li><li>Reduction of neuroinflammation</li><li>Promotion of neurogenesis in areas like the hippocampus</li></ul><p>These mechanisms may work together to create an anxiolytic (anxiety-reducing) effect without the side effects associated with traditional anti-anxiety medications.</p><h2>Considerations for Use</h2><p>If you''re considering CBD for anxiety, keep in mind:</p><ul><li>Dosage appears to be important, with different amounts needed for different individuals</li><li>CBD may interact with certain medications</li><li>Quality and source of CBD products vary significantly</li><li>Consulting with a healthcare provider is recommended, especially if you take other medications</li></ul><p>As research continues to evolve, our understanding of how best to use CBD for anxiety will likely improve.</p>',
      'Recent scientific studies have shown promising results regarding CBD''s potential effects on anxiety disorders. This article summarizes the latest research findings and what they might mean for those suffering from anxiety.',
      '/images/blog/cbd-anxiety-research.jpg',
      admin_user_id,
      research_cat_id,
      true,
      '2025-02-25T15:30:00Z',
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'CBD Beginner''s Guide: How to Choose Your First Product',
      'cbd-beginners-guide-first-product',
      '<p>If you''re new to CBD, the variety of products and information can be overwhelming. This beginner''s guide will help you understand the basics and choose your first CBD product with confidence.</p><h2>Understanding CBD Basics</h2><p>Before choosing a product, it''s helpful to understand some fundamentals:</p><ul><li><strong>What is CBD?</strong> Cannabidiol (CBD) is a compound derived from the cannabis plant that doesn''t cause intoxication</li><li><strong>Full-spectrum vs. Broad-spectrum vs. Isolate:</strong> Full-spectrum contains all cannabis compounds including trace THC; broad-spectrum contains multiple compounds but no THC; isolate is pure CBD</li><li><strong>Entourage Effect:</strong> The theory that cannabis compounds work better together than in isolation</li></ul><p>This foundation will help you make more informed decisions about products.</p><h2>Common CBD Product Types</h2><p>CBD comes in several forms, each with advantages:</p><ul><li><strong>Oils and Tinctures:</strong> Versatile, taken under the tongue for faster absorption</li><li><strong>Capsules:</strong> Convenient, pre-measured doses</li><li><strong>Edibles:</strong> Tasty and discreet</li><li><strong>Topicals:</strong> Applied directly to skin for localized effects</li><li><strong>Vapes:</strong> Fast-acting but with respiratory considerations</li></ul><p>For beginners, oils or capsules often provide the best introduction due to their ease of use and dosage control.</p><h2>How to Choose Quality Products</h2><p>Look for these indicators of quality:</p><ul><li>Third-party lab testing with accessible results</li><li>Clear indication of CBD content per serving</li><li>Organic hemp sourcing</li><li>Good manufacturing practices</li><li>Positive customer reviews and company reputation</li><li>Reasonable claims (avoid products promising miracle cures)</li></ul><p>Starting with a lower dose and gradually increasing is generally recommended for new users.</p><h2>Getting Started</h2><p>For your first CBD experience:</p><ul><li>Start with a low dose (10-25mg)</li><li>Take it at a relaxed time when you don''t need to drive</li><li>Be patient—some effects may be subtle</li><li>Keep a journal of effects to track your experience</li><li>Consult with healthcare providers if you take medications</li></ul><p>Remember that finding your ideal CBD product and dosage may take some experimentation.</p>',
      'If you''re new to CBD, the variety of products and information can be overwhelming. This beginner''s guide will help you understand the basics and choose your first CBD product with confidence.',
      '/images/blog/cbd-guide.jpg',
      admin_user_id,
      guides_cat_id,
      true,
      '2025-02-20T09:15:00Z',
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'CBD for Sleep: A Comprehensive Guide',
      'cbd-for-sleep-comprehensive-guide',
      '<p>Many people are turning to CBD as a natural sleep aid. This article explores the science behind CBD for sleep and offers practical advice for those considering it for sleep issues.</p><h2>The Science of CBD and Sleep</h2><p>Research on CBD and sleep suggests several potential mechanisms:</p><ul><li>CBD may interact with receptors involved in the sleep-wake cycle</li><li>By reducing anxiety, CBD might help people fall asleep faster</li><li>CBD could address pain that interferes with sleep</li><li>Some studies suggest CBD may affect REM sleep and reduce daytime sleepiness</li></ul><p>While more research is needed, preliminary studies show promising results for certain sleep disorders.</p><h2>Choosing CBD Products for Sleep</h2><p>Not all CBD products are created equal when it comes to sleep benefits:</p><ul><li><strong>Full-spectrum products</strong> containing minor cannabinoids and terpenes like myrcene and linalool may have enhanced sleep benefits</li><li><strong>CBD combined with CBN</strong> is increasingly popular specifically for sleep</li><li><strong>Products with added ingredients</strong> like melatonin, valerian root, or chamomile may provide synergistic effects</li></ul><p>The delivery method also matters—oils or capsules taken 30-60 minutes before bedtime typically work best for sleep.</p><h2>Effective Dosing for Sleep</h2><p>Finding the right dose is crucial:</p><ul><li>Start with 25-30mg of CBD for sleep issues</li><li>Gradually increase by 5mg every few nights if needed</li><li>Keep a sleep journal to track effects</li><li>Be consistent—CBD may work better with regular use</li><li>Timing matters: take it 30-60 minutes before bedtime</li></ul><p>Some people find they need higher doses for sleep than for other applications.</p><h2>Creating a Sleep-Friendly Routine</h2><p>CBD works best as part of a comprehensive sleep hygiene practice:</p><ul><li>Combine CBD with a consistent sleep schedule</li><li>Create a relaxing bedtime routine</li><li>Limit screen time before bed</li><li>Keep your bedroom cool, dark, and quiet</li><li>Avoid caffeine and alcohol near bedtime</li></ul><p>These practices enhance CBD''s potential sleep benefits and promote better rest overall.</p><h2>When to Consult a Professional</h2><p>While CBD may help with occasional sleep issues, consult a healthcare provider if:</p><ul><li>You have chronic insomnia</li><li>You experience sleep apnea symptoms</li><li>Sleep problems significantly impact your daily life</li><li>You take medications that might interact with CBD</li></ul><p>CBD is not a replacement for addressing underlying sleep disorders that require medical attention.</p>',
      'Many people are turning to CBD as a natural sleep aid. This article explores the science behind CBD for sleep and offers practical advice for those considering it for sleep issues.',
      '/images/blog/cbd-sleep.jpg',
      admin_user_id,
      health_cat_id,
      true,
      '2025-02-15T14:45:00Z',
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'The Benefits of CBD Oil for Pain Management',
      'benefits-cbd-oil-pain-management',
      '<p>CBD oil has gained popularity as a natural approach to pain management. This article examines the evidence behind these claims and how CBD might help those suffering from various types of pain.</p><h2>Understanding How CBD Affects Pain</h2><p>CBD may influence pain through several mechanisms:</p><ul><li>Interaction with endocannabinoid receptors involved in pain signaling</li><li>Reduction of inflammatory responses in the body</li><li>Modulation of pain perception pathways in the central nervous system</li><li>Muscle relaxant properties that may help with pain associated with tension</li></ul><p>These multiple mechanisms may explain why CBD shows promise for different pain conditions.</p><h2>Types of Pain CBD May Help With</h2><p>Research and anecdotal evidence suggest CBD may benefit:</p><ul><li><strong>Inflammatory pain</strong> from conditions like arthritis</li><li><strong>Neuropathic pain</strong> resulting from nerve damage</li><li><strong>Muscle pain</strong> and soreness</li><li><strong>Migraine pain</strong> in some individuals</li><li><strong>General chronic pain</strong> conditions</li></ul><p>The effectiveness varies by individual and the specific pain condition.</p><h2>Choosing CBD Products for Pain</h2><p>For pain management, consider:</p><ul><li><strong>Topical products</strong> for localized pain (arthritis, muscle soreness)</li><li><strong>Oils or tinctures</strong> for faster systemic relief</li><li><strong>Capsules</strong> for consistent, long-lasting effects</li><li><strong>Full-spectrum products</strong> that may offer enhanced pain relief through the entourage effect</li></ul><p>Higher concentrations are typically needed for pain than for general wellness.</p><h2>Effective Usage for Pain Relief</h2><p>To maximize potential benefits:</p><ul><li>Start with 25mg twice daily for chronic pain</li><li>For acute pain, sublingual oils may provide faster relief</li><li>Combine topical and internal CBD for multi-level relief</li><li>Consistency is key—regular use may provide better results than occasional application</li><li>Document your response to different dosages and products</li></ul><p>Finding your optimal approach may require some experimentation.</p><h2>Integrating CBD into a Pain Management Plan</h2><p>CBD works best as part of a comprehensive approach:</p><ul><li>Combine with appropriate physical therapy or exercise</li><li>Use alongside proper nutrition and anti-inflammatory foods</li><li>Integrate stress management techniques</li><li>Discuss with healthcare providers, especially if taking pain medications</li><li>Consider as a complement to, not replacement for, conventional treatments for serious conditions</li></ul><p>This integrated approach may provide more significant pain relief than CBD alone.</p>',
      'CBD oil has gained popularity as a natural approach to pain management. This article examines the evidence behind these claims and how CBD might help those suffering from various types of pain.',
      '/images/blog/cbd-oil-pain.jpg',
      admin_user_id,
      health_cat_id,
      true,
      '2025-02-10T11:20:00Z',
      now(),
      now()
    );

  -- Create blog tags
  INSERT INTO public.blog_tags (id, name, slug, created_at)
  VALUES
    (gen_random_uuid(), 'CBD Oil', 'cbd-oil', now()),
    (gen_random_uuid(), 'Wellness', 'wellness', now()),
    (gen_random_uuid(), 'Research', 'research', now()),
    (gen_random_uuid(), 'Regulations', 'regulations', now()),
    (gen_random_uuid(), 'Beginners', 'beginners', now()),
    (gen_random_uuid(), 'Sleep', 'sleep', now()),
    (gen_random_uuid(), 'Anxiety', 'anxiety', now()),
    (gen_random_uuid(), 'Pain Relief', 'pain-relief', now());
    
  -- Link tags to posts (would need to be expanded with actual IDs)
  -- This is just a placeholder to show the structure
  -- In a real implementation, you would need to get the actual post and tag IDs
END $$;
