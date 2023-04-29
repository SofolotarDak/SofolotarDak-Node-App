// External Inputs
const { body } = require('express-validator');

exports.userBookValidator = [
    body('book_name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('বইয়ের নাম থাকা করা আবশ্যক!')
        .isLength({ min: 2, max: 30 })
        .withMessage('লেখকের নাম ২ থেকে ৩০ অক্ষর পর্যন্ত হতে হবে!'),

    body('writter_name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('লেখকের নাম উল্লেখ করা আবশ্যক!')
        .isLength({ min: 4, max: 25 })
        .withMessage('লেখকের নাম ৪ থেকে ২৫ অক্ষর পর্যন্ত হতে হবে!'),

    body('book_subject')
        .not()
        .isEmpty()
        .withMessage('বইটির বিষয়বস্তু এক শব্দে প্রদান করুন!')
        .isLength({ max: 20 })
        .withMessage('শিরোনাম সর্বোচ্চ ২০ অক্ষরের হতে পারে!'),

    body('book_discription')
        .not()
        .isEmpty()
        .withMessage('অবশ্যই একটি সংক্ষিপ্ত বর্ণনা দিতে হবে!')
        .isLength({ max: 500 })
        .withMessage('বর্ণনাটি সর্বোচ্চ ৮০ শব্দের হতে পারে!'),

    body('book_reading_link')
        .not()
        .isEmpty()
        .withMessage('বইটির PDF লিঙ্কটি দেয়া আবশ্যক!'),

    body('storyimage').custom((value, { req }) => {
        if (!req.file) {
            return Promise.reject('বইয়ের প্রচ্ছদের ছবি অবশ্যই দিতে হবে!');
        }
        return true;
    }),
];
