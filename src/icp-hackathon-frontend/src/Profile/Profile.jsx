import { Link } from "react-router";

// hooks
import useStore from "../store/store.js";
import useProtectRoute from "../common/hooks/useProtectRoute.js";

// components
import PageHeader from "../common/components/PageHeader/PageHeader.jsx";
import ContactInfo from "../common/components/ContactInfo/ContactInfo";
import Grid from "../Home/Grid/Grid";
import Button from "../common/Button";

import avatarImg from "../assets/avatar.png";

import "./Profile.scss";

function Profile() {
	const user = useStore(state => state.user);
	const loadingUser = useStore(state => state.loadingUser);

	const protection = useProtectRoute();
	if (protection === "error") return null;
	if (protection === "loading" || loadingUser || !user) {
		return (
			<div class="ball-clip-rotate">
				<div></div>
			</div>
		);
	}

	return (
		<div className="profile-page">
			<section className="profile-page__header">
				<img src={avatarImg} alt="zdjęcie profilowe" />
				<div className="profile-page__header__panel-right">
					<PageHeader>
						{user.initialised && <h1>Witaj, {user.name.split(" ")[0]}!</h1>}
						{!user.initialised && <h1>Uzupełnij swój profil poniżej</h1>}
					</PageHeader>

					<ContactInfo editButton />
				</div>
				<Link to="/add">
					<Button>
						<i className="fas fa-plus"></i> Dodaj ogłoszenie
					</Button>
				</Link>
			</section>
			<h2>Twoje ogłoszenia</h2>
			<Grid listings={[]} />
		</div>
	);
}

export default Profile;
