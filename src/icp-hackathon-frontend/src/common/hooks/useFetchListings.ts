import { icp_hackathon_backend as backend } from "../../../../declarations/icp-hackathon-backend/index.js";
import useStore from "../../store/store.js";
import { useCanister } from "./useCanister";
import { useQuery } from "@tanstack/react-query";
import { Listing } from "../../../../declarations/icp-hackathon-backend/icp-hackathon-backend.did.js";

function parseBackendListing(l: Listing) {
	return {
		...l,
		id: Number(l.id),
		reviews: l.reviews.flat(),
		images: Array.from(l.images_id).map(id => Number(id)),
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
	const { actor } = useCanister();
	const addListings = useStore(state => state.addListings);

	const { data, error, isLoading } = useQuery({
		queryKey: ["listings"],
		enabled: !!actor,
		queryFn: async () => {
			const response = await actor!.get_listings();
			const parsed = response.map(parseBackendListing);
			addListings(...parsed);
			return parsed;
		}
	});

	return { data, error, isLoading };
}

function useFetchCategoryListings(category: string) {
	const addListings = useStore(state => state.addListings);

	const { data, error, isLoading, refetch } = useQuery({
		queryKey: ["categoryListings", category],
		enabled: !!category,
		queryFn: async () => {
			const response = await backend.get_listings_id_by_category(category);
			const parsed = response.map(parseBackendListing);
			addListings(...parsed);
			return parsed;
		}
	});

	return { data, error, isLoading, refetch };
}

function useFetchListingsByIds(ids: number[]) {
	const listings = useStore(state => state.listings);
	const addListings = useStore(state => state.addListings);

	const { data, error, isLoading, refetch } = useQuery({
		queryKey: ["listingsByIds", ids],
		enabled: ids.length > 0,
		queryFn: async () => {
			const idsToFetch = ids.filter(id => !listings[id]);
			if (idsToFetch.length === 0) return [];
			// Convert numbers to bigint for the backend call
			const response = await backend.get_listings_by_id(idsToFetch.map(id => BigInt(id)));
			const parsed = response.map(parseBackendListing);
			addListings(...parsed);
			return parsed;
		}
	});

	return { data, error, isLoading, refetch };
}

export { useFetchListings, useFetchCategoryListings, parseBackendListing, useFetchListingsByIds };
export default useFetchListings;
