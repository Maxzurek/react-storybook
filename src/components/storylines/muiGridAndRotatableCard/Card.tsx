import "./Card.scss";

interface CardProps {
    imageSrc: string;
    title: string;
    description: string;
    buttonLabel: string;
    profileImageSrc?: string;
    profileLink?: string;
}

export default function Card({
    imageSrc,
    title,
    description,
    buttonLabel,
    profileImageSrc,
    profileLink,
}: CardProps) {
    const backCardImage = "/images/cards/marvel-back-card.jpg";

    return (
        <div className="card">
            <div className="card__rotator-overlay">
                <div className="card__rotator">
                    <div className="card__front">
                        <img className="card__image" src={imageSrc} />
                    </div>
                    <div className="card__back">
                        <img
                            className="card__image"
                            src={backCardImage}
                        />
                    </div>
                </div>
            </div>
            <div className="card__body">
                <div className="card__image-profile-container">
                    <a href={profileLink} rel="noreferrer" target="_blank">
                        <img
                            className="card__image-profile"
                            src={profileImageSrc}
                        />
                    </a>
                    <div className="card__info-container">
                        <a href={profileLink} rel="noreferrer" target="_blank">
                            <div className="card__title">{title}</div>
                        </a>
                        <div className="card__description">{description}</div>
                    </div>
                </div>
                <button className="card__button">{buttonLabel}</button>
            </div>
        </div>
    );
}
