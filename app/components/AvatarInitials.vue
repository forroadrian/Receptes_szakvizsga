<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    name?: string | null
    size?: string
}>(), {
    name: '',
    size: '40px'
})

const initials = computed(() => {
    const source = (props.name ?? '').trim()
    if (!source) return '?'

    const parts = source.split(/[\s._-]+/).filter(Boolean)
    const first = parts[0]?.[0] ?? ''
    const second = parts.length > 1 ? parts[1]?.[0] ?? '' : ''

    return (first + second).toUpperCase() || '?'
})

const paletteIndex = computed(() => {
    const source = (props.name ?? '').trim()
    if (!source) return 0

    let hash = 0
    for (let i = 0; i < source.length; i++) {
        hash = (hash * 31 + source.charCodeAt(i)) | 0
    }
    return Math.abs(hash) % 3
})
</script>

<template>
    <span class="avatar-initials" :class="`p${paletteIndex}`"
        :style="{ '--avatar-size': size }"
        role="img"
        :aria-label="name || undefined">
        <span class="text">{{ initials }}</span>
    </span>
</template>

<style scoped>
.avatar-initials {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--avatar-size);
    height: var(--avatar-size);
    border-radius: 50%;
    user-select: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    container-type: size;
    overflow: hidden;
}

.text {
    font-family: "Poppins", sans-serif;
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: #fff;
    font-size: 42cqmin;
}

.p0 {
    background: var(--grad-orange);
}

.p1 {
    background: var(--grad-yellow);
}

.p1 .text {
    color: var(--text-dark);
}

.p2 {
    background: linear-gradient(135deg, #ff9454, #ff5a24);
}

[data-bs-theme="dark"] .avatar-initials {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}
</style>
