/**
 * Settlr Checkout Widget - Embeddable JavaScript
 * 
 * Usage:
 * <script src="https://settlr.app/widget.js"></script>
 * <script>
 *   document.getElementById('pay-btn').onclick = function() {
 *     Settlr.checkout({
 *       merchantWallet: 'YOUR_SOLANA_WALLET',
 *       amount: 9.99,
 *       memo: 'In-game purchase',
 *       merchantName: 'My Game',
 *       onSuccess: function(data) {
 *         console.log('Payment success!', data.signature);
 *         // Grant the in-game item
 *       }
 *     });
 *   };
 * </script>
 */

(function () {
    'use strict';

    var SETTLR_BASE_URL = 'https://settlr.app';
    var VERSION = '1.0.0';

    // Prevent double initialization
    if (window.Settlr && window.Settlr.initialized) {
        console.log('[Settlr] Already initialized');
        return;
    }

    /**
     * Create and inject CSS styles
     */
    function injectStyles() {
        if (document.getElementById('settlr-styles')) return;

        var style = document.createElement('style');
        style.id = 'settlr-styles';
        style.textContent = '\n' +
            '#settlr-overlay {\n' +
            '  position: fixed;\n' +
            '  top: 0;\n' +
            '  left: 0;\n' +
            '  right: 0;\n' +
            '  bottom: 0;\n' +
            '  background: rgba(0, 0, 0, 0.85);\n' +
            '  backdrop-filter: blur(8px);\n' +
            '  z-index: 2147483647;\n' +
            '  display: flex;\n' +
            '  align-items: center;\n' +
            '  justify-content: center;\n' +
            '  padding: 20px;\n' +
            '  opacity: 0;\n' +
            '  transition: opacity 0.3s ease;\n' +
            '}\n' +
            '#settlr-overlay.visible {\n' +
            '  opacity: 1;\n' +
            '}\n' +
            '#settlr-modal {\n' +
            '  width: 100%;\n' +
            '  max-width: 420px;\n' +
            '  max-height: 90vh;\n' +
            '  background: #18181b;\n' +
            '  border-radius: 16px;\n' +
            '  overflow: hidden;\n' +
            '  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);\n' +
            '  position: relative;\n' +
            '  transform: scale(0.95) translateY(20px);\n' +
            '  transition: transform 0.3s ease;\n' +
            '}\n' +
            '#settlr-overlay.visible #settlr-modal {\n' +
            '  transform: scale(1) translateY(0);\n' +
            '}\n' +
            '#settlr-close {\n' +
            '  position: absolute;\n' +
            '  top: 12px;\n' +
            '  right: 12px;\n' +
            '  width: 32px;\n' +
            '  height: 32px;\n' +
            '  border: none;\n' +
            '  background: #27272a;\n' +
            '  color: #a1a1aa;\n' +
            '  border-radius: 8px;\n' +
            '  font-size: 20px;\n' +
            '  cursor: pointer;\n' +
            '  display: flex;\n' +
            '  align-items: center;\n' +
            '  justify-content: center;\n' +
            '  z-index: 10;\n' +
            '  transition: background 0.2s;\n' +
            '}\n' +
            '#settlr-close:hover {\n' +
            '  background: #3f3f46;\n' +
            '}\n' +
            '#settlr-iframe {\n' +
            '  width: 100%;\n' +
            '  height: 650px;\n' +
            '  border: none;\n' +
            '}\n' +
            '@media (max-width: 480px) {\n' +
            '  #settlr-modal {\n' +
            '    max-width: 100%;\n' +
            '    border-radius: 0;\n' +
            '    max-height: 100vh;\n' +
            '  }\n' +
            '  #settlr-overlay {\n' +
            '    padding: 0;\n' +
            '  }\n' +
            '  #settlr-iframe {\n' +
            '    height: 100vh;\n' +
            '  }\n' +
            '}\n';
        document.head.appendChild(style);
    }

    /**
     * Open checkout modal
     */
    function checkout(config) {
        if (!config || !config.merchantWallet) {
            console.error('[Settlr] merchantWallet is required');
            return;
        }

        var merchantWallet = config.merchantWallet;
        var amount = config.amount || 0;
        var currency = config.currency || 'USDC';
        var memo = config.memo || '';
        var merchantName = config.merchantName || 'Merchant';
        var theme = config.theme || 'dark';
        var onSuccess = config.onSuccess || function () { };
        var onCancel = config.onCancel || function () { };
        var onError = config.onError || function () { };

        // Build checkout URL
        var params = [
            'to=' + encodeURIComponent(merchantWallet),
            'amount=' + encodeURIComponent(amount),
            'currency=' + encodeURIComponent(currency),
            'memo=' + encodeURIComponent(memo),
            'merchant=' + encodeURIComponent(merchantName),
            'theme=' + encodeURIComponent(theme),
            'embed=true',
            'widget=true'
        ].join('&');

        var checkoutUrl = SETTLR_BASE_URL + '/checkout?' + params;

        // Inject styles if needed
        injectStyles();

        // Remove any existing overlay
        var existing = document.getElementById('settlr-overlay');
        if (existing) {
            document.body.removeChild(existing);
        }

        // Create overlay
        var overlay = document.createElement('div');
        overlay.id = 'settlr-overlay';

        // Create modal
        var modal = document.createElement('div');
        modal.id = 'settlr-modal';

        // Create close button
        var closeBtn = document.createElement('button');
        closeBtn.id = 'settlr-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close');

        // Create iframe
        var iframe = document.createElement('iframe');
        iframe.id = 'settlr-iframe';
        iframe.src = checkoutUrl;
        iframe.allow = 'payment';
        iframe.setAttribute('loading', 'eager');

        // Assemble
        modal.appendChild(closeBtn);
        modal.appendChild(iframe);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(function () {
            overlay.classList.add('visible');
        });

        // Close function
        function closeCheckout() {
            overlay.classList.remove('visible');
            setTimeout(function () {
                if (overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
            }, 300);
            window.removeEventListener('message', handleMessage);
        }

        // Close handlers
        closeBtn.onclick = function () {
            closeCheckout();
            onCancel();
        };

        overlay.onclick = function (e) {
            if (e.target === overlay) {
                closeCheckout();
                onCancel();
            }
        };

        // Escape key
        function handleKeydown(e) {
            if (e.key === 'Escape') {
                closeCheckout();
                onCancel();
                document.removeEventListener('keydown', handleKeydown);
            }
        }
        document.addEventListener('keydown', handleKeydown);

        // Listen for messages from iframe
        function handleMessage(event) {
            // Basic origin check
            if (event.origin.indexOf('settlr') === -1 &&
                event.origin.indexOf('localhost') === -1) {
                return;
            }

            var data = event.data || {};
            var type = data.type;
            var payload = data.data || {};

            switch (type) {
                case 'settlr:success':
                    closeCheckout();
                    onSuccess(payload);
                    break;
                case 'settlr:cancel':
                    closeCheckout();
                    onCancel();
                    break;
                case 'settlr:error':
                    closeCheckout();
                    onError(new Error(payload.message || 'Payment failed'));
                    break;
                case 'settlr:resize':
                    if (payload.height) {
                        iframe.style.height = payload.height + 'px';
                    }
                    break;
            }
        }

        window.addEventListener('message', handleMessage);
    }

    /**
     * Create a payment button
     */
    function createButton(config) {
        var btn = document.createElement('button');
        btn.className = 'settlr-button';
        btn.innerHTML = config.buttonText || ('Pay $' + (config.amount || 0).toFixed(2));
        btn.style.cssText =
            'padding: 12px 24px;' +
            'background: linear-gradient(to right, #ec4899, #06b6d4);' +
            'color: white;' +
            'font-weight: 600;' +
            'font-size: 16px;' +
            'border-radius: 12px;' +
            'border: none;' +
            'cursor: pointer;' +
            'transition: opacity 0.2s, transform 0.2s;';

        btn.onmouseenter = function () {
            btn.style.opacity = '0.9';
            btn.style.transform = 'scale(1.02)';
        };
        btn.onmouseleave = function () {
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
        };
        btn.onclick = function () {
            checkout(config);
        };

        return btn;
    }

    /**
     * Auto-initialize buttons with data attributes
     */
    function initDataAttributes() {
        var buttons = document.querySelectorAll('[data-settlr-checkout]');
        buttons.forEach(function (el) {
            el.addEventListener('click', function () {
                checkout({
                    merchantWallet: el.getAttribute('data-merchant-wallet'),
                    amount: parseFloat(el.getAttribute('data-amount') || '0'),
                    memo: el.getAttribute('data-memo') || '',
                    merchantName: el.getAttribute('data-merchant-name') || '',
                    onSuccess: function (data) {
                        // Dispatch custom event
                        el.dispatchEvent(new CustomEvent('settlr:success', { detail: data }));
                    },
                    onCancel: function () {
                        el.dispatchEvent(new CustomEvent('settlr:cancel'));
                    },
                    onError: function (err) {
                        el.dispatchEvent(new CustomEvent('settlr:error', { detail: err }));
                    }
                });
            });
        });
    }

    // Initialize Settlr global
    window.Settlr = {
        version: VERSION,
        initialized: true,
        checkout: checkout,
        createButton: createButton,
        init: initDataAttributes
    };

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDataAttributes);
    } else {
        initDataAttributes();
    }

    console.log('[Settlr] Widget initialized v' + VERSION);
})();
