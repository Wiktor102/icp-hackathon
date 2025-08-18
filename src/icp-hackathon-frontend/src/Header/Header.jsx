import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useNavigate } from "react-router";

// components
import Button from "../common/Button";

// hookjs
import useStore from "../store/store.js";
import { useAuthenticatedActor } from "../common/hooks/useActor.js";

import "./Header.scss";

function Header() {
	const navigate = useNavigate();

	const identity = useStore(state => state.identity);
	const setUser = useStore(state => state.setUser);
	const setUserLoading = useStore(state => state.setUserLoading);
	const [actorLoading, actor] = useAuthenticatedActor();

	const authClient = useStore(state => state.authClient);
	const setIdentity = useStore(state => state.setIdentity);

	function login() {
		authClient.login({
			identityProvider:
				process.env.DFX_NETWORK === "ic"
					? "https://identity.ic0.app/#authorize"
					: // : `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`,
					  //   `http://localhost:4943?canisterId=bw4dl-smaaa-aaaaa-qaacq-cai#authorize`,
					  `http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943/#authorize`,
			onSuccess: async () => {
				const identity = await authClient.getIdentity();
				setIdentity(identity);
			}
		});
	}

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

		console.log("setting user", user);
		setUser(user);
		return user;
	}

	async function createEmptyUser() {
		try {
			const { Ok, Err } = await actor.add_empty_user();
			if (Err) {
				console.warn(Err);
				alert("An error occurred while creating user");
				return;
			}

			parseBackendUser(Ok);
			navigate("/profile");
		} catch (err) {
			console.error("(creating user) backend error:" + err);
			alert("An unknown error occurred while creating account. Try again later.");
		}
	}

	function fetchUser() {
		setUserLoading(true);
		actor.get_active_user().then(response => {
			if (Array.isArray(response) && response.length === 0) {
				createEmptyUser();
				return;
			}

			parseBackendUser(response[0]);
		});
	}

	useEffect(() => {
		if (identity == null || actorLoading) {
			setUser(null);
			setUserLoading(false);
			return;
		}

		// Always fetch user data when identity changes
		fetchUser();
	}, [identity]);

	return (
		<>
			<header className="page-header">
				<Link to="/">
					<h1>HurtChain</h1>
				</Link>
				<div>
					{identity ? (
						<ProfileDropdown
							onLogout={() => {
								setUser(null);
								setIdentity(null);
							}}
						/>
					) : (
						<Button onClick={login}>Log In</Button>
					)}
				</div>
			</header>
			<Outlet />
		</>
	);
}

function ProfileDropdown({ onLogout }) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="profile-dropdown" ref={dropdownRef}>
			<Button onClick={() => setIsOpen(!isOpen)}>
				<i className="fas fa-user"></i>
				Profile
			</Button>

			{isOpen && (
				<div className="profile-dropdown-menu">
					<Link to="/profile" onClick={() => setIsOpen(false)}>
						<div className="profile-dropdown-item">
							<i className="fas fa-circle-info"></i>
							<div className="profile-dropdown-item__label">Details</div>
						</div>
					</Link>
					<Link to="/favorites" onClick={() => setIsOpen(false)}>
						<div className="profile-dropdown-item">
							<i className="fas fa-star"></i>
							<div className="profile-dropdown-item__label">Favorites</div>
						</div>
					</Link>
					<Link to="/chat" onClick={() => setIsOpen(false)}>
						<div className="profile-dropdown-item">
							<i className="fas fa-comments"></i>
							<div className="profile-dropdown-item__label">Messages</div>
						</div>
					</Link>
					<div
						className="profile-dropdown-item"
						onClick={() => {
							setIsOpen(false);
							onLogout();
						}}
					>
						<i className="fas fa-arrow-right-from-bracket"></i>
						<div className="profile-dropdown-item__label">Log Out</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Header;
