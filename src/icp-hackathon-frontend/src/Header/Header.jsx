import { ConnectWallet } from "@nfid/identitykit/react";
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
					<ConnectWallet connectButtonComponent={props => <Button {...props}>Zaloguj się</Button>} />
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

export default Header;
