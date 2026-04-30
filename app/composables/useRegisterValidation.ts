export const useRegisterValidation = () => {
    const isUsernameOk = (username: string) =>
        username.trim().length >= 4

    const isPasswordOk = (password: string) =>
        password.trim().length >= 6

    const doPasswordsMatch = (password: string, repassword: string) =>
        password === repassword

    return { isUsernameOk, isPasswordOk, doPasswordsMatch }
}
