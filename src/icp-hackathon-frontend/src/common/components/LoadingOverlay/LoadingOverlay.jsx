import Loader from "../Loader/Loader.jsx";

import "./LoadingOverlay.scss";

function LoadingOverlay() {
	return (
		<div className="loading-overlay">
			<Loader />
		</div>
	);
}

export default LoadingOverlay;
