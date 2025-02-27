import { useTranslation } from '../../../lib/i18n/useTranslation';

/**
 * Benefits of CBD section for the homepage
 */
export const BenefitsSection = () => {
  const { t } = useTranslation();
  
  // Benefits data with icons
  const benefits = [
    {
      id: 'painRelief',
      icon: 'healing',
      title: t.benefits.painRelief,
      description: t.benefits.painReliefDesc,
    },
    {
      id: 'anxiety',
      icon: 'psychology',
      title: t.benefits.anxiety,
      description: t.benefits.anxietyDesc,
    },
    {
      id: 'sleep',
      icon: 'bedtime',
      title: t.benefits.sleep,
      description: t.benefits.sleepDesc,
    },
    {
      id: 'wellness',
      icon: 'spa',
      title: t.benefits.wellness,
      description: t.benefits.wellnessDesc,
    },
  ];
  
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">
          {t.benefits.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div 
              key={benefit.id}
              className="text-center p-6 rounded-lg transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="bg-accent rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-primary text-3xl">
                  {benefit.icon}
                </span>
              </div>
              <h3 className="text-xl font-heading font-bold text-primary mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
