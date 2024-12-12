import { useIdentity } from "@nfid/identitykit/react";
import { Link, useNavigate } from "react-router";

// components
import ContactInfo from "../common/components/ContactInfo/ContactInfo";

import "./Profile.scss";
import Grid from "../Home/Grid/Grid";
import Button from "../common/Button";

function Profile() {
	const identity = useIdentity();
	const navigate = useNavigate();

	if (!identity) {
		navigate("/");
		return null;
	}

	return (
		<div className="profile-page">
			<section className="profile-page__header">
				<img src="https://picsum.photos/200" alt="zdjęcie profilowe" />
				<div className="profile-page__header__panel-right">
					<h1>Witaj, Janusz!</h1>
					<ContactInfo editButton />
				</div>
				<Link to="/add">
					<Button onClick={() => navigate("/add")}>
						<i className="fas fa-plus"></i> Dodaj ogłoszenie
					</Button>
				</Link>
			</section>
			<h2>Twoje ogłoszenia</h2>
			<Grid />
		</div>
	);
}

export default Profile;
