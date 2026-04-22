import * as bootstrap from "bootstrap";

export default defineNuxtPlugin(() => {
    (window as any).bootstrap = bootstrap;
});
