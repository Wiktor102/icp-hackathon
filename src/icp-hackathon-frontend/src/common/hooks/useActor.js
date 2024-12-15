import { useMemo } from "react";
import { useAgent } from "@nfid/identitykit/react";
import { Actor } from "@dfinity/agent";
import { idlFactory as targetIdlFactory } from "../../../../declarations/icp-hackathon-backend/icp-hackathon-backend.did.js";
import { icp_hackathon_backend } from "../../../../declarations/icp-hackathon-backend/index.js";

const TARGET_CANISTER_ID_TO_CALL = "bkyz2-fmaaa-aaaaa-qaaaq-cai";

function useAuthenticatedActor() {
	const authenticatedAgent = useAgent();

	const authenticatedActor = useMemo(() => {
		return (
			authenticatedAgent &&
			Actor.createActor(targetIdlFactory, {
				agent: authenticatedAgent,
				canisterId: TARGET_CANISTER_ID_TO_CALL
			})
		);
	}, [authenticatedAgent, targetIdlFactory]);

	return [authenticatedActor == null, authenticatedActor];
	return [false, icp_hackathon_backend];
}

export { useAuthenticatedActor };
