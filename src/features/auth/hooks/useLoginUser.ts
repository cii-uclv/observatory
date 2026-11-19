import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/lib/api";
import { sanitizeNextPath } from "@/lib/auth/redirect";

import { DEFAULT_LOGIN_VALUES } from "../const/default-values";
import { SESSION_QUERY_KEY } from "../const/query-keys";
import { LoginUserInput, loginUserSchema } from "../schemas/auth";
import { signIn } from "../service";

interface UseLoginUserOptions {
	redirectTo?: string;
}

export const useLoginUser = ({ redirectTo }: UseLoginUserOptions = {}) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const safeRedirect = sanitizeNextPath(redirectTo) ?? "/";

	const {
		register,
		handleSubmit: handleSubmitForm,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<LoginUserInput>({
		resolver: zodResolver(loginUserSchema),
		defaultValues: DEFAULT_LOGIN_VALUES,
	});

	const onSubmit = async (data: LoginUserInput) => {
		setErrorMessage(null);

		try {
			await signIn(data);
			await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
			reset();
			router.replace(safeRedirect);
			router.refresh();
		} catch (error) {
			setErrorMessage(getApiErrorMessage(error, "No se pudo iniciar sesión."));
		}
	};

	return {
		register,
		handleSubmit: handleSubmitForm(onSubmit),
		errors,
		isSubmitting,
		errorMessage,
	};
};
