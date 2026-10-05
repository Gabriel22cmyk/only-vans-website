(function() {
    var sb = window.supabase.createClient(
        'https://tsorpwmhwbyivltgulaf.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzb3Jwd21od2J5aXZsdGd1bGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Njk4MDcsImV4cCI6MjEwMzI0NTgwN30.xLXJN3-BV7vaFkKI6p4j83-ZBd3wB7KH7MCiU2Zuk6o'
    );

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
                    ? '<img src="' + images[0] + '" alt="' + v.make + ' ' + v.model + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy" id="main-' + v.id + '">'
                    : '<div style="color:#94a3b8;font-size:48px;">\uD83D\uDE90</div>';
                var thumbsHtml = '';
                if (images.length > 1) {
                    thumbsHtml = '<div style="display:flex;gap:6px;padding:8px 12px;overflow-x:auto;">';
                    images.forEach(function(url, idx) {
                        thumbsHtml += '<img src="' + url + '" alt="Photo ' + (idx+1) + '" style="width:56px;height:56px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid ' + (idx===0 ? '#0891b2' : '#e2e8f0') + ';flex-shrink:0;" loading="lazy" data-van="' + v.id + '" data-url="' + url + '">';
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
                            (v.mileage ? ' \u00b7 ' + Number(v.mileage).toLocaleString() + ' miles' : '') +
                            ' \u00b7 ' + (v.fuel_type || 'Diesel') + ' \u00b7 ' + (v.transmission || 'Manual') +
                            (v.colour ? ' \u00b7 ' + v.colour : '') + '</p>' +
                        '<div style="font-size:26px;font-weight:800;background:linear-gradient(135deg,#0891b2,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px;">\u00a3' + Number(v.price).toLocaleString() + '</div>' +
                        (v.description ? '<p style="color:#64748b;font-size:13px;line-height:1.6;">' + v.description + '</p>' : '') +
                    '</div>' +
                    '<div style="padding:0 24px 20px;"><a href="tel:01235376044" class="btn-primary" style="display:block;text-align:center;font-size:14px;padding:12px;">Call About This Van</a></div>' +
                '</div>';
            });
            // Thumbnail click to swap main image
            grid.querySelectorAll('[data-van]').forEach(function(thumb) {
                thumb.addEventListener('click', function() {
                    var vanId = this.getAttribute('data-van');
                    var url = this.getAttribute('data-url');
                    document.getElementById('main-' + vanId).src = url;
                    this.parentElement.querySelectorAll('img').forEach(function(t) { t.style.borderColor = '#e2e8f0'; });
                    this.style.borderColor = '#0891b2';
                });
            });
            html += '</div>';
            grid.innerHTML = html;
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
