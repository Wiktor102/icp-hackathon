import "./Button.scss";

function Button({ children, onClick, ...props }) {
	return (
		<button onClick={onClick} {...props} className="pill-button">
			{children}
		</button>
	);
}

export default Button;
