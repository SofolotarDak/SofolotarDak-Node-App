const mongoose = require('mongoose');
const date = new Date();

const postBookSchema = new mongoose.Schema({
    book_name: {
        type: String,
        required: true,
    },
    writter_name: {
        type: String,
        required: true,
    },
    book_subject: {
        type: String,
        required: true,
    },
    book_discription: {
        type: String,
        required: true,
    },
    book_reading_link: {
        type: String,
        required: true,
    },
    storyimage: {
        type: String,
    },
    Posted_at: {
        type: String,
        required: true,
        default: date.toLocaleString(),
    },
    posted_by: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('UserBook', postBookSchema);
