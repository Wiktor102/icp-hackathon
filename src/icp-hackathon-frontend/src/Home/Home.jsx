import { useState } from "react";
import { NavLink } from "react-router";

// hooks
import useStore from "../store/store.js";

// components
import Grid from "./Grid/Grid";
import List from "./List/List";

import "./Home.scss";

function Home() {
	const [isList, setIsList] = useState(false);
	const userInitialised = useStore(state => state.user)?.initialised;

	function switchDisplayMode() {
		setIsList(c => !c);
	}

	return (
		<main className="main-page">
			{userInitialised === false && (
				<WarningCard>
					Uzupełnij swój profil, aby móc dodawać ogłoszenia <NavLink to="/profile">Przejdź do profilu</NavLink>
				</WarningCard>
			)}
			<form className="main-page__search-container">
				<label htmlFor="search">Szukaj produktów</label>
				<input type="search" id="search" placeholder="np. Ozdoby świąteczne" />
				<button>
					<i className="fas fa-search"></i>
				</button>
			</form>
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
				<button className="main-page__toolbar__view" onClick={switchDisplayMode}>
					<i className={`fas fa-${isList ? "border-all" : "list"}`}></i>
				</button>
			</section>
			{isList ? <List /> : <Grid />}
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
