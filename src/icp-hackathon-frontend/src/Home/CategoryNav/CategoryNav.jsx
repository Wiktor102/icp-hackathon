import { useMemo } from "react";
import { NavLink, useSearchParams } from "react-router";

// hooks
import useStore from "../../store/store.js";

// components
import Loader from "../../common/components/Loader/Loader.jsx";
import SubtleButton from "../../common/components/SubtleButton/SubtleButton.jsx";

// styles
import "./CategoryNav.scss";

function CategoryNav() {
	const categories = useStore(state => state.categories);

	const [searchParams] = useSearchParams();
	const category = useMemo(() => searchParams.get("category"), [searchParams]);

	return (
		<section className="main-page__category-selector">
			<h4>
				{category && (
					<NavLink to="">
						<SubtleButton icon={<i className="fas fa-arrow-left"></i>} />
					</NavLink>
				)}{" "}
				Product Categories
			</h4>
			<nav className="main-page__category-selector__nav">
				{!categories && (
					<div className="main-page__category-selector__loader-container">
						<Loader />
					</div>
				)}
				{categories && (
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
				)}
			</nav>
		</section>
	);
}

export default CategoryNav;
