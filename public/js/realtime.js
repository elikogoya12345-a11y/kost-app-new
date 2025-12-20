// Real-time WebSocket client for booking and payment system
class RealtimeClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        
        this.init();
    }
    
    init() {
        try {
            // Initialize Socket.IO connection
            this.socket = io({
                transports: ['websocket', 'polling'],
                upgrade: true,
                rememberUpgrade: true
            });
            
            this.setupEventListeners();
            this.setupConnectionHandlers();
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }
    
    setupConnectionHandlers() {
        this.socket.on('connect', () => {
            console.log('Connected to real-time server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Join appropriate rooms based on user role
            const userRole = document.body.dataset.userRole;
            const userId = document.body.dataset.userId;
            
            if (userRole === 'admin') {
                this.socket.emit('join-admin-room');
            } else if (userId) {
                this.socket.emit('join-user-room', userId);
            }
            
            this.showConnectionStatus('connected');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from real-time server');
            this.isConnected = false;
            this.showConnectionStatus('disconnected');
            this.attemptReconnect();
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.showConnectionStatus('error');
        });
    }
    
    setupEventListeners() {
        // Booking events
        this.socket.on('booking-update', (data) => {
            this.handleBookingUpdate(data);
        });
        
        this.socket.on('booking-status', (data) => {
            this.handleBookingStatus(data);
        });
        
        this.socket.on('new-booking', (data) => {
            this.handleNewBooking(data);
        });
        
        // Payment events
        this.socket.on('payment-update', (data) => {
            this.handlePaymentUpdate(data);
        });
        
        this.socket.on('payment-status', (data) => {
            this.handlePaymentStatus(data);
        });
        
        // Room availability events
        this.socket.on('room-availability', (data) => {
            this.handleRoomAvailability(data);
        });
        
        // Notification events
        this.socket.on('notification', (data) => {
            this.handleNotification(data);
        });
        
        // Statistics events (for admin)
        this.socket.on('statistics-update', (data) => {
            this.handleStatisticsUpdate(data);
        });
        
        // Announcement events
        this.socket.on('announcement', (data) => {
            this.handleAnnouncement(data);
        });
    }
    
    // Booking event handlers
    handleBookingUpdate(data) {
        console.log('Booking update received:', data);
        
        // Update booking status in UI
        const bookingElement = document.querySelector(`[data-booking-id="${data.data.id}"]`);
        if (bookingElement) {
            const statusElement = bookingElement.querySelector('.booking-status');
            if (statusElement) {
                statusElement.textContent = data.data.status;
                statusElement.className = `booking-status status-${data.data.status}`;
            }
        }
        
        // Show notification
        this.showNotification('Booking Update', `Booking untuk kamar ${data.data.room_number} telah diperbarui`, 'info');
        
        // Update statistics if admin
        if (document.body.dataset.userRole === 'admin') {
            this.refreshAdminStats();
        }
    }
    
    handleBookingStatus(data) {
        console.log('Booking status received:', data);
        this.showNotification('Booking Status', data.message, data.status === 'confirmed' ? 'success' : 'info');
    }
    
    handleNewBooking(data) {
        console.log('New booking received:', data);
        
        // Add to admin booking list if exists
        const bookingsList = document.querySelector('#bookings-list');
        if (bookingsList) {
            this.addBookingToList(bookingsList, data.data);
        }
        
        this.showNotification('Booking Baru', `Booking baru dari ${data.data.user_name || 'User'} untuk kamar ${data.data.room_number}`, 'info');
        this.refreshAdminStats();
    }
    
    // Payment event handlers
    handlePaymentUpdate(data) {
        console.log('Payment update received:', data);
        
        // Update payment status in UI
        const paymentElement = document.querySelector(`[data-payment-id="${data.data.id}"]`);
        if (paymentElement) {
            const statusElement = paymentElement.querySelector('.payment-status');
            if (statusElement) {
                statusElement.textContent = data.data.status === 'paid' ? 'Lunas' : 'Pending';
                statusElement.className = `payment-status status-${data.data.status}`;
            }
            
            // Update payment date if paid
            if (data.data.status === 'paid') {
                const dateElement = paymentElement.querySelector('.payment-date');
                if (dateElement) {
                    dateElement.textContent = new Date().toLocaleDateString('id-ID');
                }
            }
        }
        
        // Update dashboard statistics
        this.refreshPaymentStats();
        
        this.showNotification('Payment Update', `Pembayaran untuk kamar ${data.data.room_number} telah diperbarui`, 'success');
    }
    
    handlePaymentStatus(data) {
        console.log('Payment status received:', data);
        // Notification disabled
        
        // Refresh payment summary
        this.refreshPaymentStats();
    }
    
    // Room availability handler
    handleRoomAvailability(data) {
        console.log('Room availability update:', data);
        
        // Update room status in booking form
        const roomElement = document.querySelector(`[data-room-id="${data.data.room_id}"]`);
        if (roomElement) {
            const statusElement = roomElement.querySelector('.room-status');
            const checkbox = roomElement.querySelector('.room-checkbox');
            
            if (statusElement) {
                statusElement.textContent = data.data.status === 'available' ? 'Tersedia' : 'Tidak Tersedia';
                statusElement.className = `room-status status-${data.data.status}`;
            }
            
            if (checkbox) {
                checkbox.disabled = data.data.status !== 'available';
                if (data.data.status !== 'available') {
                    checkbox.checked = false;
                }
            }
        }
        
        // Update room availability counter
        this.updateRoomCounter();
    }
    
    // Notification handler
    handleNotification(data) {
        console.log('Notification received:', data);
        this.showNotification(data.title, data.message, data.type);
        
        // Add to notification list if exists
        this.addToNotificationList(data);
    }
    
    // Statistics handler (admin)
    handleStatisticsUpdate(data) {
        console.log('Statistics update:', data);
        
        // Update dashboard statistics
        const totalBookingsEl = document.querySelector('#total-bookings');
        const totalPaymentsEl = document.querySelector('#total-payments');
        const availableRoomsEl = document.querySelector('#available-rooms');
        
        if (totalBookingsEl) totalBookingsEl.textContent = data.totalBookings;
        if (totalPaymentsEl) totalPaymentsEl.textContent = data.totalPayments;
        if (availableRoomsEl) availableRoomsEl.textContent = data.availableRooms;
    }
    
    // Announcement handler
    handleAnnouncement(data) {
        console.log('Announcement received:', data);
        this.showNotification('Pengumuman', data.data.message, 'announcement');
    }
    
    // Utility methods
    showNotification(title, message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to notification container
        let container = document.querySelector('#notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    showConnectionStatus(status) {
        let statusEl = document.querySelector('#connection-status');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'connection-status';
            statusEl.className = 'fixed bottom-4 left-4 px-3 py-1 rounded text-sm z-50';
            document.body.appendChild(statusEl);
        }
        
        switch (status) {
            case 'connected':
                statusEl.textContent = 'Real-time: Connected';
                statusEl.className = 'fixed bottom-4 left-4 px-3 py-1 rounded text-sm z-50 bg-green-500 text-white';
                setTimeout(() => statusEl.style.display = 'none', 3000);
                break;
            case 'disconnected':
                statusEl.textContent = 'Real-time: Disconnected';
                statusEl.className = 'fixed bottom-4 left-4 px-3 py-1 rounded text-sm z-50 bg-red-500 text-white';
                statusEl.style.display = 'block';
                break;
            case 'error':
                statusEl.textContent = 'Real-time: Connection Error';
                statusEl.className = 'fixed bottom-4 left-4 px-3 py-1 rounded text-sm z-50 bg-yellow-500 text-white';
                statusEl.style.display = 'block';
                break;
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.socket.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }
    
    refreshAdminStats() {
        if (document.body.dataset.userRole === 'admin') {
            fetch('/admin/api/dashboard/stats')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        this.handleStatisticsUpdate(data.stats);
                    }
                })
                .catch(error => console.error('Failed to refresh stats:', error));
        }
    }
    
    refreshPaymentStats() {
        fetch('/user/api/payments/status')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update payment summary
                    const totalPaidEl = document.querySelector('#total-paid');
                    const pendingCountEl = document.querySelector('#pending-count');
                    const overdueCountEl = document.querySelector('#overdue-count');
                    
                    if (totalPaidEl) totalPaidEl.textContent = `Rp ${data.summary.total_paid.toLocaleString('id-ID')}`;
                    if (pendingCountEl) pendingCountEl.textContent = data.summary.pending_count;
                    if (overdueCountEl) overdueCountEl.textContent = data.summary.overdue_count;
                }
            })
            .catch(error => console.error('Failed to refresh payment stats:', error));
    }
    
    updateRoomCounter() {
        const availableRooms = document.querySelectorAll('.room-card[data-status="available"]').length;
        const counterEl = document.querySelector('#available-rooms-count');
        if (counterEl) {
            counterEl.textContent = availableRooms;
        }
    }
    
    addToNotificationList(notification) {
        const notificationsList = document.querySelector('#notifications-list');
        if (notificationsList) {
            const notificationEl = document.createElement('div');
            notificationEl.className = 'notification-item p-3 border-b';
            notificationEl.innerHTML = `
                <div class="font-medium">${notification.title}</div>
                <div class="text-sm text-gray-600">${notification.message}</div>
                <div class="text-xs text-gray-400">${new Date().toLocaleString('id-ID')}</div>
            `;
            notificationsList.insertBefore(notificationEl, notificationsList.firstChild);
        }
    }
    
    // Public methods for manual triggers
    confirmPayment(paymentId) {
        if (!this.isConnected) {
            this.showNotification('Error', 'Tidak terhubung ke server real-time', 'error');
            return;
        }
        
        fetch(`/user/payments/${paymentId}/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('Success', data.message, 'success');
            } else {
                this.showNotification('Error', data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Payment confirmation error:', error);
            this.showNotification('Error', 'Gagal mengkonfirmasi pembayaran', 'error');
        });
    }
    
    checkRoomAvailability() {
        if (!this.isConnected) return;
        
        fetch('/user/api/rooms/availability')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update room availability in real-time
                    data.rooms.forEach(room => {
                        this.handleRoomAvailability({
                            data: {
                                room_id: room.id,
                                status: room.status,
                                room_number: room.room_number
                            }
                        });
                    });
                }
            })
            .catch(error => console.error('Room availability check failed:', error));
    }
}

// Initialize real-time client when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.realtimeClient = new RealtimeClient();
    
    // Auto-refresh room availability every 30 seconds
    setInterval(() => {
        if (window.realtimeClient.isConnected) {
            window.realtimeClient.checkRoomAvailability();
        }
    }, 30000);
});

// CSS for notifications
const notificationStyles = `
<style>
.notification {
    @apply bg-white border-l-4 p-4 rounded shadow-lg max-w-sm;
    animation: slideIn 0.3s ease-out;
}
.notification-info { @apply border-blue-500; }
.notification-success { @apply border-green-500; }
.notification-error { @apply border-red-500; }
.notification-announcement { @apply border-yellow-500; }

.notification-content {
    @apply flex-1;
}
.notification-title {
    @apply font-medium text-gray-900;
}
.notification-message {
    @apply text-sm text-gray-600 mt-1;
}
.notification-close {
    @apply ml-4 text-gray-400 hover:text-gray-600 text-xl leading-none;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.status-available { @apply text-green-600; }
.status-occupied { @apply text-red-600; }
.status-maintenance { @apply text-yellow-600; }
.status-confirmed { @apply text-green-600; }
.status-pending { @apply text-yellow-600; }
.status-cancelled { @apply text-red-600; }
.status-paid { @apply text-green-600; }
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);