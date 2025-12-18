const db = require('./models/db');

async function cleanTwinRoom() {
    try {
        console.log('Cleaning twin-room data...');
        
        // Delete all rooms with twin-room type
        await db.execute('DELETE FROM rooms WHERE room_type_id IN (SELECT id FROM room_types WHERE name = "Twin Room")');
        console.log('Deleted twin-room rooms');
        
        // Delete twin-room type
        await db.execute('DELETE FROM room_types WHERE name = "Twin Room"');
        console.log('Deleted twin-room type');
        
        // Clean up any bookings/occupants/payments related to twin rooms
        await db.execute('DELETE FROM bookings WHERE room_type_id NOT IN (SELECT id FROM room_types)');
        await db.execute('DELETE FROM occupants WHERE room_id NOT IN (SELECT id FROM rooms)');
        await db.execute('DELETE FROM payments WHERE occupant_id NOT IN (SELECT id FROM occupants)');
        
        console.log('Twin-room cleanup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning twin-room:', error);
        process.exit(1);
    }
}

cleanTwinRoom();