import "./FormInputIndex.scss";

import { useState } from "react";
import FormInput from "../../input/FormInput";
import { IoMdClose } from "react-icons/io";
import { BsEye, BsEyeSlash } from "react-icons/bs";

const FormInputIndex = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleClearEmail = () => {
        setEmail("");
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    const handleClickHidePassword = () => {
        setIsPasswordVisible(false);
    };

    const handleClickShowPassword = () => {
        setIsPasswordVisible(true);
    };

    return (
        <div className="form-input-index">
            <form className="form-input-index__form" onSubmit={handleSubmit}>
                <FormInput
                    endAdornment={
                        <IoMdClose
                            className="form-input-index__end-adornment"
                            onClick={handleClearEmail}
                        />
                    }
                    label="Email"
                    required
                    type="email"
                    value={email}
                    onChange={handleChangeEmail}
                />
                <FormInput
                    endAdornment={
                        isPasswordVisible ? (
                            <BsEyeSlash
                                className="sign-in-form__password-button"
                                onClick={handleClickHidePassword}
                            />
                        ) : (
                            <BsEye
                                className="sign-in-form__password-button"
                                onClick={handleClickShowPassword}
                            />
                        )
                    }
                    label="Password"
                    minLength={8}
                    required
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={handleChangePassword}
                />
                <button className="button form-input-index__button">Submit</button>
            </form>
        </div>
    );
};

export default FormInputIndex;
