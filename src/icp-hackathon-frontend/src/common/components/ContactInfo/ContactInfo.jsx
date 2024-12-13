import { forwardRef, useRef, useState } from "react";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";

// hooks
import useStore from "../../../store/store.js";

// components
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay.jsx";
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
	const user = useStore(state => state.user);
	const setUser = useStore(state => state.setUser);

	const [editable, setEditable] = useState(editButton && !user?.initialised);
	const [loading, setLoading] = useState(false || user == null);
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

	const saveUserData = async () => {
		const formData = new FormData(formRef.current);
		const name = formData.get("name");
		const email = formData.get("e-mail");
		const phone = formData.get("phone");
		const company = formData.get("company");

		const error = await backend.edit_active_user(name, email, phone, company);
		console.log(error);
		if (error != "") {
			alert("Wystąpił błąd podczas zapisywania danych: " + error);
			return false;
		}

		setUser({ name, email, phone, company, initialised: true });
		return true;
	};

	const onClick = async () => {
		if (editable && !validateUserData()) return;
		if (editable) {
			setLoading(true);
			const success = await saveUserData();
			setLoading(false);
			if (success) setEditable(false);
			return;
		}

		setEditable(e => !e);
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
							<input type="text" name="company" defaultValue={user.company} />
						) : (
							<span>{user.initialised ? user.company : "???"}</span>
						)}
					</div>
					<div>
						<i className="fas fa-user"></i>
						<span className="label">Imię i nazwisko:</span>
						{editable ? (
							<input type="text" name="name" defaultValue={user.name} />
						) : (
							<span>{user.initialised ? user.name : "???"}</span>
						)}
					</div>
					<div>
						<i className="fas fa-envelope"></i>
						<span className="label">Adres e-mail:</span>
						{editable ? (
							<input type="email" name="e-mail" defaultValue={user.email} />
						) : (
							<span>{user.initialised ? user.email : "???"}</span>
						)}
					</div>
					<div>
						<i className="fa fa-phone"></i>
						<span className="label">Telefon:</span>
						{editable ? (
							<input type="tel" name="phone" defaultValue={user.phone} />
						) : (
							<span>{user.initialised ? user.phone : "???"}</span>
						)}
					</div>
					{loading && <LoadingOverlay />}
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
