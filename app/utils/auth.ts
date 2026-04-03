export const getRequestErrorMessage = (error: any, fallback: string) => {
    return error?.data?.message || error?.message || error?.data?.statusMessage || error?.statusMessage || fallback
}