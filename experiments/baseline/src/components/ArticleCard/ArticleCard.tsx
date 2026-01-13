import './ArticleCard.css';

type ArticleCardProps = {
    image: string;
    category: string;
    date: string;
    title: string;
    description: string;
};

export function ArticleCard({ image, category, date, title, description }: ArticleCardProps) {
    return (
        <article className="article-card">
            <div className="article-image-container">
                <img src={image} alt={title} className="article-image" />
            </div>
            <div className="article-meta">
                <span className="article-category">{category}</span>
                <span className="article-separator">|</span>
                <span className="article-date">{date}</span>
            </div>
            <h3 className="article-title">{title}</h3>
            <p className="article-description">{description}</p>
        </article>
    );
}
