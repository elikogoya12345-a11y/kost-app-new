// STRICT MOBILE CONSTRAINT - NON-DESTRUCTIVE JAVASCRIPT
(function() {
    'use strict';
    
    // Only run on mobile
    if (window.innerWidth > 390) return;
    
    // HOME SIDEBAR MOBILE FUNCTIONALITY
    function initMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        // Create mobile menu button if not exists
        if (!document.querySelector('.mobile-menu-btn')) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.appendChild(menuBtn);
            
            // Create overlay if not exists
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            
            // Toggle functionality
            menuBtn.addEventListener('click', function() {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            });
            
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileSidebar);
    } else {
        initMobileSidebar();
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