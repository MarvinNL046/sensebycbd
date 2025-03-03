'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SiteConfig } from '../../../../lib/site-config';

export default function SiteConfigPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  // Fetch the current configuration
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/site-config');
        if (!response.ok) {
          throw new Error('Failed to fetch site configuration');
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError('Error loading configuration: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    }
    
    fetchConfig();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/site-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }
      
      setSuccess(true);
      
      // Refresh the page after a short delay to show the changes
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err) {
      setError('Error saving configuration: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };
  
  // Handle input changes
  const handleChange = (path: string, value: any) => {
    if (!config) return;
    
    // Split the path into parts (e.g., "branding.colors.primary" -> ["branding", "colors", "primary"])
    const parts = path.split('.');
    
    // Create a deep copy of the config
    const newConfig = JSON.parse(JSON.stringify(config));
    
    // Navigate to the right property and update it
    let current = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    
    setConfig(newConfig);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Site Configuration</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }
  
  if (error && !config) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Site Configuration</h1>
        <div className="bg-red-100 p-6 rounded-lg shadow text-red-700">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!config) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Site Configuration</h1>
        <div className="bg-red-100 p-6 rounded-lg shadow text-red-700">
          <p>Configuration not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Site Configuration</h1>
      
      {error && (
        <div className="bg-red-100 p-4 rounded-lg mb-6 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 p-4 rounded-lg mb-6 text-green-700">
          <p>Configuration saved successfully! The changes will be applied shortly.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input
                type="text"
                value={config.domain}
                onChange={(e) => handleChange('domain', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        </section>
        
        {/* SEO Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Default Title</label>
              <input
                type="text"
                value={config.seo.defaultTitle}
                onChange={(e) => handleChange('seo.defaultTitle', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Description</label>
              <textarea
                value={config.seo.defaultDescription}
                onChange={(e) => handleChange('seo.defaultDescription', e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Keywords</label>
              <input
                type="text"
                value={config.seo.defaultKeywords}
                onChange={(e) => handleChange('seo.defaultKeywords', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">OG Image Path</label>
              <input
                type="text"
                value={config.seo.ogImage}
                onChange={(e) => handleChange('seo.ogImage', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="/images/og-image.jpg"
              />
            </div>
          </div>
        </section>
        
        {/* Branding Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Branding</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Assets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Logo Path</label>
                <input
                  type="text"
                  value={config.branding.logo}
                  onChange={(e) => handleChange('branding.logo', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="/images/logo.svg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Favicon Path</label>
                <input
                  type="text"
                  value={config.branding.favicon}
                  onChange={(e) => handleChange('branding.favicon', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="/favicon.ico"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary Color</label>
                <div className="flex">
                  <input
                    type="color"
                    value={config.branding.colors.primary}
                    onChange={(e) => handleChange('branding.colors.primary', e.target.value)}
                    className="h-10 w-10 border rounded"
                  />
                  <input
                    type="text"
                    value={config.branding.colors.primary}
                    onChange={(e) => handleChange('branding.colors.primary', e.target.value)}
                    className="w-full p-2 border rounded-r"
                    placeholder="#2D6A4F"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Primary Light</label>
                <div className="flex">
                  <input
                    type="color"
                    value={config.branding.colors.primaryLight}
                    onChange={(e) => handleChange('branding.colors.primaryLight', e.target.value)}
                    className="h-10 w-10 border rounded"
                  />
                  <input
                    type="text"
                    value={config.branding.colors.primaryLight}
                    onChange={(e) => handleChange('branding.colors.primaryLight', e.target.value)}
                    className="w-full p-2 border rounded-r"
                    placeholder="#52B788"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Primary Dark</label>
                <div className="flex">
                  <input
                    type="color"
                    value={config.branding.colors.primaryDark}
                    onChange={(e) => handleChange('branding.colors.primaryDark', e.target.value)}
                    className="h-10 w-10 border rounded"
                  />
                  <input
                    type="text"
                    value={config.branding.colors.primaryDark}
                    onChange={(e) => handleChange('branding.colors.primaryDark', e.target.value)}
                    className="w-full p-2 border rounded-r"
                    placeholder="#1B4332"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Secondary Color</label>
                <div className="flex">
                  <input
                    type="color"
                    value={config.branding.colors.secondary}
                    onChange={(e) => handleChange('branding.colors.secondary', e.target.value)}
                    className="h-10 w-10 border rounded"
                  />
                  <input
                    type="text"
                    value={config.branding.colors.secondary}
                    onChange={(e) => handleChange('branding.colors.secondary', e.target.value)}
                    className="w-full p-2 border rounded-r"
                    placeholder="#74C69D"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Secondary Light</label>
                <div className="flex">
                  <input
                    type="color"
                    value={config.branding.colors.secondaryLight}
                    onChange={(e) => handleChange('branding.colors.secondaryLight', e.target.value)}
                    className="h-10 w-10 border rounded"
                  />
                  <input
                    type="text"
                    value={config.branding.colors.secondaryLight}
                    onChange={(e) => handleChange('branding.colors.secondaryLight', e.target.value)}
                    className="w-full p-2 border rounded-r"
                    placeholder="#B7E4C7"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Secondary Dark</label>
                <div className="flex">
                  <input
                    type="color"
                    value={config.branding.colors.secondaryDark}
                    onChange={(e) => handleChange('branding.colors.secondaryDark', e.target.value)}
                    className="h-10 w-10 border rounded"
                  />
                  <input
                    type="text"
                    value={config.branding.colors.secondaryDark}
                    onChange={(e) => handleChange('branding.colors.secondaryDark', e.target.value)}
                    className="w-full p-2 border rounded-r"
                    placeholder="#40916C"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Accent Color</label>
                <div className="flex">
                  <input
                    type="color"
                    value={config.branding.colors.accent}
                    onChange={(e) => handleChange('branding.colors.accent', e.target.value)}
                    className="h-10 w-10 border rounded"
                  />
                  <input
                    type="text"
                    value={config.branding.colors.accent}
                    onChange={(e) => handleChange('branding.colors.accent', e.target.value)}
                    className="w-full p-2 border rounded-r"
                    placeholder="#D8F3DC"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Fonts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Heading Font</label>
                <input
                  type="text"
                  value={config.branding.fonts.heading}
                  onChange={(e) => handleChange('branding.fonts.heading', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Montserrat, sans-serif"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Body Font</label>
                <input
                  type="text"
                  value={config.branding.fonts.body}
                  onChange={(e) => handleChange('branding.fonts.body', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Inter, sans-serif"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Accent Font</label>
                <input
                  type="text"
                  value={config.branding.fonts.accent}
                  onChange={(e) => handleChange('branding.fonts.accent', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Playfair Display, serif"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Social Media Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facebook URL</label>
              <input
                type="url"
                value={config.social.facebook || ''}
                onChange={(e) => handleChange('social.facebook', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="https://facebook.com/yourbrand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram URL</label>
              <input
                type="url"
                value={config.social.instagram || ''}
                onChange={(e) => handleChange('social.instagram', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="https://instagram.com/yourbrand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Twitter URL</label>
              <input
                type="url"
                value={config.social.twitter || ''}
                onChange={(e) => handleChange('social.twitter', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="https://twitter.com/yourbrand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">YouTube URL</label>
              <input
                type="url"
                value={config.social.youtube || ''}
                onChange={(e) => handleChange('social.youtube', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="https://youtube.com/yourbrand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={config.social.linkedin || ''}
                onChange={(e) => handleChange('social.linkedin', e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="https://linkedin.com/company/yourbrand"
              />
            </div>
          </div>
        </section>
        
        {/* Contact Info Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={config.contact.email}
                onChange={(e) => handleChange('contact.email', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={config.contact.phone || ''}
                onChange={(e) => handleChange('contact.phone', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={config.contact.address || ''}
                onChange={(e) => handleChange('contact.address', e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="feature-blog"
                checked={config.features.blog}
                onChange={(e) => handleChange('features.blog', e.target.checked)}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor="feature-blog" className="text-sm font-medium">Enable Blog</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="feature-auth"
                checked={config.features.auth}
                onChange={(e) => handleChange('features.auth', e.target.checked)}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor="feature-auth" className="text-sm font-medium">Enable Authentication</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="feature-newsletter"
                checked={config.features.newsletter}
                onChange={(e) => handleChange('features.newsletter', e.target.checked)}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor="feature-newsletter" className="text-sm font-medium">Enable Newsletter</label>
            </div>
          </div>
        </section>
        
        {/* Domain-specific Configuration Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Domain-specific Configuration</h2>
          <p className="mb-4 text-sm text-gray-600">
            Configure different settings for each domain. This allows you to have different languages and SEO settings per domain.
          </p>
          
          {/* Display existing domain configurations */}
          {config.domains && Object.keys(config.domains).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Configured Domains</h3>
              <div className="space-y-4">
                {Object.entries(config.domains).map(([domain, domainConfig]) => (
                  <div key={domain} className="border p-4 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{domain}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newConfig = JSON.parse(JSON.stringify(config));
                          delete newConfig.domains[domain];
                          setConfig(newConfig);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Language</label>
                        <input
                          type="text"
                          value={domainConfig.language}
                          onChange={(e) => handleChange(`domains.${domain}.language`, e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="en"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                          type="text"
                          value={domainConfig.title}
                          onChange={(e) => handleChange(`domains.${domain}.title`, e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="Site Title"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={domainConfig.description}
                          onChange={(e) => handleChange(`domains.${domain}.description`, e.target.value)}
                          className="w-full p-2 border rounded"
                          rows={2}
                          placeholder="Site description"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Keywords</label>
                        <input
                          type="text"
                          value={domainConfig.keywords}
                          onChange={(e) => handleChange(`domains.${domain}.keywords`, e.target.value)}
                          className="w-full p-2 border rounded"
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add new domain configuration */}
          <div>
            <h3 className="text-lg font-medium mb-2">Add New Domain</h3>
            <div className="border p-4 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Domain</label>
                  <input
                    type="text"
                    id="new-domain"
                    className="w-full p-2 border rounded"
                    placeholder="example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <input
                    type="text"
                    id="new-domain-language"
                    className="w-full p-2 border rounded"
                    placeholder="en"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    id="new-domain-title"
                    className="w-full p-2 border rounded"
                    placeholder="Site Title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    id="new-domain-description"
                    className="w-full p-2 border rounded"
                    rows={2}
                    placeholder="Site description"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Keywords</label>
                  <input
                    type="text"
                    id="new-domain-keywords"
                    className="w-full p-2 border rounded"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      const domain = (document.getElementById('new-domain') as HTMLInputElement).value;
                      const language = (document.getElementById('new-domain-language') as HTMLInputElement).value;
                      const title = (document.getElementById('new-domain-title') as HTMLInputElement).value;
                      const description = (document.getElementById('new-domain-description') as HTMLTextAreaElement).value;
                      const keywords = (document.getElementById('new-domain-keywords') as HTMLInputElement).value;
                      
                      if (!domain || !language || !title || !description) {
                        alert('Please fill in all required fields');
                        return;
                      }
                      
                      const newConfig = JSON.parse(JSON.stringify(config));
                      if (!newConfig.domains) {
                        newConfig.domains = {};
                      }
                      
                      newConfig.domains[domain] = {
                        language,
                        title,
                        description,
                        keywords,
                      };
                      
                      setConfig(newConfig);
                      
                      // Clear the form
                      (document.getElementById('new-domain') as HTMLInputElement).value = '';
                      (document.getElementById('new-domain-language') as HTMLInputElement).value = '';
                      (document.getElementById('new-domain-title') as HTMLInputElement).value = '';
                      (document.getElementById('new-domain-description') as HTMLTextAreaElement).value = '';
                      (document.getElementById('new-domain-keywords') as HTMLInputElement).value = '';
                    }}
                    className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary-dark transition-colors"
                  >
                    Add Domain
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Notification Bars Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Notification Bars</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Top Notification Bar</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <input
                  type="text"
                  value={config.notificationBars?.top?.message || ''}
                  onChange={(e) => handleChange('notificationBars.top.message', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="This website is under development"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Background Color</label>
                  <input
                    type="text"
                    value={config.notificationBars?.top?.bgColor || ''}
                    onChange={(e) => handleChange('notificationBars.top.bgColor', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="bg-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Text Color</label>
                  <input
                    type="text"
                    value={config.notificationBars?.top?.textColor || ''}
                    onChange={(e) => handleChange('notificationBars.top.textColor', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="text-amber-800"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Bottom Notification Bar</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <input
                  type="text"
                  value={config.notificationBars?.bottom?.message || ''}
                  onChange={(e) => handleChange('notificationBars.bottom.message', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Website in development"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Background Color</label>
                  <input
                    type="text"
                    value={config.notificationBars?.bottom?.bgColor || ''}
                    onChange={(e) => handleChange('notificationBars.bottom.bgColor', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="bg-primary-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Text Color</label>
                  <input
                    type="text"
                    value={config.notificationBars?.bottom?.textColor || ''}
                    onChange={(e) => handleChange('notificationBars.bottom.textColor', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="text-primary-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
      
      {/* Apply Changes Section */}
      <section className="bg-white p-6 rounded-lg shadow mt-8">
        <h2 className="text-xl font-semibold mb-4">Apply Changes</h2>
        <p className="mb-4">
          After saving your configuration, you need to apply the changes to see them on your site.
          This will update the Tailwind theme and environment variables.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => window.location.href = '/api/admin/apply-config?action=theme'}
            className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary-dark transition-colors"
          >
            Generate Theme
          </button>
          <button
            onClick={() => window.location.href = '/api/admin/apply-config?action=env'}
            className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary-dark transition-colors"
          >
            Update Environment
          </button>
          <button
            onClick={() => window.location.href = '/api/admin/apply-config?action=all'}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            Apply All Changes
          </button>
        </div>
      </section>
    </div>
  );
}
