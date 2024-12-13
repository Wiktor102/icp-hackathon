import { useEffect } from "react";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";

// hooks
import useStore from "../../store/store.js";

// styles
import "./CategoryNav.scss";

function CategoryNav() {
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

	return (
		<section className="main-page__category-selector">
			<h4>Kategorie produktów</h4>
			{!categories && (
				<div className="ball-clip-rotate">
					<div></div>
				</div>
			)}
			{categories && (
				<nav className="main-page__category-selector__nav">
					<ul>
						{categories.map(({ name, children }, i) => (
							<li key={i} className="category-item">
								<button>{name}</button>
								{children && children.length > 0 && (
									<ul className="dropdown">
										{children.map((child, j) => (
											<li key={j}>
												<button>{child.name}</button>
											</li>
										))}
									</ul>
								)}
							</li>
						))}
					</ul>
				</nav>
			)}
		</section>
	);
}

export default CategoryNav;
