const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
    user_email: {
        type: String,
        require: true,
    },
    verificationCode: {
        type: String,
        require: true,
    },
});

module.exports = mongoose.model('verificationCode', verificationCodeSchema);
