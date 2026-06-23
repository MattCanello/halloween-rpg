(function () {
    const openButton = document.getElementById('open-sales');
    const modal = document.getElementById('salesModal');
    const closeButton = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');
    const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let lastFocused = null;

    function openModal() {
        lastFocused = document.activeElement;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeButton.focus();
    }

    function closeModal() {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    function trapFocus(event) {
        if (event.key !== 'Tab') return;
        const elements = Array.from(modal.querySelectorAll(focusable));
        if (!elements.length) return;
        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    openButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    modal.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
})();