let alertTimer: ReturnType<typeof setTimeout> | null = null

export const useAlert = () => {
    const show = useState<boolean>("alert-show", () => false)
    const type = useState<string>("alert-type", () => "success")
    const message = useState<string>("alert-message", () => "")
    const duration = useState<number>("alert-duration", () => 5000)
    const alertKey = useState<number>("alert-key", () => 0)

    const hideAlert = () => {
        show.value = false

        if (alertTimer) {
            clearTimeout(alertTimer)
            alertTimer = null
        }
    }

    const showAlert = (
        newType: "success" | "danger" | "error",
        newMessage: string,
        newDuration = 5000
    ) => {
        if (alertTimer) {
            clearTimeout(alertTimer)
            alertTimer = null
        }

        type.value = newType === "error" ? "danger" : newType
        message.value = newMessage
        duration.value = newDuration
        alertKey.value += 1
        show.value = true

        alertTimer = setTimeout(() => {
            hideAlert()
        }, newDuration)
    }

    return {show, type , message , duration , alertKey , showAlert , hideAlert }
}