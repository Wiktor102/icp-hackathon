import { ConnectWallet } from "@nfid/identitykit/react";
import Button from "../common/Button";

import "./Header.scss";

function Header() {
	return (
		<header className="page-header">
			<h1>SklepX</h1>
			<ConnectWallet connectButtonComponent={props => <Button {...props}>Zaloguj się</Button>} />
		</header>
	);
}

export default Header;
