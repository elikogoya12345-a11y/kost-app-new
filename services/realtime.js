const db = require('../models/db');

class RealtimeService {
    constructor(io) {
        this.io = io;
    }

    // Broadcast booking updates
    async broadcastBookingUpdate(bookingData) {
        try {
            // Send to admin room
            this.io.to('admin-room').emit('booking-update', {
                type: 'booking',
                action: 'new',
                data: bookingData,
                timestamp: new Date()
            });

            // Send to specific user
            this.io.to(`user-${bookingData.user_id}`).emit('booking-status', {
                type: 'booking',
                status: bookingData.status,
                message: 'Booking Anda telah dikonfirmasi!',
                data: bookingData,
                timestamp: new Date()
            });

            console.log('Booking update broadcasted:', bookingData.id);
        } catch (error) {
            console.error('Error broadcasting booking update:', error);
        }
    }

    // Broadcast payment updates
    async broadcastPaymentUpdate(paymentData) {
        try {
            // Send to admin room
            this.io.to('admin-room').emit('payment-update', {
                type: 'payment',
                action: 'status_change',
                data: paymentData,
                timestamp: new Date()
            });

            // Send to specific user
            this.io.to(`user-${paymentData.user_id}`).emit('payment-status', {
                type: 'payment',
                status: paymentData.status,
                message: 'Status pembayaran diperbarui',
                data: paymentData,
                timestamp: new Date()
            });

            console.log('Payment update broadcasted:', paymentData.id);
        } catch (error) {
            console.error('Error broadcasting payment update:', error);
        }
    }

    // Broadcast room availability changes
    async broadcastRoomAvailability(roomData) {
        try {
            // Broadcast to all users
            this.io.emit('room-availability', {
                type: 'room',
                action: 'availability_change',
                data: roomData,
                timestamp: new Date()
            });

            console.log('Room availability broadcasted:', roomData.room_id);
        } catch (error) {
            console.error('Error broadcasting room availability:', error);
        }
    }

    // Send real-time notification
    async sendNotification(userId, notification) {
        try {
            // Save to database
            await db.execute(
                'INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, ?, ?, ?, NOW())',
                [userId, notification.title, notification.message, notification.type]
            );

            // Send real-time notification
            this.io.to(`user-${userId}`).emit('notification', {
                ...notification,
                timestamp: new Date()
            });

            console.log('Notification sent to user:', userId);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    // Broadcast system-wide announcements
    async broadcastAnnouncement(announcement) {
        try {
            this.io.emit('announcement', {
                type: 'announcement',
                data: announcement,
                timestamp: new Date()
            });

            console.log('Announcement broadcasted');
        } catch (error) {
            console.error('Error broadcasting announcement:', error);
        }
    }

    // Get real-time statistics
    async broadcastStatistics() {
        try {
            const [totalBookings] = await db.execute(
                'SELECT COUNT(*) as count FROM bookings WHERE status = "confirmed"'
            );
            
            const [totalPayments] = await db.execute(
                'SELECT COUNT(*) as count FROM payments WHERE status = "paid"'
            );
            
            const [availableRooms] = await db.execute(
                'SELECT COUNT(*) as count FROM rooms WHERE status = "available"'
            );

            const stats = {
                totalBookings: totalBookings[0].count,
                totalPayments: totalPayments[0].count,
                availableRooms: availableRooms[0].count,
                timestamp: new Date()
            };

            // Send to admin room
            this.io.to('admin-room').emit('statistics-update', stats);

            return stats;
        } catch (error) {
            console.error('Error broadcasting statistics:', error);
        }
    }

    // Handle booking queue for high traffic
    async processBookingQueue(bookingRequest) {
        try {
            // Check room availability in real-time
            const [roomCheck] = await db.execute(
                'SELECT status FROM rooms WHERE id = ? FOR UPDATE',
                [bookingRequest.room_id]
            );

            if (roomCheck.length === 0 || roomCheck[0].status !== 'available') {
                // Room no longer available
                this.io.to(`user-${bookingRequest.user_id}`).emit('booking-error', {
                    type: 'error',
                    message: 'Maaf, kamar sudah tidak tersedia',
                    timestamp: new Date()
                });
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error processing booking queue:', error);
            return false;
        }
    }

    // Real-time payment verification
    async verifyPaymentRealtime(paymentId, userId) {
        try {
            const [payment] = await db.execute(
                'SELECT * FROM payments p JOIN occupants o ON p.occupant_id = o.id WHERE p.id = ? AND o.user_id = ?',
                [paymentId, userId]
            );

            if (payment.length === 0) {
                return { success: false, message: 'Pembayaran tidak ditemukan' };
            }

            // Update payment status
            await db.execute(
                'UPDATE payments SET status = "paid", payment_date = NOW() WHERE id = ?',
                [paymentId]
            );

            // Broadcast update
            await this.broadcastPaymentUpdate({
                id: paymentId,
                user_id: userId,
                status: 'paid',
                amount: payment[0].amount
            });

            return { success: true };
        } catch (error) {
            console.error('Error verifying payment:', error);
            return { success: false, message: 'Gagal memverifikasi pembayaran' };
        }
    }
}

module.exports = RealtimeService;