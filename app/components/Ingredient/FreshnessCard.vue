<script setup lang="ts">
import { computed } from "vue";
import { useIngredientStore } from "~/stores/ingredients";

const store = useIngredientStore();

const freshCount = computed(
    () => store.ingredients.filter((i) => i.tag === "fresh").length
);
const totalCount = computed(() => store.ingredients.length);
</script>

<template>
    <section class="freshness-card">
        <div class="card-main">
            <span class="count">{{ freshCount }}</span>
            <div class="meta">
                <span class="title">{{ $t('pantry.freshness.title') }}</span>
                <span class="subtitle">{{$t('pantry.freshness.subtitle')}}</span>
            </div>
            <i class="bi bi-leaf icon"></i>
        </div>

        <div class="card-status">
            <i class="bi bi-basket3 me-2"></i>
            <span>
                <strong>{{ totalCount }}</strong>
                {{$t('pantry.freshness.total')}}
            </span>
        </div>
    </section>
</template>

<style scoped>
.freshness-card {
    border-radius: var(--radius-md);
    padding: 1.25rem 1.25rem 1rem;
    background:
        linear-gradient(var(--bs-body-bg), var(--bs-body-bg)) padding-box,
        var(--grad-orange) border-box;
    border: 2px solid transparent;
    color: var(--bs-body-color);
}

.card-main {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
}

.count {
    font-family: "Caveat Brush", cursive;
    font-size: 64px;
    line-height: 1;
    color: var(--orange);
}

.meta {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.title {
    font-family: "Caveat Brush", cursive;
    font-size: 28px;
    color: var(--bs-emphasis-color);
    text-transform: uppercase;
}

.subtitle {
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
}

.icon {
    margin-left: auto;
    font-size: 28px;
    color: var(--orange);
    opacity: 0.75;
}

.card-status {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px dashed var(--bs-border-color);
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
    display: flex;
    align-items: center;
}

.card-status strong {
    color: var(--bs-emphasis-color);
    margin-right: 0.25rem;
}

@media (max-width: 576px) {
    .freshness-card {
        padding: 1rem;
    }

    .count {
        font-size: 48px;
    }

    .title {
        font-size: 22px;
    }
}
</style>
