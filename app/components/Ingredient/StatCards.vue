<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    all?: number;
    fresh?: number;
    almostExpired?: number;
    expired?: number;
  }>(),
  {
    all: 0,
    fresh: 0,
    almostExpired: 0,
    expired: 0,
  }
);

const order = computed(() => {
  return [
    {
      amount: props.all,
      name: "Összes",
    },
    {
      amount: props.fresh,
      name: "Friss",
    },
    {
      amount: props.almostExpired,
      name: "Hamarosan",
    },
    {
      amount: props.expired,
      name: "Lejárt",
    },
  ];
});

const selected = ref<{ name: string; id: number }>({ name: "Friss", id: 1 });
</script>
<template>
  <div class="d-none d-md-block pb-4 border-bottom mt-4 mt-md-0 py-3">
    <span
      class="rounded rounded-pill d-flex align-items-center justify-content-around badge segmentation"
    >
      <span
        class="badge rounded-pill flex-grow-1"
        :class="[selected?.name === tag.name ? 'active' : 'inactive']"
        v-for="(tag, index) in order"
        @click="
          selected = { name: tag.name, id: index };
          $emit('filter', selected?.name);
        "
      >
        <i class="bi bi-circle-fill me-3"></i>
        {{ tag.name }}:
        <strong>{{ tag.amount }}</strong>
      </span>
    </span>
  </div>
  <div
    id="statsCollapse"
    class="d-block d-md-none d-flex flex-column gap-3 collapse collapse-horizontal w-50 position-relative z-3 whole"
  >
    <CardBase :orientation="'vertical'" class="position-absolute cardthingy">
      <template #header >
        <CardHeader :rank="4" class="text-center fw-bold mb-1 border-bottom">Statisztikák</CardHeader>
      </template>
      <template #body>
        <div class="d-flex flex-column badges">
            <span
              class="badge rounded-pill align-self-start w-100 text-start"
              :class="[selected?.name === tag.name ? 'active' : 'inactive']"
              v-for="(tag, index) in order"
              @click="
                selected = { name: tag.name, id: index };
                $emit('filter', selected?.name);
              "
            >
              <i class="bi bi-circle-fill me-3"></i>
              {{ tag.name }}:
              <strong>{{ tag.amount }}</strong>
            </span>
        </div>
      </template>
    </CardBase>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap");


.whole {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    left: calc(70%);
    top: -30px;
}

.cardthingy {
    background-color: white;
}

.segmentation > span {
  font-family: "Inter";
  padding: 10px 0px;
  font-size: var(--medium-text);
  transition: background-color 200ms ease-out, color 200ms ease-out,
    box-shadow 200ms ease-out, transform 200ms ease-out;
}

.segmentation {
  background-color: var(--segmentation-bg);
  border: 1px solid var(--pill-border);
  box-shadow: var(--pill-shadow);
}

.active {
  background-color: var(--active-bg);
  color: var(--active-text);
  font-weight: 800;
  border: 2px solid var(--pill-primary-strong);
}

.bi-circle-fill {
  transition: color 200ms ease-out;
}

.active .bi-circle-fill {
  color: var(--pill-primary-strong);
}

.inactive {
  background-color: transparent;
  color: var(--pill-text-muted);
}
.inactive .bi-circle-fill {
  color: var(--pill-text-light);
}

.badge {
    cursor: pointer;
}
</style>
