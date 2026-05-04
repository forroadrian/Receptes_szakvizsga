declare module "bootstrap";

interface Window {
    bootstrap?: {
        Modal: {
            getOrCreateInstance(el: HTMLElement): {
                show(): void;
                hide(): void;
            };
        };
    };
}
