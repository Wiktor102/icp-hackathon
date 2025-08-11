import { useState } from "react";

import "./ImageCarousel.scss";

function ImageCarousel({ images, title }) {
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextImage = () => {
		setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
	};

	const prevImage = () => {
		setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
	};

	if (!images || images.length === 0) return null;

	return (
		<div className="image-carousel">
			{currentIndex !== 0 && (
				<button onClick={prevImage} className="carousel-button prev">
					<i className="fas fa-chevron-left"></i>
				</button>
			)}
			<div
				className="image-carousel__track"
				style={{
					transform: `translateX(-${currentIndex * 100}%)`,
					transition: "transform 0.3s ease-in-out"
				}}
			>
				{images.map((image, index) => (
					<img key={index} src={image} alt={`${title} - photo ${index + 1}`} />
				))}
			</div>
			{currentIndex !== images.length - 1 && (
				<button onClick={nextImage} className="carousel-button next">
					<i className="fas fa-chevron-right"></i>
				</button>
			)}
		</div>
	);
}

export default ImageCarousel;
