import { useNavigate, useParams } from "react-router";

import "./ListingDetails.scss";
import Button from "../common/Button";
import ContactInfo from "../common/components/ContactInfo/ContactInfo";

function ListingDetails() {
	const { listingId } = useParams();
	const navigate = useNavigate();

	return (
		<main className="listing-details">
			<header className="listing-details__header">
				<nav>
					<button onClick={() => navigate(-1)}>
						<i className="fas fa-arrow-left"></i>
					</button>
				</nav>
				<div className="category">SklepX / odzież / ubrania dla dzieci / ubrania niemowlęce</div>
			</header>
			<section className="listing-details__layout">
				<div className="listing-details__layout__image-container">
					<img src="https://picsum.photos/300/200" alt="Testowy długi tytuł ogłoszenia bo tak" />
				</div>
				<div className="listing-details__info">
					<h1>Testowy długi tytuł ogłoszenia bo tak</h1>
					<p className="rating">
						3.8 <i className="fas fa-star"></i> &nbsp;&nbsp;|&nbsp;&nbsp; 321 opinii
					</p>
					<div className="price">234,76 zł</div>
				</div>
				{/* <ListingContactForm /> */}
				<ContactInfo />
			</section>
			<article className="listing-details__description">
				<h2>Opis produktu</h2>
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Numquam qui asperiores ipsum ducimus ex doloribus,
				quidem amet omnis eius obcaecati voluptatibus odio dolores, unde facere. Ipsam neque earum sed provident,
				quaerat illum officiis voluptate, repudiandae explicabo sapiente aperiam dicta beatae maiores amet tempora.
				Laborum impedit animi culpa atque, ea earum aperiam suscipit inventore dolorum veritatis consequuntur
				recusandae voluptatum saepe odio, nemo sapiente cumque minus quos. Dolore aliquam saepe animi inventore
				consequatur id ab quo dolor unde consectetur illum, sunt sed ipsa repellendus sit ut quia laudantium
				doloribus. Iusto expedita quaerat quis? Dolor corporis reiciendis modi molestias tenetur tempore quaerat
				nulla assumenda, mollitia odio, nesciunt sequi officiis perferendis aspernatur id soluta atque cum quia,
				ipsum facere rerum. Quidem expedita a explicabo. Accusantium veniam dolorem, officia ea voluptates ipsam
				nostrum, harum sint minima repudiandae quos alias obcaecati praesentium enim at dolor assumenda, eaque
				eveniet. Aspernatur a architecto, incidunt commodi molestias exercitationem! Quod voluptates saepe ducimus
				rerum? Saepe delectus repudiandae rem veritatis fugiat ipsum excepturi nihil, perspiciatis ratione ea
				molestias eaque sequi, officia hic dolore placeat. Perspiciatis harum, impedit delectus a cupiditate sunt.
				Laborum itaque ut non iusto veritatis distinctio in placeat exercitationem corrupti tempore esse officia
				dignissimos labore ullam, quasi quod eaque sequi deserunt ipsum aspernatur ad? Velit iste labore laboriosam!
				Facere ducimus quibusdam explicabo maiores unde accusamus quam molestias ullam ut, ab aperiam similique
				maxime possimus autem, recusandae natus id ea. Quis tempore nostrum ab ullam aspernatur atque perspiciatis
				nihil id? Nemo corporis hic voluptas consequatur. Mollitia sunt iste voluptatibus hic!
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
