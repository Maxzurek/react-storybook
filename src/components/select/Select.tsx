import "./Select.scss";

import { useRef, useState } from "react";
import Chip from "../chip/Chip";
import { SelectOption } from "./SelectOption";
import FormControlBase, { FormControlBaseProps } from "../formControl/FormControlBase";
import DropdownMenu, { DropdownMenuPosition } from "../dropDownMenu/DropdownMenu";
import { withClassNames } from "../../utilities/Html.utils";
import ClickOutsideArea from "../clickOutsideArea/ClickOutsideArea";
import { RxCaretDown } from "react-icons/rx";

export interface Option<T> {
    value: T;
    label: string;
}

interface SelectBaseProps<T> extends Omit<FormControlBaseProps, "isLabelRaised"> {
    options: Option<T>[];
    placeHolder?: string;
    className?: string;
    onSelectOption: (value: Option<T>) => void;
    onRemoveOption?: (value: Option<T>) => void;
}

interface SelectWithSingleSelectedOptionProps<T> extends SelectBaseProps<T> {
    selectedOption?: Option<T>;
}
interface SelectWithMultipleSelectedOptionsProps<T> extends SelectBaseProps<T> {
    selectedOptions?: Option<T>[];
}

type SelectProps<T> = SelectWithSingleSelectedOptionProps<T> &
    SelectWithMultipleSelectedOptionsProps<T>;

function Select<T>(props: SelectWithSingleSelectedOptionProps<T>): JSX.Element;
function Select<T>(props: SelectWithMultipleSelectedOptionsProps<T>): JSX.Element;
function Select<T>(props: SelectProps<T>) {
    const {
        selectedOptions,
        selectedOption,
        options,
        placeHolder = "",
        className,
        animationDuration = 250,
        onSelectOption,
        onRemoveOption,
        ...formControlBaseProps
    } = props;
    const { theme } = formControlBaseProps;
    const hasSelectedOptions =
        selectedOptions?.length > 0 || (!!selectedOption?.value && !!selectedOption?.label);

    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [dropdownMenuPosition, setDropdownMenuPosition] = useState<DropdownMenuPosition>(
        DropdownMenuPosition.Bottom
    );

    const selectRef = useRef<HTMLDivElement>();
    const dropdownMenuRef = useRef<HTMLDivElement>();

    const handleSelectRefCallback = (node: HTMLDivElement) => {
        selectRef.current = node;

        if (!node) return;

        node.style.setProperty("--select-animation-duration", `${animationDuration / 1000}s`);
    };

    const handleCloseMenu = () => {
        setIsDropDownOpen(false);
    };

    const handleClickFormControlBase = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === dropdownMenuRef.current) return;

        if (isDropDownOpen) {
            handleCloseMenu();
        } else {
            setIsDropDownOpen(true);
        }
    };

    const handleClickOutSideArea = () => {
        if (isDropDownOpen) {
            handleCloseMenu();
        } else {
            setIsDropDownOpen(true);
        }
    };

    const handleClickOption = (e: React.MouseEvent, option: Option<T>) => {
        e.stopPropagation();

        onSelectOption(option);
        handleCloseMenu();
    };

    const handleChangeOption = (e: React.MouseEvent, option: Option<T>, isChecked: boolean) => {
        e.stopPropagation();

        if (isChecked) {
            onRemoveOption(option);
        } else {
            onSelectOption(option);
        }
    };

    const handleAfterOpenDropdownMenu = (position: DropdownMenuPosition) => {
        setDropdownMenuPosition(position);
    };

    return (
        <FormControlBase
            ref={handleSelectRefCallback}
            className={withClassNames([
                className,
                "select",
                theme === "secondary" && "select--theme-secondary",
                theme === "accent" && "select--theme-accent",
                isDropDownOpen &&
                    dropdownMenuPosition === DropdownMenuPosition.Bottom &&
                    "select--menu-opened-bottom",
                isDropDownOpen &&
                    dropdownMenuPosition === DropdownMenuPosition.Top &&
                    "select--menu-opened-top",
                selectedOptions?.length && "select--with-chips",
                formControlBaseProps.variant === "standard" && "select--standard",
            ])}
            onClick={handleClickFormControlBase}
            {...formControlBaseProps}
            isLabelRaised={hasSelectedOptions || isDropDownOpen}
        >
            {selectedOptions ? (
                <div className="select__chips">
                    {selectedOptions.length
                        ? selectedOptions.map((option, index) => (
                              <Chip
                                  key={`${option.value}-${index}`}
                                  theme={theme}
                                  value={option.label}
                                  onDelete={() => onRemoveOption(option)}
                              />
                          ))
                        : placeHolder}
                </div>
            ) : (
                <div className="select__value">
                    {hasSelectedOptions ? selectedOption?.label : placeHolder}
                </div>
            )}
            <div className="select__caret-button">
                <RxCaretDown
                    className={withClassNames([
                        "select__caret-icon",
                        isDropDownOpen && "select__caret-icon--rotate",
                    ])}
                />
            </div>
            <ClickOutsideArea isActive={isDropDownOpen} onClick={handleClickOutSideArea}>
                <DropdownMenu
                    ref={dropdownMenuRef}
                    anchorElement={selectRef.current}
                    calculateWith="anchor-width"
                    isOpen={isDropDownOpen}
                    theme={formControlBaseProps.theme}
                    onAfterOpen={handleAfterOpenDropdownMenu}
                >
                    {options.map((option, index) => {
                        if (selectedOptions) {
                            const isChecked =
                                selectedOptions.findIndex(
                                    (selectedOption) => selectedOption.value === option.value
                                ) > -1;

                            return (
                                <SelectOption
                                    key={`${option}-${index}`}
                                    isChecked={isChecked}
                                    label={option.label}
                                    theme={theme}
                                    value={option.value}
                                    withCheckbox
                                    onChange={(e) => handleChangeOption(e, option, isChecked)}
                                />
                            );
                        } else if (option.value !== selectedOption?.value) {
                            return (
                                <SelectOption
                                    key={`${option}-${index}`}
                                    label={option.label}
                                    theme={theme}
                                    value={option.value}
                                    onClick={(e) => handleClickOption(e, option)}
                                />
                            );
                        } else {
                            return null;
                        }
                    })}
                </DropdownMenu>
            </ClickOutsideArea>
        </FormControlBase>
    );
}

export default Select;
