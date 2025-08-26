import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";

function useProtectRoute() {
	const { identity, isInitializing } = useInternetIdentity();
	const navigate = useNavigate();

	useEffect(() => {
		if (!identity && !isInitializing) {
			navigate("/");
		}
	}, [identity, isInitializing, navigate]);

	if (!identity && !isInitializing) return "error";
	return isInitializing ? "loading" : "ok";
}

export default useProtectRoute;
