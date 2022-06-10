import "./MuiCustomAutocomplete.scss";

import { Box, TextField } from "@mui/material";
import { useState } from "react";
import CustomAutocomplete from "./CustomAutocomplete";

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
                    getOptionLabel={(option) => option.label}
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
