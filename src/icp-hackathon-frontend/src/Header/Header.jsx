import {
	ConnectWallet,
	ConnectWalletDropdownMenu,
	ConnectWalletDropdownMenuButton,
	ConnectWalletDropdownMenuItems
} from "@nfid/identitykit/react";
import Button from "../common/Button";
import { Link, Outlet, useLocation } from "react-router";

import "./Header.scss";

function Header() {
	const { pathname: location } = useLocation();

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
