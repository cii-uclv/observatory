import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
	"flex w-full rounded-md border bg-background text-sm transition-colors outline-none placeholder:text-muted-foreground",
	{
		variants: {
			variant: {
				default: "border-input focus:border-ring focus:ring-2 focus:ring-ring/30",
				error: "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/30",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

export interface TextareaProps
	extends
		React.TextareaHTMLAttributes<HTMLTextAreaElement>,
		VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, variant, ...props }, ref) => {
		return (
			<textarea ref={ref} className={cn(textareaVariants({ variant }), className)} {...props} />
		);
	}
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
