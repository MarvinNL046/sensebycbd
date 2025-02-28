import { useState, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { useLazyLoad } from '../../lib/utils/lazyLoading';

interface LazyImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  /**
   * Whether to use a blur placeholder while the image is loading
   * @default true
   */
  useBlur?: boolean;
  
  /**
   * The color to use for the blur placeholder
   * @default '#f3f4f6' (gray-100)
   */
  blurColor?: string;
  
  /**
   * The threshold at which the image should start loading
   * @default 0.1
   */
  threshold?: number;
  
  /**
   * The root margin to use for the intersection observer
   * @default '200px'
   */
  rootMargin?: string;
}

/**
 * A component that lazily loads images when they are about to enter the viewport
 */
export const LazyImage = ({
  src,
  alt,
  width,
  height,
  useBlur = true,
  blurColor = '#f3f4f6',
  threshold = 0.1,
  rootMargin = '200px',
  className = '',
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Use the lazy load hook to determine if the image is in the viewport
  const isVisible = useLazyLoad(
    imageRef,
    { threshold, rootMargin },
    true
  );
  
  // Generate a simple blur data URL
  const blurDataURL = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='${encodeURIComponent(blurColor)}'/%3E%3C/svg%3E`;
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  // Handle image error
  const handleError = () => {
    setIsError(true);
  };
  
  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
    >
      {isVisible && (
        <Image
          src={isError ? blurDataURL : src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={useBlur ? 'blur' : 'empty'}
          blurDataURL={useBlur ? blurDataURL : undefined}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      )}
      
      {(!isVisible || !isLoaded) && (
        <div
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{ backgroundColor: blurColor }}
        />
      )}
    </div>
  );
};
