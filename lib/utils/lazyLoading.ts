import { useState, useEffect, RefObject } from 'react';

/**
 * Utility functions for lazy loading images and other resources
 */

/**
 * Checks if the Intersection Observer API is available
 */
export const isIntersectionObserverAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
};

/**
 * Creates an intersection observer that calls the callback when the element is visible
 * @param element The element to observe
 * @param callback The callback to call when the element is visible
 * @param options Options for the intersection observer
 * @returns The intersection observer instance
 */
export const createIntersectionObserver = (
  element: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null => {
  if (!isIntersectionObserverAvailable()) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  observer.observe(element);
  return observer;
};

/**
 * React hook to determine if an element is in the viewport
 * @param ref React ref to the element to observe
 * @param options Options for the intersection observer
 * @param once Whether to stop observing after the element is visible once
 * @returns Whether the element is in the viewport
 */
export const useLazyLoad = (
  ref: RefObject<Element>,
  options: IntersectionObserverInit = {},
  once: boolean = true
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || (isVisible && once)) {
      return;
    }

    const observer = createIntersectionObserver(
      ref.current,
      () => {
        setIsVisible(true);
      },
      options
    );

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [ref, options, once, isVisible]);

  return isVisible;
};
