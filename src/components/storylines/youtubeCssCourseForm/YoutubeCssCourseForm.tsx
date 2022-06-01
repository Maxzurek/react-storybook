import "./YoutubeCssCourseForm.scss";

export default function YoutubeCssCourseForm() {
    return (
        <div className="youtube-css-course-form">
            <div className="youtube-css-course-form__form-1">
                <div className="youtube-css-course-form__form-row">
                    <input
                        className="youtube-css-course-form__input-first-name"
                        placeholder="First name"
                        type="text"
                    />
                    <input
                        className="youtube-css-course-form__input-last-name"
                        placeholder="Last name"
                        type="text"
                    />
                </div>
                <div className="youtube-css-course-form__form-row">
                    <input
                        className="youtube-css-course-form__input-email"
                        placeholder="Email"
                        type="email"
                    />
                </div>
                <div className="youtube-css-course-form__form-row">
                    <button className="youtube-css-course-form__button-sign-up">
                        Sign up
                    </button>
                </div>
            </div>
        </div>
    );
}
