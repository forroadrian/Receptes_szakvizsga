<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useIngredientStore } from "~/stores/ingredients";

const emit = defineEmits<{
    (e: "pick", ingredientName: string): void;
}>();

const store = useIngredientStore();

const modalElRef = ref<HTMLElement | null>(null);
let modalInstance: any = null;

const missing = ref<{ name: string; appears: number }[]>([]);
const isLoading = ref(false);

const ensureModalInstance = () => {
    if (modalInstance) return modalInstance;
    if (!modalElRef.value) return null;
    const bs = (window as any).bootstrap;
    if (!bs?.Modal) return null;
    modalInstance = bs.Modal.getOrCreateInstance(modalElRef.value);
    return modalInstance;
};

const open = async () => {
    ensureModalInstance()?.show();
    isLoading.value = true;
    try {
        const res = await store.getMissing();
        missing.value = Array.isArray(res) ? res : [];
    } catch {
        missing.value = [];
    } finally {
        isLoading.value = false;
    }
};

const close = () => modalInstance?.hide();

const onPick = (name: string) => {
    close();
    emit("pick", name);
};

onMounted(() => {
    ensureModalInstance();
});

defineExpose({ open });
</script>

<template>
    <div
        id="ingredientMissingModal"
        ref="modalElRef"
        class="modal fade"
        tabindex="-1"
        aria-labelledby="ingredientMissingModalLabel"
        aria-hidden="true"
    >
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="d-flex flex-column">
                        <h2 id="ingredientMissingModalLabel" class="modal-title fs-4 mb-1">
                            Hiányzó alapanyagok
                        </h2>
                        <p class="mb-0 text-muted small">
                            A receptjeidben gyakran előforduló alapanyagok, amelyek még nincsenek a kamrádban.
                        </p>
                    </div>
                    <button
                        type="button"
                        class="btn-close ms-3"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                    ></button>
                </div>

                <div class="modal-body">
                    <p v-if="isLoading" class="text-muted small mb-0">Betöltés...</p>

                    <div v-else-if="!missing.length" class="empty">
                        <i class="bi bi-check2-circle fs-2 mb-2 d-block"></i>
                        <p class="mb-0">Nincs hiányzó ajánlás.</p>
                    </div>

                    <ul v-else class="missing-list list-unstyled m-0">
                        <li
                            v-for="item in missing"
                            :key="item.name"
                        >
                            <button
                                type="button"
                                class="missing-row"
                                @click="onPick(item.name)"
                            >
                                <span class="appears-chip">
                                    {{ item.appears }}&times;
                                </span>
                                <span class="item-name">{{ item.name }}</span>
                                <span class="add-hint">
                                    <i class="bi bi-plus-lg me-1"></i>
                                    Hozzáadás
                                </span>
                            </button>
                        </li>
                    </ul>
                </div>

                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        data-bs-dismiss="modal"
                    >
                        Bezárás
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-content {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    border-radius: var(--radius-md);
}

.empty {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--bs-secondary-color);
}

.missing-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.missing-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.55rem 0.75rem;
    border-radius: var(--radius-sm);
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    color: inherit;
    cursor: pointer;
    transition: all 0.15s ease-in;
}

.missing-row:hover {
    background: var(--accent-soft);
    border-color: var(--orange);
}

[data-bs-theme="dark"] .missing-row:hover {
    background: rgba(255, 114, 49, 0.1);
}

.appears-chip {
    min-width: 44px;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    background: var(--bs-tertiary-bg);
    color: var(--bs-secondary-color);
    font-size: 12px;
    font-weight: 700;
    text-align: center;
    flex-shrink: 0;
}

.item-name {
    flex: 1;
    text-align: left;
    font-weight: 500;
    color: var(--bs-emphasis-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.add-hint {
    font-size: var(--small-text);
    color: var(--orange);
    font-weight: 600;
    flex-shrink: 0;
}
</style>
