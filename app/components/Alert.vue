<script setup>
defineProps({
    show: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: "success"
    },
    message: {
        type: String,
        default: ""
    }
});

defineEmits(["close"]);
</script>

<template>
    <div class="alert-container position-fixed top-0 start-50 translate-middle-x mt-3">
        <transition name="alert-slide">
            <div v-if="show" class="custom-alert" :class="type === 'success' ? 'alert-success-custom' : 'alert-danger-custom'">
                <div class="custom-alert-content">
                    <div class="custom-alert-left">
                        <i class="bi" :class="type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'"></i>
                        <span>{{ message }}</span>
                    </div>
                    
                    <button type="button" class="custom-alert-close" @click="$emit('close')" aria-label="Bezárás">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="custom-alert-timer"></div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.alert-container {
    min-width: 320px;
    max-width: 90vw;
    z-index: 1080;
}

.custom-alert {
    min-width: 320px;
    max-width: 460px;
    border-radius: 16px;
    box-shadow: 0 14px 35px rgba(0, 0, 0, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.10);
}

.custom-alert-content,
.custom-alert-left {
    display: flex;
    align-items: center;
}

.custom-alert-content {
    justify-content: space-between;
    gap: 18px;
    padding: 14px 16px;
}

.custom-alert-left {
    gap: 10px;
    font-weight: 500;
}

.custom-alert-left i {
    font-size: 1.1rem;
}

.custom-alert-close {
    border: 0;
    background: transparent;
    color: inherit;
    padding: 0;
    align-items: center;
}

.custom-alert-close:hover {
    opacity: 1;
    transform: scale(1.08);
}

.custom-alert-timer {
    height: 4px;
    width: 100%;
    transform-origin: left;
    animation: alertTimerBar 5s linear forwards;
}

.alert-success-custom,
.alert-danger-custom {
    color: #fff;
}

.alert-success-custom {
    background: rgba(25, 135, 84, 0.96);
}

.alert-danger-custom {
    background: rgba(220, 53, 69, 0.96);
}

.alert-success-custom .custom-alert-timer,
.alert-danger-custom .custom-alert-timer {
    background: rgba(255, 255, 255, 0.85);
}

.alert-slide-enter-active,
.alert-slide-leave-active {
    transition: opacity 0.35s ease, transform 0.35s ease;
}

.alert-slide-enter-from {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
}

.alert-slide-enter-to,
.alert-slide-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.alert-slide-leave-to {
    opacity: 0;
    transform: translateY(-14px) scale(0.98);
}

@keyframes alertTimerBar {
    from {
        transform: scaleX(1);
    }

    to {
        transform: scaleX(0);
    }
}
</style>