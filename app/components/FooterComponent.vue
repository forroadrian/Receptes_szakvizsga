<script setup>

const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
    <footer class="footer">
        <div class="footer-bg"></div>
        <div class="container footer-container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <NuxtImg src="/logo.png" alt="Menu Planr" format="webp" loading="lazy" densities="x1 x2"
                        class="footer-logo" />

                    <p class="footer-desc">{{ $t('footer.title') }}</p>

                    <div class="footer-social">
                        <a class="social-btn" href="#" aria-label="Facebook"> <i class="bi bi-facebook"></i></a>
                        <a class="social-btn" href="#" aria-label="Instagram"> <i class="bi bi-instagram"></i></a>
                        <a class="social-btn" href="#" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
                    </div>
                </div>

                <nav class="footer-col" aria-label="Footer navigation">
                    <h5 class="footer-title">{{ $t('footer.links.title') }}</h5>

                    <ul class="footer-list">
                        <li>
                            <NuxtLink to="/" class="footer-link">{{ $t('common.pages.index') }}</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/recipes" class="footer-link">{{ $t('common.pages.recipes') }}</NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/ingredients" class="footer-link">{{ $t('common.pages.ingredients') }}
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/menu" class="footer-link">{{ $t('common.pages.menuPlanner') }} </NuxtLink>
                        </li>
                    </ul>
                </nav>

                <div class="footer-col">
                    <h5 class="footer-title">{{ $t('footer.contact.title') }}</h5>
                    <ul class="footer-list footer-contact">
                        <li>
                            <i class="bi bi-geo-alt"></i>
                            <span>{{ $t('footer.contact.address') }}</span>
                        </li>
                        <li>
                            <i class="bi bi-telephone"></i>
                            <span>{{ $t('footer.contact.phone') }}</span>
                        </li>
                        <li>
                            <i class="bi bi-globe"></i>
                            <span>{{ $t('footer.contact.website') }}</span>
                        </li>
                    </ul>

                    <div class="mini-badge">
                        <i class="bi bi-clock"></i>
                        <span>{{ $t('footer.contact.time') }}: 08:00–16:00</span>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2026 Bánki Tatabánya | {{ $t('footer.rights') }}</p>
                <button class="scroll-top" @click="scrollTop" :aria-label="$t('footer.anchor.aria.label')">
                    <i class="bi bi-arrow-up"></i>
                </button>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    position: relative;
    padding: 60px;
    background:
        radial-gradient(900px 400px at 50% 30%, rgba(255, 114, 49, 0.14), transparent 70%),
        radial-gradient(700px 350px at 50% 100%, rgba(250, 180, 100, 0.18), transparent 70%),
        var(--bs-body-bg);
    border-top: 1px solid rgba(173, 173, 173, 0.22);
}

.footer-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.025));
    pointer-events: none;
}

.footer-container {
    position: relative;
    z-index: 1;
}

.footer-grid {
    display: grid;
    grid-template-columns: 1.5fr 0.8fr 1fr;
    gap: clamp(2rem, 5vw, 4rem);
    align-items: start;
}

.footer-brand {
    max-width: 360px;
}

.footer-logo {
    width: var(--small-brand-logo-width);
    height: auto;
    margin-bottom: 10px;
}

.footer-desc {
    max-width: 320px;
    margin: 0;
    font-size: 0.92rem;
    color: var(--bs-secondary-color);
}

.footer-title {
    margin-bottom: 30px;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--bs-body-color);
}

.footer-list {
    display: grid;
    gap: 1.6rem;
    padding: 0;
    margin: 0;
    list-style: none;
}

.footer-link {
    display: inline-flex;
    width: fit-content;
    color: var(--bs-secondary-color);
    text-decoration: none;
    transition: color 0.18s ease, transform 0.18s ease;
}

.footer-link:hover {
    color: var(--orange);
    transform: translateX(4px);
}

.footer-contact li {
    display: flex;
    align-items: center;
    gap: 20px;
    color: var(--bs-secondary-color);
}

.footer-contact i {
    color: var(--orange);
}

.footer-social {
    display: flex;
    gap: 0.65rem;
    margin-top: 1.4rem;
}

.social-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 1px solid rgba(173, 173, 173, 0.25);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.45);
    color: var(--bs-secondary-color);
    text-decoration: none;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
    transition: transform 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.social-btn:hover {
    transform: translateY(-3px);
    color: var(--orange);
    border-color: rgba(255, 114, 49, 0.35);
}

.mini-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    width: fit-content;
    margin-top: 1.1rem;
    padding: 0.65rem 0.85rem;
    border: 1px solid rgba(255, 114, 49, 0.16);
    border-radius: 999px;
    background: rgba(255, 114, 49, 0.07);
    color: var(--bs-secondary-color);
    font-size: 0.82rem;
}

.mini-badge i {
    color: var(--orange);
}

.footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 3rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(173, 173, 173, 0.22);
}

.footer-bottom p {
    margin: 0;
    color: var(--bs-secondary-color);
    font-size: 0.82rem;
}

.scroll-top {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, #a33e00, #f06922);
    color: #fff;
    cursor: pointer;
    box-shadow: 0 12px 24px rgba(240, 105, 34, 0.25);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.scroll-top:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 30px rgba(240, 105, 34, 0.32);
}

[data-bs-theme="dark"] .footer {
    background:
        radial-gradient(900px 400px at 50% 30%, rgba(255, 114, 49, 0.10), transparent 70%),
        radial-gradient(700px 350px at 50% 100%, rgba(250, 180, 100, 0.08), transparent 70%),
        var(--bs-body-bg);
}

[data-bs-theme="dark"] .social-btn {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);
}

[data-bs-theme="dark"] .mini-badge {
    background: rgba(255, 114, 49, 0.08);
    border-color: rgba(255, 114, 49, 0.18);
}

@media (max-width: 991px) {
    .footer {
        padding-top: 3.5rem;
    }

    .footer-grid {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .footer-brand {
        max-width: none;
    }

    .footer-desc {
        margin: 0 auto;
    }

    .footer-social,
    .footer-link,
    .footer-contact li,
    .mini-badge {
        justify-content: center;
    }

    .footer-link:hover {
        transform: none;
    }

    .footer-bottom {
        flex-direction: column-reverse;
        text-align: center;
    }
}
</style>