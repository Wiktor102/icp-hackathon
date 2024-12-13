import { useNavigate } from "react-router";

import "./PageHeader.scss";

function PageHeader({ implyLeading = true, children }) {
	const navigate = useNavigate();

	return (
		<div className="page-header">
			{implyLeading && (
				<button onClick={() => navigate(-1)}>
					<i className="fas fa-arrow-left"></i>
				</button>
			)}
			{children}
		</div>
	);
}

export default PageHeader;
