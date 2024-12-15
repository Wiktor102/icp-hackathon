import { useEffect } from "react";
import {
	ConnectWallet,
	ConnectWalletDropdownMenu,
	ConnectWalletDropdownMenuButton,
	ConnectWalletDropdownMenuItems,
	useIdentity
} from "@nfid/identitykit/react";
import { Link, Outlet, useNavigate } from "react-router";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";

// components
import Button from "../common/Button";

// hookjs
import useStore from "../store/store.js";
import { useFetchUserListings } from "../common/hooks/useFetchUserListings.js";

import "./Header.scss";

function Header() {
	const navigate = useNavigate();

	const identity = useIdentity();
	const setUser = useStore(state => state.setUser);
	const setUserLoading = useStore(state => state.setUserLoading);
	useFetchUserListings();
	console.log(identity?.getPrincipal().toText());

	function parseBackendUser(user) {
		var user = {
			name: user.name,
			email: user.email,
			phone: user.phone_number,
			company: user.company_name,
			favorites: user.favorites_id ?? [],
			initialised: user.initialised
		};

		user.initialised = !(user.name === "" && user.email === "" && user.phone === "" && user.company === "");

		setUser(user);
		return user;
	}

	async function createEmptyUser() {
		try {
			const { Ok, Err } = await backend.add_empty_user();
			if (Err) {
				console.warn(Err);
				alert("Wystąpił błąd podczas tworzenia użytkownika");
				return;
			}

			parseBackendUser(Ok);
			navigate("/profile");
		} catch (err) {
			console.error("(creating user) backend error:" + err);
			alert("Wystąpił niezany błąd podczas tworzenia konta. Spróbuj ponownie później.");
		}
	}

	function fetchUser() {
		setUserLoading(true);
		backend.get_active_user().then(response => {
			if (Array.isArray(response) && response.length === 0) {
				createEmptyUser();
				return;
			}

			parseBackendUser(response[0]);
		});
	}

	useEffect(() => {
		if (identity == null) {
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
					<ConnectWallet
						connectButtonComponent={props => <Button {...props}>Zaloguj się</Button>}
						dropdownMenuComponent={ProfileDropdown}
					/>
				</div>
			</header>
			<Outlet />
		</>
	);
}

function ProfileDropdown({ connectedAccount, icpBalance, disconnect }) {
	const setUser = useStore(state => state.setUser);

	const handleDisconnect = () => {
		setUser(null); // Clear user state before disconnecting
		disconnect();
	};

	return (
		<ConnectWalletDropdownMenu>
			<ConnectWalletDropdownMenuButton connectedAccount={connectedAccount} icpBalance={icpBalance}>
				<Button>
					<i className="fas fa-user"></i>
					Profil
				</Button>
			</ConnectWalletDropdownMenuButton>
			<ConnectWalletDropdownMenuItems>
				<Link to="/profile">
					<div className="profile-dropdown-item">
						<i className="fas fa-circle-info"></i>
						<div className="profile-dropdown-item__label">Szczegóły</div>
					</div>
				</Link>
				<Link to="/favorites">
					<div className="profile-dropdown-item">
						<i className="fas fa-star"></i>
						<div className="profile-dropdown-item__label">Ulubione</div>
					</div>
				</Link>
				<div className="profile-dropdown-item" onClick={handleDisconnect}>
					<i className="fas fa-arrow-right-from-bracket"></i>
					<div className="profile-dropdown-item__label">Wyloguj się</div>
				</div>
			</ConnectWalletDropdownMenuItems>
		</ConnectWalletDropdownMenu>
	);
}

export default Header;
