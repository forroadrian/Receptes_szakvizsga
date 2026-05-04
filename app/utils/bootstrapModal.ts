export type BootstrapModal = {
    show(): void;
    hide(): void;
    toggle?(): void;
    dispose?(): void;
};

type WindowWithBootstrap = Window & {
    bootstrap?: {
        Modal: {
            getOrCreateInstance(el: HTMLElement): BootstrapModal;
        };
    };
};

export function getBootstrapModal(el: HTMLElement | null): BootstrapModal | null {
    if (!el || typeof window === "undefined") return null;
    const bs = (window as WindowWithBootstrap).bootstrap;
    if (!bs?.Modal) return null;
    return bs.Modal.getOrCreateInstance(el);
}
