import "./CustomAutocomplete.scss";

import { Autocomplete, AutocompleteProps } from "@mui/material";

export default function CustomAutocomplete<
    T,
    Multiple extends boolean | undefined = undefined,
    DisableClearable extends boolean | undefined = undefined,
    FreeSolo extends boolean | undefined = undefined
>(props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
    return (
        <div className="custom-autocomplete">
            <Autocomplete {...props} />
        </div>
    );
}
