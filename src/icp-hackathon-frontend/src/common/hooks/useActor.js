import { useEffect, useMemo, useState } from "react";
import { HttpAgent } from "@dfinity/agent";
import { idlFactory as targetIdlFactory } from "../../../../declarations/icp-hackathon-backend/icp-hackathon-backend.did.js";
import { icp_hackathon_backend } from "../../../../declarations/icp-hackathon-backend/index.js";
import { canisterId, createActor } from "../../../../declarations/icp-hackathon-backend/index.js";
import useStore from "../../store/store.js";

const TARGET_CANISTER_ID_TO_CALL = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
const ICP_API_HOST = "http://localhost:4943/";

function useAuthenticatedActor() {
	const identity = useStore(state => state.identity);
	const [agent, setAgent] = useState(null);
	const [isAgentReady, setIsAgentReady] = useState(false);

	// Create and setup agent when identity changes
	useEffect(() => {
		if (!identity) {
			setAgent(null);
			setIsAgentReady(false);
			return;
		}

		const initializeAgent = async () => {
			try {
				setIsAgentReady(false);

				// Create agent with proper host
				const host = process.env.DFX_NETWORK === "ic" ? undefined : ICP_API_HOST;
				const newAgent = new HttpAgent({ host, identity });

				// For local development, fetch root key first
				if (process.env.DFX_NETWORK !== "ic") {
					await newAgent.fetchRootKey();
				}

				setAgent(newAgent);
				setIsAgentReady(true);
			} catch (error) {
				console.error("Failed to initialize agent:", error);
				setAgent(null);
				setIsAgentReady(false);
			}
		};

		initializeAgent();
	}, [identity]);

	const authenticatedActor = useMemo(() => {
		if (!identity || !agent || !isAgentReady) {
			return null;
		}

		try {
			return createActor(canisterId, {
				agent
			});
		} catch (error) {
			console.error("Failed to create actor:", error);
			return null;
		}
	}, [identity, agent, isAgentReady]);

	return [authenticatedActor === null, authenticatedActor];
}

export { useAuthenticatedActor };
