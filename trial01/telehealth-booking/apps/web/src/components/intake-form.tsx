'use client';

import { useForm } from 'react-hook-form';
import { IntakeFieldType } from '@medconnect/shared';
import { Button, Input } from '@medconnect/ui';

interface IntakeField {
  id: string;
  type: IntakeFieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface IntakeFormProps {
  fields: IntakeField[];
  onSubmit: (responses: Record<string, unknown>) => void;
  isSubmitting?: boolean;
}

export function IntakeForm({ fields, onSubmit, isSubmitting }: IntakeFormProps) {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </label>

          {field.type === IntakeFieldType.TEXT && (
            <Input
              id={field.id}
              placeholder={field.placeholder}
              {...register(field.id, { required: field.required })}
            />
          )}

          {field.type === IntakeFieldType.TEXTAREA && (
            <textarea
              id={field.id}
              placeholder={field.placeholder}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register(field.id, { required: field.required })}
            />
          )}

          {field.type === IntakeFieldType.SELECT && (
            <select
              id={field.id}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register(field.id, { required: field.required })}
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {field.type === IntakeFieldType.MULTI_SELECT && (
            <select
              id={field.id}
              multiple
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register(field.id, { required: field.required })}
            >
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {field.type === IntakeFieldType.CHECKBOX && (
            <div className="flex items-center gap-2">
              <input
                id={field.id}
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                {...register(field.id, { required: field.required })}
              />
            </div>
          )}

          {field.type === IntakeFieldType.DATE && (
            <Input
              id={field.id}
              type="date"
              {...register(field.id, { required: field.required })}
            />
          )}

          {field.type === IntakeFieldType.NUMBER && (
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              {...register(field.id, { required: field.required })}
            />
          )}

          {field.type === IntakeFieldType.PHONE && (
            <Input
              id={field.id}
              type="tel"
              placeholder={field.placeholder ?? '(555) 555-5555'}
              {...register(field.id, { required: field.required })}
            />
          )}

          {field.type === IntakeFieldType.EMAIL && (
            <Input
              id={field.id}
              type="email"
              placeholder={field.placeholder ?? 'email@example.com'}
              {...register(field.id, { required: field.required })}
            />
          )}
        </div>
      ))}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
