import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  register,
  errors,
  name,
  validation,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const error = errors?.[name];

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          type={inputType}
          placeholder={placeholder}
          {...register(name, validation)}
          className={`
            w-full px-4 py-3 bg-background border rounded-card 
            text-text placeholder-text placeholder-opacity-40
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-all duration-300
            ${error ? 'border-accent' : 'border-border'}
            ${className}
          `}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text text-opacity-40 hover:text-primary transition-colors duration-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1.5 mt-1">
          <AlertCircle className="w-4 h-4 text-accent" />
          <p className="text-sm text-accent">{error.message}</p>
        </div>
      )}
    </div>
  );
};

export default Input;