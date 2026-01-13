import './ProductCard.css';

type ProductCardProps = {
    image: string;
    title: string;
    description: string;
}

export function ProductCard({ image, title, description }: ProductCardProps) {
    return (
        <div className="product-card">
            <div className="product-image-container">
                <img src={image} alt={title} className="product-image" />
            </div>
            <h3 className="product-title">{title}</h3>
            <p className="product-description">{description}</p>
            <button className="read-more-btn">Read More</button>
        </div>
    );
}
