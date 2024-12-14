import { useMemo } from "react";
import { Link } from "react-router";
import Button from "../../common/Button";

import "./List.scss";

function List({ listings }) {
	return (
		<section className="main-page__list">
			{listings.map(listing => (
				<ListItem
					key={listing.id}
					{...{
						id: listing.id,
						title: listing.title,
						price: listing.price,
						images: listing.images,
						description: listing.description,
						// category: listing.category,
						// categoryPath: listing.categories_path,
						reviews: listing.reviews,
						date: listing.date
					}}
				/>
			))}
		</section>
	);
}

function ListItem({ id, images, title, description, price, reviews, favorite }) {
	const img = useMemo(() => "data:image/jpeg;base64," + atob(images[0]), [images]);
	const formattedPrice = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(price);
	const shortDescription = description.split(" ").slice(0, 20).join(" ") + "...";

	return (
		<Link to={`/product/${id}`}>
			<div className="main-page__list__item">
				<img src={img} alt={title} />
				<div className="main-page__list__item__middle-collumn">
					<h4>{title}</h4>
					<p className="rating">
						{reviews.length === 0 ? "-" : (5).toFixed(1)} <i className="fas fa-star"></i>
					</p>
					<p className="reviews">{reviews.length} opinii</p>
					<p className="description">{shortDescription}</p>
				</div>
				<div className="main-page__list__item__last-collumn">
					<p className="price">{formattedPrice}</p>
					<Button>
						{favorite ? <i className="fas fa-star"></i> : <i className="fa-regular fa-star"></i>}
						{favorite ? "Usuń z" : "Dodaj do"} ulubionych
					</Button>
				</div>
			</div>
		</Link>
	);
}

export default List;
