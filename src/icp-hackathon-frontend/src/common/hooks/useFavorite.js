import { useState } from "react";
import { useIdentity } from "@nfid/identitykit/react";
import { icp_hackathon_backend as backend } from "../../../../declarations/icp-hackathon-backend/index.js";

// hooks
import useStore from "../../store/store.js";
import useIsFavorite from "./useIsFavorite.js";
import { useAuthenticatedActor } from "./useActor.js";

function useFavorite(id) {
	const identity = useIdentity();
	const addFavorite = useStore(state => state.addFavorite);
	const isFavorite = useIsFavorite(id);
	const [loading, setLoading] = useState(false);
	const [actorLoading, actor] = useAuthenticatedActor();

	return {
		isFavorite,
		loading,
		addFavorite: async () => {
			if (isFavorite || loading || !identity || actorLoading) return;
			setLoading(true);
			try {
				await actor.add_favorite_listing(id);
				addFavorite(id);
			} catch (error) {
				console.error(error);
				alert("Wystąpił nieznany błąd! Proszę spróbować ponownie.");
			} finally {
				setLoading(false);
			}
		},
		removeFavorite: async () => {
			if (!isFavorite || loading || !identity) return;
			setLoading(true);
			try {
				// TODO: remove_favorite_listing is not implemented in the backend
				await backend.remove_favorite_listing(id);
			} catch (error) {
				console.error(error);
				alert("Wystąpił nieznany błąd! Proszę spróbować ponownie.");
			} finally {
				setLoading(false);
			}
		}
	};
}

export default useFavorite;
