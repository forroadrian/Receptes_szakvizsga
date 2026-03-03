<script setup lang="ts">
import type { CardTagItem } from '~/components/CardTags.vue';


const tagsFirstCard: CardTagItem[] = [
    { label: 'Ebéd', variant: 'active' },
    { label: 'Sós', variant: 'outline' },
    { label: 'Tovább...', variant: 'greyed' },
]

</script>
<template>
    <div class="container py-4">
        <h1 class="mb-4">Kartyak :D</h1>
        <section class="mb-5">
            <Card variant="outline" media-position="topLeft" tags-position="below" show-divider class="mb-3">
                <template #media>
                    <div class="d-flex align-items-center justify-content-center w-100 h-100 text-secondary">
                        <span>📷</span>
                    </div>
                </template>
                <template #badge>
                    <span class="badge bg-dark text-white rounded-pill">Kipróbált</span>
                </template>
                <template #header>
                    <CardHeader>
                        <CardTitle :rank="2">Lorem ipsum dolor sit amet</CardTitle>
                        <template #actions>
                            <span class="text-secondary" title="User">👤</span>
                        </template>
                    </CardHeader>
                </template>
                <template #body>
                    <p class="small text-body-secondary mb-0 text-center">
                        Accusantium doloremque laudantium, totam rem aperiam eaque doloremque.
                    </p>
                </template>
                <template #metadata>
                    <CardMetadata>
                        <span>🕐 30 perc</span>
                        <span>👥 2 fő</span>
                    </CardMetadata>
                </template>
                <template #tags>
                    <CardTags :items="tagsFirstCard" />
                </template>
                <template #footer>
                    <p class="small text-body-secondary mb-0">(!) Allergént tartalmaz: Búzafélék</p>
                </template>
            </Card>
        </section>

        <section class="mb-5">
            <Card variant="outline" media-position="top" tags-position="above" show-divider class="mb-3">
                <template #media>
                    <div class="d-flex align-items-center justify-content-center w-100 h-100 text-secondary">
                        <span>📷</span>
                    </div>
                </template>
                <template #badge>
                    <span class="badge bg-dark text-white rounded-pill">Kipróbált</span>
                </template>
                <template #header>
                    <CardHeader>
                        <CardTitle :rank="2">Lorem ipsum dolor sit amet</CardTitle>
                        <template #actions>
                            <span class="text-secondary" title="User">👤</span>
                        </template>
                    </CardHeader>
                </template>
                <template #body>
                    <p class="small text-body-secondary mb-0 text-center">
                        Accusantium doloremque laudantium, totam rem aperiam eaque.
                    </p>
                </template>
                <template #footer>
                    <p class="small text-body-secondary mb-0">(!!!) Allergént tartalmaz: Búzafélék</p>
                </template>
            </Card>
        </section>
    </div>
</template>


<style>
    .card--base {
        max-width: 400px!important;
    }
</style>