<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';

const props = withDefaults(
    defineProps<{
        show: boolean;
        title?: string;
        name?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        loading?: boolean;
    }>(),
    { loading: false }
);

const emit = defineEmits<{ confirm: []; cancel: [] }>();

const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.show) emit('cancel');
};

onMounted(() => window.addEventListener('keydown', handleEsc));
onBeforeUnmount(() => window.removeEventListener('keydown', handleEsc));
</script>

<template>
    <Teleport to="body">
        <div name="modal-fade">
            <div v-if="show" class="confirm-backdrop" @click.self="emit('cancel')">
                <div class="recipe-card confirm-card" @click.stop>
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="confirm-icon">
                            <span name="icon" class="grad orange"><i class="bi bi-exclamation-triangle"></i></span>
                        </div>
                        <h2 class="fs-3">
                            <slot name="title">{{ $t('recipe.addRecipeModal.titleDelete') }}</slot>
                        </h2>
                    </div>

                    <div class="my-5">
                        <h3 v-if="name">{{ $t('recipe.addRecipeModal.subtitleDelete', { name }) }}</h3>
                        <p class="text-secondary mb-0">
                            <slot name="message">{{ $t('common.irreversible') }}</slot>
                        </p>
                    </div>

                    <div class="row">
                        <div class="col-lg-6 col-md-6 col-sm-12 my-3 d-flex justify-content-center justify-content-md-end justify-content-xl-center">
                            <Button class="w-100" @click="emit('cancel')">
                                {{ cancelLabel ?? $t('common.actions.cancel') }}
                            </Button>
                        </div>
                        <div class="col-lg-6 col-md-6 col-sm-12  my-3 d-flex justify-content-center justify-content-md-end justify-content-xl-center">
                            <Button class="w-100" color="orange" :disabled="loading" @click="emit('confirm')">
                                    {{ loading ? $t('common.actions.deleting') : (confirmLabel ?? $t('common.actions.confirm')) }}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.confirm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1060;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.confirm-card {
    width: 50%;
    background: var(--bs-body-bg);
    padding: 30px;
    border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
    .confirm-card  {
        min-width: 80%;
    }
 }
</style>
