import "./MuiCustomAutocomplete.scss";
import "react-perfect-scrollbar/dist/css/styles.css";

import { Box, TextField } from "@mui/material";
import { useState } from "react";
import CustomAutocomplete from "./CustomAutocomplete";
import PerfectScrollbar from "react-perfect-scrollbar";
import AutocompleteListboxComponent from "./AutocompleteListboxComponent";

export default function MuiCustomAutocomplete() {
    const [value, setValue] = useState<CountryType>(options[0]);

    return (
        <div className="mui-custom-select">
            <div className="mui-custom-select__autocomplete-group">
                <div className="mui-custom-select__selected-image">
                    <img
                        loading="lazy"
                        src={`https://flagcdn.com/w20/${value.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${value.code.toLowerCase()}.png 2x`}
                    />
                </div>
                <CustomAutocomplete
                    autoComplete={false}
                    autoHighlight
                    disablePortal
                    getOptionLabel={(option) => option.label}
                    ListboxComponent={(params) => (
                        <AutocompleteListboxComponent props={params} />
                    )}
                    // PaperComponent={(params) => (
                    //     <PerfectScrollbar>
                    //         <Paper {...params} />
                    //     </PerfectScrollbar>
                    // )}
                    options={options}
                    renderInput={(params) => (
                        <>
                            <TextField
                                {...params}
                                inputProps={{
                                    ...params.inputProps,
                                    autoComplete: "new-password", // disable autocomplete and autofill
                                }}
                            />
                        </>
                    )}
                    renderOption={(props, option) => (
                        <Box
                            component="li"
                            sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                            {...props}
                        >
                            <img
                                loading="lazy"
                                src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                width="20"
                            />
                            {option.label} ({option.code}) +{option.phone}
                        </Box>
                    )}
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue ?? options[0]);
                    }}
                />
            </div>
            <PerfectScrollbar>
                <ul style={{ height: "100px" }}>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Exercitationem illum earum necessitatibus laborum facilis
                    deleniti animi accusantium aliquid. Sunt quas nam tempore
                    tempora nemo, doloremque placeat ullam eaque, voluptatem,
                    illum nesciunt adipisci beatae nisi veniam? Maxime fuga
                    temporibus iusto itaque illo illum laudantium architecto,
                    praesentium, voluptatum similique animi ipsum? Laudantium,
                    exercitationem perferendis, commodi veniam dolor quos esse
                    eius nemo fuga est a explicabo consequuntur provident! Optio
                    dicta asperiores explicabo consequuntur tempora! Sunt,
                    exercitationem necessitatibus rem ex laborum dignissimos!
                    Eveniet sit consequatur voluptas, debitis aut, totam culpa
                    mollitia ullam quae, veniam nobis. Recusandae aliquam esse
                    mollitia earum perferendis voluptas velit eveniet repellat
                    ut corrupti molestiae rem vero ducimus dignissimos
                    accusamus, quo nisi. Nemo commodi ut qui voluptatum
                    molestiae eveniet excepturi fugiat? Sequi ea corrupti,
                    reiciendis nemo ad maiores qui molestiae iste voluptatem
                    libero quasi rem necessitatibus minus autem? Quas, sint,
                    impedit debitis quos modi reprehenderit porro, officiis
                    aspernatur ipsam totam adipisci. Cum in veniam nulla
                    corrupti quia commodi laboriosam asperiores soluta delectus
                    quo distinctio blanditiis, facere aperiam praesentium
                    eligendi illo necessitatibus maiores sapiente rerum possimus
                    ipsam, ut tenetur, aliquid dolores. Nesciunt architecto unde
                    pariatur quod culpa nobis quia aperiam, temporibus eligendi
                    maxime iusto nam magni, quasi inventore id amet nihil
                    dolores quas, sint dolor porro modi laborum eaque eveniet?
                    Asperiores id, deserunt molestiae voluptas, eos magni fugiat
                    repudiandae eius dolorum aliquid amet quisquam vero tempora
                    quibusdam excepturi aperiam animi earum atque praesentium
                    nemo ducimus eum. Commodi in eaque sed quis ipsa libero
                    veritatis excepturi illo unde esse, placeat molestias sint
                    culpa provident perferendis iure molestiae delectus corrupti
                    facilis. Possimus incidunt placeat consequatur voluptates
                    maxime consectetur ad iste doloribus, dolores doloremque
                    similique tempore repellat. Voluptates repellendus, modi
                    iusto suscipit odio tempora aliquid ad incidunt quis eaque
                    placeat laboriosam, autem error in facere provident saepe
                    laudantium quisquam accusantium velit voluptatum? Vero ea
                    excepturi unde autem. Iusto, nulla autem quia quod explicabo
                    repellendus vel, ab, debitis assumenda iure reiciendis dolor
                    nihil earum doloremque. Error omnis aut, cum temporibus non,
                    placeat saepe nulla voluptatibus eos commodi ducimus
                    repudiandae! Possimus quam dolores eius, debitis saepe
                    dolore ut minima recusandae, maxime dicta iste quia sit
                    mollitia. Nostrum exercitationem aperiam ab cum. Impedit
                    minima enim ipsum, ex accusantium laborum eligendi. Incidunt
                    eum fugiat dolores animi soluta beatae harum natus quia!
                    Quam optio itaque accusantium quas facere? Maxime, ducimus
                    ipsa eius autem cumque aspernatur tenetur sed atque deleniti
                    earum soluta nobis magni harum officiis ab odio,
                    consequuntur vero quas. Aperiam voluptatem nisi animi
                    voluptatibus officia porro quos eaque, accusamus nostrum
                    natus, deserunt esse nemo quibusdam? Vero at totam quas
                    consequatur, ut ipsum unde sit impedit rerum dolorem
                    dignissimos, nobis cum expedita eligendi doloremque saepe
                    dolorum molestiae maxime corrupti culpa. Animi eaque
                    officiis cupiditate labore vel voluptas omnis quaerat fuga
                    quae autem ad, nobis quam quo esse amet, sunt suscipit, non
                    a voluptates velit? Reprehenderit mollitia quidem quod sit
                    illo dolores. Possimus fugiat quo eaque voluptas eius, velit
                    ab debitis porro labore assumenda incidunt reiciendis? Ipsa
                    quis eius distinctio rem, optio voluptatem harum adipisci
                    quisquam accusantium reiciendis maxime, dolorem laudantium?
                </ul>
            </PerfectScrollbar>
        </div>
    );
}

export interface CountryType {
    code: string;
    label: string;
    phone: string;
}

const options = [
    { code: "AD", label: "Andorra", phone: "376" },
    {
        code: "AE",
        label: "United Arab Emirates",
        phone: "971",
    },
    { code: "AF", label: "Afghanistan", phone: "93" },
    {
        code: "AG",
        label: "Antigua and Barbuda",
        phone: "1-268",
    },
    { code: "AI", label: "Anguilla", phone: "1-264" },
    { code: "AL", label: "Albania", phone: "355" },
    { code: "AM", label: "Armenia", phone: "374" },
    { code: "AO", label: "Angola", phone: "244" },
    { code: "AQ", label: "Antarctica", phone: "672" },
    { code: "AR", label: "Argentina", phone: "54" },
    { code: "AS", label: "American Samoa", phone: "1-684" },
    { code: "AT", label: "Austria", phone: "43" },
    {
        code: "AU",
        label: "Australia",
        phone: "61",
        suggested: true,
    },
    { code: "AW", label: "Aruba", phone: "297" },
    { code: "AX", label: "Alland Islands", phone: "358" },
    { code: "AZ", label: "Azerbaijan", phone: "994" },
    {
        code: "BA",
        label: "Bosnia and Herzegovina",
        phone: "387",
    },
    { code: "BB", label: "Barbados", phone: "1-246" },
    { code: "BD", label: "Bangladesh", phone: "880" },
    { code: "BE", label: "Belgium", phone: "32" },
    { code: "BF", label: "Burkina Faso", phone: "226" },
    { code: "BG", label: "Bulgaria", phone: "359" },
    { code: "BH", label: "Bahrain", phone: "973" },
    { code: "BI", label: "Burundi", phone: "257" },
    { code: "BJ", label: "Benin", phone: "229" },
    { code: "BL", label: "Saint Barthelemy", phone: "590" },
    { code: "BM", label: "Bermuda", phone: "1-441" },
    { code: "BN", label: "Brunei Darussalam", phone: "673" },
    { code: "BO", label: "Bolivia", phone: "591" },
    { code: "BR", label: "Brazil", phone: "55" },
    { code: "BS", label: "Bahamas", phone: "1-242" },
    { code: "BT", label: "Bhutan", phone: "975" },
    { code: "BV", label: "Bouvet Island", phone: "47" },
    { code: "BW", label: "Botswana", phone: "267" },
    { code: "BY", label: "Belarus", phone: "375" },
    { code: "BZ", label: "Belize", phone: "501" },
];
