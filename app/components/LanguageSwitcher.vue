<script setup lang="ts">
const {locale,locales, setLocale} = useI18n({
    useScope: 'global'
})

const languageOptions = {
    hu: "Magyar",
    en: "English"
}

const flags = {
    hu: '/icons/hu.svg',
    en: '/icons/gb.svg'
}
const selectedLanguage = ref("Magyar");
</script>
<template>
    <div class="dropdown lang-dropdown mx-auto d-flex flex-column">
        <button class="btn lang-btn dropdown-toggle d-flex align-items-center gap-2" type="button"
            data-bs-toggle="dropdown">
            <NuxtImg :src="flags[locale]"
                class="flag-icon" :width="22" :height="16" alt="flag" loading="lazy"/>
            <span class="fw-semibold">
                {{ languageOptions[locale] }}
            </span>
        </button>
    
        <ul class="dropdown-menu rounded-4 shadow-sm">
            <li v-for="lang in locales">
                <span class="dropdown-item lang-item d-flex align-items-center gap-2 rounded-3"
                    @click="() => {
                        setLocale(lang.code);
                        if (!lang.name) return;
                        selectedLanguage = lang.name
                    }
                    ">
                    <img :src="flags[lang.code]" class=" flag-icon" alt="flag" />
                    <span>{{ lang.name }}</span>
                </span>
            </li>
        </ul>
    </div>
</template>
<style scoped>
.dropdown-menu :active {
    background-color: var(--yellow);
}

.dropdown-item {
    cursor: pointer;
}

.dropdown button,
.dropdown-menu {
    border: none !important;
}

.lang-dropdown {
    position: relative;
}

.lang-dropdown .dropdown-menu {
    min-width: 100%;
}


.dropdown-menu {
    opacity: 0;
    transform: translateY(-8px);
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s ease;
}

.dropdown-menu.show {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
    pointer-events: auto;
}


.lang-btn {
    border-radius: var(--radius-sm);
}

.lang-btn:hover,
.flag-icon {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);

}


.flag-icon {
    width: 22px;
    height: 16px;
    object-fit: cover;
    border-radius: 4px;
}

@media (min-width: 992px) {
    .lang-btn {
        width: auto;
        justify-content: flex-start;
    }

    .lang-dropdown .dropdown-menu {
        width: max-content;
    }
}

@media (max-width: 992px) {
    .dropdown-menu {
        min-width: min(300px, calc(100vw - 2rem));
        max-width: calc(100vw - 2rem);
        right: 0;
        left: auto;
    }
}


</style>