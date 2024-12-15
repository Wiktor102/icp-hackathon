import { useIdentity, useIsInitializing } from "@nfid/identitykit/react";
import { useNavigate } from "react-router";
import useStore from "../../store/store.js";

function useProtectRoute() {
	const identity = useStore(state => state.identity);
	const navigate = useNavigate();
	const isInitializing = useIsInitializing();

	if (!identity && !isInitializing) {
		navigate("/");
		return "error";
	}

	return isInitializing ? "loading" : "ok";
}

export default useProtectRoute;
