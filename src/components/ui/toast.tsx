"use client";

import * as React from "react";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
	React.ElementRef<typeof ToastPrimitive.Viewport>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
	<ToastPrimitive.Viewport
		ref={ref}
		className={cn(
			"fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]",
			className
		)}
		{...props}
	/>
));
ToastViewport.displayName = "ToastViewport";

const Toast = React.forwardRef<
	React.ElementRef<typeof ToastPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => (
	<ToastPrimitive.Root
		ref={ref}
		className={cn(
			"group bg-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
			className
		)}
		{...props}
	/>
));
Toast.displayName = "Toast";

const ToastAction = React.forwardRef<
	React.ElementRef<typeof ToastPrimitive.Action>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
	<ToastPrimitive.Action
		ref={ref}
		className={cn(
			"ring-offset-background hover:bg-secondary focus:ring-ring inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none",
			className
		)}
		{...props}
	/>
));
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef<
	React.ElementRef<typeof ToastPrimitive.Close>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
	<ToastPrimitive.Close
		ref={ref}
		className={cn(
			"focus:ring-ring absolute top-2 right-2 rounded-md p-1 opacity-70 transition-opacity group-hover:opacity-100 hover:opacity-100 focus:ring-2 focus:outline-none",
			className
		)}
		{...props}
	>
		<X className="h-4 w-4" />
	</ToastPrimitive.Close>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
	)
);
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p ref={ref} className={cn("text-muted-foreground text-sm", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

export {
	Toast,
	ToastAction,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
};
