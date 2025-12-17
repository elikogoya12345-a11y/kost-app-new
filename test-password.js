const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

bcrypt.compare(password, hash, (err, result) => {
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('Match:', result);
    
    if (result) {
        console.log('✅ Password COCOK!');
    } else {
        console.log('❌ Password TIDAK COCOK!');
        
        // Generate hash baru
        bcrypt.hash(password, 10, (err, newHash) => {
            console.log('\nHash baru untuk password "admin123":');
            console.log(newHash);
        });
    }
});