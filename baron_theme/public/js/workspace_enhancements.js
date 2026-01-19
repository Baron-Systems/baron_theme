/**
 * Workspace Enhancements
 * Adds colored dots and improves workspace layout
 */

(function() {
    'use strict';

    /**
     * Add colored dots to workspace links
     */
    function addColoredDots() {
        // Find all workspace links
        const workspaceLinks = document.querySelectorAll('.widget-body a, .widget-body li a, .workspace-link');
        
        workspaceLinks.forEach(link => {
            const parentLi = link.closest('li');
            if (!parentLi) return;

            // Check if dot already exists
            if (parentLi.querySelector('.workspace-dot')) return;

            // Determine dot color based on link type
            // Get theme color from CSS variable
            const computedStyle = getComputedStyle(document.documentElement);
            let dotColor = computedStyle.getPropertyValue('--fluent-primary').trim() || '#3498db'; // Default color
            
            const href = link.getAttribute('href') || '';
            const linkText = link.textContent.trim().toLowerCase();
            
            // Orange for Reports
            if (href.includes('query-report') || href.includes('report') || 
                linkText.includes('report') || linkText.includes('summary') ||
                linkText.includes('statement') || linkText.includes('analysis')) {
                dotColor = '#f59e0b';
            }
            
            // Create dot element
            const dot = document.createElement('span');
            dot.className = 'workspace-dot';
            dot.style.cssText = `
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: ${dotColor};
                margin-right: 8px;
                vertical-align: middle;
            `;
            
            // Insert dot before link text
            link.insertBefore(dot, link.firstChild);
        });
    }

    /**
     * Enhance workspace shortcuts layout
     */
    function enhanceShortcuts() {
        const shortcutWidgets = document.querySelectorAll('.shortcut-widget-box');
        
        shortcutWidgets.forEach(widget => {
            widget.style.cssText += `
                background-color: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                font-weight: 500;
                transition: all 0.2s ease;
                cursor: pointer;
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            widget.addEventListener('mouseenter', function() {
                const computedStyle = getComputedStyle(document.documentElement);
                const primaryColor = computedStyle.getPropertyValue('--fluent-primary').trim() || '#3498db';
                this.style.borderColor = primaryColor;
                // Use CSS variable for shadow and background
                this.style.boxShadow = `0 4px 12px color-mix(in srgb, ${primaryColor} 15%, transparent 85%)`;
                this.style.backgroundColor = `color-mix(in srgb, ${primaryColor} 5%, var(--fluent-surface) 95%)`;
                this.style.transform = 'translateY(-2px)';
            });
            
            widget.addEventListener('mouseleave', function() {
                this.style.borderColor = '#e5e7eb';
                this.style.boxShadow = 'none';
                this.style.backgroundColor = '#ffffff';
                this.style.transform = 'translateY(0)';
            });
        });
    }

    /**
     * Organize workspace sections
     */
    function organizeWorkspaceSections() {
        const layoutSection = document.querySelector('.layout-main-section');
        if (layoutSection) {
            layoutSection.style.cssText += `
                background-color: #f9fafb;
                padding: 24px;
                border-radius: 8px;
            `;
        }

        // Add section headers
        const widgets = document.querySelectorAll('.widget');
        widgets.forEach(widget => {
            const title = widget.querySelector('.widget-title');
            if (title) {
                title.style.cssText += `
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 16px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #f3f4f6;
                `;
            }
        });
    }

    /**
     * Initialize enhancements
     */
    function init() {
        // Run immediately
        addColoredDots();
        enhanceShortcuts();
        organizeWorkspaceSections();

        // Watch for dynamic content
        const observer = new MutationObserver(() => {
            addColoredDots();
            enhanceShortcuts();
            organizeWorkspaceSections();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also run on route changes (Frappe specific)
        if (window.frappe && frappe.router) {
            frappe.router.on('change', () => {
                setTimeout(() => {
                    addColoredDots();
                    enhanceShortcuts();
                    organizeWorkspaceSections();
                }, 500);
            });
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

