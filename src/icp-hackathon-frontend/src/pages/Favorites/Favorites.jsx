import { useMemo } from "react";

// hooks
import useStore from "../../store/store.js";
import useProtectRoute from "../../common/hooks/useProtectRoute.js";
import { useFetchListingsByIds } from "../../common/hooks/useFetchListings.js";

// components
import List from "../../Home/List/List.jsx";
import Empty from "../../common/components/Empty/Empty.jsx";
import PageHeader from "../../common/components/PageHeader/PageHeader.jsx";

import "./Favorites.scss";

function Favorites() {
	const favorites = useStore(state => state.user?.favorites) ?? [];
	const allListings = useStore(state => state.listings);
	const favoritesListings = useMemo(
		() => Object.values(allListings).filter(listing => favorites?.includes(listing.id)),
		[favorites, allListings]
	);

	useFetchListingsByIds(favorites);

	if (useProtectRoute() !== "ok") return null;
	return (
		<div className="favorites-page">
			<PageHeader>
				<h1>Ulubione</h1>
			</PageHeader>
			{favoritesListings.length === 0 && (
				<Empty icon={<i className="fa-solid fa-heart-circle-minus"></i>}>Brak ulubionych ofert</Empty>
			)}
			{favoritesListings.length > 0 && <List listings={favoritesListings} />}
		</div>
	);
}

export default Favorites;
