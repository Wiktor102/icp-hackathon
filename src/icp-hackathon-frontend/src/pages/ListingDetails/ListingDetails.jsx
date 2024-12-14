import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { icp_hackathon_backend as backend } from "../../../../declarations/icp-hackathon-backend/index.js";

// hooks
import useListing from "../../common/hooks/useListing.js";
import useStore from "../../store/store.js";

// components
import Button from "../../common/Button";
import Loader from "../../common/components/Loader/Loader.jsx";
import ContactInfo from "../../common/components/ContactInfo/ContactInfo";
import PageHeader from "../../common/components/PageHeader/PageHeader.jsx";
import ImageCarousel from "../../common/components/ImageCarousel/ImageCarousel.jsx";
import LoadingOverlay from "../../common/components/LoadingOverlay/LoadingOverlay.jsx";

import "./ListingDetails.scss";

function ListingDetails() {
	const { productId } = useParams();
	const user = useStore(state => state.user);

	const { listing, loading, error } = useListing(+productId);
	const { title, description, price, images = [], reviews, ...rest } = listing ?? {};

	const img = useMemo(() => images.map(i => "data:image/jpeg;base64," + atob(i)), [images]);
	const formattedPrice = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(price);
	const favorite = false;

	const avgRating = useMemo(() => {
		if (!reviews?.length) return "-";
		const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
		return (sum / reviews.length).toFixed(1);
	}, [reviews]);

	if (loading || error || reviews == null) return <Loader />;
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
			<section className="listing-details__description">
				<h2>Opis produktu</h2>
				{description}
			</section>
			<ListingReviewSummary reviews={reviews} avgRating={avgRating} />
			<AddReview />
			<section className="listing-details__reviews"></section>
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

function ListingReviewSummary({ reviews, avgRating }) {
	return (
		<section className="listing-details__reviews-summary">
			<h2>Opinie ({reviews.length})</h2>
			<div className="left-panel">
				{[5, 4, 3, 2, 1].map(stars => (
					<div key={stars} className="rating-bar">
						<span>
							{stars} <i className="fas fa-star"></i>
						</span>
						<div className="bar">
							<div
								className="fill"
								style={{
									width: `${(reviews.filter(r => r.rating === stars).length / reviews.length) * 100}%`
								}}
							/>
						</div>
						<span>{reviews.filter(r => r.rating === stars).length}</span>
					</div>
				))}
			</div>
			<div className="right-panel">
				<span>{avgRating}</span>
				<i className="fas fa-star"></i>
			</div>
		</section>
	);
}

function AddReview() {
	const addReview = useStore(state => state.addReview);
	const [loading, setLoading] = useState(false);
	const { productId } = useParams();

	async function saveReview(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const rating = formData.get("rating");
		const message = formData.get("message");
		setLoading(true);

		try {
			const response = await backend.add_review(+productId, +rating, message);
			if (response.length !== 0) {
				alert("Wystąpił błąd podczas dodawania opinii: " + response[0]);
				return;
			}

			addReview(+productId, response);
			e.target.reset();
		} catch (err) {
			console.error("(adding review) backend error: " + err);
			alert("Wystąpił błąd podczas dodawania opinii. Prosimy spróbować ponownie później.");
		}

		setLoading(false);
	}

	return (
		<form className="listing-details__add-review" onSubmit={saveReview}>
			<h2>Dodaj opinię</h2>
			<div className="left-panel">
				<label htmlFor="rating">Ocena</label>
				<div className="rating-buttons">
					{[1, 2, 3, 4, 5].map(value => (
						<label key={value}>
							<input type="radio" name="rating" value={value} required />
							{new Array(value).fill(null).map((_, i) => (
								<i className="fas fa-star" key={i}></i>
							))}
						</label>
					))}
				</div>
			</div>
			<div className="right-panel">
				<label htmlFor="message">Wiadomość</label>
				<textarea id="message" name="message"></textarea>
			</div>
			<Button>
				<i className="fas fa-envelope"></i>
				Wyślij
			</Button>
			{loading && <LoadingOverlay />}
		</form>
	);
}

export default ListingDetails;
