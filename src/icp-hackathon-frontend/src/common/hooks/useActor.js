import { useEffect, useMemo, useState } from "react";
import { HttpAgent } from "@dfinity/agent";
import { canisterId, createActor } from "../../../../declarations/icp-hackathon-backend/index.js";
import useStore from "../../store/store.js";

const ICP_API_HOST = "http://localhost:4943/";

function useAuthenticatedActor() {
	const identity = useStore(state => state.identity);
	const [actor, setActor] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function createAgentAndActor() {
			if (!identity) {
				setActor(null);
				setLoading(false);
				return;
			}

			setLoading(true);

			try {
				const agent = new HttpAgent({
					host: process.env.DFX_NETWORK === "ic" ? "https://icp-api.io" : ICP_API_HOST,
					identity
				});

				// Fetch root key for local development
				if (process.env.DFX_NETWORK !== "ic") {
					await agent.fetchRootKey();
				}

				const newActor = createActor(canisterId, {
					agent
				});

				setActor(newActor);
			} catch (err) {
				console.error("Error creating actor:", err);
				setActor(null);
			} finally {
				setLoading(false);
			}
		}

		createAgentAndActor();
	}, [identity]);

	return [loading, actor];
}

export { useAuthenticatedActor };
