import './ProductCard.css';

type ProductCardProps = {
    imageUrl: string;
    title: string;
    description: string;
    onReadMore?: () => void;
};

/**
 * Individual product card component
 * Displays an image, title, description, and CTA button
 */
export function ProductCard({ imageUrl, title, description, onReadMore }: ProductCardProps) {
    return (
        <article className="product-card">
            <div className="product-card__image-wrapper">
                <img src={imageUrl} alt={title} className="product-card__image" />
            </div>
            <h3 className="product-card__title">{title}</h3>
            <p className="product-card__description">{description}</p>
            <button className="product-card__button" onClick={onReadMore}>
                Read More
            </button>
        </article>
    );
}

export default ProductCard;
