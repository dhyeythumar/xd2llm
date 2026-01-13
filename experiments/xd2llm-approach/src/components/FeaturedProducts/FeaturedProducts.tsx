import { ProductCard } from '../ProductCard';
import './FeaturedProducts.css';

const PRODUCTS = [
    {
        id: '1',
        imageUrl: '/img-1.png',
        title: 'Lorem Ipsum Dolor',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        id: '2',
        imageUrl: '/img-2.png',
        title: 'Lorem Ipsum Dolor',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        id: '3',
        imageUrl: '/img-3.png',
        title: 'Lorem Ipsum Dolor',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
];

/**
 * Featured Products section component
 * Displays a grid of product cards with images, titles, descriptions, and CTA buttons
 */
export function FeaturedProducts() {
    return (
        <section className="featured-products">
            <div className="featured-products__header">
                <h2 className="featured-products__title">Featured Products</h2>
                <div className="featured-products__divider" />
            </div>
            <div className="featured-products__grid">
                {PRODUCTS.map((product) => (
                    <ProductCard
                        key={product.id}
                        imageUrl={product.imageUrl}
                        title={product.title}
                        description={product.description}
                        onReadMore={() => console.log(`Read more: ${product.id}`)}
                    />
                ))}
            </div>
        </section>
    );
}

export default FeaturedProducts;
