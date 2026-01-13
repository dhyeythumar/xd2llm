import { ProductCard } from '../ProductCard';
import './FeaturedProducts.css';

const PRODUCTS = [
    {
        image: '/img-1.png',
        title: 'Lorem Ipsum Dolor',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        image: '/img-2.png',
        title: 'Lorem Ipsum Dolor',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        image: '/img-3.png',
        title: 'Lorem Ipsum Dolor',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
];

export function FeaturedProducts() {
    return (
        <section className="featured-products">
            <h1 className="section-title">Featured Products</h1>
            <div className="title-underline"></div>
            <div className="products-grid">
                {PRODUCTS.map((product, index) => (
                    <ProductCard
                        key={index}
                        image={product.image}
                        title={product.title}
                        description={product.description}
                    />
                ))}
            </div>
        </section>
    );
}
