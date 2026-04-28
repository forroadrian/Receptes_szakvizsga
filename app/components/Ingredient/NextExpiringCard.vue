<script setup lang="ts">
import { computed } from "vue";
import { useIngredientStore } from "~/stores/ingredients";
import { daysFromToday } from "~/utils/budapestDate";

const emit = defineEmits<{
    (e: "jump", ingredientId: number): void;
}>();

const store = useIngredientStore();
const { t, locale } = useI18n();
const { formatUnit } = useUnitFormatter();

const intlLocale = computed(() => (locale.value === "hu" ? "hu-HU" : "en-US"));

const nextExpiring = computed(() => {
    const nonExpired = store.ingredients.filter((i) => i.tag !== "expired");
    if (!nonExpired.length) return null;
    return [...nonExpired].sort(
        (a, b) => a.expiry.value.getTime() - b.expiry.value.getTime()
    )[0];
});

const relativeLabel = computed(() => {
    const i = nextExpiring.value;
    if (!i) return "";
    const days = daysFromToday(i.expiry.toStamp());
    if (days <= 0) return t("pantry.nextExpiring.relative.today");
    if (days === 1) return t("pantry.nextExpiring.relative.tomorrow");
    if (days < 7) return t("pantry.nextExpiring.relative.inDays", { count: days }, days);
    return new Intl.DateTimeFormat(intlLocale.value, {
        timeZone: "Europe/Budapest",
        month: "long",
        day: "numeric",
    }).format(i.expiry.value);
});

const onJump = () => {
    if (nextExpiring.value) emit("jump", nextExpiring.value.id);
};
</script>

<template>
    <section class="next-expiring" :class="{ 'is-empty': !nextExpiring }">
        <p class="label mb-2">
            <i class="bi bi-hourglass-split me-2"></i>
            {{$t('pantry.nextExpiring.label')}}
        </p>

        <template v-if="nextExpiring">
            <button type="button" class="title-btn text-start w-100" @click="onJump">
                <span class="title">{{$t('ingredient.' + nextExpiring.id)}}</span>
                <span class="relative">{{ relativeLabel }}</span>
            </button>

            <div class="meta">
                <i class="bi bi-box2 me-1"></i>
                {{ nextExpiring.quantity }} {{ formatUnit(nextExpiring.unit) }}
            </div>
        </template>

        <template v-else>
            <p class="empty mb-0">{{$t('pantry.nextExpiring.empty')}}</p>
        </template>
    </section>
</template>

<style scoped>
.next-expiring {
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    color: var(--bs-body-color);
}

.label {
    font-size: var(--small-text);
    font-weight: 600;
    color: var(--bs-secondary-color);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
}

.title-btn {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.title {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--bs-emphasis-color);
}

.title-btn:hover .title {
    color: var(--orange);
}

.relative {
    font-size: var(--small-text);
    color: var(--orange);
    font-weight: 600;
}

.meta {
    margin-top: 0.75rem;
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
}

.empty {
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
}
</style>
