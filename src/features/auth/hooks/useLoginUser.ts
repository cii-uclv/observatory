import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api";

import { DEFAULT_LOGIN_VALUES } from "../const/default-values";
import { SESSION_QUERY_KEY } from "../const/query-keys";
import { LoginUserInput, loginUserSchema } from "../schemas/auth";
import { signIn } from "../service";

interface UseLoginUserOptions {
	redirectTo?: string;
}

function getSafeRedirect(target?: string): string {
	if (!target || !target.startsWith("/") || target.startsWith("//") || target.includes("\\")) {
		return "/";
	}

	if (target.startsWith("/login")) {
		return "/";
	}

	return target;
}

export const useLoginUser = ({ redirectTo }: UseLoginUserOptions = {}) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const safeRedirect = getSafeRedirect(redirectTo);

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
			if (error instanceof ApiError) {
				setErrorMessage(error.response?.message || "Error de API");
			} else {
				setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
			}
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
