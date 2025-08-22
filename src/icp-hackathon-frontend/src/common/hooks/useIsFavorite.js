import useStore from "../../store/store.js";
import useUser from "./useUser.js";

function useIsFavorite(id) {
	// Try to get favorites from React Query user first, fallback to store
	const { user: queryUser } = useUser();
	const storeUser = useStore(state => state.user);

	// Use React Query user data if available, otherwise fallback to store
	const user = queryUser || storeUser;
	const favorites = user?.favorites;

	return favorites?.includes(id);
}

export default useIsFavorite;
