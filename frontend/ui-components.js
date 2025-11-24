// FlowPartner - UI Components & Utilities

// ===== Toast Notification System =====
const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 4000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-circle',
            info: 'info'
        };

        toast.innerHTML = `
            <i data-lucide="${icons[type]}" class="toast-icon"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i data-lucide="x"></i>
            </button>
        `;

        this.container.appendChild(toast);

        // Initialize Lucide icons in the toast
        if (window.lucide) {
            lucide.createIcons();
        }

        // Auto remove after duration
        setTimeout(() => {
            toast.classList.add('toast-removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    },

    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// ===== Modal System =====
const Modal = {
    activeModal: null,

    create(options = {}) {
        const {
            title = 'Modal',
            content = '',
            buttons = [],
            closeOnBackdrop = true,
            className = ''
        } = options;

        // Remove existing modal if any
        this.close();

        const modal = document.createElement('div');
        modal.className = `modal-overlay ${className}`;
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" data-action="close">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${buttons.map((btn, idx) => `
                            <button class="btn ${btn.className || 'btn-secondary'}" data-action="${btn.action || idx}">
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        // Handle backdrop click
        if (closeOnBackdrop) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close();
                }
            });
        }

        // Handle close button
        modal.querySelector('[data-action="close"]').addEventListener('click', () => {
            this.close();
        });

        document.body.appendChild(modal);
        this.activeModal = modal;

        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Trigger animation
        setTimeout(() => modal.classList.add('modal-open'), 10);

        return modal;
    },

    close() {
        if (this.activeModal) {
            this.activeModal.classList.remove('modal-open');
            setTimeout(() => {
                this.activeModal.remove();
                this.activeModal = null;
            }, 300);
        }
    },

    confirm(options = {}) {
        const {
            title = 'Confirm',
            message = 'Are you sure?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            onConfirm = () => { },
            onCancel = () => { }
        } = options;

        const modal = this.create({
            title,
            content: `<p>${message}</p>`,
            buttons: [
                {
                    text: cancelText,
                    className: 'btn-secondary',
                    action: 'cancel'
                },
                {
                    text: confirmText,
                    className: 'btn-primary',
                    action: 'confirm'
                }
            ]
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            onCancel();
            this.close();
        });

        modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            onConfirm();
            this.close();
        });

        return modal;
    }
};

// ===== Loading Indicator =====
const Loading = {
    show(target = document.body, text = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div class="loading-content">
                <div class="spinner-modern"></div>
                <p class="loading-text">${text}</p>
            </div>
        `;
        target.appendChild(loader);
        setTimeout(() => loader.classList.add('loading-active'), 10);
        return loader;
    },

    hide(loader) {
        if (loader && loader.parentElement) {
            loader.classList.remove('loading-active');
            setTimeout(() => loader.remove(), 300);
        }
    }
};

// ===== Skeleton Loader Components =====
const Skeleton = {
    card() {
        return `
            <div class="skeleton-card">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-button"></div>
            </div>
        `;
    },

    jobCard() {
        return `
            <div class="job-card skeleton-loading">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 70%;"></div>
                <div class="flex gap-md mt-md">
                    <div class="skeleton skeleton-badge"></div>
                    <div class="skeleton skeleton-badge"></div>
                </div>
            </div>
        `;
    },

    list(count = 3) {
        return Array(count).fill(this.jobCard()).join('');
    }
};

// ===== Empty State Components =====
const EmptyState = {
    create(options = {}) {
        const {
            icon = 'inbox',
            title = 'No items found',
            description = '',
            action = null
        } = options;

        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i data-lucide="${icon}"></i>
                </div>
                <h3 class="empty-state-title">${title}</h3>
                ${description ? `<p class="empty-state-description">${description}</p>` : ''}
                ${action ? `
                    <a href="${action.href}" class="btn btn-primary mt-md">
                        ${action.icon ? `<i data-lucide="${action.icon}"></i>` : ''}
                        ${action.text}
                    </a>
                ` : ''}
            </div>
        `;
    }
};

// ===== Form Validation Helpers =====
const FormValidator = {
    showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;

        // Remove existing error
        this.clearError(inputElement);

        // Add error class
        inputElement.classList.add('form-input-error');

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.innerHTML = `
            <i data-lucide="alert-circle"></i>
            <span>${message}</span>
        `;
        formGroup.appendChild(errorDiv);

        // Initialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    },

    clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;

        inputElement.classList.remove('form-input-error');
        const existingError = formGroup.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
    },

    showSuccess(inputElement) {
        inputElement.classList.remove('form-input-error');
        inputElement.classList.add('form-input-success');
    }
};

// ===== Progress Bar =====
const ProgressBar = {
    create(percentage = 0, className = '') {
        return `
            <div class="progress-bar ${className}">
                <div class="progress-bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
    }
};

// Export all components
window.Toast = Toast;
window.Modal = Modal;
window.Loading = Loading;
window.Skeleton = Skeleton;
window.EmptyState = EmptyState;
window.FormValidator = FormValidator;
window.ProgressBar = ProgressBar;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    Toast.init();

    // Initialize Lucide icons globally
    if (window.lucide) {
        lucide.createIcons();
    }
});

export { Toast, Modal, Loading, Skeleton, EmptyState, FormValidator, ProgressBar };
