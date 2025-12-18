// Room type images from Unsplash
const roomImages = {
    'Standard Room': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center',
    'Superior Room': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop&crop=center',
    'Deluxe Room': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop&crop=center',
    'Suite Room': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop&crop=center',
    'Share Room': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center',
    'Large Room': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop&crop=center',
    'President Room': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop&crop=center'
};

const availableRoomImages = [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&h=200&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=200&fit=crop&crop=center'
];

function getRoomTypeImage(roomType) {
    return roomImages[roomType] || 'https://via.placeholder.com/400x300/fbbf24/ffffff?text=' + encodeURIComponent(roomType);
}

function getAvailableRoomImage(index = 0) {
    return availableRoomImages[index % availableRoomImages.length];
}