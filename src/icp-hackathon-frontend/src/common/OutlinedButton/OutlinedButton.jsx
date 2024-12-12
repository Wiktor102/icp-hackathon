import "./OutlinedButton.scss";

function OutlinedButton({ children, onClick, ...props }) {
	return (
		<button onClick={onClick} {...props} className="pill-outlined-button">
			{children}
		</button>
	);
}

export default OutlinedButton;
