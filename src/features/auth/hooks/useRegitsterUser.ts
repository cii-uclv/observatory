"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/lib/api";

import { DEFAULT_REGISTER_VALUES } from "../const/default-values";
import { SESSION_QUERY_KEY } from "../const/query-keys";
import { RegisterUserInput, registerUserSchema } from "../schemas/auth";
import { signIn, signUp } from "../service";

export const useRegitsterUser = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const {
		register,
		handleSubmit: handleSubmitForm,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<RegisterUserInput>({
		resolver: zodResolver(registerUserSchema),
		defaultValues: DEFAULT_REGISTER_VALUES,
	});

	const onSubmit = async (data: RegisterUserInput) => {
		setErrorMessage(null);

		try {
			await signUp(data);
		} catch (error) {
			setErrorMessage(getApiErrorMessage(error, "No se pudo completar el registro."));

			return;
		}

		try {
			await signIn({
				username: data.username,
				password: data.password,
			});
		} catch {
			reset();
			router.replace("/login?registered=1");
			router.refresh();

			return;
		}

		await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
		reset();
		router.push(`/${data.username}`);
		router.refresh();
	};

	return {
		register,
		handleSubmit: handleSubmitForm(onSubmit),
		errors,
		isSubmitting,
		errorMessage,
	};
};
