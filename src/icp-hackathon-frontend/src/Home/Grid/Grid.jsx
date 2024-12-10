import { Link } from "react-router";
import Button from "../../common/Button";
import "./Grid.scss";

function Grid() {
	return (
		<section className="main-page__grid">
			{new Array(5).fill(0).map((_, i) => (
				<GridItem
					key={i}
					id={i}
					name={"Testowy długi tytuł ogłoszenia bo tak"}
					img={"https://picsum.photos/300/200"}
					price={32.76}
					rating={3.8}
					reviewsCount={321}
				/>
			))}
		</section>
	);
}

function GridItem({ id, name, img, price, rating, reviewsCount }) {
	const formattedPrice = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(price);

	return (
		<Link to={`/product/${id}`}>
			<div className="main-page__grid__item">
				<img src={img} alt={name} />
				<div className="main-page__grid__item__top-row">
					<p className="price">{formattedPrice}</p>
					<p className="rating">
						{rating} <i className="fas fa-star"></i>
					</p>
					<p className="reviews">{reviewsCount} opinii</p>
				</div>
				<h4>{name}</h4>
				<Button>
					Dodaj do koszyka <i className="fas fa-cart-plus"></i>
				</Button>
			</div>
		</Link>
	);
}

export default Grid;
