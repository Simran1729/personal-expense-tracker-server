const bcrypt = require('bcryptjs');


const hashPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

const verifyPassword = async(hash, password) => {
    if(!hash || !password) {
        return false;
    }

    const res = await bcrypt.compare(password, hash);
    return res;
}

module.exports = {hashPassword, verifyPassword}