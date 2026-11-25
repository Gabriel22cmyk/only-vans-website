/* ═══════════════════════════════════════════
   COOKIE CONSENT BANNER & MANAGEMENT
   Only Vans — GDPR Compliant
   GA4 only loads after user accepts cookies
   ═══════════════════════════════════════════ */

(function() {
    'use strict';

    var COOKIE_CONSENT_KEY = 'cookie-consent';
    var COOKIE_CONSENT_DURATION = 365 * 24 * 60 * 60 * 1000;
    var GA_ID = 'G-HGKJGM85FW';

    function getConsent() {
        try {
            var stored = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (!stored) return null;
            var consent = JSON.parse(stored);
            if (consent.expires && Date.now() > consent.expires) {
                localStorage.removeItem(COOKIE_CONSENT_KEY);
                return null;
            }
            return consent;
        } catch (e) {
            return null;
        }
    }

    function setConsent(accepted) {
        var consent = {
            accepted: accepted,
            timestamp: Date.now(),
            expires: Date.now() + COOKIE_CONSENT_DURATION
        };
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    }

    function loadGA4() {
        if (document.getElementById('ga4-script')) return;
        var script = document.createElement('script');
        script.id = 'ga4-script';
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(script);
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', GA_ID);
    }

    function removeGA4() {
        var script = document.getElementById('ga4-script');
        if (script) script.remove();
        window.dataLayer = [];
        // Clear GA cookies
        document.cookie.split(';').forEach(function(c) {
            var name = c.trim().split('=')[0];
            if (name.indexOf('_ga') === 0 || name.indexOf('_gid') === 0) {
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + location.hostname;
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            }
        });
    }

    function showBanner() {
        var banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie Consent');
        banner.setAttribute('aria-describedby', 'cookie-consent-text');
        banner.innerHTML = 
            '<div class="cookie-banner-bg"></div>' +
            '<div class="cookie-banner-content">' +
                '<div class="cookie-banner-text" id="cookie-consent-text">' +
                    '<h3>🍪 We use cookies</h3>' +
                    '<p>We use cookies and similar tracking technologies to analyse site traffic and understand how you use our website. By clicking "Accept All", you consent to our use of analytics cookies. You can reject non-essential cookies or learn more in our <a href="cookie-policy.html">Cookie Policy</a>.</p>' +
                '</div>' +
                '<div class="cookie-banner-buttons">' +
                    '<button id="cookie-reject-btn" class="cookie-btn cookie-btn-secondary">Reject Non-Essential</button>' +
                    '<button id="cookie-accept-btn" class="cookie-btn cookie-btn-primary">Accept All</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(banner);

        document.getElementById('cookie-reject-btn').addEventListener('click', function() {
            setConsent(false);
            removeGA4();
            removeBanner();
        });

        document.getElementById('cookie-accept-btn').addEventListener('click', function() {
            setConsent(true);
            loadGA4();
            removeBanner();
        });

        document.addEventListener('keydown', function closeBanner(e) {
            if (e.key === 'Escape') {
                setConsent(false);
                removeGA4();
                removeBanner();
                document.removeEventListener('keydown', closeBanner);
            }
        });
    }

    function removeBanner() {
        var banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.add('fade-out');
            setTimeout(function() { banner.remove(); }, 300);
        }
    }

    function init() {
        var consent = getConsent();
        if (consent === null) {
            showBanner();
        } else if (consent.accepted) {
            loadGA4();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
