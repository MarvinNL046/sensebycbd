import { BlogPost, BlogCategory, BlogTag, BlogComment } from '../types/blog';

// Mock blog categories
export const mockBlogCategories: BlogCategory[] = [
  {
    id: '1',
    name: 'CBD News',
    slug: 'cbd-news',
    description: 'Latest news and updates about CBD products and research',
    created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Articles about health benefits and wellness applications of CBD',
    created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Product Guides',
    slug: 'product-guides',
    description: 'Guides and information about different CBD products',
    created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '4',
    name: 'Research',
    slug: 'research',
    description: 'Scientific research and studies about CBD',
    created_at: '2025-01-15T10:00:00Z'
  }
];

// Mock blog tags
export const mockBlogTags: BlogTag[] = [
  { id: '1', name: 'CBD Oil', slug: 'cbd-oil', created_at: '2025-01-15T10:00:00Z' },
  { id: '2', name: 'Pain Relief', slug: 'pain-relief', created_at: '2025-01-15T10:00:00Z' },
  { id: '3', name: 'Sleep', slug: 'sleep', created_at: '2025-01-15T10:00:00Z' },
  { id: '4', name: 'Anxiety', slug: 'anxiety', created_at: '2025-01-15T10:00:00Z' },
  { id: '5', name: 'Wellness', slug: 'wellness', created_at: '2025-01-15T10:00:00Z' },
  { id: '6', name: 'Research', slug: 'research', created_at: '2025-01-15T10:00:00Z' },
  { id: '7', name: 'Beginner Guide', slug: 'beginner-guide', created_at: '2025-01-15T10:00:00Z' }
];

// Mock blog posts
export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Benefits of CBD Oil for Pain Management',
    slug: 'benefits-cbd-oil-pain-management',
    content: `
      <h2>Understanding CBD and Pain</h2>
      <p>Chronic pain affects millions of people worldwide and is one of the most common reasons people turn to CBD. But how exactly does CBD help with pain management?</p>
      
      <p>CBD, or cannabidiol, is one of over 100 compounds found in the cannabis plant. Unlike THC, CBD doesn't produce a "high" feeling but still interacts with your body's endocannabinoid system, which plays a role in regulating pain.</p>
      
      <h2>How CBD Works for Pain Relief</h2>
      <p>Research suggests that CBD may help reduce pain by:</p>
      <ul>
        <li>Reducing inflammation throughout the body</li>
        <li>Interacting with neurotransmitters that signal pain</li>
        <li>Affecting endocannabinoid receptor activity</li>
      </ul>
      
      <p>A 2020 review of studies found that CBD can help alleviate chronic pain, improve sleep, and reduce inflammation in some conditions.</p>
      
      <h2>Types of Pain CBD May Help With</h2>
      <p>While research is still ongoing, CBD has shown promise for several types of pain:</p>
      <ul>
        <li><strong>Arthritis pain:</strong> Animal studies suggest CBD can help reduce inflammation and pain-related behaviors.</li>
        <li><strong>Neuropathic pain:</strong> This type of pain stems from nerve damage and can be particularly difficult to treat with conventional methods.</li>
        <li><strong>Multiple sclerosis:</strong> CBD may help reduce muscle spasticity and pain associated with MS.</li>
        <li><strong>General chronic pain:</strong> Many users report relief from ongoing pain conditions.</li>
      </ul>
      
      <h2>Finding the Right CBD Product for Pain</h2>
      <p>When looking for CBD products to manage pain, consider:</p>
      <ul>
        <li><strong>Full-spectrum vs. isolate:</strong> Full-spectrum products contain multiple cannabinoids that work together (the "entourage effect").</li>
        <li><strong>Delivery method:</strong> Oils, topicals, and capsules each have different onset times and durations.</li>
        <li><strong>Potency:</strong> Higher concentrations may be more effective for severe pain.</li>
        <li><strong>Quality:</strong> Always choose lab-tested products from reputable manufacturers.</li>
      </ul>
      
      <p>As with any supplement, it's important to consult with a healthcare provider before starting CBD, especially if you're taking other medications.</p>
    `,
    excerpt: 'Discover how CBD oil can help manage chronic pain conditions through its anti-inflammatory properties and interaction with the endocannabinoid system.',
    featured_image: '/images/blog/cbd-oil-pain.jpg',
    author_id: '1',
    category_id: '2',
    published: true,
    published_at: '2025-02-10T14:30:00Z',
    created_at: '2025-02-10T10:00:00Z',
    updated_at: '2025-02-10T10:00:00Z',
    author: {
      id: '1',
      full_name: 'Dr. Emma Johnson'
    },
    category: {
      id: '2',
      name: 'Health & Wellness',
      slug: 'health-wellness',
      created_at: '2025-01-15T10:00:00Z'
    },
    tags: [
      { tag: { id: '1', name: 'CBD Oil', slug: 'cbd-oil', created_at: '2025-01-15T10:00:00Z' } },
      { tag: { id: '2', name: 'Pain Relief', slug: 'pain-relief', created_at: '2025-01-15T10:00:00Z' } }
    ]
  },
  {
    id: '2',
    title: 'CBD for Sleep: A Natural Solution for Insomnia',
    slug: 'cbd-sleep-natural-solution-insomnia',
    content: `
      <h2>The Sleep Crisis</h2>
      <p>In our fast-paced world, quality sleep has become increasingly elusive. According to the CDC, about one-third of adults don't get enough sleep on a regular basis. This sleep deficit can lead to serious health problems, reduced productivity, and diminished quality of life.</p>
      
      <p>While there are many pharmaceutical options for sleep disorders, more people are turning to natural alternatives like CBD for help.</p>
      
      <h2>How CBD May Improve Sleep</h2>
      <p>CBD may help improve sleep in several ways:</p>
      <ul>
        <li><strong>Addressing anxiety:</strong> By reducing anxiety, CBD may help quiet the mind before bedtime.</li>
        <li><strong>Pain reduction:</strong> For those whose sleep is disrupted by pain, CBD's analgesic properties may provide relief.</li>
        <li><strong>Regulating sleep cycles:</strong> Some research suggests CBD may help regulate sleep-wake cycles.</li>
        <li><strong>Reducing REM behavior disorder:</strong> CBD may decrease symptoms of REM behavior disorder, which includes acting out dreams during sleep.</li>
      </ul>
      
      <h2>Research on CBD and Sleep</h2>
      <p>A 2019 study published in The Permanente Journal found that 66.7% of patients with sleep concerns reported better sleep after taking CBD. Another study from 2017 suggested that CBD may have therapeutic potential for the treatment of insomnia.</p>
      
      <p>While these results are promising, more large-scale clinical trials are needed to fully understand CBD's effects on sleep.</p>
      
      <h2>Using CBD for Better Sleep</h2>
      <p>If you're considering CBD for sleep, here are some tips:</p>
      <ul>
        <li><strong>Timing:</strong> Take CBD about 30 minutes to an hour before bedtime.</li>
        <li><strong>Dosage:</strong> Start with a low dose and gradually increase until you find what works for you.</li>
        <li><strong>Consistency:</strong> Use CBD regularly for best results, as effects may build over time.</li>
        <li><strong>Product type:</strong> Consider oils or capsules for sleep, as they provide longer-lasting effects than vaping.</li>
      </ul>
      
      <p>Remember that CBD is just one component of good sleep hygiene. Maintaining a regular sleep schedule, creating a comfortable sleep environment, and limiting screen time before bed are all important practices for better sleep.</p>
    `,
    excerpt: 'Explore how CBD can help improve sleep quality and combat insomnia by addressing underlying issues like anxiety and pain that often disrupt sleep patterns.',
    featured_image: '/images/blog/cbd-sleep.jpg',
    author_id: '2',
    category_id: '2',
    published: true,
    published_at: '2025-02-15T09:45:00Z',
    created_at: '2025-02-15T08:00:00Z',
    updated_at: '2025-02-15T08:00:00Z',
    author: {
      id: '2',
      full_name: 'Sarah Williams'
    },
    category: {
      id: '2',
      name: 'Health & Wellness',
      slug: 'health-wellness',
      created_at: '2025-01-15T10:00:00Z'
    },
    tags: [
      { tag: { id: '3', name: 'Sleep', slug: 'sleep', created_at: '2025-01-15T10:00:00Z' } },
      { tag: { id: '5', name: 'Wellness', slug: 'wellness', created_at: '2025-01-15T10:00:00Z' } }
    ]
  },
  {
    id: '3',
    title: 'CBD Beginner\'s Guide: What You Need to Know',
    slug: 'cbd-beginners-guide',
    content: `
      <h2>What is CBD?</h2>
      <p>CBD, short for cannabidiol, is one of the many compounds found in the cannabis plant. Unlike its cousin THC (tetrahydrocannabinol), CBD doesn't cause a "high" or psychoactive effect. This makes it an appealing option for people looking for relief from various symptoms without the mind-altering effects of marijuana or certain pharmaceutical drugs.</p>
      
      <h2>How Does CBD Work?</h2>
      <p>CBD interacts with your body's endocannabinoid system (ECS), a complex cell-signaling system that plays a role in regulating a range of functions and processes, including:</p>
      <ul>
        <li>Sleep</li>
        <li>Mood</li>
        <li>Appetite</li>
        <li>Memory</li>
        <li>Reproduction and fertility</li>
        <li>Inflammation and pain response</li>
      </ul>
      
      <p>The ECS has three components: endocannabinoids, receptors, and enzymes. CBD doesn't directly bind to receptors but influences them in other ways, potentially helping your natural endocannabinoids work more effectively.</p>
      
      <h2>Types of CBD Products</h2>
      <p>There are several ways to take CBD:</p>
      <ul>
        <li><strong>Oils and tinctures:</strong> Placed under the tongue for quick absorption</li>
        <li><strong>Capsules and pills:</strong> Convenient for consistent dosing</li>
        <li><strong>Edibles:</strong> Gummies, chocolates, and other food products</li>
        <li><strong>Topicals:</strong> Creams, balms, and lotions applied directly to the skin</li>
        <li><strong>Vaping:</strong> Inhaled for rapid effects (though health concerns exist about vaping)</li>
      </ul>
      
      <h2>Full-Spectrum, Broad-Spectrum, and Isolate</h2>
      <p>When shopping for CBD, you'll encounter these terms:</p>
      <ul>
        <li><strong>Full-spectrum:</strong> Contains all cannabinoids naturally found in the cannabis plant, including THC (less than 0.3%)</li>
        <li><strong>Broad-spectrum:</strong> Contains multiple cannabinoids but no THC</li>
        <li><strong>Isolate:</strong> Pure CBD with no other cannabinoids</li>
      </ul>
      
      <p>Many experts believe full-spectrum products provide enhanced benefits due to the "entourage effect," where multiple cannabis compounds work together synergistically.</p>
      
      <h2>Starting with CBD: Tips for Beginners</h2>
      <ul>
        <li><strong>Start low and go slow:</strong> Begin with a low dose and gradually increase</li>
        <li><strong>Be patient:</strong> CBD effects can be subtle and may take time to notice</li>
        <li><strong>Keep a journal:</strong> Track your dosage and effects to find what works best</li>
        <li><strong>Choose quality products:</strong> Look for third-party lab testing and transparent companies</li>
        <li><strong>Consult healthcare providers:</strong> Especially if you take other medications, as CBD can interact with certain drugs</li>
      </ul>
      
      <p>Remember that everyone's body responds differently to CBD, so what works for others may not work the same way for you. Finding your optimal CBD routine is often a process of experimentation and adjustment.</p>
    `,
    excerpt: 'New to CBD? This comprehensive guide covers everything beginners need to know about CBD, from how it works to different product types and dosing recommendations.',
    featured_image: '/images/blog/cbd-guide.jpg',
    author_id: '3',
    category_id: '3',
    published: true,
    published_at: '2025-02-20T11:15:00Z',
    created_at: '2025-02-20T09:00:00Z',
    updated_at: '2025-02-20T09:00:00Z',
    author: {
      id: '3',
      full_name: 'Michael Chen'
    },
    category: {
      id: '3',
      name: 'Product Guides',
      slug: 'product-guides',
      created_at: '2025-01-15T10:00:00Z'
    },
    tags: [
      { tag: { id: '7', name: 'Beginner Guide', slug: 'beginner-guide', created_at: '2025-01-15T10:00:00Z' } },
      { tag: { id: '5', name: 'Wellness', slug: 'wellness', created_at: '2025-01-15T10:00:00Z' } }
    ]
  },
  {
    id: '4',
    title: 'Latest Research: CBD and Anxiety Disorders',
    slug: 'latest-research-cbd-anxiety-disorders',
    content: `
      <h2>The Science Behind CBD and Anxiety</h2>
      <p>Anxiety disorders are among the most common mental health conditions worldwide, affecting approximately 284 million people. As traditional treatments don't work for everyone, researchers have been exploring alternative approaches, including CBD.</p>
      
      <p>Recent scientific studies have shown promising results regarding CBD's potential to help manage various forms of anxiety. But what does the research actually tell us?</p>
      
      <h2>Recent Clinical Studies</h2>
      <p>A 2024 double-blind, placebo-controlled study published in the Journal of Psychiatric Research found that participants who received 300mg of CBD experienced significantly reduced anxiety during a simulated public speaking test compared to those who received a placebo.</p>
      
      <p>Another 2023 study in the Journal of Clinical Psychology followed 72 adults with generalized anxiety disorder over 8 weeks. Those taking CBD showed marked improvement in anxiety symptoms and reported better sleep quality compared to the control group.</p>
      
      <h2>How CBD May Help with Anxiety</h2>
      <p>Research suggests CBD may help anxiety through several mechanisms:</p>
      <ul>
        <li><strong>Serotonin receptors:</strong> CBD appears to interact with 5-HT1A receptors, which are involved in serotonin signaling and anxiety regulation.</li>
        <li><strong>GABA enhancement:</strong> CBD may boost the effects of GABA, an inhibitory neurotransmitter that reduces neuronal excitability.</li>
        <li><strong>Neurogenesis:</strong> Some studies suggest CBD promotes the growth of new neurons in the hippocampus, an area often smaller in people with anxiety disorders.</li>
        <li><strong>Stress hormone reduction:</strong> CBD may help lower cortisol levels, potentially reducing stress responses.</li>
      </ul>
      
      <h2>Types of Anxiety That May Respond to CBD</h2>
      <p>Research has explored CBD's effects on various anxiety disorders:</p>
      <ul>
        <li><strong>Generalized Anxiety Disorder (GAD)</strong></li>
        <li><strong>Social Anxiety Disorder</strong></li>
        <li><strong>Post-Traumatic Stress Disorder (PTSD)</strong></li>
        <li><strong>Panic Disorder</strong></li>
        <li><strong>Obsessive-Compulsive Disorder (OCD)</strong></li>
      </ul>
      
      <p>The strongest evidence currently exists for CBD's effects on social anxiety and PTSD, though research into all forms continues to expand.</p>
      
      <h2>Limitations and Future Research</h2>
      <p>Despite promising results, several limitations exist in current research:</p>
      <ul>
        <li>Many studies have small sample sizes</li>
        <li>Long-term effects remain largely unknown</li>
        <li>Optimal dosing protocols haven't been established</li>
        <li>Individual responses vary significantly</li>
      </ul>
      
      <p>Larger, long-term clinical trials are currently underway, which should provide more definitive answers about CBD's efficacy for anxiety disorders.</p>
      
      <p>While research continues, it's important to remember that CBD should not replace conventional treatments without medical supervision. Always consult healthcare providers before using CBD for anxiety, especially if you're taking other medications.</p>
    `,
    excerpt: 'Examine the latest scientific research on CBD\'s potential to help manage anxiety disorders, including clinical studies and proposed mechanisms of action.',
    featured_image: '/images/blog/cbd-anxiety-research.jpg',
    author_id: '1',
    category_id: '4',
    published: true,
    published_at: '2025-02-25T13:20:00Z',
    created_at: '2025-02-25T11:00:00Z',
    updated_at: '2025-02-25T11:00:00Z',
    author: {
      id: '1',
      full_name: 'Dr. Emma Johnson'
    },
    category: {
      id: '4',
      name: 'Research',
      slug: 'research',
      created_at: '2025-01-15T10:00:00Z'
    },
    tags: [
      { tag: { id: '4', name: 'Anxiety', slug: 'anxiety', created_at: '2025-01-15T10:00:00Z' } },
      { tag: { id: '6', name: 'Research', slug: 'research', created_at: '2025-01-15T10:00:00Z' } }
    ]
  },
  {
    id: '5',
    title: 'New CBD Regulations: What They Mean for Consumers',
    slug: 'new-cbd-regulations-consumers',
    content: `
      <h2>The Changing Landscape of CBD Regulation</h2>
      <p>The regulatory environment for CBD has been evolving rapidly in recent years. As CBD's popularity continues to grow, governments around the world are working to establish clearer guidelines for its production, sale, and use.</p>
      
      <p>These new regulations aim to protect consumers while allowing reasonable access to CBD products. But what exactly is changing, and how will it affect you?</p>
      
      <h2>Recent Regulatory Developments</h2>
      <p>Several significant regulatory changes have occurred or are in progress:</p>
      <ul>
        <li><strong>FDA Oversight:</strong> The FDA has increased its scrutiny of CBD products, particularly those making health claims.</li>
        <li><strong>Testing Requirements:</strong> Many jurisdictions now require comprehensive third-party testing for contaminants and accurate CBD content.</li>
        <li><strong>Labeling Standards:</strong> New rules specify what information must appear on CBD product labels.</li>
        <li><strong>THC Limits:</strong> Regulations continue to enforce strict limits on THC content in CBD products (typically 0.3% or less).</li>
        <li><strong>Age Restrictions:</strong> Many regions now explicitly prohibit CBD sales to minors.</li>
      </ul>
      
      <h2>What These Changes Mean for Consumers</h2>
      <p>These regulatory developments have several implications for CBD users:</p>
      <ul>
        <li><strong>Improved Safety:</strong> Stricter testing requirements mean products are less likely to contain harmful contaminants.</li>
        <li><strong>Greater Transparency:</strong> Enhanced labeling requirements help consumers make more informed choices.</li>
        <li><strong>More Consistent Products:</strong> Standardization leads to more reliable CBD concentrations and effects.</li>
        <li><strong>Potential Price Increases:</strong> Compliance with new regulations may increase production costs, which could be passed to consumers.</li>
        <li><strong>Fewer Exaggerated Claims:</strong> Crackdowns on unsubstantiated health claims should reduce misleading marketing.</li>
      </ul>
      
      <h2>How to Navigate the New Regulatory Environment</h2>
      <p>As a consumer, here's how to adapt to these changes:</p>
      <ul>
        <li><strong>Look for Compliance:</strong> Choose products from companies that openly embrace regulatory compliance.</li>
        <li><strong>Check for COAs:</strong> Certificates of Analysis from third-party labs are more important than ever.</li>
        <li><strong>Be Wary of Health Claims:</strong> Extreme health claims are still a red flag, as approved medical applications for CBD remain limited.</li>
        <li><strong>Stay Informed:</strong> Regulations continue to evolve, so keep up with changes in your region.</li>
        <li><strong>Support Responsible Companies:</strong> Purchase from businesses that advocate for sensible regulation and consumer safety.</li>
      </ul>
      
      <h2>The Future of CBD Regulation</h2>
      <p>Looking ahead, we can expect:</p>
      <ul>
        <li>More specific regulations for different CBD product categories</li>
        <li>Increased international standardization</li>
        <li>Clearer pathways for CBD in food and beverages</li>
        <li>More research-backed applications in healthcare settings</li>
      </ul>
      
      <p>While navigating changing regulations may seem challenging, these developments ultimately benefit consumers by creating a safer, more transparent CBD marketplace. The short-term adjustments should lead to long-term improvements in product quality and consumer confidence.</p>
    `,
    excerpt: 'Stay informed about the latest regulatory changes affecting CBD products and what these new rules mean for consumers in terms of safety, quality, and availability.',
    featured_image: '/images/blog/cbd-regulations.jpg',
    author_id: '3',
    category_id: '1',
    published: true,
    published_at: '2025-03-01T10:00:00Z',
    created_at: '2025-03-01T08:30:00Z',
    updated_at: '2025-03-01T08:30:00Z',
    author: {
      id: '3',
      full_name: 'Michael Chen'
    },
    category: {
      id: '1',
      name: 'CBD News',
      slug: 'cbd-news',
      created_at: '2025-01-15T10:00:00Z'
    },
    tags: [
      { tag: { id: '6', name: 'Research', slug: 'research', created_at: '2025-01-15T10:00:00Z' } }
    ]
  }
];

// Mock blog comments
export const mockBlogComments: BlogComment[] = [
  {
    id: '1',
    post_id: '1',
    user_id: '4',
    content: 'This article was really helpful! I\'ve been considering CBD for my chronic back pain and this gave me a lot of good information to consider.',
    approved: true,
    created_at: '2025-02-12T15:30:00Z',
    user: {
      id: '4',
      full_name: 'John Doe'
    }
  },
  {
    id: '2',
    post_id: '1',
    name: 'Lisa M.',
    email: 'lisa@example.com',
    content: 'I started using CBD oil for my arthritis pain last year and it\'s made a huge difference. Nice to see some science backing up my experience!',
    approved: true,
    created_at: '2025-02-13T09:45:00Z'
  },
  {
    id: '3',
    post_id: '2',
    user_id: '5',
    content: 'I\'ve struggled with insomnia for years and tried everything. CBD has been the only thing that helps me fall asleep without feeling groggy the next day.',
    approved: true,
    created_at: '2025-02-16T20:15:00Z',
    user: {
      id: '5',
      full_name: 'Maria Garcia'
    }
  },
  {
    id: '4',
    post_id: '3',
    name: 'New User',
    email: 'newuser@example.com',
    content: 'As someone completely new to CBD, this guide was exactly what I needed. Clear, comprehensive, and not overwhelming. Thank you!',
    approved: true,
    created_at: '2025-02-21T14:20:00Z'
  },
  {
    id: '5',
    post_id: '4',
    user_id: '6',
    content: 'As someone who has dealt with anxiety for most of my life, I\'m excited to see more rigorous research being done on CBD. The results so far are promising!',
    approved: true,
    created_at: '2025-02-26T11:10:00Z',
    user: {
      id: '6',
      full_name: 'Robert Johnson'
    }
  }
];
