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
				const filtered = Object.values(allListings).filter(listing => listing.categories_path.startsWith(category));
				setListingsToDisplay(filtered);
			}
		});
	}, [category, allListings]);

	return (
		<main className="main-page">
			{user?.initialised === false && (
				<WarningCard>
					Uzupełnij swój profil, aby móc dodawać ogłoszenia <NavLink to="/profile">Przejdź do profilu</NavLink>
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
						<i className="fas fa-arrow-down-wide-short"></i> Sortuj według:
					</span>
					<select name="" id="">
						<option value="">Najnowsze</option>
						<option value="">Najstarsze</option>
						<option value="">Popularność: największa</option>
						<option value="">Cena: malejąco</option>
						<option value="">Cana: rosnąco</option>
					</select>
				</div>
				<SubtleButton
					icon={<i className={`fas fa-${isList ? "border-all" : "list"}`}></i>}
					text={isList ? "Widok siatki" : "Widok listy"}
					onClick={switchDisplayMode}
				/>
			</section>
			{isPending && <Loader />}
			{!isPending && listingsToDisplay.length > 0 && (
				<>{isList ? <List listings={listingsToDisplay} /> : <Grid listings={listingsToDisplay} />}</>
			)}
			{!isPending && listingsToDisplay.length === 0 && <Empty>Brak ogłoszeń w tej kategori</Empty>}
			{user && user.initialised && (
				<div className="main-page__add-listing-btn-container">
					<NavLink to="/add">
						<Button tabIndex={-1}>
							<i className="fas fa-plus"></i>
							Dodaj ogłoszenie
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
