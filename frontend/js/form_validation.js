/**
 * Enhanced Form Validation System
 * Provides real-time form validation with visual feedback
 */

class FormValidator {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.options = {
            showRealTimeValidation: true,
            validateOnBlur: true,
            validateOnInput: false,
            errorClass: 'border-red-500',
            successClass: 'border-green-500',
            errorTextClass: 'text-red-600',
            successTextClass: 'text-green-600',
            ...options
        };
        
        this.rules = new Map();
        this.validators = new Map();
        this.init();
    }

    init() {
        if (!this.form) {
            console.error('Form not found:', this.formId);
            return;
        }

        // Set up default validators
        this.setupDefaultValidators();
        
        // Add event listeners
        this.setupEventListeners();
        
        // Set up custom validation rules
        this.setupValidationRules();
    }

    setupDefaultValidators() {
        // Required field validator
        this.validators.set('required', (value) => {
            return value && value.trim().length > 0;
        });

        // Email validator
        this.validators.set('email', (value) => {
            if (!value) return true;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        });

        // Password strength validator
        this.validators.set('password_strength', (value) => {
            if (!value) return false;
            let strength = 0;
            if (value.length >= 8) strength++;
            if (value.match(/[a-z]/) && value.match(/[A-Z]/)) strength++;
            if (value.match(/[0-9]/)) strength++;
            if (value.match(/[^a-zA-Z0-9]/)) strength++;
            return strength >= 3;
        });

        // Password match validator
        this.validators.set('password_match', (value, fieldName) => {
            const passwordField = this.form.querySelector('[data-password-match="' + fieldName + '"]');
            if (!passwordField) return true;
            return value === passwordField.value;
        });

        // Min length validator
        this.validators.set('min_length', (value, minLength) => {
            return value && value.length >= parseInt(minLength);
        });

        // Max length validator
        this.validators.set('max_length', (value, maxLength) => {
            return !value || value.length <= parseInt(maxLength);
        });

        // Numeric validator
        this.validators.set('numeric', (value) => {
            return !value || /^[0-9]+$/.test(value);
        });

        // Phone number validator
        this.validators.set('phone', (value) => {
            if (!value) return true;
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            return phoneRegex.test(value);
        });

        // URL validator
        this.validators.set('url', (value) => {
            if (!value) return true;
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });
    }

    setupEventListeners() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Input validation
            if (this.options.validateOnInput) {
                input.addEventListener('input', (e) => {
                    this.validateField(input);
                });
            }

            // Blur validation
            if (this.options.validateOnBlur) {
                input.addEventListener('blur', (e) => {
                    this.validateField(input);
                });
            }

            // Real-time validation for specific fields
            if (input.hasAttribute('data-realtime')) {
                input.addEventListener('input', (e) => {
                    this.validateField(input);
                });
            }
        });

        // Form submission validation
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                this.showFormError();
                return false;
            }
        });
    }

    setupValidationRules() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const rules = [];
            
            // Check for required attribute
            if (input.hasAttribute('required') || input.hasAttribute('data-required')) {
                rules.push({ type: 'required', message: 'This field is required' });
            }

            // Check for pattern attribute
            if (input.hasAttribute('pattern')) {
                const pattern = input.getAttribute('pattern');
                const message = input.getAttribute('data-pattern-message') || 'Please enter a valid value';
                rules.push({ type: 'pattern', pattern, message });
            }

            // Check for min/max length
            if (input.hasAttribute('minlength')) {
                const minLength = input.getAttribute('minlength');
                const message = `Minimum ${minLength} characters required`;
                rules.push({ type: 'min_length', minLength, message });
            }

            if (input.hasAttribute('maxlength')) {
                const maxLength = input.getAttribute('maxlength');
                const message = `Maximum ${maxLength} characters allowed`;
                rules.push({ type: 'max_length', maxLength, message });
            }

            // Check for type-specific validation
            const type = input.type || input.tagName.toLowerCase();
            if (type === 'email') {
                rules.push({ type: 'email', message: 'Please enter a valid email address' });
            }

            if (input.hasAttribute('data-validate')) {
                const validationType = input.getAttribute('data-validate');
                switch (validationType) {
                    case 'password':
                        rules.push({ type: 'password_strength', message: 'Password must be strong (8+ chars with mixed types)' });
                        break;
                    case 'phone':
                        rules.push({ type: 'phone', message: 'Please enter a valid phone number' });
                        break;
                    case 'numeric':
                        rules.push({ type: 'numeric', message: 'Please enter numbers only' });
                        break;
                    case 'url':
                        rules.push({ type: 'url', message: 'Please enter a valid URL' });
                        break;
                }
            }

            // Check for password match
            if (input.hasAttribute('data-password-match')) {
                const fieldName = input.getAttribute('data-password-match');
                rules.push({ type: 'password_match', fieldName, message: 'Passwords must match' });
            }

            if (rules.length > 0) {
                this.rules.set(input.name || input.id, rules);
            }
        });
    }

    validateField(input) {
        const fieldName = input.name || input.id;
        const rules = this.rules.get(fieldName);
        
        if (!rules || rules.length === 0) {
            return true;
        }

        const value = input.value;
        let isValid = true;
        let errorMessage = '';

        for (const rule of rules) {
            const validator = this.validators.get(rule.type);
            if (validator) {
                let ruleValid;
                if (rule.type === 'pattern') {
                    const regex = new RegExp(rule.pattern);
                    ruleValid = !value || regex.test(value);
                } else if (rule.type === 'min_length' || rule.type === 'max_length') {
                    ruleValid = validator(value, rule.parameter);
                } else if (rule.type === 'password_match') {
                    ruleValid = validator(value, rule.parameter);
                } else {
                    ruleValid = validator(value);
                }

                if (!ruleValid) {
                    isValid = false;
                    errorMessage = rule.message;
                    break;
                }
            }
        }

        this.updateFieldValidation(input, isValid, errorMessage);
        return isValid;
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            const fieldValid = this.validateField(input);
            if (!fieldValid) {
                isValid = false;
            }
        });

        return isValid;
    }

    updateFieldValidation(input, isValid, errorMessage) {
        // Remove existing validation message
        this.removeFieldValidation(input);

        if (!isValid) {
            // Add error styling
            input.classList.add(this.options.errorClass);
            input.classList.remove(this.options.successClass);
            
            // Add error message
            this.showFieldError(input, errorMessage);
        } else {
            // Add success styling
            input.classList.add(this.options.successClass);
            input.classList.remove(this.options.errorClass);
            
            // Add success indicator
            this.showFieldSuccess(input);
        }
    }

    showFieldError(input, message) {
        const errorElement = document.createElement('div');
        errorElement.className = `mt-1 text-sm ${this.options.errorTextClass} field-error-message`;
        errorElement.textContent = message;
        
        // Insert after input's parent
        const parent = input.closest('.mb-4, .space-y-1, div') || input.parentElement;
        parent.appendChild(errorElement);
    }

    showFieldSuccess(input) {
        const successElement = document.createElement('div');
        successElement.className = `mt-1 text-sm ${this.options.successTextClass} field-success-message`;
        successElement.innerHTML = `
            <svg class="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0116 0zm-3.707-9.293a1 1 0 00-1.414 1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Valid
        `;
        
        // Insert after input's parent
        const parent = input.closest('.mb-4, .space-y-1, div') || input.parentElement;
        parent.appendChild(successElement);
    }

    removeFieldValidation(input) {
        // Remove error/success styling
        input.classList.remove(this.options.errorClass, this.options.successClass);
        
        // Remove error/success messages
        const parent = input.closest('.mb-4, .space-y-1, div') || input.parentElement;
        const errorMessages = parent.querySelectorAll('.field-error-message, .field-success-message');
        errorMessages.forEach(msg => msg.remove());
    }

    showFormError() {
        const existingError = this.form.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorElement = document.createElement('div');
        errorElement.className = 'mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md form-error-message';
        errorElement.innerHTML = `
            <div class="flex">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 00-1.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"/>
                </svg>
                <div class="ml-3">
                    <h3 class="text-sm font-medium">Please correct the errors below</h3>
                    <p class="text-sm mt-1">There are validation errors in your form. Please check all fields and try again.</p>
                </div>
            </div>
        `;

        this.form.insertBefore(errorElement, this.form.firstChild);
        
        // Scroll to top of form
        this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Public methods
    addRule(fieldName, rule) {
        const existingRules = this.rules.get(fieldName) || [];
        existingRules.push(rule);
        this.rules.set(fieldName, existingRules);
    }

    removeRule(fieldName, ruleType) {
        const existingRules = this.rules.get(fieldName) || [];
        const filteredRules = existingRules.filter(rule => rule.type !== ruleType);
        this.rules.set(fieldName, filteredRules);
    }

    validate() {
        return this.validateForm();
    }

    reset() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            this.removeFieldValidation(input);
        });
        
        // Remove form error message
        const formError = this.form.querySelector('.form-error-message');
        if (formError) {
            formError.remove();
        }
    }
}

// Global function for backward compatibility
window.initFormValidation = (formId, options) => {
    return new FormValidator(formId, options);
};

// Auto-initialize forms with validation attribute
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('[data-validate-form]');
    forms.forEach(form => {
        const formId = form.id || form.getAttribute('data-validate-form');
        if (formId) {
            window.initFormValidation(formId);
        }
    });
});