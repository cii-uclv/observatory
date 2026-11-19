import { LoginUserInput, RegisterUserInput } from "../schemas/auth";

export const DEFAULT_LOGIN_VALUES: LoginUserInput = {
	username: "",
	password: "",
};

export const DEFAULT_REGISTER_VALUES: RegisterUserInput = {
	username: "",
	email: "",
	first_name: "",
	last_name: "",
	password: "",
	confirmPassword: "",
};
