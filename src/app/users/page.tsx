/**
 * Users Page
 *
 * Server Component page that displays the users list.
 */

import { UserList } from "@/features/users";

// Rendered per request: it depends on the authenticated session.
export const dynamic = "force-dynamic";

export default function UsersPage() {
	return (
		<div className="container mx-auto py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Users</h1>
				<p className="text-muted-foreground">Manage system users</p>
			</div>
			<UserList />
		</div>
	);
}
