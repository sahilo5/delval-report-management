/**
 * Toast Notification System
 * Provides a centralized way to show toast notifications
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.toastCounter = 0;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    }

    show(message, options = {}) {
        const {
            type = 'info',
            title = null,
            duration = 5000,
            dismissible = true,
            id = null,
            class: extraClass = ''
        } = options;

        const toastId = id || `toast_${this.toastCounter++}`;
        
        // Create toast element
        const toast = this.createToast(toastId, message, type, title, dismissible, extraClass);
        
        // Add to container
        this.container.appendChild(toast);
        this.toasts.set(toastId, { element: toast, timer: null });
        
        // Show with animation
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Auto-dismiss
        if (duration > 0) {
            const timer = setTimeout(() => {
                this.dismiss(toastId);
            }, duration);
            this.toasts.get(toastId).timer = timer;
        }

        return toastId;
    }

    dismiss(toastId) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const { element, timer } = toastData;
        
        // Clear auto-dismiss timer
        if (timer) {
            clearTimeout(timer);
        }

        // Hide with animation
        element.style.transform = 'translateX(100%)';
        element.style.opacity = '0';

        // Remove after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(toastId);
        }, 300);
    }

    createToast(id, message, type, title, dismissible, extraClass) {
        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `toast max-w-md w-full ${extraClass}`;
        toast.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            padding: 16px;
            pointer-events: auto;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border-left: 4px solid ${this.getTypeColor(type)};
            display: flex;
            align-items: flex-start;
            gap: 12px;
        `;

        // Icon
        const icon = this.createIcon(type);
        toast.appendChild(icon);

        // Content
        const content = document.createElement('div');
        content.style.cssText = 'flex: 1; min-width: 0; overflow-wrap: break-word; word-wrap: break-word;';
        
        if (title) {
            const titleElement = document.createElement('div');
            titleElement.textContent = title;
            titleElement.style.cssText = 'font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 4px;';
            content.appendChild(titleElement);
        }

        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.cssText = 'font-size: 14px; color: #6b7280; line-height: 1.5; word-wrap: break-word; overflow-wrap: break-word;';
        content.appendChild(messageElement);
        
        toast.appendChild(content);

        // Dismiss button
        if (dismissible) {
            const dismissBtn = document.createElement('button');
            dismissBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
            `;
            dismissBtn.style.cssText = `
                background: none;
                border: none;
                padding: 4px;
                cursor: pointer;
                border-radius: 4px;
                color: #9ca3af;
                transition: color 0.2s;
                flex-shrink: 0;
            `;
            dismissBtn.onmouseover = () => dismissBtn.style.color = '#4b5563';
            dismissBtn.onmouseout = () => dismissBtn.style.color = '#9ca3af';
            dismissBtn.onclick = () => this.dismiss(id);
            
            toast.appendChild(dismissBtn);
        }

        return toast;
    }

    createIcon(type) {
        const icon = document.createElement('div');
        icon.style.cssText = 'flex-shrink: 0; width: 20px; height: 20px;';

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        const paths = {
            success: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>',
            error: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>',
            warning: '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>',
            info: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>'
        };

        icon.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="${colors[type]}">
                ${paths[type]}
            </svg>
        `;

        return icon;
    }

    getTypeColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }

    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    // Clear all toasts
    clear() {
        this.toasts.forEach((_, id) => {
            this.dismiss(id);
        });
    }
}

// Global instance
window.toastManager = new ToastManager();

// Global functions for backward compatibility
window.showToast = (message, options) => window.toastManager.show(message, options);
window.dismissToast = (id) => window.toastManager.dismiss(id);

// Auto-initialize Django messages
document.addEventListener('DOMContentLoaded', function() {
    // Check if there are Django messages to display
    const messagesContainer = document.querySelector('.toast-container');
    if (messagesContainer) {
        const messages = messagesContainer.querySelectorAll('[id^="toast_"]');
        messages.forEach(toast => {
            const id = toast.id;
            const message = toast.querySelector('p')?.textContent || '';
            const type = toast.classList.contains('text-green-800') ? 'success' :
                       toast.classList.contains('text-red-800') ? 'error' :
                       toast.classList.contains('text-yellow-800') ? 'warning' : 'info';
            
            // Remove the original Django toast and replace with our toast
            toast.remove();
            
            // Show our enhanced toast
            window.toastManager.show(message, { type, id });
        });
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastManager;
}