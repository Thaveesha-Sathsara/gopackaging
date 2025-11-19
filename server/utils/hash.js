// hash.js
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Password: ${password}`);
  console.log(`Hashed: ${hash}`);
};

// Replace 'password123' with the password you want to hash
hashPassword('password123');