import useStore from "../../store/store.js";

function useIsFavorite(id) {
	const favorites = useStore(state => state.user)?.favorites;
	return favorites?.includes(id);
}

export default useIsFavorite;
