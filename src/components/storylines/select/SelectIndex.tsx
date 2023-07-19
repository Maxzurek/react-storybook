import "./SelectIndex.scss";

import Select, { Option } from "../../select/Select";
import { useState } from "react";

const SelectIndex = () => {
    const [selectedOption, setSelectedOption] = useState<Option<string>>();
    const [selectedOptions, setSelectedOptions] = useState<Option<string>[]>([]);

    const handleSelectOption = (option: Option<string>) => {
        setSelectedOption(option);
    };

    const handleAddOption = (option: Option<string>) => {
        setSelectedOptions([...selectedOptions, option]);
    };

    const handleRemoveOption = (option: Option<string>) => {
        const newSelectedOptions = selectedOptions.filter(
            (selectedOption) => selectedOption.value !== option.value
        );
        setSelectedOptions(newSelectedOptions);
    };

    return (
        <div className="select-index">
            <Select
                options={[
                    {
                        value: "Option 1",
                        label: "Option 1",
                    },
                    {
                        value: "Option 2",
                        label: "Option 2",
                    },
                ]}
                placeHolder="Select and option"
                selectedOption={selectedOption}
                theme="primary"
                onSelectOption={handleSelectOption}
            />
            <Select
                options={[
                    {
                        value: "Option 1",
                        label: "Option 1",
                    },
                    {
                        value: "Option 2",
                        label: "Option 2",
                    },
                    {
                        value: "Option 3",
                        label: "Option 3",
                    },
                ]}
                placeHolder="Select options"
                selectedOptions={selectedOptions}
                onRemoveOption={handleRemoveOption}
                onSelectOption={handleAddOption}
            />
        </div>
    );
};

export default SelectIndex;
