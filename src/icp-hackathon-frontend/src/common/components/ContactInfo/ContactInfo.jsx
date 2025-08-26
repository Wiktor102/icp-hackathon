import { forwardRef, useRef, useState } from "react";

// hooks
import useStore from "../../../store/store.js";
import { useCanister } from "../../hooks/useCanister";

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

function ContactInfo({ editButton = false, user }) {
	const setUser = useStore(state => state.setUser);
	const { actor, loading: actorLoadingFromHook, isLoading } = useCanister();
	const actorLoading = actorLoadingFromHook ?? isLoading ?? false;

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
			alert("Invalid email address");
			return false;
		}

		if (!phonePattern.test(phone)) {
			alert("Invalid phone number");
			return false;
		}

		const name = formData.get("name");
		const company = formData.get("company");

		if (!name.includes(" ")) {
			alert("Enter full name");
			return false;
		}

		if (!company.trim()) {
			alert("Company name cannot be empty");
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

		const error = await actor.edit_active_user(name, email, phone, company);
		if (error != "") {
			alert("An error occurred while saving data: " + error);
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
				<h3>Contact Information</h3>
				<Wrapper condition={editable} className="grid" ref={formRef}>
					<div>
						<i className="fas fa-building"></i>
						<span className="label">Company:</span>
						{editable ? (
							<input type="text" name="company" defaultValue={user.company} />
						) : (
							<span>{user.company ?? user.company_name ?? "???"}</span>
						)}
					</div>
					<div>
						<i className="fas fa-user"></i>
						<span className="label">Full name:</span>
						{editable ? (
							<input type="text" name="name" defaultValue={user.name} />
						) : (
							<span>{user.name ?? "???"}</span>
						)}
					</div>
					<div>
						<i className="fas fa-envelope"></i>
						<span className="label">Email address:</span>
						{editable ? (
							<input type="email" name="e-mail" defaultValue={user.email} />
						) : (
							<span>{user.email ?? "???"}</span>
						)}
					</div>
					<div>
						<i className="fa fa-phone"></i>
						<span className="label">Phone:</span>
						{editable ? (
							<input type="tel" name="phone" defaultValue={user.phone} />
						) : (
							<span>{user.phone ?? user.phone_number ?? "???"}</span>
						)}
					</div>
					{(loading || actorLoading) && editButton && <LoadingOverlay />}
				</Wrapper>
				{editButton && (
					<OutlinedButton onClick={onClick}>
						<i className="fas fa-pencil"></i> {editable ? "Save changes" : "Edit contact information"}
					</OutlinedButton>
				)}
			</div>
		</div>
	);
}

export default ContactInfo;
