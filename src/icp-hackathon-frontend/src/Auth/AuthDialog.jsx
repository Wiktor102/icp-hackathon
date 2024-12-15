import { useState } from "react";
import Button from "../common/Button.jsx";
import "./AuthDialog.scss";

export function AuthDialog({ isOpen, onClose }) {
	const [isLogin, setIsLogin] = useState(true);

	if (!isOpen) return null;

	const handleOverlayClick = e => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div className="auth__overlay" onClick={handleOverlayClick}>
			<div className="auth__dialog">
				<button className="auth__close" onClick={onClose}>
					<i className="fas fa-times"></i>
				</button>
				<div className="auth__tabs">
					<button className={`auth__tab ${isLogin ? "auth__tab--active" : ""}`} onClick={() => setIsLogin(true)}>
						Logowanie
					</button>
					<button className={`auth__tab ${!isLogin ? "auth__tab--active" : ""}`} onClick={() => setIsLogin(false)}>
						Rejestracja
					</button>
				</div>
				{isLogin ? <LoginForm /> : <SignupForm />}
			</div>
		</div>
	);
}

function LoginForm() {
	const handleSubmit = e => {
		e.preventDefault();
		// TODO: Implement login logic
	};

	return (
		<form className="auth__form" onSubmit={handleSubmit}>
			<div className="auth__form-group">
				<label className="auth__form-label">Adres email</label>
				<div className="auth__form-input-wrapper">
					<i className="fas fa-envelope"></i>
					<input className="auth__form-input" type="email" placeholder="Email" required />
				</div>
			</div>
			<div className="auth__form-group">
				<label className="auth__form-label">Hasło</label>
				<div className="auth__form-input-wrapper">
					<i className="fas fa-lock"></i>
					<input className="auth__form-input" type="password" placeholder="Hasło" required />
				</div>
			</div>
			<Button type="submit">
				<i className="fas fa-right-to-bracket"></i>
				Zaloguj się
			</Button>
		</form>
	);
}

function SignupForm() {
	const handleSubmit = e => {
		e.preventDefault();
		// TODO: Implement signup logic
	};

	return (
		<form className="auth__form" onSubmit={handleSubmit}>
			<div className="auth__form-group">
				<label className="auth__form-label">Adres email</label>
				<div className="auth__form-input-wrapper">
					<i className="fas fa-envelope"></i>
					<input className="auth__form-input" type="email" placeholder="Email" required />
				</div>
			</div>
			<div className="auth__form-group">
				<label className="auth__form-label">Hasło</label>
				<div className="auth__form-input-wrapper">
					<i className="fas fa-lock"></i>
					<input className="auth__form-input" type="password" placeholder="Hasło" required />
				</div>
			</div>
			<div className="auth__form-group">
				<label className="auth__form-label">Powtórz hasło</label>
				<div className="auth__form-input-wrapper">
					<i className="fas fa-lock"></i>
					<input className="auth__form-input" type="password" placeholder="Potwierdź hasło" required />
				</div>
			</div>
			<Button type="submit">
				<i className="fas fa-user-plus"></i>
				Zarejestruj się
			</Button>
		</form>
	);
}
