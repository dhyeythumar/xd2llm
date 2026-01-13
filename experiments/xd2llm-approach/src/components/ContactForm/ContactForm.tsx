import { useState } from 'react';
import './ContactForm.css';

type ContactFormProps = {
    onClose?: () => void;
    onSubmit?: (data: { name: string; email: string; message: string }) => void;
};

/**
 * Contact Form / Get In Touch modal component
 * Displays contact information and a message form
 */
export function ContactForm({ onClose, onSubmit }: ContactFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.({ name, email, message });
    };

    return (
        <div className="contact-form-overlay">
            <div className="contact-form">
                {/* Left Side - Form */}
                <div className="contact-form__left">
                    <h4 className="contact-form__title">Get In Touch</h4>

                    <div className="contact-form__info">
                        <div className="contact-form__info-item">
                            {/* TODO: Add location icon SVG */}
                            <svg
                                className="contact-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                            >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span className="contact-form__info-text">123 Mockup St., New York</span>
                        </div>
                        <div className="contact-form__info-item">
                            {/* TODO: Add phone icon SVG */}
                            <svg
                                className="contact-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                            >
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span className="contact-form__info-text">(+1) 123 456 7890</span>
                        </div>
                        <div className="contact-form__info-item">
                            {/* TODO: Add mobile icon SVG */}
                            <svg
                                className="contact-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                            >
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                <line x1="12" y1="18" x2="12.01" y2="18" />
                            </svg>
                            <span className="contact-form__info-text">(+1) 123 456 7891</span>
                        </div>
                    </div>

                    <form className="contact-form__form" onSubmit={handleSubmit}>
                        <div className="contact-form__row">
                            <input
                                type="text"
                                className="contact-form__input"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <input
                                type="email"
                                className="contact-form__input"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <textarea
                            className="contact-form__textarea"
                            placeholder="Write your message here"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" className="contact-form__button">
                            Send
                        </button>
                    </form>
                </div>

                {/* Right Side - Decorative */}
                <div className="contact-form__right">
                    <button className="contact-form__close" onClick={onClose} aria-label="Close">
                        <span className="contact-form__close-icon">×</span>
                    </button>
                    <div className="contact-form__pin">
                        <div className="contact-form__pin-outer" />
                        <div className="contact-form__pin-inner" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactForm;
