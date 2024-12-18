import { useEffect, useRef } from "react";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";
import useStore from "../../store/store.js";

function parseBackendListing(l) {
	return {
		...l,
		reviews: l.reviews.flat(),
		images: l.images_id,
		ownerId: l.owner_id,
		category: {
			path: l.categories_path,
			name: l.category
		},
		categories_path: undefined
		// owner: {
		// 	...l.owner,
		// 	phone: l.owner.phone_number,
		// 	company: l.owner.company_name,
		// 	company_name: undefined,
		// 	phone_number: undefined,
		// 	initialised: true
		// }
	};
}

function useFetchListings() {
	const addListings = useStore(state => state.addListings);
	const fetched = useRef(false);

	async function fetchListings() {
		try {
			const response = await backend.get_listings();
			addListings(...response.map(parseBackendListing));
		} catch (error) {
			console.error("(fetch listings) Backend error: " + error);
		}
	}

	useEffect(() => {
		if (fetched.current) return;
		fetched.current = true;
		fetchListings();
	}, []);
}

function useFetchCategoryListings() {
	const addListings = useStore(state => state.addListings);

	async function fetchListings(category) {
		try {
			const response = await backend.get_listings_by_category(category);
			addListings(...response.map(parseBackendListing));
		} catch (error) {
			console.error(error);
		}
	}

	return fetchListings;
}

function useFetchListingsByIds(ids) {
	const listings = useStore(state => state.listings);
	const addListings = useStore(state => state.addListings);

	async function fetchListings(ids) {
		try {
			const response = await backend.get_listings_by_id(ids);
			addListings(...response.map(parseBackendListing));
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		const idsToFetch = ids.filter(id => !listings[id]);
		if (idsToFetch.length === 0) return;
		fetchListings(ids);
	}, [ids]);
}

export { useFetchListings, useFetchCategoryListings, parseBackendListing, useFetchListingsByIds };
export default useFetchListings;
