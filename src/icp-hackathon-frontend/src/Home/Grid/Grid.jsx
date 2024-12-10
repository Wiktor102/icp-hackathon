import { Link } from "react-router";
import Button from "../../common/Button";
import "./Grid.scss";

function Grid() {
	return (
		<section className="main-page__grid">
			{new Array(5).fill(0).map((_, i) => (
				<GridItem key={i} id={i} name={"TEST"} img={"https://picsum.photos/300/200"} price={32.76} />
			))}
		</section>
	);
}

function GridItem({ id, name, img, price }) {
	let formattedPrice = price.toFixed(2).replace(".", ",");
	return (
		<Link to={`/product/${id}`}>
			<div className="main-page__grid__item">
				<img src={img} alt={name} />
				<p className="price">{formattedPrice}</p>
				<h4>{name}</h4>
				<Button>Dodaj do koszyka +</Button>
			</div>
		</Link>
	);
}

export default Grid;
