import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormData } from '@/lib/validators';
import { createPatient } from '@/lib/fhir-client';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { FHIRPatient } from '@/types/fhir';

interface PatientFormProps {
  onSuccess?: (patient: FHIRPatient) => void;
}

export function PatientForm({ onSuccess }: PatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const patient = await createPatient({
        resourceType: 'Patient',
        active: true,
        name: [
          {
            use: 'official',
            family: data.family,
            given: [data.given],
          },
        ],
        gender: data.gender,
        birthDate: data.birthDate,
      });

      setSuccess(`Patient created successfully! ID: ${patient.id}`);
      reset();
      
      if (onSuccess) {
        onSuccess(patient);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <div>
        <label htmlFor="family" className="block text-sm font-medium text-slate-700 mb-1">
          Family Name <span className="text-error-500">*</span>
        </label>
        <input
          {...register('family')}
          type="text"
          id="family"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Doe"
        />
        {errors.family && (
          <p className="mt-1 text-sm text-error-600">{errors.family.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="given" className="block text-sm font-medium text-slate-700 mb-1">
          Given Name <span className="text-error-500">*</span>
        </label>
        <input
          {...register('given')}
          type="text"
          id="given"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="John"
        />
        {errors.given && (
          <p className="mt-1 text-sm text-error-600">{errors.given.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
          Gender <span className="text-error-500">*</span>
        </label>
        <select
          {...register('gender')}
          id="gender"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="unknown">Unknown</option>
        </select>
        {errors.gender && (
          <p className="mt-1 text-sm text-error-600">{errors.gender.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700 mb-1">
          Birth Date (optional)
        </label>
        <input
          {...register('birthDate')}
          type="date"
          id="birthDate"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            'Create Patient'
          )}
        </Button>
      </div>
    </form>
  );
}
