import { useEffect, useMemo, useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router";
import { icp_hackathon_backend as backend } from "../../../../declarations/icp-hackathon-backend/index.js";

// hooks
import useStore from "../../store/store.js";
import useImage from "../../common/hooks/useImage.js";
import useListing from "../../common/hooks/useListing.js";
import { useAuthenticatedActor } from "../../common/hooks/useActor.js";
import useCalculateAvgReview from "../../common/hooks/useCalculateAvgReview.js";

// components
import Button from "../../common/Button";
import Empty from "../../common/components/Empty/Empty.jsx";
import Loader from "../../common/components/Loader/Loader.jsx";
import ContactInfo from "../../common/components/ContactInfo/ContactInfo";
import PageHeader from "../../common/components/PageHeader/PageHeader.jsx";
import ImageCarousel from "../../common/components/ImageCarousel/ImageCarousel.jsx";
import LoadingOverlay from "../../common/components/LoadingOverlay/LoadingOverlay.jsx";

import "./ListingDetails.scss";
import useUserDetails from "../../common/hooks/useUserDetails.js";

function ListingDetails() {
	const { productId } = useParams();
	const navigate = useNavigate();
	const user = useStore(state => state.user);
	const userListings = useStore(state => state.userListings);
	const deleteListing = useStore(state => state.deleteListing);
	const addConversation = useStore(state => state.addConversation);
	const createConversation = useStore(state => state.createConversation);
	const conversations = useStore(state => state.conversations);
	const [deleting, setDeleting] = useState(false);

	const { listing, loading, error } = useListing(+productId);
	const { title, description, price, reviews, ownerId, category, ...rest } = listing ?? {};
	const [imagesLoading, ...images] = useImage(...(rest?.images ?? []));

	const formattedPrice = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(price);
	const favorite = false;
	const avgRating = useCalculateAvgReview(+productId);

	const isOwner = useMemo(() => userListings.some(listing => listing.id == +productId), [userListings, productId]);
	const [actorLoading, actor] = useAuthenticatedActor();

	const [owner, setOwner] = useState(null);

	function parseBackendUser(user) {
		var user = {
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone_number,
			company: user.company_name,
			favorites: user.favorites_id ?? [],
			initialised: user.initialised
		};

		user.initialised = !(user.name === "" && user.email === "" && user.phone === "" && user.company === "");
		return user;
	}

	useEffect(() => {
		if (!ownerId) return;
		backend.get_user_by_principal(ownerId).then(([response]) => {
			setOwner(parseBackendUser(response));
		});
	}, [ownerId]);

	function handleEdit() {
		alert("Listing edit function is unavailable in the prototype version of the application.");
	}

	async function handleDelete() {
		if (actorLoading) return;
		if (!window.confirm("Are you sure you want to delete this listing?")) {
			return;
		}

		setDeleting(true);
		try {
			const [errors] = await actor.delete_listing(+productId);
			if (errors) {
				alert("An error occurred while deleting listing: " + Err);
				return;
			}

			deleteListing(+productId);
			navigate("/profile");
		} catch (error) {
			console.error("(delete listing) Backend error:", error);
			alert("An error occurred while deleting listing. Try again later.");
		} finally {
			setDeleting(false);
		}
	}

	async function startChat() {
		if (!ownerId || !user) {
			console.warn("Cannot start chat: missing ownerId or user", { ownerId, user });
			return;
		}

		try {
			// Check if conversation already exists for this listing between these users
			const currentUserId = user.id;
			console.log("Checking for existing conversation", {
				currentUserId,
				ownerId,
				productId: +productId,
				conversations: Object.values(conversations)
			});

			const existingConversation = Object.values(conversations).find(conv => {
				// Check if this conversation is for the same listing
				if (conv.listingId !== +productId) return false;

				// Check if both users are participants
				const participants = conv.participants || [];
				return participants.includes(currentUserId) && participants.includes(ownerId);
			});

			if (existingConversation) {
				console.log("Found existing conversation:", existingConversation);
				// Navigate to existing conversation
				navigate(`/chat/${existingConversation.id}`);
				return;
			}

			console.log("No existing conversation found, creating new one");
			// Create new conversation via backend API using the principal ID
			const conversationId = await createConversation(+productId, title);
			console.log("Created conversation with ID:", conversationId);

			// Navigate to the new conversation
			navigate(`/chat/${conversationId}`);
		} catch (error) {
			console.error("Failed to start chat:", error);
			alert(`Failed to start chat: ${error.message || error}`);
		}
	}

	if (error) {
		return (
			<main className="listing-details">
				<Empty icon={<i className="fa-solid fa-exclamation-circle"></i>}>
					An error occurred while loading listing. The listing may not exist.
					<br />
					<NavLink to="/">Return to homepage</NavLink>
				</Empty>
			</main>
		);
	}
	if (loading || reviews == null || imagesLoading) return <Loader />;
	return (
		<main className="listing-details">
			<PageHeader>
				<div className="category">{category.path.split("/").join(" / ")}</div>
			</PageHeader>
			<section className="listing-details__layout">
				<ImageCarousel images={images} title={title} />
				<div className="listing-details__info">
					<h1>{title}</h1>
					<p className="rating">
						{avgRating} <i className="fas fa-star"></i> &nbsp;&nbsp;|&nbsp;&nbsp; {reviews.length} reviews
					</p>
					<div className="price">{formattedPrice}</div>
				</div>
				{/* <ListingContactForm /> */}
				<ContactInfo user={owner} />
				{user && !isOwner && ownerId && (
					<>
						<Button>
							{favorite ? <i className="fas fa-star"></i> : <i className="fa-regular fa-star"></i>}
							{favorite ? "Remove from" : "Add to"} favorites
						</Button>
						<Button onClick={startChat}>
							<i className="fas fa-comments"></i> Start Chat
						</Button>
					</>
				)}
				{isOwner && (
					<>
						<Button onClick={handleEdit}>
							<i className="fas fa-pencil"></i> Edytuj ogłoszenie
						</Button>
						<Button onClick={handleDelete} className="danger">
							<i className="fas fa-trash"></i> Delete listing
						</Button>
						{deleting && <LoadingOverlay />}
					</>
				)}
			</section>
			<section className="listing-details__description">
				<h2>Opis produktu</h2>
				{description}
			</section>
			<ListingReviewSummary reviews={reviews} avgRating={avgRating} />
			{user && <AddReview />}
			<ListingReviews reviews={reviews} />
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
	const [actorLoading, actor] = useAuthenticatedActor();

	async function saveReview(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const rating = formData.get("rating");
		const message = formData.get("message");
		setLoading(true);

		try {
			const { Ok, Err } = await actor.add_review(+productId, +rating, message);
			if (Err) {
				alert("An error occurred while adding review: " + Err);
				return;
			}

			addReview(+productId, Ok);
			e.target.reset();
		} catch (err) {
			console.error("(adding review) backend error: " + err);
			alert("An error occurred while adding review. Please try again later.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form className="listing-details__add-review" onSubmit={saveReview}>
			<h2>Add Review</h2>
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
			{(loading || actorLoading) && <LoadingOverlay />}
		</form>
	);
}

function ListingReviewItem({ id, owner_id, rating, comment }) {
	const { userDetails, isLoading } = useUserDetails(owner_id);

	return (
		<li className="listing-details__review">
			<div className="review-header">
				<div className="user">
					{/* <img src={userDetails.avatar} alt={userDetails.name} /> */}
					{!isLoading && <span>{userDetails.name}</span>}
					{isLoading && <span>Loading...</span>}
				</div>
				<div className="rating">
					{new Array(rating).fill(null).map((_, i) => (
						<i className="fas fa-star" key={i}></i>
					))}
				</div>
			</div>
			<p>{comment}</p>
		</li>
	);
}

function ListingReviews({ reviews }) {
	return (
		<section className="listing-details__reviews">
			{reviews.length === 0 && <Empty icon={<i className="fa-solid fa-comment-slash"></i>}>No reviews</Empty>}
			<ul>
				{reviews.map(review => (
					<ListingReviewItem key={review.id} {...review} />
				))}
			</ul>
		</section>
	);
}

export default ListingDetails;
