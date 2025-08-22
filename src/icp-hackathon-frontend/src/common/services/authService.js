import { AuthClient } from "@dfinity/auth-client";

/**
 * Production-grade authentication service for ICP
 * Handles session persistence, restoration, and cleanup
 */
class AuthService {
	constructor() {
		this.authClient = null;
		this.isInitialized = false;
		this.initializationPromise = null;
	}

	/**
	 * Initialize the auth client and restore any existing session
	 * @returns {Promise<AuthClient>}
	 */
	async initialize() {
		if (this.isInitialized && this.authClient) {
			return this.authClient;
		}

		// Prevent multiple initialization calls
		if (this.initializationPromise) {
			return this.initializationPromise;
		}

		this.initializationPromise = this._initializeClient();
		return this.initializationPromise;
	}

	/**
	 * Internal method to create and configure AuthClient
	 * @private
	 */
	async _initializeClient() {
		try {
			this.authClient = await AuthClient.create({
				idleOptions: {
					// Disable idle timeout for development, adjust for production
					disableIdle: process.env.DFX_NETWORK !== "ic",
					// In production, set appropriate idle timeout (e.g., 30 minutes)
					idleTimeout: process.env.DFX_NETWORK === "ic" ? 30 * 60 * 1000 : undefined
				}
			});

			this.isInitialized = true;
			return this.authClient;
		} catch (error) {
			console.error("Failed to initialize AuthClient:", error);
			throw new Error("Authentication initialization failed");
		}
	}

	/**
	 * Check if user is currently authenticated
	 * @returns {Promise<boolean>}
	 */
	async isAuthenticated() {
		if (!this.authClient) {
			await this.initialize();
		}
		return this.authClient.isAuthenticated();
	}

	/**
	 * Get the current identity if authenticated
	 * @returns {Promise<Identity|null>}
	 */
	async getIdentity() {
		if (!this.authClient) {
			await this.initialize();
		}

		const isAuth = await this.authClient.isAuthenticated();
		if (!isAuth) {
			return null;
		}

		try {
			const identity = this.authClient.getIdentity();

			// Validate identity is not anonymous and has proper principal
			if (!identity || identity.getPrincipal().isAnonymous()) {
				console.warn("Identity is anonymous or invalid, clearing session");
				await this.logout();
				return null;
			}

			return identity;
		} catch (error) {
			console.error("Failed to get identity:", error);
			// Clear potentially corrupted session
			await this.logout();
			return null;
		}
	}

	/**
	 * Login with Internet Identity
	 * @param {Object} options - Login options
	 * @returns {Promise<Identity>}
	 */
	async login(options = {}) {
		if (!this.authClient) {
			await this.initialize();
		}

		const defaultOptions = {
			identityProvider: this._getIdentityProvider(),
			maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
			...options
		};

		return new Promise((resolve, reject) => {
			this.authClient.login({
				...defaultOptions,
				onSuccess: async () => {
					try {
						const identity = await this.authClient.getIdentity();
						resolve(identity);
					} catch (error) {
						reject(error);
					}
				},
				onError: error => {
					reject(error);
				}
			});
		});
	}

	/**
	 * Logout and clear session
	 * @returns {Promise<void>}
	 */
	async logout() {
		if (!this.authClient) {
			return;
		}

		try {
			await this.authClient.logout();
		} catch (error) {
			console.error("Logout error:", error);
			// Continue with cleanup even if logout fails
		}
	}

	/**
	 * Get the appropriate identity provider URL based on environment
	 * @private
	 */
	_getIdentityProvider() {
		if (process.env.DFX_NETWORK === "ic") {
			return "https://identity.ic0.app/#authorize";
		}

		// Local development
		return `http://asrmz-lmaaa-aaaaa-qaaeq-cai.localhost:4943/#authorize`;
	}

	/**
	 * Get the AuthClient instance (for backward compatibility)
	 * @returns {AuthClient|null}
	 */
	getAuthClient() {
		return this.authClient;
	}
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
