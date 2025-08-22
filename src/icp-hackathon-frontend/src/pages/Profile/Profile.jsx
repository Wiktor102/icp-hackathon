import { Link } from "react-router";

// hooks
import useStore from "../../store/store.js";
import useProtectRoute from "../../common/hooks/useProtectRoute.js";

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
	const userCreating = useStore(state => state.userCreating);
	const userListings = useStore(state => state.userListings);
	const userListingsLoading = useStore(state => state.userListingsLoading);
	const userListingsError = useStore(state => state.userListingsError);

	const protection = useProtectRoute();
	if (protection === "error") return null;
	if (protection === "loading" || loadingUser || userCreating || !user || userListingsLoading) {
		return <Loader />;
	}

	if (userListingsError) {
		return <Empty icon={<i className="fas fa-exclamation-triangle" />}>An error occurred: {userListingsError}</Empty>;
	}

	return (
		<div className="profile-page">
			<section className="profile-page__header">
				<img src={avatarImg} alt="profile picture" />
				<div className="profile-page__header__panel-right">
					<PageHeader>
						{user.initialised && <h1>Welcome, {user.name.split(" ")[0]}!</h1>}
						{!user.initialised && <h1>Complete your profile below</h1>}
					</PageHeader>

					<ContactInfo user={user} editButton />
				</div>
				<Link to="/add">
					<Button>
						<i className="fas fa-plus"></i> Add Listing
					</Button>
				</Link>
			</section>
			<h2>Your Listings</h2>
			{userListings.length > 0 && <Grid listings={userListings} />}
			{userListings.length === 0 && <Empty>You haven't added any listings yet</Empty>}
		</div>
	);
}

export default Profile;
