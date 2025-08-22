import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackendMutation } from "./useBackend.js";
import useStore from "../../store/store.js";
import useIsFavorite from "./useIsFavorite.js";

/**
 * React Query version of useFavorite hook
 * Much cleaner with automatic error handling and cache updates
 */
function useFavorite(id) {
	const queryClient = useQueryClient();
	const addFavoriteToStore = useStore(state => state.addFavorite);
	const isFavorite = useIsFavorite(id);

	// Mutation for adding favorite
	const addFavoriteMutation = useBackendMutation("add_favorite_listing", {
		invalidateQueries: [
			["user", "favorites"],
			["user", "active"]
		],
		onSuccess: () => {
			// Update local store
			addFavoriteToStore(id);

			// Show success message
			console.log("Added to favorites");
		},
		onError: error => {
			alert("Failed to add to favorites. Please try again.");
		}
	});

	// Mutation for removing favorite
	const removeFavoriteMutation = useBackendMutation("remove_favorite_listing", {
		invalidateQueries: [
			["user", "favorites"],
			["user", "active"]
		],
		onSuccess: () => {
			// Update cache optimistically
			queryClient.invalidateQueries(["user"]);
			console.log("Removed from favorites");
		},
		onError: error => {
			alert("Failed to remove from favorites. Please try again.");
		}
	});

	return {
		isFavorite,
		loading: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,

		addFavorite: () => {
			if (isFavorite || addFavoriteMutation.isPending) return;
			addFavoriteMutation.mutate([id]);
		},

		removeFavorite: () => {
			if (!isFavorite || removeFavoriteMutation.isPending) return;
			removeFavoriteMutation.mutate([id]);
		},

		// Additional states from React Query
		addError: addFavoriteMutation.error,
		removeError: removeFavoriteMutation.error,
		isAddingFavorite: addFavoriteMutation.isPending,
		isRemovingFavorite: removeFavoriteMutation.isPending
	};
}

export default useFavorite;
