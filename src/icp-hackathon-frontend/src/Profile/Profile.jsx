import { useIdentity } from "@nfid/identitykit/react";
import { useNavigate } from "react-router";

import "./Profile.scss";

function Profile() {
	const identity = useIdentity();
	const navigate = useNavigate();

	if (!identity) {
		navigate("/");
		return null;
	}

	return (
		<div>
			<h1>Profile</h1>
		</div>
	);
}

export default Profile;
