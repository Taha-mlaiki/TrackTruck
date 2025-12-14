"use client";

import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormInput({ label, error, required, className, id, ...props }: FormInputProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={inputId}
        className={cn(
          "w-full px-3 py-2 border rounded-md bg-background transition-colors",
          error ? "border-destructive focus:border-destructive focus:ring-destructive" : "border-input",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function FormSelect({
  label,
  error,
  required,
  options,
  placeholder,
  className,
  id,
  ...props
}: FormSelectProps) {
  const selectId = id || props.name;

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <select
        id={selectId}
        className={cn(
          "w-full px-3 py-2 border rounded-md bg-background transition-colors",
          error ? "border-destructive focus:border-destructive focus:ring-destructive" : "border-input",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export function FormCheckbox({ label, error, className, id, ...props }: FormCheckboxProps) {
  const checkboxId = id || props.name;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={checkboxId}
          className={cn(
            "h-4 w-4 rounded border-input",
            error && "border-destructive",
            className
          )}
          {...props}
        />
        <label htmlFor={checkboxId} className="text-sm font-medium">
          {label}
        </label>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
