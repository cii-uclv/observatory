/**
 * Design Tokens - TypeScript Definitions
 *
 * This file provides type-safe access to design tokens defined in globals.css.
 * globals.css is the source of truth for all token values.
 */

/**
 * Color Tokens
 * Semantic color names that adapt to light/dark mode
 */
export const colors = {
	// Base colors
	background: "bg-background",
	foreground: "text-foreground",

	// Primary colors
	primary: "bg-primary text-primary-foreground",
	primaryForeground: "text-primary-foreground",

	// Secondary colors
	secondary: "bg-secondary text-secondary-foreground",
	secondaryForeground: "text-secondary-foreground",

	// Muted colors
	muted: "bg-muted text-muted-foreground",
	mutedForeground: "text-muted-foreground",

	// Accent colors
	accent: "bg-accent text-accent-foreground",
	accentForeground: "text-accent-foreground",

	// Semantic colors
	destructive: "bg-destructive text-destructive-foreground",
	destructiveForeground: "text-destructive-foreground",
	warning: "bg-warning text-warning-foreground",
	warningForeground: "text-warning-foreground",
	success: "bg-success text-success-foreground",
	successForeground: "text-success-foreground",
	info: "bg-info text-info-foreground",
	infoForeground: "text-info-foreground",

	// Background & Surface tokens
	backgroundAlt: "bg-background-alt",
	backgroundLight: "bg-background-light",
	backgroundDark: "bg-background-dark",
	surfaceDark: "bg-surface-dark",

	// Neutral scale
	neutral50: "bg-neutral-50",
	neutral100: "bg-neutral-100",
	neutral200: "bg-neutral-200",
	neutral300: "bg-neutral-300",
	neutral400: "bg-neutral-400",
	neutral500: "bg-neutral-500",
	neutral600: "bg-neutral-600",
	neutral700: "bg-neutral-700",
	neutral800: "bg-neutral-800",
	neutral900: "bg-neutral-900",

	// Chart colors
	chart1: "bg-chart-1",
	chart2: "bg-chart-2",
	chart3: "bg-chart-3",
	chart4: "bg-chart-4",
	chart5: "bg-chart-5",

	// UI element colors
	border: "border-border",
	input: "bg-input",
	ring: "ring-ring",
	card: "bg-card text-card-foreground",
	popover: "bg-popover text-popover-foreground",

	// Sidebar colors
	sidebar: "bg-sidebar",
	sidebarForeground: "text-sidebar-foreground",
	sidebarPrimary: "bg-sidebar-primary",
	sidebarPrimaryForeground: "text-sidebar-primary-foreground",
	sidebarAccent: "bg-sidebar-accent",
	sidebarAccentForeground: "text-sidebar-accent-foreground",
	sidebarBorder: "border-sidebar-border",
	sidebarRing: "ring-sidebar-ring",
} as const;

/**
 * Typography Tokens
 */
export const typography = {
	// Font families
	fontSans: "font-sans",
	fontMono: "font-mono",
	fontDisplay: "font-display",
	fontBody: "font-body",
	fontCode: "font-code",

	// Font sizes
	fontSize: {
		xs: "text-xs",
		sm: "text-sm",
		base: "text-base",
		lg: "text-lg",
		xl: "text-xl",
		"2xl": "text-2xl",
		"3xl": "text-3xl",
		"4xl": "text-4xl",
		"5xl": "text-5xl",
		"6xl": "text-6xl",
	},

	// Font weights
	fontWeight: {
		light: "font-light",
		normal: "font-normal",
		medium: "font-medium",
		semibold: "font-semibold",
		bold: "font-bold",
		extrabold: "font-extrabold",
		black: "font-black",
	},

	// Line heights
	lineHeight: {
		none: "leading-none",
		tight: "leading-tight",
		snug: "leading-snug",
		normal: "leading-normal",
		relaxed: "leading-relaxed",
		loose: "leading-loose",
	},

	// Letter spacing
	letterSpacing: {
		tighter: "tracking-tighter",
		tight: "tracking-tight",
		normal: "tracking-normal",
		wide: "tracking-wide",
		wider: "tracking-wider",
		widest: "tracking-widest",
	},
} as const;

/**
 * Spacing Tokens
 * Based on 4px base unit
 */
export const spacing = {
	0: "p-0",
	1: "p-1",
	2: "p-2",
	3: "p-3",
	4: "p-4",
	5: "p-5",
	6: "p-6",
	8: "p-8",
	10: "p-10",
	12: "p-12",
	16: "p-16",
	20: "p-20",
	24: "p-24",
	32: "p-32",
	40: "p-40",
	48: "p-48",
	64: "p-64",
} as const;

/**
 * Border Radius Tokens
 */
export const radius = {
	none: "rounded-none",
	sm: "rounded-sm",
	md: "rounded-md",
	base: "rounded",
	lg: "rounded-lg",
	xl: "rounded-xl",
	"2xl": "rounded-2xl",
	"3xl": "rounded-3xl",
	"4xl": "rounded-4xl",
	full: "rounded-full",
} as const;

/**
 * Shadow Tokens
 */
export const shadows = {
	none: "shadow-none",
	xs: "shadow-xs",
	sm: "shadow-sm",
	md: "shadow-md",
	lg: "shadow-lg",
	xl: "shadow-xl",
	"2xl": "shadow-2xl",
	inner: "shadow-inner",
} as const;

/**
 * Z-Index Tokens
 */
export const zIndex = {
	base: "z-base",
	dropdown: "z-dropdown",
	sticky: "z-sticky",
	fixed: "z-fixed",
	modalBackdrop: "z-modal-backdrop",
	modal: "z-modal",
	popover: "z-popover",
	tooltip: "z-tooltip",
} as const;

/**
 * Transition Tokens
 */
export const transitions = {
	fast: "transition-fast",
	base: "transition-base",
	slow: "transition-slow",
	all: "transition-all",
} as const;

/**
 * Type exports for better TypeScript support
 */
export type ColorToken = keyof typeof colors;
export type TypographySize = keyof typeof typography.fontSize;
export type TypographyWeight = keyof typeof typography.fontWeight;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type ShadowToken = keyof typeof shadows;
export type ZIndexToken = keyof typeof zIndex;
export type TransitionToken = keyof typeof transitions;
