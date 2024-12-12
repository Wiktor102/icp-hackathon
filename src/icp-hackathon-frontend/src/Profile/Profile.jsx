import { useIdentity } from "@nfid/identitykit/react";
import { useNavigate } from "react-router";

// components
import ContactInfo from "../common/ContactInfo/ContactInfo";

import "./Profile.scss";

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
					<h1>Witaj, Janusz</h1>
					<ContactInfo />
				</div>
			</section>
		</div>
	);
}

export default Profile;
