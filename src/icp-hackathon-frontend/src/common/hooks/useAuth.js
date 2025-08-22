import { useEffect, useState } from "react";
import useStore from "../../store/store.js";
import authService from "../services/authService.js";

/**
 * Production-grade authentication hook
 * Manages authentication state with proper initialization and session restoration
 */
export function useAuth() {
	const [isInitializing, setIsInitializing] = useState(true);
	const [authError, setAuthError] = useState(null);

	const identity = useStore(state => state.identity);
	const setIdentity = useStore(state => state.setIdentity);
	const setAuthClient = useStore(state => state.setAuthClient);

	/**
	 * Initialize authentication and restore session if exists
	 */
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				setIsInitializing(true);
				setAuthError(null);

				// Initialize auth service
				const authClient = await authService.initialize();
				setAuthClient(authClient);

				// Check for existing session and restore identity
				const isAuthenticated = await authService.isAuthenticated();
				if (isAuthenticated) {
					const currentIdentity = await authService.getIdentity();
					if (currentIdentity) {
						setIdentity(currentIdentity);
					}
				} else {
					// Ensure identity is cleared if not authenticated
					setIdentity(null);
				}
			} catch (error) {
				console.error("Authentication initialization failed:", error);
				setAuthError(error.message);
				setIdentity(null);
			} finally {
				setIsInitializing(false);
			}
		};

		initializeAuth();
	}, [setIdentity, setAuthClient]);

	/**
	 * Login function
	 */
	const login = async () => {
		try {
			setAuthError(null);
			const newIdentity = await authService.login();
			setIdentity(newIdentity);
			return newIdentity;
		} catch (error) {
			console.error("Login failed:", error);
			setAuthError(error.message);
			throw error;
		}
	};

	/**
	 * Logout function
	 */
	const logout = async () => {
		try {
			setAuthError(null);
			await authService.logout();
			setIdentity(null);
		} catch (error) {
			console.error("Logout failed:", error);
			setAuthError(error.message);
			// Still clear identity even if logout fails
			setIdentity(null);
		}
	};

	/**
	 * Check if user is authenticated
	 */
	const isAuthenticated = Boolean(identity && !isInitializing);

	return {
		// State
		identity,
		isAuthenticated,
		isInitializing,
		authError,

		// Actions
		login,
		logout,

		// Legacy - for backward compatibility
		authClient: authService.getAuthClient()
	};
}

export default useAuth;
