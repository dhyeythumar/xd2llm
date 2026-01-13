import { useState } from 'react';
import { CategoryTabs } from '../CategoryTabs';
import { PostCard } from '../PostCard';
import './PostsGrid.css';

const CATEGORIES = ['View All', 'Category 1', 'Category 2', 'Category 3'];

const POSTS = [
    {
        id: '1',
        imageUrl: '/img-1.png',
        imageHeight: 'small' as const,
        category: 'Category 1',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
        column: 1,
    },
    {
        id: '2',
        imageUrl: '/img-2.png',
        imageHeight: 'large' as const,
        category: 'Category 1',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
        column: 2,
    },
    {
        id: '3',
        imageUrl: '/img-3.png',
        imageHeight: 'medium' as const,
        category: 'Category 1',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
        column: 3,
    },
    {
        id: '4',
        imageUrl: '/img-4.png',
        imageHeight: 'large' as const,
        category: 'Category 1',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
        column: 1,
    },
    {
        id: '5',
        imageUrl: '/img-5.png',
        imageHeight: 'small' as const,
        category: 'Category 2',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
        column: 2,
    },
    {
        id: '6',
        imageUrl: '/img-6.png',
        imageHeight: 'medium' as const,
        category: 'Category 2',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
        column: 3,
    },
    {
        id: '7',
        imageUrl: '/img-7.png',
        imageHeight: 'large' as const,
        category: 'Category 3',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
        column: 1,
    },
    {
        id: '8',
        imageUrl: '/img-8.png',
        imageHeight: 'large' as const,
        category: 'Category 3',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
        column: 2,
    },
    {
        id: '9',
        imageUrl: '/img-9.png',
        imageHeight: 'medium' as const,
        category: 'Category 3',
        date: 'Date',
        title: 'Lorem ipsum dolor sit amet, consectetur.',
        description:
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia in deserunt mollit anim id est sint',
        column: 3,
    },
];

/**
 * Posts Grid section component
 * Displays a filterable masonry grid of blog post cards
 */
export function PostsGrid() {
    const [activeCategory, setActiveCategory] = useState('View All');

    const column1Posts = POSTS.filter((post) => post.column === 1);
    const column2Posts = POSTS.filter((post) => post.column === 2);
    const column3Posts = POSTS.filter((post) => post.column === 3);

    return (
        <section className="posts-grid">
            <CategoryTabs
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            <div className="posts-grid__masonry">
                <div className="posts-grid__column">
                    {column1Posts.map((post) => (
                        <PostCard
                            key={post.id}
                            imageUrl={post.imageUrl}
                            imageHeight={post.imageHeight}
                            category={post.category}
                            date={post.date}
                            title={post.title}
                            description={post.description}
                        />
                    ))}
                </div>
                <div className="posts-grid__column">
                    {column2Posts.map((post) => (
                        <PostCard
                            key={post.id}
                            imageUrl={post.imageUrl}
                            imageHeight={post.imageHeight}
                            category={post.category}
                            date={post.date}
                            title={post.title}
                            description={post.description}
                        />
                    ))}
                </div>
                <div className="posts-grid__column">
                    {column3Posts.map((post) => (
                        <PostCard
                            key={post.id}
                            imageUrl={post.imageUrl}
                            imageHeight={post.imageHeight}
                            category={post.category}
                            date={post.date}
                            title={post.title}
                            description={post.description}
                        />
                    ))}
                </div>
            </div>

            <div className="posts-grid__footer">
                <button className="posts-grid__button">View More</button>
            </div>
        </section>
    );
}

export default PostsGrid;
