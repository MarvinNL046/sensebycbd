'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '../../../types/product';

interface ProductGalleryProps {
  product: Product;
}

/**
 * Product gallery component that displays the main image and additional images
 */
export const ProductGallery = ({ product }: ProductGalleryProps) => {
  const [activeImage, setActiveImage] = useState<string>(product.image_url);
  const [allImages, setAllImages] = useState<string[]>([product.image_url]);
  
  // Initialize all images when the component mounts or product changes
  useEffect(() => {
    // Ensure additional_images is an array
    const additionalImages = Array.isArray(product.additional_images) 
      ? product.additional_images 
      : [];
    
    // Combine main image with additional images
    setAllImages([product.image_url, ...additionalImages]);
    
    // Log for debugging
    console.log('Product Gallery Images:', [product.image_url, ...additionalImages]);
  }, [product]);

  return (
    <div className="w-full">
      {/* Main image */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden mb-4">
        <Image
          src={activeImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(image)}
              className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                activeImage === image
                  ? 'border-primary'
                  : 'border-transparent hover:border-primary/50'
              }`}
              aria-label={`View image ${index + 1} of ${product.name}`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image}
                  alt={`${product.name} - Image ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
