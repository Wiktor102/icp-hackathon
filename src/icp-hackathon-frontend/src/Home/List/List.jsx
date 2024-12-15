import { Link } from "react-router";
import { useIdentity } from "@nfid/identitykit/react";

// hooks
import useImage from "../../common/hooks/useImage.js";
import useFavorite from "../../common/hooks/useFavorite.js";
import useCalculateAvgReview from "../../common/hooks/useCalculateAvgReview.js";

// components
import Button from "../../common/Button";
import Loader from "../../common/components/Loader/Loader.jsx";

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

function ListItem({ id, images, title, description, price, reviews }) {
	const [imgLoading, img] = useImage(images[0]);
	const formattedPrice = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(price);
	const shortDescription = description.split(" ").slice(0, 20).join(" ") + "...";
	const avgRating = useCalculateAvgReview(id);

	const identity = useIdentity();
	const { isFavorite, loading, addFavorite, removeFavorite } = useFavorite(id);
	function toggleFavorite(e) {
		e.stopPropagation();
		e.preventDefault();

		if (isFavorite) {
			removeFavorite();
		} else {
			addFavorite();
		}
	}

	return (
		<Link to={`/product/${id}`}>
			<div className="main-page__list__item">
				<img src={img} alt={title} />
				<div className="main-page__list__item__middle-collumn">
					<h4>{title}</h4>
					<p className="rating">
						{avgRating} <i className="fas fa-star"></i>
					</p>
					<p className="reviews">{reviews.length} opinii</p>
					<p className="description">{shortDescription}</p>
				</div>
				<div className="main-page__list__item__last-collumn">
					<p className="price">{formattedPrice}</p>
					{identity && (
						<Button onClick={toggleFavorite}>
							{!loading && (
								<>
									{isFavorite ? <i className="fas fa-star"></i> : <i className="fa-regular fa-star"></i>}
									{isFavorite ? "Usuń z" : "Dodaj do"} ulubionych
								</>
							)}
							{loading && <Loader />}
						</Button>
					)}
				</div>
			</div>
		</Link>
	);
}

export default List;
