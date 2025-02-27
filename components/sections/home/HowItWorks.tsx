import { useTranslation } from '../../../lib/i18n/useTranslation';

/**
 * How CBD Works section for the homepage in infographic style
 */
export const HowItWorks = () => {
  const { t } = useTranslation();
  
  // Steps data with icons
  const steps = [
    {
      id: 'step1',
      icon: 'science',
      title: 'Extraction',
      description: 'CBD is extracted from hemp plants using CO2 extraction for maximum purity and potency.'
    },
    {
      id: 'step2',
      icon: 'biotech',
      title: 'Endocannabinoid System',
      description: 'CBD interacts with your body\'s endocannabinoid system, which regulates many physiological processes.'
    },
    {
      id: 'step3',
      icon: 'psychology',
      title: 'Receptors',
      description: 'Unlike THC, CBD doesn\'t bind directly to cannabinoid receptors but influences them indirectly.'
    },
    {
      id: 'step4',
      icon: 'balance',
      title: 'Balance',
      description: 'CBD helps restore balance (homeostasis) in the body, supporting overall wellness and relief.'
    }
  ];
  
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">
          How CBD Works
        </h2>
        
        {/* Desktop version - horizontal timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-24 left-0 w-full h-1 bg-accent"></div>
            
            {/* Steps */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="w-1/4 px-4 relative">
                  {/* Step number */}
                  <div className="absolute top-[5.85rem] left-1/2 -translate-x-1/2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="bg-accent rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 relative z-20">
                    <span className="material-icons text-primary text-4xl">
                      {step.icon}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-xl font-heading font-bold text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobile version - vertical timeline */}
        <div className="md:hidden">
          <div className="relative pl-10">
            {/* Timeline line */}
            <div className="absolute top-0 left-4 h-full w-1 bg-accent"></div>
            
            {/* Steps */}
            {steps.map((step, index) => (
              <div key={step.id} className="mb-10 relative">
                {/* Step number */}
                <div className="absolute top-0 left-0 -translate-x-1/2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10">
                  {index + 1}
                </div>
                
                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <span className="material-icons text-primary text-3xl mr-4">
                      {step.icon}
                    </span>
                    <h3 className="text-xl font-heading font-bold text-primary">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
