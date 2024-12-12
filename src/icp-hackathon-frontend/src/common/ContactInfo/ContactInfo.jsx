import "./ContactInfo.scss";

function ContactInfo() {
	return (
		<section className="contact-info">
			<h3>Dane kontaktowe</h3>
			<div className="grid">
				<div>
					<i className="fas fa-building"></i>
					<span className="label">Firma:</span>
					<span>Ubraniex Sp ZOO</span>
				</div>
				<div>
					<i className="fas fa-user"></i>
					<span className="label">Imię i nazwisko:</span>
					<span>Jan Kowalski</span>
				</div>
				<div>
					<i className="fas fa-envelope"></i>
					<span className="label">Adres e-mail:</span>
					<span>abs@example.com</span>
				</div>
				<div>
					<i className="fa fa-phone"></i>
					<span className="label">Telefon:</span>
					<span>123456789</span>
				</div>
			</div>
		</section>
	);
}

export default ContactInfo;
