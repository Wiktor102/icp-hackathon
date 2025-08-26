import { useEffect, useMemo, useState, useTransition } from "react";
import { NavLink, useSearchParams } from "react-router";

// hooks
import useStore from "../store/store.js";
import { useFetchCategoryListings } from "../common/hooks/useFetchListings.js";

// components
import Grid from "./Grid/Grid";
import List from "./List/List";
import Button from "../common/Button.jsx";
import CategoryNav from "./CategoryNav/CategoryNav.jsx";
import Empty from "../common/components/Empty/Empty.jsx";
import Loader from "../common/components/Loader/Loader.jsx";
import SubtleButton from "../common/components/SubtleButton/SubtleButton.jsx";

// styles
import "./Home.scss";

function Home() {
	const user = useStore(state => state.user);
	const allListings = useStore(state => state.listings);

	const [listingsToDisplay, setListingsToDisplay] = useState(Object.values(allListings));
	const [isList, setIsList] = useState(false);

	const fetchCategoryListings = useFetchCategoryListings();
	const [isPending, startTransition] = useTransition();
	const [searchParams] = useSearchParams();
	const category = useMemo(() => searchParams.get("category"), [searchParams]);

	function switchDisplayMode() {
		setIsList(c => !c);
	}

	useEffect(() => {
		if (!category) return;
		fetchCategoryListings(category);
	}, [category]);

	useEffect(() => {
		startTransition(() => {
			if (!category) {
				setListingsToDisplay(Object.values(allListings));
			} else {
				const filtered = Object.values(allListings).filter(listing => listing.category.path.startsWith(category));
				setListingsToDisplay(filtered);
			}
		});
	}, [category, allListings]);

	return (
		<main className="main-page">
			{user?.initialised === false && (
				<WarningCard>
					Complete your profile to be able to add listings <NavLink to="/profile">Go to profile</NavLink>
				</WarningCard>
			)}
			{/* <form className="main-page__search-container">
				<label htmlFor="search">Szukaj produktów</label>
				<input type="search" id="search" placeholder="np. Ozdoby świąteczne" />
				<button>
					<i className="fas fa-search"></i>
				</button>
			</form> */}
			<CategoryNav />
			<section className="main-page__toolbar">
				<div className="main-page__toolbar__sort">
					<span>
						<i className="fas fa-arrow-down-wide-short"></i> Sort by:
					</span>
					<select name="" id="">
						<option value="">Newest</option>
						<option value="">Oldest</option>
						<option value="">Popularity: Highest</option>
						<option value="">Price: Descending</option>
						<option value="">Price: Ascending</option>
					</select>
				</div>
				<SubtleButton
					icon={<i className={`fas fa-${isList ? "border-all" : "list"}`}></i>}
					text={isList ? "Grid View" : "List View"}
					onClick={switchDisplayMode}
				/>
			</section>
			{isPending && <Loader />}
			{!isPending && listingsToDisplay.length > 0 && (
				<>{isList ? <List listings={listingsToDisplay} /> : <Grid listings={listingsToDisplay} />}</>
			)}
			{!isPending && listingsToDisplay.length === 0 && <Empty>No listings in this category</Empty>}
			{user && user.initialised && (
				<div className="main-page__add-listing-btn-container">
					<NavLink to="/add">
						<Button tabIndex={-1}>
							<i className="fas fa-plus"></i>
							Add Listing
						</Button>
					</NavLink>
				</div>
			)}
		</main>
	);
}

function WarningCard({ children }) {
	return (
		<div className="warning-card">
			<i className="fas fa-exclamation-triangle"></i>
			{children}
		</div>
	);
}

export default Home;
