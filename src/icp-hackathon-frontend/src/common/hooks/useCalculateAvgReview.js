import { useMemo } from "react";
import useListing from "./useListing.js";

function useCalculateAvgReview(listingId) {
	const { listing, loading, error } = useListing(listingId);
	const { reviews } = listing ?? {};

	const avgRating = useMemo(() => {
		if (loading || error || !reviews?.length) return "-";
		const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
		return (sum / reviews.length).toFixed(1);
	}, [reviews]);

	return avgRating;
}

export default useCalculateAvgReview;
