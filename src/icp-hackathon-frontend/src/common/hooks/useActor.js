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
	const [unauthenticatedAgent, setUnauthenticatedAgent] = useState(null);

	useEffect(() => {
		HttpAgent.create({ host: ICP_API_HOST }).then(setUnauthenticatedAgent);
	}, []);

	const authenticatedActor = useMemo(() => {
		return (
			identity &&
			createActor(canisterId, {
				agentOptions: {
					identity
				}
				// canisterId: TARGET_CANISTER_ID_TO_CALL
			})
		);
	}, [identity, targetIdlFactory]);

	return [authenticatedActor == null, authenticatedActor];
}

export { useAuthenticatedActor };
