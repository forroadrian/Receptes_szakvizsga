<script setup lang="ts">
import { useIngredientStore } from '~/stores/ingredients';
import { useRecipeStore } from '~/stores/recipe';
import { useRecipeModal } from '~/composables/useRecipeModal';

const { t, locale } = useI18n();
const router = useRouter();
const ingredientStore = useIngredientStore();
const recipeStore = useRecipeStore();
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

const isOpen = ref(false);
const isLoading = ref(false);
const isExpired = ref(false);
const unreadCount = ref(0);
const input = ref('');
const messages = ref<Message[]>([]);
const messagesEl = ref<HTMLElement | null>(null);

const TIMEOUT_MS = 5 * 60 * 1000;
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (isExpired.value) return;
    inactivityTimer = setTimeout(() => {
        isExpired.value = true;
        messages.value.push({ role: 'assistant', content: t('chatbot.expired'), time: now() });
        if (!isOpen.value) unreadCount.value++;
        scrollToBottom();
    }, TIMEOUT_MS);
}

const suggestions = computed(() => [
    t('chatbot.suggestions.whatCanIDo'),
    t('chatbot.suggestions.suggestRecipe'),
    t('chatbot.suggestions.fromPantry'),
    t('chatbot.suggestions.quickMeal')
]);

const showSuggestions = computed(() =>
    messages.value.length === 1 && messages.value[0]?.role === 'assistant'
);

function openChat() {
    if (!isOpen.value && messages.value.length === 0) {
        messages.value.push({ role: 'assistant', content: t('chatbot.welcome'), time: now() });
    }
    isOpen.value = !isOpen.value;
    if (isOpen.value) unreadCount.value = 0;
}

function newChat() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = null;
    isExpired.value = false;
    messages.value = [];
    input.value = '';
    messages.value.push({ role: 'assistant', content: t('chatbot.welcome'), time: now() });
}

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
    resetInactivityTimer();
    await scrollToBottom();

    try {
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
                    unit: i.unit
                })),
                availableCategories: recipeStore.getAvailableCategories(),
                availableIngredients: ingredientStore.availableIngredients,
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
    <div class="chatbot-wrapper">
        <Transition name="chatbot-slide">
            <div v-if="isOpen" class="chatbot-panel card shadow-lg">
                <div class="chatbot-header card-header d-flex align-items-center justify-content-between">
                    <span class="fw-semibold">
                        <i class="bi bi-stars me-2"></i>{{ $t('chatbot.title') }}
                    </span>
                    <div class="d-flex align-items-center gap-2">
                        <button class="chatbot-new-btn" :title="$t('chatbot.newChat')" @click="newChat">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn-close btn-close-white" @click="isOpen = false" />
                    </div>
                </div>

                <div ref="messagesEl" class="chatbot-messages card-body">
                    <div
                        v-for="(msg, i) in messages"
                        :key="i"
                        class="chatbot-message"
                        :class="msg.role === 'user' ? 'chatbot-message--user' : 'chatbot-message--assistant'"
                    >
                        <div class="chatbot-bubble">{{ msg.content }}</div>
                        <button
                            v-if="msg.recipe"
                            class="btn btn-sm btn-dark mt-2"
                            @click="openRecipeForm(msg.recipe)"
                        >
                            <i class="bi bi-pencil-square me-1"></i>{{ $t('chatbot.openRecipe') }}
                        </button>
                        <span class="chatbot-time">{{ msg.time }}</span>
                    </div>

                    <div v-if="isLoading" class="chatbot-message chatbot-message--assistant">
                        <div class="chatbot-bubble chatbot-bubble--loading">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>

                <div v-if="showSuggestions" class="chatbot-suggestions">
                    <div class="chatbot-suggestions-row chatbot-suggestions-row--duo">
                        <button class="chatbot-suggestion-btn" @click="sendSuggestion(suggestions[0])">{{ suggestions[0] }}</button>
                        <button class="chatbot-suggestion-btn" @click="sendSuggestion(suggestions[1])">{{ suggestions[1] }}</button>
                    </div>
                    <div class="chatbot-suggestions-row">
                        <button class="chatbot-suggestion-btn" @click="sendSuggestion(suggestions[2])">{{ suggestions[2] }}</button>
                    </div>
                    <div class="chatbot-suggestions-row">
                        <button class="chatbot-suggestion-btn" @click="sendSuggestion(suggestions[3])">{{ suggestions[3] }}</button>
                    </div>
                </div>

                <div v-if="!isExpired" class="chatbot-input card-footer">
                    <div class="input-group">
                        <textarea
                            v-model="input"
                            class="form-control form-control-sm"
                            rows="1"
                            :placeholder="$t('chatbot.placeholder')"
                            :disabled="isExpired"
                            @keydown="onKeydown"
                        />
                        <button
                            class="btn btn-dark btn-sm"
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
            class="chatbot-toggle btn btn-dark rounded-circle shadow"
            :title="$t('chatbot.openBtn')"
            @click="openChat"
        >
            <i class="bi" :class="isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'"></i>
            <span v-if="!isOpen && unreadCount > 0" class="chatbot-badge">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
        </button>
    </div>
</template>

<style scoped>
.chatbot-wrapper {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 1050;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
}

.chatbot-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #dc3545;
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
    min-width: 1.1rem;
    height: 1.1rem;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.2rem;
    pointer-events: none;
}

.chatbot-toggle {
    position: relative;
    width: 3.25rem;
    height: 3.25rem;
    font-size: 1.25rem;
    flex-shrink: 0;
}

.chatbot-panel {
    width: 440px;
    max-width: calc(100vw - 2rem);
    border-radius: 1rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.chatbot-new-btn {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 50%;
    color: #fff;
    width: 1.6rem;
    height: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.15s;
}

.chatbot-new-btn:hover {
    background: rgba(255,255,255,0.15);
}

.chatbot-header {
    background: var(--bs-dark);
    color: #fff;
    padding: 0.65rem 1rem;
}

.chatbot-messages {
    height: 360px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1rem;
}

.chatbot-message {
    display: flex;
    flex-direction: column;
}

.chatbot-message--user {
    align-items: flex-end;
}

.chatbot-message--assistant {
    align-items: flex-start;
}

.chatbot-bubble {
    max-width: 85%;
    padding: 0.5rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.9rem;
    white-space: pre-wrap;
    word-break: break-word;
}

.chatbot-message--user .chatbot-bubble {
    background: var(--bs-dark);
    color: #fff;
    border-bottom-right-radius: 0.2rem;
}

.chatbot-message--assistant .chatbot-bubble {
    background: var(--bs-secondary-bg);
    border-bottom-left-radius: 0.2rem;
}

.chatbot-time {
    font-size: 0.68rem;
    color: var(--bs-secondary-color);
    margin-top: 0.2rem;
    opacity: 0.7;
}

.chatbot-bubble--loading {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 0.6rem 0.9rem;
}

.chatbot-bubble--loading span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--bs-secondary-color);
    animation: chatbot-dot 1.2s infinite;
}

.chatbot-bubble--loading span:nth-child(2) { animation-delay: 0.2s; }
.chatbot-bubble--loading span:nth-child(3) { animation-delay: 0.4s; }

@keyframes chatbot-dot {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
}

.chatbot-suggestions {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.5rem 0.75rem;
    border-top: 1px solid var(--bs-border-color);
}

.chatbot-suggestions-row {
    display: flex;
    gap: 0.4rem;
    justify-content: flex-start;
}

.chatbot-suggestions-row--duo .chatbot-suggestion-btn {
    flex: 1;
}

.chatbot-tip-wrap::after {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a1a;
    color: #fff;
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
    border-radius: 0.4rem;
    white-space: normal;
    max-width: 150px;
    text-align: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.chatbot-tip-wrap:hover::after {
    opacity: 1;
}


.chatbot-suggestion-btn {
    background: var(--bs-secondary-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: 999px;
    padding: 0.3rem 0.85rem;
    font-size: 0.78rem;
    font-weight: 500;
    cursor: pointer;
    color: var(--bs-body-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.chatbot-suggestion-btn:hover {
    background: var(--bs-tertiary-bg, #e9ecef);
    border-color: var(--bs-secondary-color);
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.chatbot-input {
    padding: 0.65rem 0.75rem;
}

.chatbot-input textarea {
    resize: none;
    border-radius: 0.5rem 0 0 0.5rem;
}

.chatbot-slide-enter-active,
.chatbot-slide-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.chatbot-slide-enter-from,
.chatbot-slide-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
}
</style>