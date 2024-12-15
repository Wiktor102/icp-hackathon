import { useEffect } from "react";
import { Link } from "react-router";
import { icp_hackathon_backend as backend } from "../../../../declarations/icp-hackathon-backend/index.js";

// hooks
import useStore from "../../store/store.js";
import useProtectRoute from "../../common/hooks/useProtectRoute.js";
import { useFetchUserListings } from "../../common/hooks/useFetchUserListings";

// utilities
import { parseBackendListing } from "../../common/hooks/useFetchListings.js";

// components
import PageHeader from "../../common/components/PageHeader/PageHeader.jsx";
import ContactInfo from "../../common/components/ContactInfo/ContactInfo";
import Loader from "../../common/components/Loader/Loader.jsx";
import Empty from "../../common/components/Empty/Empty.jsx";
import Grid from "../../Home/Grid/Grid";
import Button from "../../common/Button";

import avatarImg from "../../assets/avatar.png";

import "./Profile.scss";

function Profile() {
	const user = useStore(state => state.user);
	const loadingUser = useStore(state => state.loadingUser);
	const userListings = useStore(state => state.userListings);
	const userListingsLoading = useStore(state => state.userListingsLoading);
	const userListingsError = useStore(state => state.userListingsError);

	const protection = useProtectRoute();
	if (protection === "error") return null;
	if (protection === "loading" || loadingUser || !user || userListingsLoading) {
		return <Loader />;
	}

	if (userListingsError) {
		return <Empty icon={<i className="fas fa-exclamation-triangle" />}>Wystąpił błąd: {userListingsError}</Empty>;
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

					<ContactInfo user={user} editButton />
				</div>
				<Link to="/add">
					<Button>
						<i className="fas fa-plus"></i> Dodaj ogłoszenie
					</Button>
				</Link>
			</section>
			<h2>Twoje ogłoszenia</h2>
			{userListings.length > 0 && <Grid listings={userListings} />}
			{userListings.length === 0 && <Empty>Nie dodałeś/aś jeszcze żadnego ogłoszenia</Empty>}
		</div>
	);
}

export default Profile;
