// hooks
import useProtectRoute from "../common/hooks/useProtectRoute.js";

// components
import PageHeader from "../common/components/PageHeader/PageHeader.jsx";
import List from "../Home/List/List.jsx";

import "./Favorites.scss";

function Favorites() {
	// if (useProtectRoute()) return null;
	return (
		<div className="favorites-page">
			<PageHeader>
				<h1>Ulubione</h1>
			</PageHeader>
			<List />
		</div>
	);
}

export default Favorites;
