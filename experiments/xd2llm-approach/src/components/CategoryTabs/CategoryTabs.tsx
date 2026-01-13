import './CategoryTabs.css';

type CategoryTabsProps = {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
};

/**
 * Category filter tabs component
 * Displays a horizontal list of category filters
 */
export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
    return (
        <nav className="category-tabs">
            {categories.map((category) => (
                <button
                    key={category}
                    className={`category-tabs__item ${
                        activeCategory === category ? 'category-tabs__item--active' : ''
                    }`}
                    onClick={() => onCategoryChange(category)}
                >
                    {category}
                </button>
            ))}
        </nav>
    );
}

export default CategoryTabs;
