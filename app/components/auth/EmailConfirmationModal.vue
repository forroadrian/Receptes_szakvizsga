<script setup>
defineProps({
    show: {
        type: Boolean,
        required: true
    },
    email: {
        type: String,
        default: ""
    },
    resendLoading: {
        type: Boolean,
        default: false
    },
    resendMessage: {
        type: String,
        default: ""
    },
    resendError: {
        type: String,
        default: ""
    }
})

const emit = defineEmits(["close", "resend"])
</script>

<template>
    <Transition name="confirm-fade">
        <div v-if="show" class="confirm-overlay">
            <div class="confirm-modal">
                <button type="button" class="confirm-close" @click="emit('close')">×</button>

                <div class="confirm-icon-wrap">
                    <img src="../../assets/images/authentication.png" alt="Authentication" title="Authentication">
                </div>

                <h2 class="confirm-title">Email megerősítés</h2>

                <p class="confirm-text">
                    Küldtünk egy megerősítő emailt erre a címre:
                    <span class="confirm-email">{{ email }}</span>
                </p>

                <p class="confirm-text mb-0">
                    Kérjük, nyissa meg az emailjeit, és kattintson a levélben található linkre a regisztráció
                    befejezéséhez.
                </p>

                <div v-if="resendMessage" class="alert alert-success mt-4 mb-2">
                    {{ resendMessage }}
                </div>

                <div v-if="resendError" class="alert alert-danger mt-4 mb-2">
                    {{ resendError }}
                </div>

                <div class="confirm-resend">
                    <span>Nem kaptad meg az emailt?</span>
                    <button type="button" class="confirm-resend-link" :disabled="resendLoading" @click="emit('resend')">
                        {{ resendLoading ? 'Újraküldés...' : 'Újraküldés' }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 9999;
}

.confirm-modal {
    position: relative;
    width: 100%;
    max-width: 720px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    padding: 40px 32px 28px;
    text-align: center;
    transition: background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
}

.confirm-close {
    position: absolute;
    top: 14px;
    right: 18px;
    border: none;
    background: transparent;
    font-size: 34px;
    line-height: 1;
    color: #6c757d;
    cursor: pointer;
    transition: color 0.2s ease;
}

.confirm-icon-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}

.confirm-icon-wrap img {
    width: 70%;
}

.confirm-icon {
    font-size: 82px;
    color: #20c997;
}

.confirm-title,
.confirm-text {
    transition: color 0.25s ease;
}

.confirm-title {
    font-size: 2rem;
    margin-bottom: 16px;
    color: #212121;
}

.confirm-text,
.confirm-resend {
    color: #555;
}

.confirm-text {
    font-size: 1.05rem;
    margin-bottom: 10px;
}

.confirm-email {
    color: #0d6efd;
    font-weight: 600;
    word-break: break-word;
}

.confirm-resend {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 1rem;
    transition: color 0.25s ease, border-color 0.25s ease;
}

.confirm-resend-link {
    border: none;
    background: transparent;
    color: #0d6efd;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    padding: 0;
}

.confirm-resend-link:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
    transition: opacity 0.28s ease;
}

.confirm-fade-enter-active .confirm-modal,
.confirm-fade-leave-active .confirm-modal {
    transition: opacity 0.28s ease, transform 0.28s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
    opacity: 0;
}

.confirm-fade-enter-from .confirm-modal,
.confirm-fade-leave-to .confirm-modal {
    opacity: 0;
    transform: scale(0.94) translateY(12px);
}

.confirm-fade-enter-to .confirm-modal,
.confirm-fade-leave-from .confirm-modal {
    opacity: 1;
    transform: scale(1) translateY(0);
}

[data-bs-theme="dark"] .confirm-modal {
    background: #212121;
    color: #f5f5f5;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

[data-bs-theme="dark"] .confirm-title,
[data-bs-theme="dark"] .confirm-close {
    color: #f5f5f5;
}

[data-bs-theme="dark"] .confirm-text,
[data-bs-theme="dark"] .confirm-resend {
    color: #d8d8d8;
}

[data-bs-theme="dark"] .confirm-resend {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
}

[data-bs-theme="dark"] .confirm-close:hover {
    color: #ff7231;
}

[data-bs-theme="dark"] .alert-success {
    background-color: rgba(53, 165, 90, 0.18);
    color: #c8f1d3;
    border-color: rgba(53, 165, 90, 0.35);
}

[data-bs-theme="dark"] .alert-danger {
    background-color: rgba(220, 53, 69, 0.18);
    color: #ffd3d8;
    border-color: rgba(220, 53, 69, 0.35);
}

@media (max-width: 576px) {
    .confirm-modal {
        padding: 32px 20px 24px;
        border-radius: 18px;
    }

    .confirm-title {
        font-size: 1.6rem;
    }

    .confirm-icon {
        font-size: 64px;
    }
}
</style>