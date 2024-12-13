import { NavLink } from "react-router";

// hooks
import useStore from "../../store/store.js";

// components
import Loader from "../../common/components/Loader/Loader.jsx";

// styles
import "./CategoryNav.scss";

function CategoryNav() {
	const categories = useStore(state => state.categories);

	if (!categories) {
		return <Loader />;
	}
	return (
		<section className="main-page__category-selector">
			<h4>Kategorie produktów</h4>
			{!categories && <Loader />}
			{categories && (
				<nav className="main-page__category-selector__nav">
					<ul>
						{categories.map(({ name, children }, i) => (
							<li key={i} className="category-item">
								<NavLink to={`/?category=${name}`}>{name}</NavLink>
								{children && children.length > 0 && (
									<ul className="dropdown">
										{children.map((child, j) => (
											<li key={j}>
												<NavLink to={`/?category=${name}/${child.name}`}>{child.name}</NavLink>
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
