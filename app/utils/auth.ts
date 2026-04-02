export const getRequestErrorMessage = (error: any, fallback: string) => {
    return error?.data?.statusMessage || error?.statusMessage || error?.message || fallback
}