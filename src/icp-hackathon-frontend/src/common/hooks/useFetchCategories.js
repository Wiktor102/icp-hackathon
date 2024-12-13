import { useEffect } from "react";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";
import useStore from "../../store/store.js";

function useFetchCategories() {
	const categories = useStore(state => state.categories);
	const setCategories = useStore(state => state.setCategories);

	async function fetchCategories() {
		try {
			const response = await backend.get_categories();
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

			const transformedResponse = renameKeys(response);
			setCategories(transformedResponse);
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		if (categories != null) return;
		fetchCategories();
	}, [categories]);
}

export default useFetchCategories;
