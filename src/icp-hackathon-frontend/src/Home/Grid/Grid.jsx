import { useMemo } from "react";
import { Link } from "react-router";

// components
import Button from "../../common/Button";

// utils
// import { bigIntToImage } from "../../common/utils.js";

// styles
import "./Grid.scss";

function Grid({ listings }) {
	return (
		<section className="main-page__grid">
			{listings.map(listing => (
				<GridItem
					key={listing.id}
					{...{
						id: listing.id,
						title: listing.title,
						price: listing.price,
						images: listing.images,
						// description: listing.description,
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

function GridItem({ id, images, title, price, reviews, favorite }) {
	const img = useMemo(() => "data:image/jpeg;base64," + atob(images[0]), [images]);
	const formattedPrice = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(price);

	return (
		<Link to={`/product/${id}`}>
			<div className="main-page__grid__item">
				<img src={img} alt={title} />
				<div className="main-page__grid__item__top-row">
					<p className="price">{formattedPrice}</p>
					<p className="rating">
						{(5).toFixed(1)} <i className="fas fa-star"></i>
					</p>
					<p className="reviews">{reviews.length} opinii</p>
				</div>
				<h4>{title}</h4>
				<Button>
					{favorite ? <i className="fas fa-star"></i> : <i className="fa-regular fa-star"></i>}
					{favorite ? "Usuń z" : "Dodaj do"} ulubionych
				</Button>
			</div>
		</Link>
	);
}

export default Grid;
