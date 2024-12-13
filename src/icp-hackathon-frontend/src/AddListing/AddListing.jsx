import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useIdentity } from "@nfid/identitykit/react";
import imageCompression from "browser-image-compression";
import { icp_hackathon_backend as backend } from "declarations/icp-hackathon-backend";

import Button from "../common/Button";

import "./AddListing.scss";
import LoadingOverlay from "../common/components/LoadingOverlay/LoadingOverlay.jsx";

function AddListing() {
	const identity = useIdentity();
	const navigate = useNavigate();

	const [photoPaths, setPhotoPaths] = useState([]);

	const [base64Photos, setBase64Photos] = useState([]);
	const [category, setCategory] = useState([]);
	const [loading, setLoading] = useState(false);

	function deletePhoto(i) {
		setPhotoPaths(p => p.filter((_, j) => i !== j));
	}

	function uploadFile(e) {
		if (photoPaths.length + e.target.files.length > 3) {
			alert("Maksymalnie można dodać 3 zdjęcia");
			e.preventDefault();
			return;
		}

		setPhotoPaths(p => [...p, ...e.target.files]);
		Array.from(e.target.files).map(async img => {
			const compressed = await compressImage(img);
			const reader = new FileReader();
			reader.readAsDataURL(compressed);
			reader.onload = () => {
				const base64 = reader.result;
				setBase64Photos(prev => [...prev, base64]);
			};
		});
	}

	async function compressImage(file) {
		const options = {
			maxSizeMB: 1,
			maxWidthOrHeight: 1024,
			useWebWorker: true
		};

		try {
			const compressedFile = await imageCompression(file, options);
			// console.log("Original File:", file.size / 1024, "KB");
			// console.log("Compressed File:", compressedFile.size / 1024, "KB");
			return compressedFile;
		} catch (error) {
			console.error("Error compressing image:", error);
		}
	}

	async function saveListing(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const title = formData.get("title");
		const description = formData.get("description");
		const price = +formData.get("price");
		const amount = +formData.get("amount");
		const images = base64Photos;

		if (isNaN(price) || isNaN(amount)) {
			alert("Cena i ilość muszą być liczbami");
			return;
		}

		if (price <= 0) {
			alert("Cena musi być większa od 0");
			return;
		}

		if (amount <= 0) {
			alert("Ilość musi być większa od 0");
			return;
		}

		if (images.length === 0) {
			alert("Dodaj co najmniej 1 zdjęcie produktu");
			return;
		}

		if (category.length === 0) {
			alert("Wybierz kategorię");
			return;
		}

		setLoading(true);

		try {
			const { Ok, Err } = await backend.add_listing(
				title,
				description,
				category.at(-1),
				price,
				amount,
				images,
				category.join("/")
			);
			if (Ok) {
				alert("Ogłoszenie zostało dodane");
				console.log("Listing added:", Ok);
				navigate("/");
			}

			if (Err) {
				alert("Wystąpił błąd podczas dodawania ogłoszenia: " + Err);
			}
		} catch (error) {
			alert("Wystąpił nieznany błąd podczas dodawania ogłoszenia. Prosimy spróbować ponownie później.");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}

	// if (!identity) {
	// 	navigate("/");
	// 	return null;
	// }

	return (
		<main className="add-listing">
			<h1>Dodaj ogłoszenie</h1>
			<form className="add-listing-form" onSubmit={saveListing}>
				<div className="form-group" id="title-group">
					<i className="fas fa-heading"></i>
					<label htmlFor="title">Tytuł</label>
					<input type="text" id="title" name="title" />
				</div>

				<div className="form-image-container">
					{base64Photos.map((photo, i) => (
						<div className="image-container" key={i}>
							<img src={photo} alt="Zdjęcie produktu" />
							<button type="buton" onClick={() => deletePhoto(i)}>
								<i className="fas fa-trash"></i>
							</button>
						</div>
					))}
					{base64Photos.length < 3 &&
						new Array(3 - base64Photos.length).fill(null).map((_, i) => (
							<div className="image-placeholder" key={i}>
								<i className="fa-regular fa-image"></i>
								Nie dodałeś jeszcze zdjęcia
							</div>
						))}
					<label htmlFor="image" className={base64Photos.length >= 3 ? "disabled" : ""}>
						<i className="fas fa-upload"></i>
						Wybierz plik
						<input
							type="file"
							id="image"
							name="image"
							accept="image/*"
							value=""
							onChange={uploadFile}
							disabled={base64Photos.length >= 3}
						/>
					</label>
				</div>

				<div className="grid">
					<div className="form-group" id="decription-group">
						<i className="fas fa-list"></i>
						<label htmlFor="description">Opis</label>
						<textarea id="description" name="description"></textarea>
					</div>
					<div id="right-group">
						<div className="form-group">
							<i className="fas fa-tag"></i>
							<label htmlFor="price">Cena (zł)</label>
							<input type="number" id="price" name="price" min="0" step="0.01" />
						</div>

						<div className="form-group">
							<i className="fas fa-scale-unbalanced"></i>
							<label htmlFor="amount">Dostępna ilość (szt.)</label>
							<input type="number" id="amount" name="amount" min="0" step="1" />
						</div>

						<div className="form-group" id="category-group">
							<i className="fas fa-icons"></i>
							<label htmlFor="category">Kategoria</label>
							<CategorySelector value={category} onSelect={setCategory} />
						</div>
					</div>
				</div>

				<Button type="submit">
					<i className="fas fa-check"></i>
					Dodaj ogłoszenie
				</Button>
				{loading && <LoadingOverlay />}
			</form>
		</main>
	);
}

function CategorySelector({ value, onSelect }) {
	const [categories] = useState([
		{ name: "Electronics", children: [{ name: "Computers" }, { name: "Phones" }, { name: "Accessories" }] },
		{
			name: "Clothing",
			children: [
				{ name: "Men's", children: [{ name: "underware" }, { name: "shirts" }] },
				{ name: "Women's" },
				{ name: "Children's" }
			]
		},
		{ name: "Books" },
		{ name: "Home & Garden" },
		{ name: "Toys" },
		{ name: "Sports" },
		{ name: "Health & Beauty" },
		{ name: "Music" },
		{ name: "Other" }
	]);

	const [selectedPath, setSelectedPath] = useState([]);

	const currentLevel = useMemo(() => {
		let current = categories;
		for (const index of selectedPath) {
			current = current[index].children || [];
		}
		return current;
	}, [categories, selectedPath]);

	const getPathNames = path => {
		const names = [];
		let current = categories;
		for (const index of path) {
			names.push(current[index].name);
			current = current[index].children || [];
		}
		return names;
	};

	return (
		<div className="category-selector">
			{value.length > 0 && <div className="current-category-path">{value.join(" / ")}</div>}
			<div className="options">
				{selectedPath.length > 0 && (
					<button
						onClick={() => setSelectedPath(prev => prev.slice(0, -1))}
						className="category-selector__back-button"
						type="button"
					>
						<i className="fas fa-arrow-left"></i>
					</button>
				)}
				{currentLevel.map((category, index) => (
					<button
						className="category-selector__option"
						key={category.name}
						type="button"
						onClick={() => {
							if (category.children) {
								setSelectedPath(prev => [...prev, index]);
							}

							const fullPath = [...selectedPath, index];
							onSelect(getPathNames(fullPath));
						}}
					>
						{category.name}
						{category.children && <i className="fas fa-chevron-right"></i>}
					</button>
				))}
			</div>
		</div>
	);
}

export default AddListing;