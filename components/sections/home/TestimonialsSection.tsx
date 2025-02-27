import { useState } from 'react';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import Image from 'next/image';

// Testimonial type
type Testimonial = {
  id: string;
  name: string;
  image: string;
  rating: number;
  text: string;
  product: string;
};

/**
 * Testimonials section for the homepage
 */
export const TestimonialsSection = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Mock testimonials data (in a real app, this would come from the database)
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      rating: 5,
      text: 'The CBD oil has been a game changer for my chronic back pain. I sleep better and feel more relaxed during the day.',
      product: 'Full Spectrum CBD Oil 1000mg'
    },
    {
      id: '2',
      name: 'Michael Chen',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      rating: 4,
      text: 'I\'ve been using the CBD cream for my arthritis and it has significantly reduced the inflammation. Very pleased with the results.',
      product: 'CBD Relief Cream 250mg'
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      rating: 5,
      text: 'The CBD gummies have helped me manage my anxiety. They taste great and I feel calmer within 30 minutes of taking them.',
      product: 'CBD Gummies 300mg'
    }
  ];

  // Handle carousel navigation
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span 
        key={index} 
        className={`material-icons text-${index < rating ? 'yellow-500' : 'gray-300'}`}
      >
        star
      </span>
    ));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">
          {t.testimonials.title}
        </h2>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="flex flex-col md:flex-row items-center mb-6">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          sizes="(max-width: 768px) 80px, 80px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-heading font-bold text-primary">
                          {testimonial.name}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {testimonial.product}
                        </p>
                        <div className="flex">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>
                    <blockquote className="text-gray-700 italic">
                      &ldquo;{testimonial.text}&rdquo;
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
                aria-label="Previous testimonial"
              >
                <span className="material-icons text-primary">chevron_left</span>
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
                aria-label="Next testimonial"
              >
                <span className="material-icons text-primary">chevron_right</span>
              </button>
            </>
          )}
          
          {/* Dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    currentIndex === index ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
