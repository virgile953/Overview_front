import { twMerge } from 'tailwind-merge';
import { ChangeEvent, useState, useId } from 'react';

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  type?: 'textarea' | React.HTMLInputTypeAttribute;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function InputField({
  value,
  onChange,
  placeholder,
  className,
  type = 'text',
  rows = 3,
  id,
  ...rest
}: InputFieldProps) {
  const [hasValue, setHasValue] = useState(value !== undefined && String(value).length > 0);
  const generatedId = useId();
  const fieldId = id || generatedId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChange) onChange(e as ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>);
    setHasValue(Boolean(e.target.value && e.target.value.length > 0));
  };

  const baseClasses = "peer w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400";
  const textareaClasses = type === 'textarea' ? "min-h-[80px] resize-vertical" : "";

  return (
    <div className="relative w-full">
      {type === 'textarea' ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={handleChange}
          rows={rows}
          className={twMerge(baseClasses, textareaClasses, className)}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={handleChange}
          className={twMerge(baseClasses, className)}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {placeholder && (
        <label
          htmlFor={fieldId}
          className={twMerge(
            "absolute left-3 top-2 text-gray-400 pointer-events-none transition-transform duration-200",
            `peer-focus:text-xs peer-focus:-top-2 peer-focus:left-2
           peer-focus:text-emerald-600 peer-focus:bg-black peer-focus:px-1`,
            hasValue && "text-xs -top-2 left-2 text-gray-600 bg-black px-1"
          )}
        >
          {placeholder}
        </label>
      )}
    </div>
  );
}