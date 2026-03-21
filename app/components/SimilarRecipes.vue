<script setup lang="ts">
import CardBase from './CardBase.vue'
import CardHeader from './CardHeader.vue'
import CardMetadata from './CardMetadata.vue'
import CardTitle from './CardTitle.vue'

export interface SimilarRecipeItem {
    id: string | number
    title: string
    image?: string
    pageLink?: string
    time?: string
    servings?: string
}

const props = withDefaults(
    defineProps<{
        title?: string
        items?: SimilarRecipeItem[]
    }>(),
    {
        items: () => [
            {
                id: 1,
                title: 'Lorem ipsum dolor sit amet lorem sit amet',
                pageLink: '#',
                time: '80 perc',
                servings: '4 fő'
            },
            {
                id: 2,
                title: 'Lorem ipsum dolor sit amet lorem sit amet dolor sit lorem',
                pageLink: '#',
                time: '60 perc',
                servings: '2 fő'
            },
            {
                id: 3,
                title: 'Lorem ipsum dolor sit amet',
                pageLink: '#',
                time: '30 perc',
                servings: '2 fő'
            }
        ]
    }
)
</script>

<template>
    <section>
        <div class="similar-recipe-list">
            <CardBase v-for="item in items" orientation="horizontal" variant="outline" media-position="topLeft"
                class="similar-recipes-card" media-class="similar-recipes-media-shell"
                media-left-class="similar-recipes-media" content-class="similar-recipes-content" header-class="w-100">
                <template #media>
                    <img v-if="item.image" :src="item.image" :alt="item.title" class="similar-recipes-image">
                    <div v-else aria-hidden="true" class="similar-recipes-image">
                        <img src="/assets/icons/peking-duck.png" alt="">
                    </div>
                </template>

                <template #header>
                    <CardHeader>
                        <div class="similar-recipes-header">
                            <CardTitle :rank="5" class="text-wrap">{{ item.title }}</CardTitle>
                            <p class="py-1"><a v-if="item.pageLink" :href="item.pageLink" class=""> >> Részletek</a>
                            </p>

                        </div>
                    </CardHeader>
                </template>

                <template #metadata>
                    <CardMetadata>
                        <span v-if="item.time" class="similar-recipes-meta-item">
                            <i class="bi bi-clock me-1"></i>
                            {{ item.time }}
                        </span>
                        <span v-if="item.servings" class="similar-recipes-meta-item">
                            <i class="bi bi-people me-2"></i>
                            {{ item.servings }}
                        </span>
                    </CardMetadata>
                </template>
            </CardBase>
        </div>
    </section>
</template>

<style scoped>
.similar-recipes-card {
    padding: 20px !important;
    margin: 30px 0px;
}

.similar-recipes-image {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
}

img {
    width: 100%;
    height: 100%;
}

@media (max-width: 992px) {

    .similar-recipes-card {
        text-align: center !important;
    }

    .card-metadata {
        justify-content: center;
    }
}
</style>