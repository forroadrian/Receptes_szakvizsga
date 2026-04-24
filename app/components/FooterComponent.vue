<script setup>

const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
    <footer class="footer position-relative">
        <div class="container pt-5">
            <div class="row g-4 align-items-start text-center text-lg-start">
                <div class="col-lg-5 col-md-12 col-sm-12">
                    <NuxtImg src="/logo.png" alt="Menu Planr" :width="180" :height="128" format="webp" loading="lazy" densities="x1 x2" class="footer-logo mb-3" />
                    <p class="footer-desc mx-auto mx-lg-0">
                        {{ $t('footer.title')}}
                    </p>

                    <div class="footer-social d-flex justify-content-center justify-content-lg-start gap-2 mt-3">
                        <a class="social-btn" href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                        <a class="social-btn" href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                        <a class="social-btn" href="#" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
                    </div>
                </div>

                <div class="col-lg-3 col-md-12 col-sm-12">
                    <h5 class="footer-title mt-3">{{ $t('footer.links.title') }}</h5>
                    <ul
                        class="footer-links list-unstyled m-0 d-grid gap-2 justify-content-center justify-content-lg-start">
                        <li>
                            <NuxtLink to="/" class="footer-link justify-content-center justify-content-lg-start">
                                <i class="bi bi-house-door"></i> {{ $t('common.pages.index') }}
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/recipes" class="footer-link justify-content-center justify-content-lg-start">
                                <i class="bi bi-journal-text"></i> {{ $t('common.pages.recipes') }}
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/ingredients"
                                class="footer-link justify-content-center justify-content-lg-start">
                                <i class="bi bi-basket"></i> {{ $t('common.pages.ingredients') }}
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/menu"
                                class="footer-link justify-content-center justify-content-lg-start">
                                <i class="bi bi-calendar2-week"></i> {{ $t('common.pages.menuPlanner') }}
                            </NuxtLink>
                        </li>
                    </ul>
                </div>

                <div class="col-lg-4  col-md-12 col-sm-12">
                    <div class="contact-panel">
                        <h5 class="footer-title mb-3">{{ $t('footer.contact.title') }}</h5>

                        <ul class="footer-contact list-unstyled m-0 p-0 d-grid gap-2">
                            <li class="footer-contact-item justify-content-center justify-content-lg-start">
                                <i class="bi bi-geo-alt me-2"></i>
                                <span>{{ $t('footer.contact.address') }}</span>
                            </li>
                            <li class="footer-contact-item justify-content-center justify-content-lg-start">
                                <i class="bi bi-telephone me-2"></i>
                                <span>{{ $t('footer.contact.phone') }}</span>
                            </li>
                            <li class="footer-contact-item justify-content-center justify-content-lg-start">
                                <i class="bi bi-globe me-2"></i>
                                <span>{{ $t('footer.contact.website') }}</span>
                            </li>
                        </ul>

                        <div class="mini-badge mt-3 mx-auto mx-lg-0">
                            <i class="bi bi-clock"></i>
                            <span>{{ $t('footer.contact.time') }}: 08:00–16:00</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-center border-top mt-4 pt-3">
                <p> &copy; 2026 Bánki Tatabánya | {{ $t('footer.rights') }}</p>
            </div>
        </div>
        <button class="scroll-top" @click="scrollTop" :aria-label="$t('footer.anchor.aria.label')">↑</button>
    </footer>
</template>

<style scoped>
html[data-bs-theme="dark"] .footer {
    background:
        var(--radial-orange-top-left-strong),
        var(--radial-yellow-bottom-right-soft)
}

html[data-bs-theme="light"] .footer {
    background:
        var(--radial-orange-top-left-soft),
        var(--radial-yellow-bottom-right-strong),
        var(--grad-light);
}

.footer-logo {
    width: var(--brand-logo-width);
}

.footer-desc {
    line-height: 1.7;
    font-size: 14px;
}

.footer-title {
    font-family: "Caveat", cursive;
    font-weight: 700;
    font-size: 28px;
    letter-spacing: 0.9px;
}

.footer-title::after {
    content: "";
    display: block;
    width: 60%;
    height: 2px;
    margin: 10px auto 0;
    background: var(--grad-yellow);
}

.footer-link {
    display: inline-flex;
    align-items: center;
    padding: 10px 0;
    font-weight: 500;
    transition: transform 0.18s ease, color 0.18s ease;
}

.footer-link,
.social-btn {
    text-decoration: none;
}

.footer-link:hover {
    transform: translateX(10px);
    font-weight: 700;
}

.contact-panel {
    padding: 18px 16px;
}

.contact-panel,
.mini-badge {
    border-radius: 20px;
}

.mini-badge {
    display: inline-flex;
    align-items: center;
    padding: 10px 12px;
}

.footer-social,
.footer-link,
.mini-badge {
    gap: 10px;
}

.mini-badge,
.social-btn,
.scroll-top,
.contact-panel {
    background: linear-gradient(0deg, rgba(255, 178, 78, 0.212), rgba(243, 243, 243, 0.03));
    border: 1px solid var(--bs-border-color);
    box-shadow: var(--bs-box-shadow-sm);
}

.social-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0px 8px
}

.social-btn:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.10);
}

.scroll-top:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 10px var(--orange);
}

.scroll-top {
    font-size: var(--nav-icon-size);
    width: var(--large-icon-size);
    height: var(--large-icon-size);
    position: absolute;
    left: 40px;
    bottom: 20px;
    border-radius: var(--radius-rounded);
    border: none;
    cursor: pointer;
    background: var(--grad-orange);
    color: var(--text-light);
}

@media (max-width: 991px) {
    .footer-desc {
        margin: 0 auto;
    }

    .col-sm-12,
    .col-md-12 {
        margin-bottom: 30px;
    }

    .scroll-top {
        bottom: 55px;
        left: 45%;
    }
}

@media (min-width: 992px) {
    .footer-title::after {
        margin: 10px 0;
    }

    .navbar-brand img {
        width: var(--small-brand-logo-width);
    }
}
</style>