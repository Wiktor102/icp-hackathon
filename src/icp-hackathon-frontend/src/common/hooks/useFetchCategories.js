import { useQuery } from "@tanstack/react-query";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";
import useStore from "../../store/store.js";

const renameKeys = arr => {
	return arr.map(obj => {
		if (obj.lower_categories) {
			return {
				...obj,
				children: renameKeys(obj.lower_categories)[0],
				lower_categories: undefined
			};
		}
		return obj;
	});
};

function useFetchCategories() {
	const setCategories = useStore(state => state.setCategories);
	const categories = useStore(state => state.categories);

	const query = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const response = await backend.get_categories();
			const parsed = renameKeys(response);
			setCategories(parsed);
			return parsed;
		},
		enabled: categories == null // only fetch if not already in store
	});

	return query;
}

export default useFetchCategories;
