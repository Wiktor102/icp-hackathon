import { useState, useEffect } from "react";
import useStore from "../../store/store";
import { icp_hackathon_backend as backend } from "../../../../declarations/icp-hackathon-backend/index.js";

function useImage(...ids) {
	const [images, setImages] = useState({});
	const [loading, setLoading] = useState(false);
	const { getImageFromCache, addImageToCache } = useStore();

	useEffect(() => {
		if (!ids.length) return;

		let pendingRequests = 0;
		setLoading(true);

		ids.forEach(id => {
			const cachedImage = getImageFromCache(id);
			if (cachedImage) {
				setImages(prev => ({ ...prev, [id]: cachedImage }));
				return;
			}

			pendingRequests++;
			backend
				.get_image_by_id(id)
				.then(([response]) => {
					if (response) {
						const imageData = "data:image/jpeg;base64," + atob(response);
						setImages(prev => ({ ...prev, [id]: imageData }));
						addImageToCache(id, imageData);
					}
				})
				.finally(() => {
					pendingRequests--;
					if (pendingRequests === 0) {
						setLoading(false);
					}
				});
		});

		// If all images were cached, set loading to false
		if (pendingRequests === 0) {
			setLoading(false);
		}
	}, [ids.join(",")]);

	return [loading, ...Object.values(images)];
}

export default useImage;
