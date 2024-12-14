import { useNavigate } from "react-router";

// components
import SubtleButton from "../SubtleButton/SubtleButton.jsx";

import "./PageHeader.scss";

function PageHeader({ implyLeading = true, children }) {
	const navigate = useNavigate();

	return (
		<div className="page-header">
			{implyLeading && <SubtleButton icon={<i className="fas fa-arrow-left"></i>} onClick={() => navigate(-1)} />}
			{children}
		</div>
	);
}

export default PageHeader;
