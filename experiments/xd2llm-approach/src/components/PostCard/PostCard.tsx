import './PostCard.css';

type PostCardProps = {
    imageUrl: string;
    imageHeight?: 'small' | 'medium' | 'large';
    category: string;
    date: string;
    title: string;
    description: string;
};

/**
 * Blog post card component
 * Displays an image, category/date, title, and description
 */
export function PostCard({ imageUrl, imageHeight = 'medium', category, date, title, description }: PostCardProps) {
    return (
        <article className={`post-card post-card--${imageHeight}`}>
            <div className="post-card__image-wrapper">
                <img src={imageUrl} alt={title} className="post-card__image" />
            </div>
            <div className="post-card__content">
                <span className="post-card__meta">
                    {category} &nbsp;|&nbsp; {date}
                </span>
                <h5 className="post-card__title">{title}</h5>
                <p className="post-card__description">{description}</p>
            </div>
        </article>
    );
}

export default PostCard;
