import "./CssGrid.scss";

export default function CssGrid() {
    const handleOpenGoogle = () => {
        window.open("https://www.google.com");
    };

    return (
        <div className="css-grid">
            <div className="css-grid__grid">
                <div className="css-grid__grid-item css-grid__grid-item-1">
                    <button
                        className="css-grid__google-link story__button"
                        onClick={handleOpenGoogle}
                    >
                        Open Google
                    </button>
                </div>
                <div className="css-grid__grid-item css-grid__grid-item-2">
                    <h2>Item 2</h2>
                </div>
                <div className="css-grid__grid-item css-grid__grid-item-3">
                    <h2>Item 3</h2>
                </div>
                <div className="css-grid__grid-item css-grid__grid-item-4">
                    <h2 className="header">Item 4</h2>
                    <div className="text">Textd ad asd asd asdasd</div>
                    <button className="button">Test</button>
                </div>
                <div className="css-grid__grid-item css-grid__grid-item-5">
                    <h2 className="header">Item 5</h2>
                    <div className="text">Textd ad asd asd asdasd</div>
                    <button className="button">Test</button>
                </div>
                <div className="css-grid__grid-item css-grid__grid-item-6">
                    <h2 className="header">Item 6</h2>
                </div>
            </div>
        </div>
    );
}
