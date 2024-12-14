import { useEffect } from "react";
import {
	ConnectWallet,
	ConnectWalletDropdownMenu,
	ConnectWalletDropdownMenuButton,
	ConnectWalletDropdownMenuItems,
	useIdentity
} from "@nfid/identitykit/react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";

import Button from "../common/Button";

import useStore from "../store/store.js";
import usePrevious from "../common/hooks/usePrevious.js";

import "./Header.scss";

function Header() {
	const { pathname: location } = useLocation();
	const navigate = useNavigate();

	const identity = useIdentity();
	const previousIdentity = usePrevious(identity);
	const user = useStore(state => state.user);
	const setUser = useStore(state => state.setUser);
	const setUserLoading = useStore(state => state.setUserLoading);

	function parseBackendUser(user) {
		var user = {
			name: user.name,
			email: user.email,
			phone: user.phone_number,
			company: user.company_name,
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
				console.log(Err);
				alert("Wystąpił błąd podczas tworzenia użytkownika");
				return;
			}

			parseBackendUser(Ok);
			navigate("/profile");
		} catch (err) {
			console.log("(creating user) backend error:" + err);
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
		if (identity === previousIdentity && user != null) return;
		if (identity == null) {
			setUser(null);
			return;
		}

		fetchUser();
	}, [identity]);

	return (
		<>
			<header className="page-header">
				<Link to="/">
					<h1>SklepX</h1>
				</Link>
				<div>
					<ConnectWallet
						connectButtonComponent={props => <Button {...props}>Zaloguj się</Button>}
						dropdownMenuComponent={ProfileDropdown}
					/>
					{!location.includes("cart") && (
						<Link to="/cart" className="page-header__cart">
							<i className="fas fa-cart-shopping"></i>
						</Link>
					)}
				</div>
			</header>
			<Outlet />
		</>
	);
}

function ProfileDropdown({ connectedAccount, icpBalance, disconnect }) {
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
				<div className="profile-dropdown-item" onClick={disconnect}>
					<i className="fas fa-arrow-right-from-bracket"></i>
					<div className="profile-dropdown-item__label">Wyloguj się</div>
				</div>
			</ConnectWalletDropdownMenuItems>
		</ConnectWalletDropdownMenu>
	);
}

export default Header;
