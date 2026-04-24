import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { requireUser } from "~~/server/utils/requireUser";
import { uploadImage } from "~~/server/utils/cloudinary";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = /^image\/(jpeg|png|webp|gif|heic|heif)$/i;

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event);
    const authUser = await requireUser(event);

    const form = await readMultipartFormData(event);
    const filePart = form?.find((part) => part.name === "file");

    if (!filePart?.data || !filePart.filename) {
        throw createError({ statusCode: 400, message: "Hiányzó képfájl." });
    }

    if (filePart.data.length > MAX_FILE_BYTES) {
        throw createError({ statusCode: 413, message: "A kép maximum 2 MB lehet." });
    }

    if (!filePart.type || !ALLOWED_MIME.test(filePart.type)) {
        throw createError({ statusCode: 415, message: "Nem támogatott képformátum." });
    }

    const userId = authUser.id || authUser.sub;

    const uploadResult = await uploadImage(event, {
        buffer: filePart.data,
        folder: "profiles",
        publicId: userId,
    });

    const { error } = await client
        .from("user")
        .update({ profile_url: uploadResult.secure_url })
        .eq("id", userId);

    if (error) {
        throw createError({ statusCode: 500, message: "Nem sikerült menteni a profilképet." });
    }

    return { profileUrl: uploadResult.secure_url };
});
