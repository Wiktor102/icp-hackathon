import { useIdentity } from "@nfid/identitykit/react";
import { useNavigate } from "react-router";

function useProtectRoute() {
	const identity = useIdentity();
	const navigate = useNavigate();

	if (!identity) {
		navigate("/");
		return true;
	}

	return false;
}

export default useProtectRoute;
