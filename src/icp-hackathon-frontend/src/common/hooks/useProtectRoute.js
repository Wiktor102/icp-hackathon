import { useNavigate } from "react-router";
import useAuth from "./useAuth.js";

function useProtectRoute() {
	const { isAuthenticated, isInitializing } = useAuth();
	const navigate = useNavigate();

	if (!isAuthenticated && !isInitializing) {
		navigate("/");
		return "error";
	}

	return isInitializing ? "loading" : "ok";
}

export default useProtectRoute;
