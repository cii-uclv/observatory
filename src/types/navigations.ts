export interface NavigationItem {
	label: string;
	href: string;
	/** Hide the item until a valid session exists. */
	requiresAuth?: boolean;
	/** Only show the item when the session has one of these role codes. */
	roles?: string[];
}
