import React from 'react';
import { useForm } from 'react-hook-form';
import { clsx } from 'clsx';

interface CampoFormularioProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  register: any;
  errors: any;
  className?: string;
}

export const CampoFormulario: React.FC<CampoFormularioProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  options = [],
  register,
  errors,
  className
}) => {
  const hasError = errors[name];
  
  const inputClasses = clsx(
    'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm',
    hasError
      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    disabled && 'bg-gray-100 cursor-not-allowed',
    className
  );

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...register(name, { required: required && `${label} es requerido` })}
            className={inputClasses}
            placeholder={placeholder}
            disabled={disabled}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <select
            {...register(name, { required: required && `${label} es requerido` })}
            className={inputClasses}
            disabled={disabled}
          >
            <option value="">Seleccionar...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type={type}
            {...register(name, { required: required && `${label} es requerido` })}
            className={inputClasses}
            placeholder={placeholder}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {hasError && (
        <p className="text-sm text-red-600" role="alert">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

interface FormularioProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  className?: string;
}

export const Formulario: React.FC<FormularioProps> = ({
  children,
  onSubmit,
  className
}) => {
  const methods = useForm();
  const { handleSubmit } = methods;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={clsx('space-y-4', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === CampoFormulario) {
          return React.cloneElement(child as React.ReactElement<CampoFormularioProps>, {
            register: methods.register,
            errors: methods.formState.errors
          });
        }
        return child;
      })}
    </form>
  );
};
