<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMenuStore, type MenuItem } from "~/stores/menu";
import {
    useMissingIngredients,
    type MissingIngredient,
} from "~/composables/useMissingIngredients";

const emit = defineEmits<{
    (e: "add-recipe", dateKey: string): void;
}>();

const menuStore = useMenuStore();
const missing = useMissingIngredients();
const { t, locale } = useI18n();

const modalElRef = ref<HTMLElement | null>(null);
let modalInstance: any = null;

const dateKey = ref<string>("");
const missingList = ref<MissingIngredient[]>([]);
const isLoadingMissing = ref(false);

const intlLocale = computed(() => (locale.value === "hu" ? "hu-HU" : "en-US"));

const menusForDay = computed<MenuItem[]>(() =>
    dateKey.value ? menuStore.getMenusForDate(dateKey.value) : []
);

const dateLabel = computed(() => {
    if (!dateKey.value) return "";
    const [y, m, d] = dateKey.value.split("-").map(Number);
    const date = new Date(y!, (m ?? 1) - 1, d);
    const formatted = new Intl.DateTimeFormat(intlLocale.value, {
        month: "long",
        day: "numeric",
    }).format(date);
    const weekday = new Intl.DateTimeFormat(intlLocale.value, {
        weekday: "long",
    }).format(date);
    return `${formatted} — ${weekday}`;
});

const formatTime = (iso: string) =>
    new Intl.DateTimeFormat(intlLocale.value, {
        timeZone: "Europe/Budapest",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));

const ensureModalInstance = () => {
    if (modalInstance) return modalInstance;
    if (!modalElRef.value) return null;
    const bs = (window as any).bootstrap;
    if (!bs?.Modal) return null;
    modalInstance = bs.Modal.getOrCreateInstance(modalElRef.value);
    return modalInstance;
};

const open = async (targetDateKey: string) => {
    dateKey.value = targetDateKey;
    missingList.value = [];
    ensureModalInstance()?.show();

    isLoadingMissing.value = true;
    try {
        missingList.value = await missing.loadDay(targetDateKey);
    } catch {
        missingList.value = [];
    } finally {
        isLoadingMissing.value = false;
    }
};

const close = () => modalInstance?.hide();

const handleRemoveRecipe = async (menuId: number, recipeId: number) => {
    if (!confirm(t("menu.dayDetail.confirmRemoveRecipe"))) return;
    try {
        await menuStore.removeRecipeFromMenu(menuId, recipeId);
        missing.invalidate();
    } catch {
        alert(t("menu.dayDetail.removeRecipeError"));
    }
};

const handleDeleteMenu = async (menuId: number) => {
    if (!confirm(t("menu.dayDetail.confirmDeleteMenu"))) return;
    try {
        await menuStore.deleteMenu(menuId);
        missing.invalidate();
        if (!menusForDay.value.length) close();
    } catch {
        alert(t("menu.dayDetail.deleteMenuError"));
    }
};

const handleAdd = () => {
    close();
    emit("add-recipe", dateKey.value);
};

onMounted(() => {
    ensureModalInstance();
});

defineExpose({ open });
</script>

<template>
    <div
        id="dayDetailModal"
        ref="modalElRef"
            class="modal fade"
            tabindex="-1"
            aria-labelledby="dayDetailModalLabel"
            aria-hidden="true"
        >
            <div class="modal-dialog modal-dialog-centered modal-lg day-dialog">
                <div class="modal-content day-modal">
                    <div class="modal-header">
                        <div class="d-flex flex-column">
                            <h2 id="dayDetailModalLabel" class="modal-title fs-4 mb-1">
                                {{ $t('menu.dayDetail.title') }}
                            </h2>
                            <p class="mb-0 text-muted small">{{ dateLabel }}</p>
                        </div>
                        <button
                            type="button"
                            class="btn-close ms-3"
                            data-bs-dismiss="modal"
                            :aria-label="$t('common.actions.close')"
                        ></button>
                    </div>

                    <div class="modal-body">
                        <section v-if="menusForDay.length" class="menus-section">
                            <div
                                v-for="menu in menusForDay"
                                :key="menu.id"
                                class="menu-block"
                            >
                                <header class="menu-block-head">
                                    <div>
                                        <span class="menu-name">
                                            {{ menu.name || $t('menu.untitled') }}
                                        </span>
                                        <span class="menu-time ms-2">
                                            <i class="bi bi-clock me-1"></i>
                                            {{ formatTime(menu.planned_date) }}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        class="icon-btn danger"
                                        :aria-label="$t('menu.dayDetail.deleteMenuAria')"
                                        @click="handleDeleteMenu(menu.id)"
                                    >
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </header>

                                <ul v-if="menu.recipes.length" class="recipe-list list-unstyled m-0">
                                    <li
                                        v-for="recipe in menu.recipes"
                                        :key="recipe.recipe_id"
                                        class="recipe-row"
                                    >
                                        <NuxtLink
                                            :to="`/recipe/${recipe.recipe_id}`"
                                            class="recipe-link"
                                            @click="close"
                                        >
                                            <span class="recipe-name">{{ recipe.name }}</span>
                                            <span class="recipe-meta small">
                                                <i class="bi bi-clock me-1"></i>
                                                {{ recipe.time }} {{ $t('menu.dayDetail.minutes') }}
                                                <span class="dot">·</span>
                                                <i class="bi bi-people me-1"></i>
                                                {{ recipe.servings }} {{ $t('menu.dayDetail.people') }}
                                            </span>
                                        </NuxtLink>
                                        <button
                                            type="button"
                                            class="icon-btn small"
                                            :aria-label="$t('menu.dayDetail.removeRecipeAria')"
                                            :title="$t('menu.dayDetail.removeRecipeTitle')"
                                            @click="handleRemoveRecipe(menu.id, recipe.recipe_id)"
                                        >
                                            <i class="bi bi-x-lg"></i>
                                        </button>
                                    </li>
                                </ul>

                                <p v-else class="text-muted small mb-0">
                                    {{ $t('menu.dayDetail.noRecipes') }}
                                </p>
                            </div>
                        </section>

                        <section v-else class="empty-menus">
                            <i class="bi bi-calendar-plus fs-2 mb-2 d-block"></i>
                            <p class="mb-3">{{ $t('menu.dayDetail.empty') }}</p>
                        </section>

                        <section v-if="menusForDay.length" class="missing-section mt-4">
                            <header class="section-head">
                                <span class="section-title">
                                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                    {{ $t('menu.dayDetail.missingTitle') }}
                                </span>
                                <span
                                    v-if="missingList.length"
                                    class="count-pill"
                                >
                                    {{ missingList.length }}
                                </span>
                            </header>

                            <p v-if="isLoadingMissing" class="text-muted small mb-0">
                                {{ $t('menu.dayDetail.checking') }}
                            </p>

                            <p
                                v-else-if="!missingList.length"
                                class="success-note mb-0"
                            >
                                <i class="bi bi-check2-circle me-2"></i>
                                {{ $t('menu.dayDetail.allPresent') }}
                            </p>

                            <ul v-else class="missing-list list-unstyled m-0">
                                <li
                                    v-for="item in missingList"
                                    :key="item.ingredient_id"
                                    class="missing-row"
                                >
                                    <span class="missing-name">{{ item.ingredient_name }}</span>
                                    <span class="missing-qty">
                                        {{ item.required_quantity }} {{ item.required_unit }}
                                    </span>
                                    <span
                                        v-if="item.has_expired_stock"
                                        class="expired-flag"
                                        :title="$t('menu.dayDetail.expiredTitle')"
                                    >
                                        {{ $t('menu.dayDetail.expiredFlag') }}
                                    </span>
                                </li>
                            </ul>
                        </section>
                    </div>

                    <div class="modal-footer d-flex justify-content-between gap-2 flex-wrap">
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                        >
                            {{ $t('menu.dayDetail.close') }}
                        </button>
                        <Button
                            color="orange"
                            icon="bi bi-plus-lg"
                            icon-position="left"
                            @click="handleAdd"
                        >
                            {{ $t('menu.dayDetail.addRecipe') }}
                        </Button>
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

.menus-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.menu-block {
    padding: 0.85rem 1rem;
    border-radius: var(--radius-sm);
    background: var(--bs-tertiary-bg);
    border: 1px solid var(--bs-border-color);
}

.menu-block-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.menu-name {
    font-weight: 700;
    color: var(--bs-emphasis-color);
}

.menu-time {
    color: var(--bs-secondary-color);
    font-size: var(--small-text);
}

.recipe-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.recipe-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.5rem;
    border-radius: var(--radius-sm);
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    transition: border-color 0.15s ease-in;
}

.recipe-row:hover {
    border-color: var(--orange);
}

.recipe-link {
    flex: 1;
    display: flex;
    flex-direction: column;
    color: inherit;
    text-decoration: none;
    min-width: 0;
}

.recipe-name {
    font-weight: 500;
    color: var(--bs-emphasis-color);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

.recipe-meta {
    color: var(--bs-secondary-color);
    font-size: var(--small-text);
}

.dot {
    margin: 0 0.35rem;
}

.icon-btn {
    background: none;
    border: 1px solid var(--bs-border-color);
    color: var(--bs-secondary-color);
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease-in;
}

.icon-btn.small {
    width: 28px;
    height: 28px;
}

.icon-btn:hover {
    color: var(--bs-emphasis-color);
    border-color: var(--bs-emphasis-color);
}

.icon-btn.danger:hover {
    color: #d64545;
    border-color: #d64545;
}

.empty-menus {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--bs-secondary-color);
}

.missing-section {
    border-top: 1px dashed var(--bs-border-color);
    padding-top: 1rem;
}

.section-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.section-title {
    font-weight: 700;
    color: var(--bs-emphasis-color);
    display: inline-flex;
    align-items: center;
}

.section-title i {
    color: #c05a18;
}

.count-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    padding: 0 0.5rem;
    height: 22px;
    border-radius: var(--radius-rounded);
    background: rgba(255, 114, 49, 0.14);
    color: #b4410a;
    font-weight: 700;
    font-size: 12px;
}

.success-note {
    font-size: var(--small-text);
    color: var(--green);
    font-weight: 500;
}

.missing-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.missing-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    border-radius: var(--radius-sm);
    background: rgba(255, 114, 49, 0.06);
    border: 1px solid rgba(255, 114, 49, 0.2);
}

[data-bs-theme="dark"] .missing-row {
    background: rgba(255, 114, 49, 0.08);
}

.missing-name {
    flex: 1;
    font-weight: 500;
    color: var(--bs-body-color);
}

.missing-qty {
    color: var(--bs-secondary-color);
    font-size: var(--small-text);
}

.expired-flag {
    padding: 1px 6px;
    border-radius: var(--radius-sm);
    background: rgba(214, 69, 69, 0.15);
    color: #d64545;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

@media (max-width: 576px) {
    .menu-block {
        padding: 0.7rem 0.75rem;
    }

    .recipe-row {
        padding: 0.35rem 0.4rem;
    }

    .icon-btn {
        width: 28px;
        height: 28px;
    }
}
</style>
