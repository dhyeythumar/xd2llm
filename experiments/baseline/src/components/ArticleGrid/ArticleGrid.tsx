import { useState } from 'react';
import { ArticleCard } from '../ArticleCard';
import './ArticleGrid.css';

const CATEGORIES = ['View All', 'Category 1', 'Category 2', 'Category 3'];

const ARTICLES = [
    {
        image: '/img-4.png',
        category: 'Category Name',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
    },
    {
        image: '/img-5.png',
        category: 'Category Name',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
    },
    {
        image: '/img-6.png',
        category: 'Category Name',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
    },
    {
        image: '/img-7.png',
        category: 'Category Name',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
    },
    {
        image: '/img-8.png',
        category: 'Category Name',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
    },
    {
        image: '/img-1.png',
        category: 'Category Name',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
    },
    {
        image: '/img-9.png',
        category: 'Category Name',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
    },
    {
        image: '/img-2.png',
        category: 'Category Name',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
    },
    {
        image: '/img-3.png',
        category: 'Category Name',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
    },
];

export function ArticleGrid() {
    const [activeCategory, setActiveCategory] = useState('View All');

    return (
        <section className="article-grid-section">
            <nav className="category-tabs">
                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </nav>

            <div className="articles-masonry">
                {ARTICLES.map((article, index) => (
                    <ArticleCard
                        key={index}
                        image={article.image}
                        category={article.category}
                        date={article.date}
                        title={article.title}
                        description={article.description}
                    />
                ))}
            </div>

            <button className="view-more-btn">View More</button>
        </section>
    );
}
