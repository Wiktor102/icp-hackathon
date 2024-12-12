import { forwardRef, useRef, useState } from "react";
import OutlinedButton from "../../OutlinedButton/OutlinedButton.jsx";

import "./ContactInfo.scss";

const Wrapper = forwardRef(({ condition, children, ...props }, ref) =>
	condition ? (
		<form {...props} ref={ref}>
			{children}
		</form>
	) : (
		<div {...props}>{children}</div>
	)
);

function ContactInfo({ editButton = false }) {
	const [editable, setEditable] = useState(false);
	const formRef = useRef(null);

	const validateUserData = () => {
		const formData = new FormData(formRef.current);
		const email = formData.get("e-mail");
		const phone = formData.get("phone");

		const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		const phonePattern = /^\d{9}$/;

		if (!emailPattern.test(email)) {
			alert("Nieprawidłowy adres e-mail");
			return false;
		}

		if (!phonePattern.test(phone)) {
			alert("Niepoprawny numer telefonu");
			return false;
		}

		const name = formData.get("name");
		const company = formData.get("company");

		if (!name.includes(" ")) {
			alert("Podaj pełne imię");
			return false;
		}

		if (!company.trim()) {
			alert("Nazwa firmy nie może być pusta");
			return false;
		}

		return true;
	};

	const saveUserData = () => {
		const formData = new FormData(formRef.current);
	};

	const onClick = () => {
		setEditable(e => {
			if (!e) return !e;
			if (validateUserData()) return !e;
			saveUserData();
		});
	};

	return (
		<div className="contact-info">
			<div>
				<h3>Dane kontaktowe</h3>
				<Wrapper condition={editable} className="grid" ref={formRef}>
					<div>
						<i className="fas fa-building"></i>
						<span className="label">Firma:</span>
						{editable ? (
							<input type="text" name="company" defaultValue="Ubraniex Sp ZOO" />
						) : (
							<span>Ubraniex Sp ZOO</span>
						)}
					</div>
					<div>
						<i className="fas fa-user"></i>
						<span className="label">Imię i nazwisko:</span>
						{editable ? (
							<input type="text" name="name" defaultValue="Jan Kowalski" />
						) : (
							<span>Jan Kowalski</span>
						)}
					</div>
					<div>
						<i className="fas fa-envelope"></i>
						<span className="label">Adres e-mail:</span>
						{editable ? (
							<input type="email" name="e-mail" defaultValue="abs@example.com" />
						) : (
							<span>abs@example.com</span>
						)}
					</div>
					<div>
						<i className="fa fa-phone"></i>
						<span className="label">Telefon:</span>
						{editable ? <input type="tel" name="phone" defaultValue="123456789" /> : <span>123456789</span>}
					</div>
				</Wrapper>
				{editButton && (
					<OutlinedButton onClick={onClick}>
						<i className="fas fa-pencil"></i> {editable ? "Zapisz zmiany" : "Edytuj dane kontaktowe"}
					</OutlinedButton>
				)}
			</div>
		</div>
	);
}

export default ContactInfo;
