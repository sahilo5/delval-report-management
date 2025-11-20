/**
 * Interactive Elements System
 * Provides tooltips, modals, and other interactive UI elements
 */

class InteractiveElements {
    constructor() {
        this.tooltips = new Map();
        this.modals = new Map();
        this.init();
    }

    init() {
        this.setupTooltips();
        this.setupModals();
        this.setupDropdowns();
        this.setupAccordions();
        this.setupKeyboardNavigation();
    }

    setupTooltips() {
        const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
        
        tooltipTriggers.forEach(trigger => {
            const tooltipText = trigger.getAttribute('data-tooltip');
            const tooltipPosition = trigger.getAttribute('data-tooltip-position') || 'top';
            
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 pointer-events-none transition-opacity duration-200';
            tooltip.textContent = tooltipText;
            tooltip.style.maxWidth = '200px';
            tooltip.style.wordWrap = 'break-word';
            
            // Position tooltip
            this.positionTooltip(trigger, tooltip, tooltipPosition);
            
            // Add to DOM
            document.body.appendChild(tooltip);
            
            // Store reference
            this.tooltips.set(trigger, tooltip);
            
            // Event listeners
            trigger.addEventListener('mouseenter', () => this.showTooltip(trigger, tooltip));
            trigger.addEventListener('mouseleave', () => this.hideTooltip(tooltip));
            trigger.addEventListener('focus', () => this.showTooltip(trigger, tooltip));
            trigger.addEventListener('blur', () => this.hideTooltip(tooltip));
        });
    }

    positionTooltip(trigger, tooltip, position) {
        const triggerRect = trigger.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = triggerRect.top - tooltipRect.height - 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = triggerRect.bottom + 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.right + 8;
                break;
            default:
                top = triggerRect.top - tooltipRect.height - 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    showTooltip(trigger, tooltip) {
        tooltip.classList.remove('opacity-0');
        tooltip.classList.add('opacity-100');
    }

    hideTooltip(tooltip) {
        tooltip.classList.remove('opacity-100');
        tooltip.classList.add('opacity-0');
    }

    setupModals() {
        const modalTriggers = document.querySelectorAll('[data-modal-target]');
        
        modalTriggers.forEach(trigger => {
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                this.modals.set(modalId, modal);
                
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModal(modalId);
                });
                
                // Close on backdrop click
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modalId);
                    }
                });
                
                // Close on escape key
                const closeButtons = modal.querySelectorAll('[data-modal-close]');
                closeButtons.forEach(btn => {
                    btn.addEventListener('click', () => this.closeModal(modalId));
                });
            }
        });
    }

    openModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.classList.add('overflow-hidden');
            
            // Focus first focusable element
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }

    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.classList.remove('overflow-hidden');
        }
    }

    setupDropdowns() {
        const dropdowns = document.querySelectorAll('[data-dropdown]');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('[data-dropdown-trigger]');
            const content = dropdown.querySelector('[data-dropdown-content]');
            
            if (trigger && content) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleDropdown(dropdown);
                });
                
                // Close on outside click
                document.addEventListener('click', (e) => {
                    if (!dropdown.contains(e.target)) {
                        this.closeDropdown(dropdown);
                    }
                });
                
                // Close on escape
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.closeDropdown(dropdown);
                    }
                });
            }
        });
    }

    toggleDropdown(dropdown) {
        const content = dropdown.querySelector('[data-dropdown-content]');
        const isOpen = !content.classList.contains('hidden');
        
        if (isOpen) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown);
        }
    }

    openDropdown(dropdown) {
        const content = dropdown.querySelector('[data-dropdown-content]');
        const trigger = dropdown.querySelector('[data-dropdown-trigger]');
        
        content.classList.remove('hidden');
        content.classList.add('opacity-100', 'transform', 'scale-100');
        trigger.classList.add('text-gray-900');
        trigger.setAttribute('aria-expanded', 'true');
    }

    closeDropdown(dropdown) {
        const content = dropdown.querySelector('[data-dropdown-content]');
        const trigger = dropdown.querySelector('[data-dropdown-trigger]');
        
        content.classList.add('hidden');
        content.classList.remove('opacity-100', 'transform', 'scale-100');
        trigger.classList.remove('text-gray-900');
        trigger.setAttribute('aria-expanded', 'false');
    }

    setupAccordions() {
        const accordions = document.querySelectorAll('[data-accordion]');
        
        accordions.forEach(accordion => {
            const trigger = accordion.querySelector('[data-accordion-trigger]');
            const content = accordion.querySelector('[data-accordion-content]');
            
            if (trigger && content) {
                trigger.addEventListener('click', () => {
                    this.toggleAccordion(accordion);
                });
            }
        });
    }

    toggleAccordion(accordion) {
        const content = accordion.querySelector('[data-accordion-content]');
        const trigger = accordion.querySelector('[data-accordion-trigger]');
        const icon = accordion.querySelector('[data-accordion-icon]');
        const isOpen = !content.classList.contains('hidden');
        
        if (isOpen) {
            this.closeAccordion(accordion);
        } else {
            this.openAccordion(accordion);
        }
    }

    openAccordion(accordion) {
        const content = accordion.querySelector('[data-accordion-content]');
        const trigger = accordion.querySelector('[data-accordion-trigger]');
        const icon = accordion.querySelector('[data-accordion-icon]');
        
        content.classList.remove('hidden');
        content.classList.add('opacity-100');
        trigger.setAttribute('aria-expanded', 'true');
        
        if (icon) {
            icon.classList.remove('rotate-0');
            icon.classList.add('rotate-180');
        }
    }

    closeAccordion(accordion) {
        const content = accordion.querySelector('[data-accordion-content]');
        const trigger = accordion.querySelector('[data-accordion-trigger]');
        const icon = accordion.querySelector('[data-accordion-icon]');
        
        content.classList.add('hidden');
        content.classList.remove('opacity-100');
        trigger.setAttribute('aria-expanded', 'false');
        
        if (icon) {
            icon.classList.add('rotate-0');
            icon.classList.remove('rotate-180');
        }
    }

    setupKeyboardNavigation() {
        // Tab navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const currentFocus = document.activeElement;
                const currentIndex = Array.from(focusableElements).indexOf(currentFocus);
                
                if (e.shiftKey && currentIndex > 0) {
                    e.preventDefault();
                    focusableElements[currentIndex - 1].focus();
                } else if (!e.shiftKey && currentIndex < focusableElements.length - 1) {
                    e.preventDefault();
                    focusableElements[currentIndex + 1].focus();
                }
            }
        });
        
        // Arrow key navigation for menus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const menuItems = document.querySelectorAll('[role="menuitem"]');
                const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);
                
                let nextIndex;
                if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
                } else {
                    nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
                }
                
                if (nextIndex >= 0) {
                    e.preventDefault();
                    menuItems[nextIndex].focus();
                }
            }
        });
    }

    // Public methods
    createTooltip(element, text, position = 'top') {
        element.setAttribute('data-tooltip', text);
        element.setAttribute('data-tooltip-position', position);
        this.setupTooltips(); // Re-initialize to include new element
    }

    createModal(modalId, content, options = {}) {
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 z-50 overflow-y-auto hidden';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto relative">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h3 class="text-lg font-medium text-gray-900">${options.title || 'Modal'}</h3>
                        <button data-modal-close class="text-gray-400 hover:text-gray-600">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="p-4">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupModals(); // Re-initialize to include new modal
        return modalId;
    }

    destroy() {
        // Clean up tooltips
        this.tooltips.forEach((tooltip, trigger) => {
            tooltip.remove();
            trigger.removeEventListener('mouseenter', this.showTooltip);
            trigger.removeEventListener('mouseleave', this.hideTooltip);
            trigger.removeEventListener('focus', this.showTooltip);
            trigger.removeEventListener('blur', this.hideTooltip);
        });
        this.tooltips.clear();
        
        // Clean up modals
        this.modals.forEach((modal, id) => {
            modal.remove();
        });
        this.modals.clear();
    }
}

// Global instance
window.interactiveElements = new InteractiveElements();

// Backward compatibility functions
window.createTooltip = (element, text, position) => {
    window.interactiveElements.createTooltip(element, text, position);
};

window.createModal = (modalId, content, options) => {
    return window.interactiveElements.createModal(modalId, content, options);
};

window.openModal = (modalId) => {
    window.interactiveElements.openModal(modalId);
};

window.closeModal = (modalId) => {
    window.interactiveElements.closeModal(modalId);
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    window.interactiveElements.init();
});