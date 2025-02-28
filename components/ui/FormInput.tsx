import React from 'react';
import { cn } from '../../lib/utils/cn';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable form input component with enhanced styling and features
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, id, type = 'text', icon, className, error, required, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          <input
            id={id}
            type={type}
            ref={ref}
            className={cn(
              "w-full px-3 py-2 border rounded-md transition-all duration-200",
              icon ? "pl-10" : "",
              error 
                ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-primary focus:border-primary",
              "focus:outline-none focus:ring-2",
              "placeholder:text-gray-400",
              "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${id}-error` : undefined}
            required={required}
            {...props}
          />
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string;
}

/**
 * Reusable form textarea component with enhanced styling and features
 */
export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, id, className, error, required, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id={id}
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-md transition-all duration-200",
            error 
              ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 focus:ring-primary focus:border-primary",
            "focus:outline-none focus:ring-2",
            "placeholder:text-gray-400",
            "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
