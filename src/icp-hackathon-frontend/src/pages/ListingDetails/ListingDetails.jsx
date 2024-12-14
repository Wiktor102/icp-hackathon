import { useMemo } from "react";
import { useParams } from "react-router";

// hooks
import useListing from "../../common/hooks/useListing.js";
import useStore from "../../store/store.js";

// components
import Button from "../../common/Button";
import Loader from "../../common/components/Loader/Loader.jsx";
import ContactInfo from "../../common/components/ContactInfo/ContactInfo";
import PageHeader from "../../common/components/PageHeader/PageHeader.jsx";
import ImageCarousel from "../../common/components/ImageCarousel/ImageCarousel.jsx";

import "./ListingDetails.scss";

function ListingDetails() {
	const { productId } = useParams();
	const user = useStore(state => state.user);

	const { listing, loading, error } = useListing(+productId);
	const { title, description, price, images = [], reviews, ...rest } = listing ?? {};

	const img = useMemo(
		() => (images.length > 0 ? [images[0], images[0]] : []).map(i => "data:image/jpeg;base64," + atob(i)),
		[images]
	);
	const formattedPrice = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(price);
	const favorite = false;

	if (loading || error) return <Loader />;
	console.log(rest);
	return (
		<main className="listing-details">
			<PageHeader>
				<div className="category">{rest.categories_path.split("/").join(" / ")}</div>
			</PageHeader>
			<section className="listing-details__layout">
				<ImageCarousel images={img} title={title} />
				<div className="listing-details__info">
					<h1>{title}</h1>
					<p className="rating">
						3.8 <i className="fas fa-star"></i> &nbsp;&nbsp;|&nbsp;&nbsp; {reviews.length} opinii
					</p>
					<div className="price">{formattedPrice}</div>
				</div>
				{/* <ListingContactForm /> */}
				<ContactInfo user={rest.owner} />
				{user && rest.owner.id !== user?.id && (
					<Button>
						{favorite ? <i className="fas fa-star"></i> : <i className="fa-regular fa-star"></i>}
						{favorite ? "Usuń z" : "Dodaj do"} ulubionych
					</Button>
				)}
				{rest.owner.id === user?.id && (
					<Button>
						<i className="fas fa-pencil"></i> Edytuj ogłoszenie
					</Button>
				)}
			</section>
			<article className="listing-details__description">
				<h2>Opis produktu</h2>
				{description}
			</article>
		</main>
	);
}

function ListingContactForm() {
	return (
		<form className="listing-details__contact-form">
			<h3>Skontaktuj się z ogłoszeniodawcą</h3>
			<div>
				<label htmlFor="name">Imię</label>
				<input type="text" id="name" />
			</div>
			<div>
				<label htmlFor="email">Adres e-mail</label>
				<input type="email" id="email" />
			</div>
			<div className="message-container">
				<label htmlFor="message">Wiadomość</label>
				<textarea id="message"></textarea>
			</div>
			<Button>
				Wyślij <i className="fas fa-envelope"></i>
			</Button>
		</form>
	);
}

export default ListingDetails;
