<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useMenuStore } from "~/stores/menu";
import { toBudapestDateKey } from "~/utils/budapestDate";

definePageMeta({ middleware: "auth-only" });

const menuStore = useMenuStore();
const user = useSupabaseUser();
const { t } = useI18n();
const { showAlert } = useAlert();

const calendarRef = ref<{ goToDate: (dateKey: string) => void } | null>(null);
const addModalRef = ref<{ openFor: (dateKey: string) => Promise<void> } | null>(null);
const monthModalRef = ref<{ open: (year: number, month: number) => void } | null>(null);
const dayDetailRef = ref<{ open: (dateKey: string) => Promise<void> } | null>(null);

const isLoadingMenus = ref(false);

onMounted(async () => {
    if (!user.value) return;
    if (menuStore.isLoaded) return;
    isLoadingMenus.value = true;
    try {
        await menuStore.loadMenus();
    } catch (err: any) {
        showAlert("error", err?.data?.message ?? err?.message ?? t("menu.addModal.error"));
    } finally {
        isLoadingMenus.value = false;
    }
});

const openAddModal = (dateKey: string) => {
    addModalRef.value?.openFor(dateKey);
};

const openDayDetail = (dateKey: string) => {
    dayDetailRef.value?.open(dateKey);
};

const openMonthModal = () => {
    const now = new Date();
    monthModalRef.value?.open(now.getFullYear(), now.getMonth());
};

const handleMenuClick = (menuId: number) => {
    const menu = menuStore.menus.find((m) => m.id === menuId);
    if (!menu) return;

    if (menu.recipes.length === 1 && menu.recipes[0]) {
        navigateTo(`/recipe/${menu.recipes[0].recipe_id}`);
        return;
    }
    openDayDetail(toBudapestDateKey(menu.planned_date));
};

const handleJump = (dateKey: string) => {
    calendarRef.value?.goToDate(dateKey);
    openDayDetail(dateKey);
};
</script>

<template>
    <section class="menu-page">
        <div class="menu-shell mx-auto px-3 px-md-4 px-lg-5 py-4">
            <header class="page-header mb-4">
                <h1 class="page-title mb-2">
                    {{ $t('menu.title') }}
                    <span v-if="isLoadingMenus" class="loading-dot" aria-hidden="true"></span>
                </h1>
                <p class="page-subtitle mb-0">
                    {{ $t('menu.subtitle') }}
                </p>
            </header>

            <div class="row g-4">
                <aside class="col-12 col-lg-4 order-lg-1 order-2">
                    <MenuSidebar
                        @jump="handleJump"
                        @day-click="handleJump"
                        @empty-click="openAddModal"
                        @open-month="openMonthModal"
                    />
                </aside>

                <section class="col-12 col-lg-8 order-lg-2 order-1">
                    <MenuCalendar
                        ref="calendarRef"
                        @empty-click="openAddModal"
                        @menu-click="handleMenuClick"
                        @overflow-click="openDayDetail"
                    />
                </section>
            </div>
        </div>

        <MenuRecipeAddModal ref="addModalRef" />
        <MenuMonthMenusModal ref="monthModalRef" @jump="handleJump" />
        <MenuDayDetailPopover ref="dayDetailRef" @add-recipe="openAddModal" />
    </section>
</template>

<style scoped>
.menu-page {
    min-height: 100%;
    background: var(--bs-body-bg);
}

.menu-shell {
    width: min(100%, 1320px);
}

.page-title {
    font-family: "Caveat Brush", cursive;
    font-size: clamp(2rem, 4vw, 2.8rem);
    text-transform: uppercase;
    color: var(--bs-emphasis-color);
    display: inline-flex;
    align-items: baseline;
    gap: 0.6rem;
}

.loading-dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: var(--orange);
    animation: loading-pulse 1.2s ease-in-out infinite;
    align-self: center;
}

@keyframes loading-pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.85); }
    50% { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
    .loading-dot { animation: none; opacity: 0.7; }
}

.page-subtitle {
    color: var(--bs-secondary-color);
    max-width: 60ch;
}

@media (max-width: 991px) {
    .page-subtitle {
        font-size: var(--small-text);
    }
}
</style>
