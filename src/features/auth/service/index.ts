/**
 * Authentication Services
 *
 * Centralized services for all authentication operations:
 * - User login (signIn)
 * - User registration (signUp)
 * - User logout (logout)
 *
 * All services use the AppClient with `credentials: 'include'` so the
 * HttpOnly cookies emitted by the backend are always sent and stored.
 *
 * Usage:
 * ```ts
 * import { signIn, signUp, logout } from '@/features/auth/service';
 *
 * // Register new user
 * const newUser = await signUp({...userData});
 *
 * // Login
 * const user = await signIn({ username, password });
 *
 * // Logout
 * await logout();
 * ```
 */

export type { ApiEnvelope, AuthTokensPayload, AuthUser } from "../types";
export { logout, type LogoutResponse } from "./logout";
export { signIn, type SignInResponse } from "./sign_in";
export { signUp, type SignUpResponse } from "./sign_up";
