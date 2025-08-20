import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const trackVariants = cva(
	"relative inline-flex items-center rounded-full transition-colors duration-200 shadow-inner cursor-pointer select-none peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring",
	{
		variants: {
			size: {
				sm: "h-5 w-9",
				md: "h-6 w-11",
				lg: "h-7 w-14",
			},
			variant: {
				default: "bg-neutral-700",
				accent: "bg-neutral-700",
				neon: "bg-neutral-700",
			},
		},
		defaultVariants: {
			size: 'md',
			variant: 'default',
		},
	}
);

const knobVariants = cva(
	"absolute rounded-full bg-white shadow-md transition-transform duration-200",
	{
		variants: {
			size: {
				sm: "h-4 w-4 left-0.5 top-0.5",
				md: "h-5 w-5 left-0.5 top-0.5",
				lg: "h-6 w-6 left-0.5 top-0.5",
			},
		},
		defaultVariants: {
			size: 'md',
		},
	}
);

export interface SwitchProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
		VariantProps<typeof trackVariants> {
	label?: string;
	labelPosition?: 'left' | 'right';
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
	(
		{
			className,
			size,
			variant,
			id,
			label,
			labelPosition = 'right',
			...props
		},
		ref
	) => {
		const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

		return (
			<label htmlFor={switchId} className={cn("inline-flex items-center gap-3", className)}>
				{label && labelPosition === 'left' && (
					<span className="text-sm font-medium select-none">{label}</span>
				)}
				<input
					id={switchId}
					type="checkbox"
					ref={ref}
					className="sr-only peer"
					role="switch"
					aria-checked={props.checked}
					{...props}
				/>
				<div
					className={cn(
						trackVariants({ size, variant }),
						props.checked && (
							variant === 'neon'
								? 'bg-gradient-to-r from-[#00EBCB] to-[#007ADF] shadow-[0_0_18px_4px_rgba(0,122,223,0.55)]'
							: variant === 'accent'
								? 'bg-accent shadow-[0_0_14px_3px_rgba(0,232,198,0.45)]'
								: 'bg-primary shadow-[0_0_14px_3px_rgba(0,122,223,0.45)]'
						)
					)}
				>
					<span
						className={cn(
							knobVariants({ size }),
							props.checked && (size === 'sm' ? 'translate-x-4' : size === 'lg' ? 'translate-x-7' : 'translate-x-5'),
							props.checked && (variant === 'neon' ? 'shadow-[0_0_12px_2px_rgba(0,122,223,0.6)]' : '')
						)}
					/>
				</div>
				{label && labelPosition === 'right' && (
					<span className="text-sm font-medium select-none">{label}</span>
				)}
			</label>
		);
	}
);

Switch.displayName = 'Switch';

export { Switch };


