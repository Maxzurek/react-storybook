import "./MuiGridAndRotatableCard.scss";

import { Grid } from "@mui/material";
import Card from "./Card";

const captainAmericaImg = "/images/cards/captain-america.jpg";
const ironManImg = "/images/cards/iron-man.jpg";
const spiderManImg = "/images/cards/spider-man.jpg";
const quicksilverImg = "/images/cards/quicksilver.jpg";
const scarletWitch = "/images/cards/scarlet-witch.jpg";

const ironManProfileImg = "/images/profiles/iron-man-profile-transparent.png";
const spiderManProfileImg =
    "/images/profiles/spider-man-profile-transparent.png";
const scarletWitchProfileImg =
    "/images/profiles/scarlet-witch-profile-transparent.png";
const captainAmericaProfileImg =
    "/images/profiles/captain-america-profile-transparent.png";
const quickSilverProfileImg =
    "/images/profiles/quick-silver-profile-transparent.png";

export default function MuiGridAndRotatableCard() {
    return (
        <div className="mui-grid-and-rotatable-card">
            <Grid
                alignItems={"stretch"}
                container
                justifyContent={"space-evenly"}
                spacing={2}
            >
                <Grid item>
                    <Card
                        buttonLabel={"Add Friend"}
                        description={"900,236,590 followers"}
                        imageSrc={captainAmericaImg}
                        profileImageSrc={captainAmericaProfileImg}
                        profileLink="https://www.marvel.com/characters/captain-america-steve-rogers"
                        title={"Captain America"}
                    />
                </Grid>
                <Grid item>
                    <Card
                        buttonLabel={"Add Friend"}
                        description={"1,234,629,235 followers"}
                        imageSrc={ironManImg}
                        profileImageSrc={ironManProfileImg}
                        profileLink="https://www.marvel.com/characters/iron-man-tony-stark"
                        title={"Iron Man"}
                    />
                </Grid>
                <Grid item>
                    <Card
                        buttonLabel={"Add Friend"}
                        description={"802,934,118 followers"}
                        imageSrc={spiderManImg}
                        profileImageSrc={spiderManProfileImg}
                        profileLink="https://www.marvel.com/characters/spider-man-peter-parker"
                        title={"Spider-Man"}
                    />
                </Grid>
                <Grid item>
                    <Card
                        buttonLabel={"Add Friend"}
                        description={"602,021,118 followers"}
                        imageSrc={quicksilverImg}
                        profileImageSrc={quickSilverProfileImg}
                        profileLink="https://www.marvel.com/characters/quicksilver"
                        title={"Quicksilver"}
                    />
                </Grid>
                <Grid item>
                    <Card
                        buttonLabel={"Add Friend"}
                        description={"582,739,921 followers"}
                        imageSrc={scarletWitch}
                        profileImageSrc={scarletWitchProfileImg}
                        profileLink="https://www.marvel.com/characters/scarlet-witch-wanda-maximoff"
                        title={"Scarlet Witch"}
                    />
                </Grid>
            </Grid>
        </div>
    );
}
