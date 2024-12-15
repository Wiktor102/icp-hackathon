import "./Empty.scss";

function Empty({ icon = <i className="fas fa-folder-minus"></i>, children }) {
	return (
		<div className="empty-indicator">
			{icon}
			<p className="label">children</p>
		</div>
	);
}

export default Empty;
