import { useIdentity } from "@nfid/identitykit/react";
import { Link, useNavigate } from "react-router";

// hooks
import useStore from "../store/store.js";

// components
import ContactInfo from "../common/components/ContactInfo/ContactInfo";
import Grid from "../Home/Grid/Grid";
import Button from "../common/Button";

import avatarImg from "../assets/avatar.png";

import "./Profile.scss";

function Profile() {
	const identity = useIdentity();
	const navigate = useNavigate();
	const user = useStore(state => state.user);

	if (!identity) {
		navigate("/");
		return null;
	}

	return (
		<div className="profile-page">
			<section className="profile-page__header">
				<img src={avatarImg} alt="zdjęcie profilowe" />
				<div className="profile-page__header__panel-right">
					{user.initialised && <h1>Witaj, {user.name.split(" ")[0]}!</h1>}
					{!user.initialised && <h1>Uzupełnij swój profil poniżej</h1>}
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