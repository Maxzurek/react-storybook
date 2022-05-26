import "./Storyline5.scss";

export default function Storyline5() {
    return (
        <div className="storyline5">
            <div className="storyline5__form-1">
                <div className="storyline5__form-row">
                    <input
                        className="storyline5__input-first-name"
                        placeholder="First name"
                        type="text"
                    />
                    <input
                        className="storyline5__input-last-name"
                        placeholder="Last name"
                        type="text"
                    />
                </div>
                <div className="storyline5__form-row">
                    <input
                        className="storyline5__input-email"
                        placeholder="Email"
                        type="email"
                    />
                </div>
                <div className="storyline5__form-row">
                    <button className="storyline5__button-sign-up">
                        Sign up
                    </button>
                </div>
            </div>

            <div className="storyline5__form-2">
                <div className="storyline5__form-row">

                </div>
            </div>
        </div>
    );
}
