// STRICT MOBILE CONSTRAINT - NON-DESTRUCTIVE JAVASCRIPT
(function() {
    'use strict';
    
    // Only run on mobile
    if (window.innerWidth > 390) return;
    
    // HOME MOBILE MENU FUNCTIONALITY
    function initHomeMobileMenu() {
        // Only for home page
        const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
        if (!isHomePage) return;
        
        // Hide specific menu items on mobile
        const aboutLink = document.querySelector('a[href="/about"]');
        const guestLink = document.querySelector('a[href="/guest/dashboard"]');
        if (aboutLink) aboutLink.style.display = 'none';
        if (guestLink) guestLink.style.display = 'none';
        
        // Create mobile hamburger button
        if (!document.querySelector('.mobile-hamburger')) {
            const hamburger = document.createElement('button');
            hamburger.className = 'mobile-hamburger';
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.appendChild(hamburger);
            
            // Create mobile menu
            const mobileMenu = document.createElement('div');
            mobileMenu.className = 'mobile-menu';
            mobileMenu.innerHTML = `
                <div style="padding: 2rem;">
                    <div style="display: flex; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
                        <i class="fas fa-home" style="font-size: 1.5rem; color: #f59e0b; margin-right: 0.5rem;"></i>
                        <span style="font-size: 1.25rem; font-weight: bold; color: #1f2937;">Menu</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <a href="/about" style="display: flex; align-items: center; padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; text-decoration: none; color: #374151; font-weight: 500;">
                            <i class="fas fa-info-circle" style="margin-right: 0.75rem; color: #3b82f6;"></i>
                            Tentang Kami
                        </a>
                        <a href="/guest/dashboard" style="display: flex; align-items: center; padding: 1rem; background: #f3f4f6; border-radius: 0.5rem; text-decoration: none; color: #374151; font-weight: 500;">
                            <i class="fas fa-eye" style="margin-right: 0.75rem; color: #10b981;"></i>
                            Masuk sebagai Tamu
                        </a>
                    </div>
                </div>
            `;
            document.body.appendChild(mobileMenu);
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            document.body.appendChild(overlay);
            
            // Toggle functionality
            hamburger.addEventListener('click', function() {
                mobileMenu.classList.toggle('active');
                overlay.classList.toggle('active');
            });
            
            overlay.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                overlay.classList.remove('active');
            });
            
            // Close menu when clicking menu items
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.classList.remove('active');
                    overlay.classList.remove('active');
                });
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomeMobileMenu);
    } else {
        initHomeMobileMenu();
    }
    
    // Prevent horizontal scroll
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 1) return;
        
        const touch = e.touches[0];
        const startX = touch.clientX;
        
        // Prevent horizontal swipe
        if (Math.abs(startX - window.innerWidth / 2) > 50) {
            e.preventDefault();
        }
    }, { passive: false });
    
})();