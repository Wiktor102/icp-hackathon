import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuthenticatedActor } from "./useActor.js";
import useAuth from "./useAuth.js";
import useStore from "../../store/store.js";

/**
 * Custom hook for managing user data with React Query
 * Provides automatic retry, caching, and error handling
 */
export function useUser() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { isAuthenticated, isInitializing, logout } = useAuth();
	const [actorLoading, actor] = useAuthenticatedActor();
	const setUser = useStore(state => state.setUser);
	const setUserLoading = useStore(state => state.setUserLoading);
	const setUserCreating = useStore(state => state.setUserCreating);

	// Helper function to parse backend user data
	const parseBackendUser = user => {
		const parsedUser = {
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone_number,
			company: user.company_name,
			favorites: user.favorites_id ?? [],
			initialised: user.initialised
		};

		parsedUser.initialised = !(
			parsedUser.name === "" &&
			parsedUser.email === "" &&
			parsedUser.phone === "" &&
			parsedUser.company === ""
		);

		return parsedUser;
	};

	// Query for fetching active user
	const userQuery = useQuery({
		queryKey: ["user", "active"],
		queryFn: async () => {
			if (!actor) {
				throw new Error("Actor not available");
			}

			const response = await actor.get_active_user();

			// If no user exists, return null to trigger user creation
			if (Array.isArray(response) && response.length === 0) {
				return null;
			}

			return parseBackendUser(response[0]);
		},
		enabled: isAuthenticated && !isInitializing && !actorLoading && !!actor,
		retry: (failureCount, error) => {
			// Don't retry if it's a signature error after 2 attempts
			if (error.message?.includes("Invalid signature") && failureCount >= 2) {
				return false;
			}
			// Retry up to 3 times for other errors
			return failureCount < 3;
		},
		retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
		onSuccess: userData => {
			if (userData) {
				console.log("Setting user from query:", userData);
				setUser(userData); // Keep store in sync
			}
			setUserLoading(false); // Clear loading state
		},
		onError: error => {
			console.error("Error fetching user:", error);
			setUserLoading(false); // Clear loading state on error

			// If it's a persistent signature error, force logout
			if (error.message?.includes("Invalid signature")) {
				console.warn("Persistent signature error, forcing logout");
				logout();
				queryClient.clear(); // Clear all cached data
			}
		}
	});

	// Mutation for creating empty user
	const createUserMutation = useMutation({
		mutationFn: async () => {
			if (!actor) {
				throw new Error("Actor not available");
			}

			const result = await actor.add_empty_user();

			if (result.Err) {
				throw new Error(result.Err);
			}

			return parseBackendUser(result.Ok);
		},
		onSuccess: newUser => {
			console.log("User created successfully:", newUser);
			setUser(newUser);
			setUserCreating(false); // Clear creating state
			// Update the query cache
			queryClient.setQueryData(["user", "active"], newUser);
			navigate("/profile");
		},
		onError: error => {
			console.error("Error creating user:", error);
			setUserCreating(false); // Clear creating state on error
		}
	});

	// Effect to handle user creation when no user exists
	React.useEffect(() => {
		if (userQuery.data === null && !createUserMutation.isPending && !createUserMutation.isError) {
			setUserCreating(true); // Set creating state
			createUserMutation.mutate();
		}
	}, [userQuery.data, createUserMutation.isPending, createUserMutation.isError]);

	// Clear user data when not authenticated
	React.useEffect(() => {
		if (!isAuthenticated && !isInitializing) {
			setUser(null);
			setUserLoading(false);
			setUserCreating(false);
			queryClient.removeQueries(["user"]);
		}
	}, [isAuthenticated, isInitializing, setUser, setUserLoading, setUserCreating, queryClient]);

	// Sync loading states with query status
	React.useEffect(() => {
		if (userQuery.isLoading) {
			setUserLoading(true);
		}
	}, [userQuery.isLoading, setUserLoading]);

	return {
		// Data
		user: userQuery.data,

		// Loading states
		isLoading: userQuery.isLoading || createUserMutation.isPending,
		isFetching: userQuery.isFetching,
		isCreatingUser: createUserMutation.isPending,

		// Error states
		error: userQuery.error || createUserMutation.error,
		isError: userQuery.isError || createUserMutation.isError,

		// Actions
		refetch: userQuery.refetch,
		createUser: createUserMutation.mutate,

		// Utils
		invalidateUser: () => queryClient.invalidateQueries(["user"]),
		clearUserCache: () => queryClient.removeQueries(["user"])
	};
}

export default useUser;
