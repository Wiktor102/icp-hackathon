import { Link } from "react-router";
import Button from "../../common/Button";

import "./List.scss";

function List() {
	return (
		<section className="main-page__list">
			{new Array(5).fill(0).map((_, i) => (
				<ListItem
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

function ListItem({ id, name, img, price, rating, reviewsCount }) {
	const formattedPrice = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(price);

	return (
		<Link to={`/product/${id}`}>
			<div className="main-page__list__item">
				<img src={img} alt={name} />
				<div className="main-page__list__item__middle-collumn">
					<h4>{name}</h4>
					<p className="rating">
						{rating} <i className="fas fa-star"></i>
					</p>
					<p className="reviews">{reviewsCount} opinii</p>
				</div>
				<div className="main-page__list__item__last-collumn">
					<p className="price">{formattedPrice}</p>
					<Button>
						Dodaj do koszyka <i className="fas fa-cart-plus"></i>
					</Button>
				</div>
			</div>
		</Link>
	);
}

export default List;
