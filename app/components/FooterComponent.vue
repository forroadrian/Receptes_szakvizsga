<script setup>

const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
    <footer class="footer position-relative">
        <div class="container py-5">
            <div class="row g-4 align-items-start text-center text-lg-start">
                <div class="col-12 col-lg-5">
                    <img src="../assets/images/logo.png" alt="Logo" class="footer-logo mb-3" />
                    <p class="footer-desc mx-auto mx-lg-0">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit!
                    </p>

                    <div class="footer-social d-flex justify-content-center justify-content-lg-start gap-2 mt-3">
                        <a class="social-btn" href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                        <a class="social-btn" href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                        <a class="social-btn" href="#" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
                    </div>
                </div>

                <div class="col-12 col-lg-3">
                    <h5 class="footer-title mt-3">Gyors Linkek</h5>
                    <ul
                        class="footer-links list-unstyled m-0 d-grid gap-2 justify-content-center justify-content-lg-start">
                        <li>
                            <NuxtLink to="/" class="footer-link justify-content-center justify-content-lg-start">
                                <i class="bi bi-house-door"></i> Kezdőlap
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/recipes" class="footer-link justify-content-center justify-content-lg-start">
                                <i class="bi bi-journal-text"></i> Receptek
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/ingredients"
                                class="footer-link justify-content-center justify-content-lg-start">
                                <i class="bi bi-basket"></i> Alapanyagok
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/menuPlanner"
                                class="footer-link justify-content-center justify-content-lg-start">
                                <i class="bi bi-calendar2-week"></i> Menütervező
                            </NuxtLink>
                        </li>
                    </ul>
                </div>

                <div class="col-12 col-lg-4">
                    <div class="contact-panel">
                        <h5 class="footer-title mb-3">Elérhetőségek</h5>

                        <ul class="footer-contact list-unstyled m-0 p-0 d-grid gap-2">
                            <li class="footer-contact-item justify-content-center justify-content-lg-start">
                                <i class="bi bi-geo-alt me-2"></i>
                                <span>2800. Lorem ipsum, dolor sit amet 22</span>
                            </li>
                            <li class="footer-contact-item justify-content-center justify-content-lg-start">
                                <i class="bi bi-telephone me-2"></i>
                                <span>+36 20 1234 5678</span>
                            </li>
                            <li class="footer-contact-item justify-content-center justify-content-lg-start">
                                <i class="bi bi-globe me-2"></i>
                                <span>loremipsum.com</span>
                            </li>
                        </ul>

                        <div class="mini-badge mt-3 mx-auto mx-lg-0">
                            <i class="bi bi-clock"></i>
                            <span>H–P: 08:00–16:00</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-center border-top mt-4 pt-3">
                <p> &copy; 2026 Bánki Tatabánya | Minden jog fenntartva!</p>
            </div>
        </div>
        <button class="scroll-top" @click="scrollTop" aria-label="Ugrás a tetejére">↑</button>
    </footer>
</template>

<style scoped>
.footer {
    color: rgba(255, 255, 255, .86);
    /* background:
        radial-gradient(800px 500px at 5% 0%, rgba(245, 147, 1, 0.5), rgba(253, 102, 32, .4), transparent 70%),
        radial-gradient(1000px 500px at 100% 90%, rgba(245, 147, 1, 0.5), rgba(253, 102, 32, .4), transparent 70%),
        linear-gradient(180deg, #141414, #201f1e, #312d2b);*/

    background: radial-gradient(1200px 700px at 0% 0%, rgba(255, 102, 0, 0.3), transparent 70%),
        radial-gradient(1000px 700px at 100% 100%, rgba(245, 164, 71, 0.3), transparent 70%),
        linear-gradient(180deg, #222226, #19191c);
}

.footer-logo {
    width: var(--brand-logo-width);
    height: auto;
    filter: drop-shadow(0 14px 26px rgba(0, 0, 0, 0.45));
}

.footer-desc {
    line-height: 1.7;
    font-size: 14px;
}

.footer-desc,
.footer-link,
.footer-contact-item,
.social-btn,
.mini-badge {
    color: rgba(255, 255, 255, 0.72);
}

.footer-title {
    font-family: "Caveat", cursive;
    font-weight: 700;
    font-size: 28px;
    color: rgba(255, 255, 255, 0.95);
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
    color: #fff;
    transform: translateX(10px);
}

.footer-contact {
    display: grid;
}

.footer-contact-item i {
    color: rgba(255, 255, 255, 0.75);
    transform: translateY(2px);
}

.contact-panel {
    padding: 18px 16px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
    border: 1px solid rgba(255, 255, 255, 0.10);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
}

.mini-badge {
    display: inline-flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.10);
}

.footer-social,
.footer-link,
.mini-badge {
    gap: 10px;
}

.social-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    margin: 0px 8px
}

.social-btn:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.10);
}

.footer .border-top {
    border-top-color: rgba(235, 235, 235, 0.2) !important;
}

.scroll-top {
    position: absolute;
    left: 18px;
    bottom: 18px;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.92);
    cursor: pointer;
}

@media (max-width: 991px) {
    .footer-desc {
        margin: 0 auto;
    }

    .col-12 {
        margin-bottom: 30px;
    }
}

@media (min-width: 992px) {
    .footer-title::after {
        margin: 10px 0;
    }
}
</style>