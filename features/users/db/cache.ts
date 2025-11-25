import { revalidatePath } from "next/cache";

export const revalidateUserCache = (userId: string) => {
    // In a real app, you might invalidate specific cache keys
    // For now, we'll just revalidate the path where user data might be shown
    revalidatePath("/");
    revalidatePath("/admin");
};
