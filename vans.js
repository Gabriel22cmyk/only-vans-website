(function() {
    var sb = window.supabase.createClient(
        'https://tsorpwmhwbyivltgulaf.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzb3Jwd21od2J5aXZsdGd1bGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Njk4MDcsImV4cCI6MjEwMzI0NTgwN30.xLXJN3-BV7vaFkKI6p4j83-ZBd3wB7KH7MCiU2Zuk6o'
    );

    // Lightbox modal state
    var lightboxState = {
        images: [],
        currentIndex: 0,
        isOpen: false
    };

    function createLightboxHTML() {
        return '<div id="van-lightbox" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease-out;">' +
            '<div style="position:absolute;top:0;left:0;right:0;bottom:0;cursor:pointer;" id="lightbox-close-bg"></div>' +
            '<div style="position:relative;z-index:10;width:90vw;max-width:900px;max-height:90vh;display:flex;flex-direction:column;">' +
            '<button id="lightbox-close" style="position:absolute;top:-40px;right:0;background:white;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:all 0.2s;z-index:11;">×</button>' +
            '<div style="flex:1;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);border-radius:8px;position:relative;overflow:hidden;">' +
            '<img id="lightbox-image" src="" alt="Van photo" style="max-width:100%;max-height:100%;object-fit:contain;display:block;animation:zoomIn 0.4s ease-out;">' +
            '<button id="lightbox-prev" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.9);border:none;width:44px;height:44px;border-radius:50%;cursor:pointer;font-size:24px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;z-index:12;">‹</button>' +
            '<button id="lightbox-next" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.9);border:none;width:44px;height:44px;border-radius:50%;cursor:pointer;font-size:24px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;z-index:12;">›</button>' +
            '</div>' +
            '<div style="background:rgba(0,0,0,0.7);padding:16px;text-align:center;color:white;font-size:14px;border-radius:0 0 8px 8px;font-family:Plus Jakarta Sans,sans-serif;font-weight:500;">' +
            '<span id="lightbox-counter"></span>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    function openLightbox(images, vanId) {
        if (!images || images.length === 0) return;
        
        lightboxState.images = images;
        lightboxState.currentIndex = 0;
        lightboxState.isOpen = true;

        // Create and inject lightbox
        if (!document.getElementById('van-lightbox')) {
            document.body.insertAdjacentHTML('beforeend', createLightboxHTML());
            setupLightboxHandlers();
        }

        updateLightboxDisplay();
    }

    function closeLightbox() {
        var lightbox = document.getElementById('van-lightbox');
        if (lightbox) {
            lightbox.style.animation = 'fadeOut 0.2s ease-out forwards';
            setTimeout(function() {
                lightbox.remove();
                lightboxState.isOpen = false;
            }, 200);
        }
    }

    function updateLightboxDisplay() {
        var img = document.getElementById('lightbox-image');
        var counter = document.getElementById('lightbox-counter');
        
        if (img) {
            img.src = lightboxState.images[lightboxState.currentIndex];
            counter.textContent = (lightboxState.currentIndex + 1) + ' of ' + lightboxState.images.length;
        }
    }

    function setupLightboxHandlers() {
        var closeBtn = document.getElementById('lightbox-close');
        var closeBg = document.getElementById('lightbox-close-bg');
        var prevBtn = document.getElementById('lightbox-prev');
        var nextBtn = document.getElementById('lightbox-next');

        closeBtn.addEventListener('click', closeLightbox);
        closeBg.addEventListener('click', closeLightbox);

        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            lightboxState.currentIndex = (lightboxState.currentIndex - 1 + lightboxState.images.length) % lightboxState.images.length;
            updateLightboxDisplay();
        });

        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            lightboxState.currentIndex = (lightboxState.currentIndex + 1) % lightboxState.images.length;
            updateLightboxDisplay();
        });

        // Keyboard controls
        document.addEventListener('keydown', function(e) {
            if (!lightboxState.isOpen) return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') {
                lightboxState.currentIndex = (lightboxState.currentIndex - 1 + lightboxState.images.length) % lightboxState.images.length;
                updateLightboxDisplay();
            }
            if (e.key === 'ArrowRight') {
                lightboxState.currentIndex = (lightboxState.currentIndex + 1) % lightboxState.images.length;
                updateLightboxDisplay();
            }
        });
    }

    async function loadVans() {
        var grid = document.getElementById('vansGrid');
        if (!grid) return;
        try {
            var res = await sb.from('vans').select('*').eq('status', 'available').order('created_at', { ascending: false });
            if (res.error) throw res.error;
            var vans = res.data || [];
            if (!vans.length) {
                grid.innerHTML = '<div class="vans-placeholder">' +
                    '<div class="service-icon" style="margin-bottom:16px;"><img src="icons/van-sales.svg" alt="Vans"></div>' +
                    '<h3>New Stock Coming Soon</h3>' +
                    '<p>Give us a call to find out what\'s currently available.</p>' +
                    '<a href="tel:01235376044" class="btn-primary">Call 01235 376044</a></div>';
                return;
            }
            var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;">';
            vans.forEach(function(v) {
                var images = (v.image_urls && v.image_urls.length) ? v.image_urls : (v.image_url ? [v.image_url] : []);
                var mainImg = images.length
                    ? '<img src="' + images[0] + '" alt="' + v.make + ' ' + v.model + '" style="width:100%;height:100%;object-fit:cover;cursor:pointer;transition:opacity 0.2s;" loading="lazy" class="van-main-image" data-images="' + encodeURIComponent(images.join('|')) + '">'
                    : '<div style="color:#94a3b8;font-size:48px;">🚙</div>';
                var thumbsHtml = '';
                if (images.length > 1) {
                    thumbsHtml = '<div style="display:flex;gap:6px;padding:8px 12px;overflow-x:auto;">';
                    images.forEach(function(url, idx) {
                        thumbsHtml += '<img src="' + url + '" alt="Photo ' + (idx+1) + '" style="width:56px;height:56px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid ' + (idx===0 ? '#0891b2' : '#e2e8f0') + ';flex-shrink:0;transition:border-color 0.2s;" loading="lazy" data-van="' + v.id + '" data-url="' + url + '" class="van-thumbnail">';
                    });
                    thumbsHtml += '</div>';
                }
                var photoCount = images.length > 1 ? '<span style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.6);color:white;padding:3px 8px;border-radius:12px;font-size:12px;font-weight:600;">' + images.length + ' photos</span>' : '';
                html += '<div class="glass-card" style="overflow:hidden;">' +
                    '<div style="height:220px;background:linear-gradient(135deg,#f0f9fc,#e0f2fe);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">' + mainImg + photoCount + '</div>' +
                    thumbsHtml +
                    '<div style="padding:24px;">' +
                        '<h3 style="font-size:20px;font-weight:700;color:#1e293b;margin-bottom:6px;">' + v.make + ' ' + v.model + '</h3>' +
                        '<p style="color:#64748b;font-size:14px;margin-bottom:12px;">' + v.year +
                            (v.mileage ? ' · ' + Number(v.mileage).toLocaleString() + ' miles' : '') +
                            ' · ' + (v.fuel_type || 'Diesel') + ' · ' + (v.transmission || 'Manual') +
                            (v.colour ? ' · ' + v.colour : '') + '</p>' +
                        '<div style="font-size:26px;font-weight:800;background:linear-gradient(135deg,#0891b2,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px;">£' + Number(v.price).toLocaleString() + '</div>' +
                        (v.description ? '<p style="color:#64748b;font-size:13px;line-height:1.6;">' + v.description + '</p>' : '') +
                    '</div>' +
                    '<div style="padding:0 24px 20px;"><a href="tel:01235376044" class="btn-primary" style="display:block;text-align:center;font-size:14px;padding:12px;">Call About This Van</a></div>' +
                '</div>';
            });
            html += '</div>';
            grid.innerHTML = html;

            // Thumbnail click to swap main image
            grid.querySelectorAll('.van-thumbnail').forEach(function(thumb) {
                thumb.addEventListener('click', function() {
                    var vanId = this.getAttribute('data-van');
                    var url = this.getAttribute('data-url');
                    var mainImg = grid.querySelector('[data-images]');
                    if (mainImg) {
                        mainImg.src = url;
                    }
                    this.parentElement.querySelectorAll('img').forEach(function(t) { t.style.borderColor = '#e2e8f0'; });
                    this.style.borderColor = '#0891b2';
                });
            });

            // Main image click to open lightbox
            grid.querySelectorAll('.van-main-image').forEach(function(img) {
                img.addEventListener('click', function() {
                    var imagesStr = this.getAttribute('data-images');
                    var images = imagesStr ? decodeURIComponent(imagesStr).split('|') : [this.src];
                    openLightbox(images);
                });
                img.addEventListener('mouseenter', function() {
                    this.style.opacity = '0.8';
                });
                img.addEventListener('mouseleave', function() {
                    this.style.opacity = '1';
                });
            });
        } catch (e) {
            grid.innerHTML = '<div class="vans-placeholder">' +
                '<div class="service-icon" style="margin-bottom:16px;"><img src="icons/van-sales.svg" alt="Vans"></div>' +
                '<h3>New Stock Coming Soon</h3>' +
                '<p>Give us a call to find out what\'s currently available.</p>' +
                '<a href="tel:01235376044" class="btn-primary">Call 01235 376044</a></div>';
        }
    }
    loadVans();
})();
