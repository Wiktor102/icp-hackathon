import Grid from "./Grid/Grid";
import "./Home.scss";

function Home() {
	return (
		<main className="main-page">
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
			</section>
			<Grid />
		</main>
	);
}

export default Home;
