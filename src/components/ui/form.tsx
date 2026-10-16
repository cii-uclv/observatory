"use client";

import { cn } from "@/lib/utils";

import { Input } from "./input";
import { Label } from "./label";

export interface FormFieldProps {
	name: string;
	label?: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
	error?: string;
	className?: string;
}

function FormField({
	name,
	label,
	type = "text",
	placeholder,
	required,
	error,
	className,
}: FormFieldProps) {
	return (
		<div className={cn("flex flex-col gap-2", className)}>
			{label && <Label htmlFor={name}>{label}</Label>}
			<Input id={name} name={name} type={type} placeholder={placeholder} required={required} />
			{error && <span className="text-destructive text-sm">{error}</span>}
		</div>
	);
}

export { FormField };
