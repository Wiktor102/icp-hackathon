import { useQuery } from "@tanstack/react-query";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";

function parseBackendUser(user) {
	var user = {
		id: user.id,
		name: user.name,
		email: user.email,
		phone: user.phone_number,
		company: user.company_name,
		favorites: user.favorites_id ?? [],
		initialised: user.initialised
	};

	user.initialised = !(user.name === "" && user.email === "" && user.phone === "" && user.company === "");
	return user;
}

/**
 * @param {string} userId - The ID of the user whose details are to be fetched.
 */
function useUserDetails(userId) {
	const { data, error, isLoading } = useQuery({
		queryKey: ["userDetails", userId],
		queryFn: async () => {
			const users = await backend.get_user_by_principal(userId);

			if (!users || users.length === 0) {
				throw new Error("User not found");
			}

			// Some backends return the record as bytes (Uint8Array/ArrayBuffer). Decode to JSON.
			let user = users[0];
			if (user instanceof Uint8Array) {
				const jsonStr = new TextDecoder().decode(user);
				try {
					return JSON.parse(jsonStr);
				} catch (err) {
					throw new Error("Failed to parse user JSON: " + err.message);
				}
			}

			return parseBackendUser(user);
		}
	});

	return {
		userDetails: data,
		isLoading,
		error
	};
}

export default useUserDetails;
