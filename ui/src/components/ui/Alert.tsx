import React from 'react';
import { clsx } from 'clsx';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type, message, onClose, className }: AlertProps) {
  const config = {
    success: {
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      textColor: 'text-success-800',
      icon: CheckCircleIcon,
      iconColor: 'text-success-500',
    },
    error: {
      bgColor: 'bg-error-50',
      borderColor: 'border-error-200',
      textColor: 'text-error-800',
      icon: ExclamationCircleIcon,
      iconColor: 'text-error-500',
    },
    warning: {
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200',
      textColor: 'text-warning-800',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-warning-500',
    },
    info: {
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200',
      textColor: 'text-primary-800',
      icon: InformationCircleIcon,
      iconColor: 'text-primary-500',
    },
  };

  const { bgColor, borderColor, textColor, icon: Icon, iconColor } = config[type];

  return (
    <div className={clsx('rounded-lg border p-4', bgColor, borderColor, className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={clsx('h-5 w-5', iconColor)} />
        </div>
        <div className="ml-3 flex-1">
          <p className={clsx('text-sm font-medium', textColor)}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={clsx('inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2', textColor)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
