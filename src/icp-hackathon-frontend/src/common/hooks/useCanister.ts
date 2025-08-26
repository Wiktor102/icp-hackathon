import { createActorHook } from "ic-use-actor";
import { canisterId, idlFactory } from "../../../../declarations/icp-hackathon-backend/index";
import { _SERVICE } from "../../../../declarations/icp-hackathon-backend/icp-hackathon-backend.did";
import { InterfaceFactory } from "@dfinity/candid/lib/esm/idl";
import { useEffect } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";

export const useCanister = createActorHook<_SERVICE>({
	canisterId,
	idlFactory: idlFactory as unknown as InterfaceFactory
});

export default function Backend() {
	const { identity, clear } = useInternetIdentity();
	const { authenticate, setInterceptors } = useCanister();

	// Set up interceptors for logging and error handling
	// useEffect(() => {
	// 	setInterceptors({
	// 		onRequest: handleRequest,
	// 		onResponse: handleResponse,
	// 		onRequestError: handleRequestError,
	// 		onResponseError: handleResponseError
	// 	});
	// }, []);

	// Authenticate the actor with the identity
	useEffect(() => {
		if (!identity) return;
		authenticate(identity);
	}, [identity, authenticate]);

	return null;
}
