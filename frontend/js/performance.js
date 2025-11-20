/**
 * Performance Optimization System
 * Optimizes UI performance with lazy loading, debouncing, and efficient animations
 */

class PerformanceOptimizer {
    constructor() {
        this.observers = new Map();
        this.lazyLoaded = new Set();
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupDebouncing();
        this.setupIntersectionObserver();
        this.optimizeImages();
        this.setupVirtualScrolling();
        this.setupMemoryManagement();
    }

    setupLazyLoading() {
        // Lazy load images and components
        const lazyElements = document.querySelectorAll('[data-lazy]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadLazyElement(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            lazyElements.forEach(element => {
                imageObserver.observe(element);
            });
        } else {
            // Fallback for older browsers
            this.lazyLoadFallback(lazyElements);
        }
    }

    loadLazyElement(element) {
        if (this.lazyLoaded.has(element)) return;
        
        this.lazyLoaded.add(element);
        
        const src = element.getAttribute('data-src');
        const type = element.getAttribute('data-lazy-type') || 'img';
        
        switch (type) {
            case 'img':
                if (element.tagName === 'IMG') {
                    element.src = src;
                    element.classList.add('loaded');
                } else {
                    // Background image
                    element.style.backgroundImage = `url(${src})`;
                    element.classList.add('loaded');
                }
                break;
                
            case 'component':
                // Load component content via AJAX
                this.loadComponentContent(element, src);
                break;
                
            default:
                element.src = src;
                element.classList.add('loaded');
        }
        
        // Remove loading placeholder
        const placeholder = element.querySelector('.lazy-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
    }

    loadComponentContent(element, url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                element.innerHTML = html;
                element.classList.add('loaded');
            })
            .catch(error => {
                console.error('Failed to load component:', error);
                element.classList.add('error');
            });
    }

    lazyLoadFallback(elements) {
        const lazyLoad = () => {
            const scrollTop = window.pageYOffset;
            
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                if (rect.top < window.innerHeight + scrollTop) {
                    this.loadLazyElement(element);
                }
            });
        };

        // Throttled scroll handler
        let ticking = false;
        const scrollHandler = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    lazyLoad();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
        lazyLoad(); // Initial check
    }

    setupDebouncing() {
        // Add debouncing to search inputs
        const searchInputs = document.querySelectorAll('[data-debounce]');
        
        searchInputs.forEach(input => {
            let timeout;
            const delay = parseInt(input.getAttribute('data-debounce')) || 300;
            
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    const event = new CustomEvent('debouncedInput', {
                        detail: { value: e.target.value }
                    });
                    e.target.dispatchEvent(event);
                }, delay);
            });
        });
    }

    setupIntersectionObserver() {
        // Observe table rows for virtual scrolling
        const tables = document.querySelectorAll('[data-virtual-scroll]');
        
        tables.forEach(table => {
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            if (rows.length > 50) { // Only virtualize large tables
                this.virtualizeTable(table, rows);
            }
        });
    }

    virtualizeTable(table, rows) {
        const itemHeight = 50; // Approximate row height
        const visibleRows = Math.ceil(window.innerHeight / itemHeight);
        const containerHeight = visibleRows * itemHeight;
        
        // Create virtual scroll container
        const virtualContainer = document.createElement('div');
        virtualContainer.className = 'virtual-scroll-container';
        virtualContainer.style.height = `${containerHeight}px`;
        virtualContainer.style.overflow = 'auto';
        
        // Replace tbody with virtual container
        const tbody = table.querySelector('tbody');
        const originalTbody = tbody.cloneNode(true);
        
        // Clear and setup virtual container
        tbody.innerHTML = '';
        tbody.appendChild(virtualContainer);
        
        // Virtual scrolling logic
        let startIndex = 0;
        const renderVirtualRows = () => {
            const endIndex = Math.min(startIndex + visibleRows, rows.length);
            const visibleRowsData = rows.slice(startIndex, endIndex);
            
            virtualContainer.innerHTML = '';
            visibleRowsData.forEach((row, index) => {
                const clonedRow = row.cloneNode(true);
                clonedRow.style.transform = `translateY(${(startIndex + index) * itemHeight}px)`;
                virtualContainer.appendChild(clonedRow);
            });
        };
        
        renderVirtualRows();
        
        // Scroll handler
        virtualContainer.addEventListener('scroll', () => {
            const newStartIndex = Math.floor(virtualContainer.scrollTop / itemHeight);
            if (newStartIndex !== startIndex) {
                startIndex = newStartIndex;
                renderVirtualRows();
            }
        });
    }

    optimizeImages() {
        // Optimize image loading
        const images = document.querySelectorAll('img[data-optimize]');
        
        images.forEach(img => {
            const optimize = img.getAttribute('data-optimize');
            
            if (optimize === 'lazy') {
                img.loading = 'lazy';
            } else if (optimize === 'progressive') {
                // Progressive JPEG loading
                img.setAttribute('loading', 'eager');
            }
            
            // Add error handling
            img.addEventListener('error', () => {
                img.classList.add('image-error');
                // Try to reload with fallback
                setTimeout(() => {
                    if (img.classList.contains('image-error')) {
                        const fallback = img.getAttribute('data-fallback');
                        if (fallback) {
                            img.src = fallback;
                        }
                    }
                }, 1000);
            });
        });
    }

    setupVirtualScrolling() {
        // Setup virtual scrolling for large data sets
        const scrollContainers = document.querySelectorAll('[data-virtual-container]');
        
        scrollContainers.forEach(container => {
            this.setupVirtualScrollingForContainer(container);
        });
    }

    setupVirtualScrollingForContainer(container) {
        const itemHeight = parseInt(container.getAttribute('data-item-height')) || 50;
        const totalItems = parseInt(container.getAttribute('data-total-items')) || 0;
        const renderItem = container.getAttribute('data-render-function');
        
        let startIndex = 0;
        const buffer = 5; // Extra items above/below viewport
        
        const render = () => {
            const containerHeight = container.clientHeight;
            const visibleCount = Math.ceil(containerHeight / itemHeight);
            const endIndex = Math.min(startIndex + visibleCount + buffer, totalItems);
            
            // Clear and render visible items
            container.innerHTML = '';
            
            for (let i = Math.max(0, startIndex - buffer); i < endIndex; i++) {
                const item = this.createVirtualItem(i, renderItem);
                item.style.transform = `translateY(${i * itemHeight}px)`;
                container.appendChild(item);
            }
            
            // Set container height
            container.style.height = `${totalItems * itemHeight}px`;
        };
        
        // Initial render
        render();
        
        // Scroll handler with throttling
        let ticking = false;
        const scrollHandler = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const newStartIndex = Math.floor(container.scrollTop / itemHeight);
                    if (newStartIndex !== startIndex) {
                        startIndex = newStartIndex;
                        render();
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        container.addEventListener('scroll', scrollHandler, { passive: true });
    }

    createVirtualItem(index, renderItem) {
        const item = document.createElement('div');
        item.className = 'virtual-item';
        item.style.height = `${this.getItemHeight()}px`;
        item.style.position = 'absolute';
        item.style.width = '100%';
        item.style.left = '0';
        
        // Execute render function if available
        if (typeof window[renderItem] === 'function') {
            item.innerHTML = window[renderItem](index);
        } else {
            item.textContent = `Item ${index}`;
        }
        
        return item;
    }

    getItemHeight() {
        // Calculate dynamic item height based on viewport
        if (window.innerWidth < 768) {
            return 60; // Mobile
        } else if (window.innerWidth < 1024) {
            return 50; // Tablet
        } else {
            return 40; // Desktop
        }
    }

    setupMemoryManagement() {
        // Cleanup event listeners and observers
        const cleanup = () => {
            // Disconnect observers
            this.observers.forEach(observer => {
                if (observer && typeof observer.disconnect === 'function') {
                    observer.disconnect();
                }
            });
            this.observers.clear();
            
            // Clear timeouts
            if (this.timeouts) {
                this.timeouts.forEach(timeout => clearTimeout(timeout));
            }
            
            // Remove event listeners
            const elements = document.querySelectorAll('[data-performance-cleanup]');
            elements.forEach(element => {
                const events = element.getAttribute('data-performance-cleanup');
                if (events) {
                    events.split(',').forEach(event => {
                        element.removeEventListener(event.trim(), this[event.trim()]);
                    });
                }
            });
        };

        // Setup cleanup on page unload
        window.addEventListener('beforeunload', cleanup);
        
        // Setup cleanup on SPA navigation
        if (typeof window.addEventListener === 'function') {
            window.addEventListener('popstate', cleanup);
        }
    }

    // Public methods
    optimizeAnimations() {
        // Reduce motion for users who prefer it
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms', 'important');
            document.documentElement.style.setProperty('--transition-duration', '0.01ms', 'important');
        }
    }

    throttle(callback, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall < delay) {
                lastCall = now;
                return;
            }
            lastCall = now;
            return callback.apply(this, args);
        };
    }

    debounce(callback, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                callback.apply(this, args);
            }, delay);
        };
    }

    measurePerformance() {
        // Performance monitoring
        const perfData = {
            navigationStart: performance.timing.navigationStart,
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domInteractive: performance.timing.domInteractive - performance.timing.navigationStart,
            firstPaint: performance.timing.firstPaint - performance.timing.navigationStart,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
        
        console.log('Performance Data:', perfData);
        return perfData;
    }
}

// Global instance
window.performanceOptimizer = new PerformanceOptimizer();

// Auto-initialize performance optimizations
document.addEventListener('DOMContentLoaded', function() {
    window.performanceOptimizer.optimizeAnimations();
    
    // Measure initial load performance
    setTimeout(() => {
        window.performanceOptimizer.measurePerformance();
    }, 1000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}