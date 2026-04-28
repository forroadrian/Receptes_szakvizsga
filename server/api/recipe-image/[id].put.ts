import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";
import { uploadImage } from "~~/server/utils/cloudinary";

export default defineEventHandler(async (event) => {
    const admin = await serverSupabaseServiceRole<Database>(event);
    const user = await requireUser(event);
    const recipeId = Number(getRouterParam(event, "id"));

    if (!recipeId || isNaN(recipeId)) {
        throw createError({ statusCode: 400, message: "Érvénytelen recept azonosító." });
    }

    const { data: existing, error: fetchError } = await admin
        .from("recipe")
        .select("author_id")
        .eq("id", recipeId)
        .single();

    if (fetchError || !existing) {
        throw createError({ statusCode: 404, message: "Recept nem található." });
    }

    if (existing.author_id !== user.sub) {
        throw createError({ statusCode: 403, message: "Nincs jogosultságod." });
    }

    const formData = await readMultipartFormData(event);
    const fileField = formData?.find((f) => f.name === "file");

    if (!fileField || !fileField.data || !fileField.type?.startsWith("image/")) {
        throw createError({ statusCode: 400, message: "Érvénytelen képfájl." });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (fileField.data.length > MAX_FILE_SIZE) {
        throw createError({ statusCode: 400, message: "A fájl mérete nem lehet nagyobb 5MB-nál." });
    }

    const result = await uploadImage(event, {
        buffer: Buffer.from(fileField.data),
        folder: "recipes",
        publicId: `recipe_${recipeId}`,
        transformation: [
            { quality: "auto", fetch_format: "auto" },
        ],
    });

    const imageUrl = result.secure_url;

    const { error: updateError } = await admin
        .from("recipe")
        .update({ image_url: imageUrl } as any)
        .eq("id", recipeId);

    if (updateError) {
        throw createError({ statusCode: 500, message: updateError.message });
    }

    return { imageUrl };
});