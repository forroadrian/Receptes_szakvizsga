export default function requireBodyKeys(
  body: Record<string, unknown> | null | undefined,
  keys: string[]
) {
  if (!body || typeof body !== "object") {
    throw createError({ statusCode: 400, message: "Missing body" });
  }
  for (const key of keys) {
    const value = body[key];
    if (value === undefined || value === null || value === "") {
      throw createError({
        statusCode: 400,
        message: `Missing required field: ${key}`,
      });
    }
  }
}