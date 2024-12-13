import { useIdentity, useIsInitializing } from "@nfid/identitykit/react";
import { useNavigate } from "react-router";

function useProtectRoute() {
	const identity = useIdentity();
	const navigate = useNavigate();
	const isInitializing = useIsInitializing();

	if (!identity && !isInitializing) {
		navigate("/");
		return "error";
	}

	return isInitializing ? "loading" : "ok";
}

export default useProtectRoute;
