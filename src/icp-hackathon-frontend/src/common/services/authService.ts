import { AuthClient, AuthClientCreateOptions } from "@dfinity/auth-client";
import type { Identity } from "@dfinity/agent";

interface LoginOptions {
	identityProvider?: string;
	maxTimeToLive?: bigint;
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
	[key: string]: unknown;
}

/**
 * Production-grade authentication service for ICP
 * Handles session persistence, restoration, and cleanup
 */
class AuthService {
	private authClient: AuthClient | null;
	private isInitialized: boolean;
	private initializationPromise: Promise<AuthClient> | null;

	constructor() {
		this.authClient = null;
		this.isInitialized = false;
		this.initializationPromise = null;
	}

	/**
	 * Initialize the auth client and restore any existing session
	 */
	async initialize(): Promise<AuthClient> {
		if (this.isInitialized && this.authClient) {
			return this.authClient;
		}

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
	private async _initializeClient(): Promise<AuthClient> {
		try {
			this.authClient = await AuthClient.create({
				idleOptions: {
					disableIdle: process.env.DFX_NETWORK !== "ic",
					idleTimeout: process.env.DFX_NETWORK === "ic" ? 30 * 60 * 1000 : undefined
				}
			} as AuthClientCreateOptions);

			this.isInitialized = true;
			return this.authClient;
		} catch (error) {
			console.error("Failed to initialize AuthClient:", error);
			throw new Error("Authentication initialization failed");
		}
	}

	/**
	 * Check if user is currently authenticated
	 */
	async isAuthenticated(): Promise<boolean> {
		if (!this.authClient) {
			await this.initialize();
		}
		return this.authClient!.isAuthenticated();
	}

	/**
	 * Get the current identity if authenticated
	 */
	async getIdentity(): Promise<Identity | null> {
		if (!this.authClient) {
			await this.initialize();
		}

		const isAuth = await this.authClient!.isAuthenticated();
		if (!isAuth) {
			return null;
		}

		return this.authClient!.getIdentity();
	}

	/**
	 * Login with Internet Identity
	 */
	async login(options: LoginOptions = {}): Promise<Identity> {
		if (!this.authClient) {
			await this.initialize();
		}

		const defaultOptions: LoginOptions = {
			identityProvider: this._getIdentityProvider(),
			maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
			...options
		};

		const { resolve, reject, promise } = Promise.withResolvers<Identity>();
		this.authClient!.login({
			...defaultOptions,
			onSuccess: async () => {
				try {
					const identity = await this.authClient!.getIdentity();
					resolve(identity);
				} catch (error) {
					reject(error);
				}
			},
			onError: (error: unknown) => {
				reject(error);
			}
		});

		return promise;
	}

	/**
	 * Logout and clear session
	 */
	async logout(): Promise<void> {
		if (!this.authClient) {
			return;
		}

		try {
			await this.authClient.logout();
		} catch (error) {
			console.error("Logout error:", error);
		}
	}

	/**
	 * Get the appropriate identity provider URL based on environment
	 * @private
	 */
	private _getIdentityProvider(): string {
		if (process.env.DFX_NETWORK === "ic") {
			return "https://identity.ic0.app/#authorize";
		}
		return `http://asrmz-lmaaa-aaaaa-qaaeq-cai.localhost:4943/#authorize`;
	}

	/**
	 * Get the AuthClient instance (for backward compatibility)
	 */
	getAuthClient(): AuthClient | null {
		return this.authClient;
	}
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
