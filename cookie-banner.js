/* ═══════════════════════════════════════════
   COOKIE CONSENT BANNER & MANAGEMENT
   Only Vans
   ═══════════════════════════════════════════ */

(function() {
    'use strict';

    var COOKIE_CONSENT_KEY = 'sb-consent';
    var COOKIE_CONSENT_DURATION = 365 * 24 * 60 * 60 * 1000; // 365 days

    // Check if consent already given
    function getConsent() {
        try {
            var stored = localStorage.getItem(COOKIE_CONSENT_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    }

    // Set consent
    function setConsent(accepted) {
        var consent = {
            accepted: accepted,
            timestamp: Date.now(),
            expires: Date.now() + COOKIE_CONSENT_DURATION
        };
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    }

    // Create and show banner
    function showBanner() {
        var banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.setAttribute('role', 'alertdialog');
        banner.setAttribute('aria-label', 'Cookie Consent');
        banner.innerHTML = `
            <div class="cookie-banner-bg"></div>
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <h3>🍪 Cookie Consent</h3>
                    <p>We use cookies to enhance your browsing experience and understand how you use our website. By clicking "Accept", you consent to our use of cookies. You can manage your preferences or learn more in our <a href="cookie-policy.html" target="_blank" rel="noopener noreferrer">Cookie Policy</a>.</p>
                </div>
                <div class="cookie-banner-buttons">
                    <button id="cookie-reject-btn" class="cookie-btn cookie-btn-secondary">Reject</button>
                    <button id="cookie-accept-btn" class="cookie-btn cookie-btn-primary">Accept All</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('cookie-reject-btn').addEventListener('click', function() {
            setConsent(false);
            removeBanner();
        });

        document.getElementById('cookie-accept-btn').addEventListener('click', function() {
            setConsent(true);
            removeBanner();
        });

        // Close on Escape key
        var closeBanner = function(e) {
            if (e.key === 'Escape') {
                removeBanner();
                document.removeEventListener('keydown', closeBanner);
            }
        };
        document.addEventListener('keydown', closeBanner);
    }

    // Remove banner
    function removeBanner() {
        var banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.add('fade-out');
            setTimeout(function() {
                banner.remove();
            }, 300);
        }
    }

    // Init on DOM ready
    function init() {
        var consent = getConsent();
        if (!consent) {
            showBanner();
        }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
