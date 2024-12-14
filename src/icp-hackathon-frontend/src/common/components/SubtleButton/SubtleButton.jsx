import "./SubtleButton.scss";

function SubtleButton({ icon, text, ...props }) {
	return (
		<button {...props} className="subtle-button">
			{icon} {text && <span>{text}</span>}
		</button>
	);
}

export default SubtleButton;
