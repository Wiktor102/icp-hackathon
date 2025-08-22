import { useQuery } from "@tanstack/react-query";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";

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

			return users[0];
		}
	});

	return {
		userDetails: data,
		isLoading,
		error
	};
}

export default useUserDetails;
