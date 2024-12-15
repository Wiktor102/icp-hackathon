import { useState, useEffect } from "react";
import useStore from "../../store/store";
import { icp_hackathon_backend as backend } from "../../../../declarations/icp-hackathon-backend/index.js";

function useImage(id) {
	const [image, setImage] = useState(null);
	const [loading, setLoading] = useState(true);
	const { getImageFromCache, addImageToCache } = useStore();

	useEffect(() => {
		if (!id) return;

		const cachedImage = getImageFromCache(id);
		if (cachedImage) {
			setImage(cachedImage);
			setLoading(false);
			return;
		}

		setLoading(true);
		backend
			.get_image_by_id(id)
			.then(([response]) => {
				if (response) {
					const imageData = "data:image/jpeg;base64," + atob(response);
					console.log(imageData);
					setImage(imageData);
					addImageToCache(id, imageData);
				}
			})
			.finally(() => setLoading(false));
	}, [id]);

	return [loading, image];
}

export default useImage;
