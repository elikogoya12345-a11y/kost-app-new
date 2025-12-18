-- Script to remove Twin Room from database
USE kost_professional;

-- Delete all rooms with Twin Room type first (to avoid foreign key constraint)
DELETE r FROM rooms r 
JOIN room_types rt ON r.room_type_id = rt.id 
WHERE rt.name = 'Twin Room';

-- Delete all bookings for Twin Room type
DELETE b FROM bookings b 
JOIN rooms r ON b.room_id = r.id 
JOIN room_types rt ON r.room_type_id = rt.id 
WHERE rt.name = 'Twin Room';

-- Delete all payments for Twin Room type
DELETE p FROM payments p 
JOIN bookings b ON p.booking_id = b.id 
JOIN rooms r ON b.room_id = r.id 
JOIN room_types rt ON r.room_type_id = rt.id 
WHERE rt.name = 'Twin Room';

-- Finally delete the Twin Room type itself
DELETE FROM room_types WHERE name = 'Twin Room';

-- Verify deletion
SELECT 'Twin Room removal completed' as status;
SELECT COUNT(*) as remaining_twin_rooms FROM room_types WHERE name = 'Twin Room';