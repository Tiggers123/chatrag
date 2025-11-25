export type InitialFormState = {
    success?: boolean;
    message?: string;
    errors?: Record<string, string[]>;
} | null;
