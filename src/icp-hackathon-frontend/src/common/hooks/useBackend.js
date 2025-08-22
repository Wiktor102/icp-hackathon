import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedActor } from "./useActor.js";
import useAuth from "./useAuth.js";

/**
 * Generic hook for making ICP backend calls with React Query
 * Provides automatic retry, caching, and error handling for any backend method
 */
export function useBackendCall(queryKey, method, options = {}) {
	const { logout } = useAuth();
	const [actorLoading, actor] = useAuthenticatedActor();
	const queryClient = useQueryClient();

	const { enabled = true, args = [], onSuccess, onError, ...queryOptions } = options;

	return useQuery({
		queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
		queryFn: async () => {
			if (!actor) {
				throw new Error("Actor not available");
			}

			if (typeof actor[method] !== "function") {
				throw new Error(`Method ${method} not found on actor`);
			}

			return await actor[method](...args);
		},
		enabled: enabled && !actorLoading && !!actor,
		retry: (failureCount, error) => {
			// Don't retry signature errors after 2 attempts
			if (error.message?.includes("Invalid signature") && failureCount >= 2) {
				return false;
			}
			return failureCount < 3;
		},
		retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
		onSuccess: data => {
			if (onSuccess) onSuccess(data);
		},
		onError: error => {
			console.error(`Error calling ${method}:`, error);

			// Force logout on persistent signature errors
			if (error.message?.includes("Invalid signature")) {
				console.warn("Persistent signature error, forcing logout");
				logout();
				queryClient.clear();
			}

			if (onError) onError(error);
		},
		...queryOptions
	});
}

/**
 * Generic hook for making ICP backend mutations with React Query
 */
export function useBackendMutation(method, options = {}) {
	const { logout } = useAuth();
	const [actorLoading, actor] = useAuthenticatedActor();
	const queryClient = useQueryClient();

	const { onSuccess, onError, invalidateQueries = [], ...mutationOptions } = options;

	return useMutation({
		mutationFn: async (args = []) => {
			if (!actor) {
				throw new Error("Actor not available");
			}

			if (typeof actor[method] !== "function") {
				throw new Error(`Method ${method} not found on actor`);
			}

			const argsArray = Array.isArray(args) ? args : [args];
			return await actor[method](...argsArray);
		},
		onSuccess: (data, variables) => {
			// Invalidate specified queries
			if (invalidateQueries.length > 0) {
				invalidateQueries.forEach(queryKey => {
					queryClient.invalidateQueries(queryKey);
				});
			}

			if (onSuccess) onSuccess(data, variables);
		},
		onError: (error, variables) => {
			console.error(`Error calling ${method}:`, error);

			// Force logout on signature errors
			if (error.message?.includes("Invalid signature")) {
				console.warn("Persistent signature error, forcing logout");
				logout();
				queryClient.clear();
			}

			if (onError) onError(error, variables);
		},
		...mutationOptions
	});
}

/**
 * Specific hook for fetching listings with enhanced features
 */
export function useListings(options = {}) {
	return useBackendCall("listings", "get_listings", {
		staleTime: 2 * 60 * 1000, // 2 minutes
		...options
	});
}

/**
 * Specific hook for fetching user's listings
 */
export function useUserListings(options = {}) {
	return useBackendCall(["listings", "user"], "get_listings_by_active_user", {
		staleTime: 1 * 60 * 1000, // 1 minute
		...options
	});
}

/**
 * Specific hook for fetching categories
 */
export function useCategories(options = {}) {
	return useBackendCall("categories", "get_categories", {
		staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
		...options
	});
}

/**
 * Specific hook for creating a listing
 */
export function useCreateListing(options = {}) {
	return useBackendMutation("create_listing", {
		invalidateQueries: [["listings"], ["listings", "user"]],
		...options
	});
}

/**
 * Specific hook for updating a listing
 */
export function useUpdateListing(options = {}) {
	return useBackendMutation("edit_listing", {
		invalidateQueries: [["listings"], ["listings", "user"]],
		...options
	});
}

/**
 * Specific hook for deleting a listing
 */
export function useDeleteListing(options = {}) {
	return useBackendMutation("delete_listing", {
		invalidateQueries: [["listings"], ["listings", "user"]],
		...options
	});
}
