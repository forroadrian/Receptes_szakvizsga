<script setup lang="ts">
import { useIngredientStore } from '~/stores/ingredients';
import { useRecipeStore } from '~/stores/recipe';
import { usePreferencesStore } from '~/stores/preferences';
import { useRecipeModal } from '~/composables/useRecipeModal';

const { t, locale } = useI18n();
const router = useRouter();
const user = useSupabaseUser();
const ingredientStore = useIngredientStore();
const recipeStore = useRecipeStore();
const preferencesStore = usePreferencesStore();
const recipeModal = useRecipeModal();

const aiPendingOpen = useState<boolean>('aiPendingOpen', () => false);

type Message = {
    role: 'user' | 'assistant';
    content: string;
    recipe?: any;
    time: string;
};

function now(): string {
    return new Date().toLocaleTimeString(locale.value === 'hu' ? 'hu-HU' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

const ALLOWED_NAV_PATHS = new Set([
    '/',
    '/recipes',
    '/ingredients',
    '/menu',
    '/profile',
    '/profile/username',
    '/profile/password',
    '/profile/email',
    '/profile/allergen',
    '/profile/dislikedIngredient'
]);

function sanitizeMessage(raw: string): string {
    const escaped = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    const q = `(?:&quot;|')`;
    return escaped.replace(
        new RegExp(`&lt;a class=${q}nav${q} href=${q}([^&'"]+)${q}&gt;([\\s\\S]*?)&lt;/a&gt;`, 'g'),
        (_, href, label) =>
            ALLOWED_NAV_PATHS.has(href)
                ? `<a class="chat-nav" data-nav-href="${href}">${label}</a>`
                : label
    );
}

function onBubbleClick(e: MouseEvent) {
    const target = (e.target as HTMLElement).closest<HTMLElement>('.chat-nav');
    if (!target) return;
    e.preventDefault();
    const href = target.dataset.navHref;
    if (!href) return;
    isOpen.value = false;
    navigateTo(href);
}

const isOpen = ref(false);
const isLoading = ref(false);
const isExpired = ref(false);
const unreadCount = ref(0);
const input = ref('');
const messages = ref<Message[]>([]);
const messagesEl = ref<HTMLElement | null>(null);

const suggestions = computed(() => [
    t('chatbot.suggestions.whatCanIDo'),
    t('chatbot.suggestions.suggestRecipe'),
    t('chatbot.suggestions.fromPantry'),
    t('chatbot.suggestions.quickMeal')
]);

const showSuggestions = computed(() =>
    messages.value.length === 1 && messages.value[0]?.role === 'assistant'
);

async function loadContext() {
    await Promise.all([
        ingredientStore.loadIngredients(),
        preferencesStore.loadUserAllergies()
    ]).catch(() => {});
}

const pantryCount = computed(() => ingredientStore.ingredients.length);
const expiringCount = computed(() =>
    ingredientStore.ingredients.filter(i => i.tag === 'soon').length
);
const allergyNames = computed(() =>
    preferencesStore.userAllergies.map(a => a.name).join(', ')
);

function openChat() {
    if (!isOpen.value && messages.value.length === 0) {
        messages.value.push({ role: 'assistant', content: t('chatbot.welcome'), time: now() });
    }
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        unreadCount.value = 0;
        loadContext();
    }
}

function newChat() {
    isExpired.value = false;
    messages.value = [];
    input.value = '';
    messages.value.push({ role: 'assistant', content: t('chatbot.welcome'), time: now() });
}

const storageKey = computed(() =>
    user.value?.id ? `chatbot:${user.value.id}` : null
);

function loadFromStorage() {
    if (!import.meta.client || !storageKey.value) return;
    const raw = localStorage.getItem(storageKey.value);
    if (!raw) {
        messages.value = [];
        isExpired.value = false;
        unreadCount.value = 0;
        return;
    }
    try {
        const data = JSON.parse(raw);
        messages.value = data.messages ?? [];
        isExpired.value = data.isExpired ?? false;
        unreadCount.value = data.unreadCount ?? 0;
    } catch {
        messages.value = [];
        isExpired.value = false;
        unreadCount.value = 0;
    }
}

function saveToStorage() {
    if (!import.meta.client || !storageKey.value) return;
    try {
        localStorage.setItem(storageKey.value, JSON.stringify({
            messages: messages.value,
            isExpired: isExpired.value,
            unreadCount: unreadCount.value
        }));
    } catch {}
}

watch(storageKey, loadFromStorage, { immediate: true });
watch([messages, isExpired, unreadCount], saveToStorage, { deep: true });

async function sendSuggestion(text: string) {
    input.value = text;
    await send();
}

async function scrollToBottom() {
    await nextTick();
    if (messagesEl.value) {
        messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
}

async function send() {
    const msg = input.value.trim();
    if (!msg || isLoading.value) return;

    messages.value.push({ role: 'user', content: msg, time: now() });
    input.value = '';
    isLoading.value = true;
    await scrollToBottom();

    try {
        await Promise.all([
            ingredientStore.loadIngredients(),
            ingredientStore.loadAvailableIngredients(),
            recipeStore.loadAvailableCategories(),
            preferencesStore.loadUserAllergies(),
            preferencesStore.loadUserDislikedIngredients()
        ]);

        const history = messages.value
            .slice(-11, -1)
            .map(m => ({ role: m.role, content: m.content }));

        const response = await $fetch<any>('/api/chat', {
            method: 'POST',
            body: {
                message: msg,
                language: locale.value,
                pantry: ingredientStore.ingredients.map(i => ({
                    name: i.name,
                    quantity: i.quantity,
                    unit: i.unit,
                    expiry: i.expiry.toShort(),
                    freshness: i.tag
                })),
                availableCategories: recipeStore.getAvailableCategories(),
                availableIngredients: ingredientStore.availableIngredients,
                allergies: preferencesStore.userAllergies.map(a => a.name),
                dislikedIngredients: preferencesStore.userDislikedIngredients.map(i => i.name),
                history
            }
        });

        messages.value.push({
            role: 'assistant',
            content: response.message,
            recipe: response.type === 'recipe' ? response.recipe : undefined,
            time: now()
        });
        if (!isOpen.value) unreadCount.value++;

        if (response.closeChat) {
            isExpired.value = true;
        }
    } catch {
        messages.value.push({
            role: 'assistant',
            content: t('chatbot.error'),
            time: now()
        });
        if (!isOpen.value) unreadCount.value++;
    } finally {
        isLoading.value = false;
        await scrollToBottom();
    }
}

async function openRecipeForm(recipe: any) {
    await recipeModal.init();

    const categories = recipeStore.getAvailableCategories();
    const mealTypes = categories.filter(c => c.group_type === 'meal');
    const typeTags = categories.filter(c => c.group_type === 'type');

    const mealTypeMatch = mealTypes.find(
        m => m.name.toLowerCase() === recipe.mealType?.toLowerCase()
    );
    const tagMatches = typeTags
        .filter(t => recipe.tags?.some(
            (tag: string) => tag.toLowerCase() === t.name.toLowerCase()
        ))
        .map(t => t.id);

    const available = ingredientStore.availableIngredients;
    const matchedIngredients = (recipe.ingredients ?? [])
        .map((ing: any) => {
            const match = available.find(
                a => a.name.toLowerCase() === ing.name.toLowerCase()
            );
            if (!match) return null;
            return {
                ingredient_id: match.id,
                name: match.name,
                quantity: ing.quantity,
                unit: ing.unit
            };
        })
        .filter(Boolean);

    recipeModal.recipe.name = recipe.name ?? '';
    recipeModal.recipe.description = recipe.description ?? '';
    recipeModal.recipe.prepTime = recipe.prepTime ?? 60;
    recipeModal.recipe.servings = recipe.servings ?? 4;
    recipeModal.recipe.mealType = mealTypeMatch?.id ?? null;
    recipeModal.recipe.tags = tagMatches;
    recipeModal.recipe.ingredients = matchedIngredients;
    recipeModal.recipe.instructions = recipe.instructions ?? [];

    isOpen.value = false;

    if (router.currentRoute.value.path !== '/recipes') {
        aiPendingOpen.value = true;
        await navigateTo('/recipes');
    } else {
        if (import.meta.client) {
            const modalEl = document.getElementById('openAddRecipeModal');
            if (modalEl) (window as any).bootstrap.Modal.getOrCreateInstance(modalEl).show();
        }
    }
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
    }
}
</script>

<template>
    <div class="wrapper">
        <Transition name="slide">
            <div v-if="isOpen" class="panel card shadow-lg rounded-4 overflow-hidden">
                <div class="header card-header bg-dark text-white d-flex align-items-center justify-content-between">
                    <span class="fw-semibold">
                        <i class="bi bi-stars me-2"></i>{{ $t('chatbot.title') }}
                    </span>
                    <div class="d-flex align-items-center gap-2">
                        <button
                            class="new-btn bg-transparent rounded-circle text-white d-flex align-items-center justify-content-center"
                            :title="$t('chatbot.newChat')"
                            @click="newChat"
                        >
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn-close btn-close-white" @click="isOpen = false" />
                    </div>
                </div>

                <div class="context d-flex flex-wrap align-items-center border-bottom bg-body-tertiary">
                    <span class="text-body-secondary fw-medium me-1">{{ $t('chatbot.context.intro') }}:</span>
                    <span class="chip d-inline-flex align-items-center bg-body border rounded-pill text-body overflow-hidden text-nowrap" :title="$t('common.pages.ingredients')">
                        <i class="bi bi-basket3"></i>
                        {{ pantryCount > 0
                            ? $t('chatbot.context.pantry', { count: pantryCount })
                            : $t('chatbot.context.pantryEmpty') }}
                    </span>
                    <span v-if="expiringCount > 0" class="chip warn d-inline-flex align-items-center border rounded-pill overflow-hidden text-nowrap">
                        <i class="bi bi-clock-history"></i>
                        {{ $t('chatbot.context.expiring', { count: expiringCount }) }}
                    </span>
                    <span class="chip d-inline-flex align-items-center bg-body border rounded-pill text-body overflow-hidden text-nowrap" :title="$t('chatbot.context.allergies')">
                        <i class="bi bi-exclamation-triangle"></i>
                        {{ allergyNames || $t('chatbot.context.noAllergies') }}
                    </span>
                </div>

                <div ref="messagesEl" class="messages card-body d-flex flex-column overflow-y-auto">
                    <div
                        v-for="(msg, i) in messages"
                        :key="i"
                        class="d-flex flex-column"
                        :class="msg.role"
                    >
                        <div
                            class="bubble rounded-4 text-break"
                            :class="msg.role === 'user' ? 'bg-dark text-white' : 'bg-body-secondary'"
                            v-html="sanitizeMessage(msg.content)"
                            @click="onBubbleClick"
                        ></div>
                        <button
                            v-if="msg.recipe"
                            class="btn btn-sm btn-dark mt-2"
                            @click="openRecipeForm(msg.recipe)"
                        >
                            <i class="bi bi-pencil-square me-1"></i>{{ $t('chatbot.openRecipe') }}
                        </button>
                        <span class="time text-body-secondary mt-1 opacity-75">{{ msg.time }}</span>
                    </div>

                    <div v-if="isLoading" class="d-flex flex-column assistant">
                        <div class="bubble loading bg-body-secondary rounded-4 d-flex align-items-center">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>

                <div v-if="showSuggestions" class="suggestions d-flex flex-column border-top">
                    <div class="line duo d-flex">
                        <button class="suggestion bg-body-secondary border rounded-pill fw-medium text-body text-nowrap overflow-hidden" @click="sendSuggestion(suggestions[0])">{{ suggestions[0] }}</button>
                        <button class="suggestion bg-body-secondary border rounded-pill fw-medium text-body text-nowrap overflow-hidden" @click="sendSuggestion(suggestions[1])">{{ suggestions[1] }}</button>
                    </div>
                    <div class="line d-flex">
                        <button class="suggestion bg-body-secondary border rounded-pill fw-medium text-body text-nowrap overflow-hidden" @click="sendSuggestion(suggestions[2])">{{ suggestions[2] }}</button>
                    </div>
                    <div class="line d-flex">
                        <button class="suggestion bg-body-secondary border rounded-pill fw-medium text-body text-nowrap overflow-hidden" @click="sendSuggestion(suggestions[3])">{{ suggestions[3] }}</button>
                    </div>
                </div>

                <div class="bar card-footer">
                    <div class="position-relative d-flex align-items-center">
                        <textarea
                            v-model="input"
                            class="textarea w-100 border rounded-pill bg-body text-body overflow-hidden"
                            rows="1"
                            :placeholder="$t('chatbot.placeholder')"
                            :disabled="isExpired"
                            @keydown="onKeydown"
                        />
                        <button
                            class="send position-absolute bg-transparent border-0 text-body-emphasis d-flex align-items-center justify-content-center rounded-circle lh-1"
                            :disabled="isLoading || !input.trim() || isExpired"
                            @click="send"
                        >
                            <i class="bi bi-send-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <button
            class="toggle btn btn-dark rounded-circle shadow position-relative fs-5 flex-shrink-0"
            :title="$t('chatbot.openBtn')"
            @click="openChat"
        >
            <i class="bi" :class="isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'"></i>
            <span v-if="!isOpen && unreadCount > 0" class="unread position-absolute bg-danger text-white fw-bold rounded-pill d-flex align-items-center justify-content-center pe-none">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
        </button>
    </div>
</template>

<style scoped>
.wrapper {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 1050;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
}

.unread {
    top: -4px;
    right: -4px;
    font-size: 0.65rem;
    min-width: 1.1rem;
    height: 1.1rem;
    padding: 0 0.2rem;
}

.toggle {
    width: 3.25rem;
    height: 3.25rem;
}

.panel {
    width: 440px;
    max-width: calc(100vw - 2rem);
}

.new-btn {
    border: 1px solid rgba(255,255,255,0.4);
    width: 1.6rem;
    height: 1.6rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.15s;
}

.new-btn:hover {
    background: rgba(255,255,255,0.15);
}

.header {
    padding: 0.65rem 1rem;
}

.context {
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    font-size: 0.7rem;
    line-height: 1.2;
}

.chip {
    gap: 0.3rem;
    padding: 0.15rem 0.55rem;
    max-width: 14rem;
    text-overflow: ellipsis;
}

.chip i {
    font-size: 0.78rem;
    opacity: 0.75;
    flex-shrink: 0;
}

.chip.warn {
    color: #b54708;
    border-color: #fec84b;
    background: #fffaeb;
}

[data-bs-theme="dark"] .chip.warn {
    color: #fdb022;
    border-color: rgba(253, 176, 34, 0.4);
    background: rgba(253, 176, 34, 0.08);
}

.messages {
    height: 360px;
    gap: 0.6rem;
}

.user {
    align-items: flex-end;
}

.assistant {
    align-items: flex-start;
}

.bubble {
    max-width: 85%;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    white-space: pre-wrap;
}

.bubble :deep(.chat-nav) {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin: 0.25rem 0.15rem 0.05rem 0;
    padding: 0.25rem 0.7rem;
    background: var(--bs-tertiary-bg, #e9ecef);
    color: var(--bs-body-color);
    border: 1px solid var(--bs-border-color);
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
}

.bubble :deep(.chat-nav)::before {
    content: "\F285";
    font-family: "bootstrap-icons";
    font-size: 0.85rem;
    line-height: 1;
}

.bubble :deep(.chat-nav):hover {
    background: var(--bs-secondary-bg);
    border-color: var(--bs-secondary-color);
    transform: translateY(-1px);
}

.user .bubble {
    border-bottom-right-radius: 0.2rem;
}

.assistant .bubble {
    border-bottom-left-radius: 0.2rem;
}

.time {
    font-size: 0.68rem;
}

.bubble.loading {
    gap: 4px;
    padding: 0.6rem 0.9rem;
}

.bubble.loading span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--bs-secondary-color);
    animation: dot 1.2s infinite;
}

.bubble.loading span:nth-child(2) { animation-delay: 0.2s; }
.bubble.loading span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
}

.suggestions {
    gap: 0.35rem;
    padding: 0.5rem 0.75rem;
}

.line {
    gap: 0.4rem;
}

.line.duo .suggestion {
    flex: 1;
}

.suggestion {
    padding: 0.3rem 0.85rem;
    font-size: 0.78rem;
    cursor: pointer;
    text-overflow: ellipsis;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.suggestion:hover {
    background: var(--bs-tertiary-bg, #e9ecef);
    border-color: var(--bs-secondary-color);
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.bar {
    padding: 0.65rem 0.75rem;
}

.textarea {
    resize: none;
    padding: 0.55rem 2.8rem 0.55rem 1.1rem;
    font-size: 0.88rem;
    line-height: 1.4;
    outline: none;
    transition: border-color 0.15s;
}

.textarea:focus {
    border-color: var(--bs-emphasis-color);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

.send {
    right: 0.45rem;
    cursor: pointer;
    padding: 0.3rem 0.4rem;
    transition: color 0.15s, background 0.15s;
}

.send:hover:not(:disabled) {
    background: var(--bs-secondary-bg);
}

.send:disabled {
    color: var(--bs-secondary-color);
    cursor: default;
    opacity: 0.45;
}

.slide-enter-active,
.slide-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
}
</style>