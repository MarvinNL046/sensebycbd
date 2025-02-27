import { useTranslation } from '../../../lib/i18n/useTranslation';
import Link from 'next/link';

/**
 * Hero section for the homepage with CBD benefits messaging
 */
export const HeroSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="bg-gradient-to-b from-accent to-white py-20">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6">
            {t.hero.title}
          </h1>
          <p className="text-xl text-primary-dark mb-8">
            {t.hero.subtitle}
          </p>
          <Link href="/products" className="btn-primary inline-block">
            {t.hero.cta}
          </Link>
        </div>
      </div>
    </section>
  );
};
