import React, { useState } from "react";
import Slider from "../../slider/Slider";
import ExpandableDiv from "./ExpandableDiv";
import "./ExpandableIndex.scss";

export default function ExpandableIndex() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [inputValue, setInputValue] = useState(0);

    const animationDuration = (0.1 * 100 + inputValue) / 100;

    const handleHeaderClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(Number(e.target.value));
    };

    return (
        <div className="expandable-index">
            <Slider value={inputValue} onChange={handleChangeInput} />
            <div className="expandable-index__animation-duration-indicator">
                Animation duration: {animationDuration}
            </div>
            <div className="expandable-index__header" onClick={handleHeaderClick}>
                Click me to {isExpanded ? "collapse" : "expand"}
            </div>
            <ExpandableDiv
                animationDuration={animationDuration}
                className="expandable-index__body"
                isExpanded={isExpanded}
            >
                <div className="expandable-index__placeholder">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Provident facere ipsam
                    error suscipit omnis animi sequi, cumque magnam, commodi tempora quas temporibus
                    natus odio aliquid similique aut nobis, vero recusandae maxime velit iure.
                    Exercitationem quia provident perferendis. Quos maiores inventore voluptas,
                    mollitia, in iure dolorum nulla est fuga corrupti repudiandae nihil recusandae
                    consequatur quisquam possimus nemo. Reprehenderit aut consequuntur, nostrum
                    quidem totam officiis facilis officia accusantium dolores et vero nam minus
                    laborum culpa, quasi maiores accusamus eveniet consequatur, nemo dicta? Placeat,
                    sint tempora! Esse, praesentium? Deleniti nemo asperiores hic harum. Corporis
                    dolore quasi a quod maxime vitae mollitia error ducimus cumque distinctio!
                    Magnam deserunt omnis consequuntur at amet, cumque cum quia? Est labore neque
                    quae, aliquid pariatur facilis sed, laborum ipsa qui aspernatur libero vel
                    beatae iusto nesciunt repudiandae nisi, necessitatibus tempore dolor. Officiis
                    sapiente culpa tempora a aut vitae labore sint itaque, et dolorum sequi,
                    obcaecati voluptatem! Autem fuga distinctio laudantium quos recusandae
                    aspernatur suscipit commodi. Officiis quasi, maiores quos placeat
                    necessitatibus, aperiam exercitationem natus corporis aliquam ratione temporibus
                    soluta beatae! Repudiandae voluptatum quaerat repellat aliquid dolore pariatur,
                    molestias, itaque laudantium quae veniam reprehenderit, harum repellendus
                    accusantium assumenda eius libero nulla. Unde aliquam mollitia impedit hic velit
                    quisquam, culpa maiores suscipit dolorem tenetur laudantium deserunt
                    exercitationem sunt nemo rem assumenda excepturi incidunt itaque odit facere
                    accusantium quo architecto. Fugiat et maxime reiciendis dolor hic autem rem
                    laboriosam, molestias possimus repellendus. Eligendi pariatur atque dignissimos
                    temporibus, vel consequuntur mollitia iure facilis deserunt sit aut molestiae
                    reiciendis minima, voluptas consectetur quia rerum totam dolores fuga! Ab, fuga,
                    a maxime possimus voluptatum inventore reiciendis necessitatibus esse distinctio
                    error impedit cum, iure sequi aspernatur deleniti aperiam vel? Illo sed laborum
                    sint provident error ipsum veritatis corporis placeat non distinctio voluptatem
                    ipsam, adipisci quis eveniet. Illo labore vero aut odio numquam adipisci. Maxime
                    ea qui nostrum quibusdam cum modi quos illo, earum maiores hic? Distinctio iure
                    itaque libero consequuntur similique optio est quis adipisci repellendus
                    quibusdam soluta maiores hic quos necessitatibus vel illum, nobis tempore, sunt
                    amet accusamus. Eligendi corporis quaerat assumenda ipsa, necessitatibus ullam
                    officia numquam, voluptas porro aliquid alias ducimus itaque temporibus dolores,
                    earum laudantium. Rem ut a quisquam ipsam, quam placeat, dicta harum, explicabo
                    fugit accusamus optio. Laudantium eos temporibus quis molestiae adipisci tenetur
                    aut unde, cum ipsa! Magni possimus repudiandae dolorum non iste corrupti.
                    Recusandae, cumque? Amet voluptatum corrupti culpa soluta laborum impedit
                    corporis saepe deleniti totam temporibus? Quas, possimus reprehenderit cum ut,
                    quae inventore animi, vel eaque assumenda maxime qui architecto tempore impedit
                    dignissimos obcaecati omnis cumque sint. Nobis officiis consequuntur repellat
                    cupiditate minima quasi illum corporis dolores quia, placeat aspernatur, dolore
                    quam ratione consequatur, aut nesciunt dolor omnis unde at odio atque qui
                    repudiandae mollitia! Consectetur ipsa eveniet libero eligendi unde doloremque
                    hic vitae quibusdam aut qui quas obcaecati at, illum esse corrupti ratione
                    provident quos minima eos. Id, fugit? Corrupti distinctio quod atque, vero
                    molestiae magnam cumque, ut id numquam a veritatis et fugit. Eius consectetur
                    eos omnis! Harum aut, laborum necessitatibus nobis quo corporis ipsa laudantium!
                </div>
            </ExpandableDiv>
        </div>
    );
}
