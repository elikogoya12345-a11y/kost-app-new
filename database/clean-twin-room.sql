-- Clean up twin-room data from database
USE kost_professional;

-- Delete all rooms with twin-room type
DELETE FROM rooms WHERE room_type_id IN (SELECT id FROM room_types WHERE name = 'Twin Room');

-- Delete twin-room type
DELETE FROM room_types WHERE name = 'Twin Room';

-- Clean up orphaned data
DELETE FROM bookings WHERE room_type_id NOT IN (SELECT id FROM room_types);
DELETE FROM occupants WHERE room_id NOT IN (SELECT id FROM rooms);
DELETE FROM payments WHERE occupant_id NOT IN (SELECT id FROM occupants);

-- Verify cleanup
SELECT 'Room Types:' as info, name FROM room_types;
SELECT 'Total Rooms:' as info, COUNT(*) as count FROM rooms;