// External Inputs
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { validationResult } = require('express-validator');
require('dotenv').config();
const nodeMailer = require('nodemailer');

// Internal Inputs
const userInfo = require('../models/user.register.model');
const userStoryInfo = require('../models/user.post-story.model');
const userBookInfo = require('../models/user.post-book.modal');
const userApprovedStoryInfo = require('../models/user.approved-story.model');
const userVerificationCodeInfo = require('../models/user.verification-code.model');
const errorFormetter = require('../utils/validation-error-formatter.utils');

// Node Mailer Configuration Step

let nodeMailerEmail = process.env.NodeMailer_EMAIL;
let nodeMailerEmailPass = process.env.NodeMailerEMAIL_PASS;
let nodeMailerConfig = {
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: nodeMailerEmail,
        pass: nodeMailerEmailPass,
    },
};

const transporter = nodeMailer.createTransport(nodeMailerConfig);

// Get Controllers

exports.getIndex = (req, res) => {
    Promise.all([userApprovedStoryInfo.find({}), userBookInfo.find({})])
        .then(([userApprovedStories, userBooks]) => {
            res.render('index', {
                userApprovedStories,
                userBooks,
            });
        })
        .catch((error) => {
            // Handle error
            console.log(error);
            res.status(500).send('Internal Server Error');
        });
};

exports.getLikhoni = (req, res) => {
    userApprovedStoryInfo.find({}, (error, userApprovedStories) => {
        res.render('likhoni', {
            userApprovedStories,
            messages: req.flash('success'),
        });
    });
};

exports.getAllBooks = (req, res) => {
    userBookInfo.find({}, (error, userBooks) => {
        res.render('all-books', {
            userBooks,
            messages: req.flash('success'),
        });
    });
};

exports.getRegister = (req, res) => {
    res.render('register', { error: {}, value: {} });
};

exports.getLogin = (req, res) => {
    res.render('login', {
        error: {},
        value: {},
        messages: req.flash('success'),
    });
};

exports.getPasswordReset = (req, res) => {
    res.render('password-reset', { error: {}, value: {} });
};

exports.getUserStory = (req, res) => {
    res.render('userstory', {
        error: {},
        value: {},
        messages: req.flash('success'),
    });
};

exports.getUserBook = (req, res) => {
    res.render('userbook', {
        error: {},
        value: {},
        messages: req.flash('success'),
    });
};

exports.getApprovalPage = (req, res) => {
    userStoryInfo.find({}, (error, userstories) => {
        res.render('approval-page', {
            userstories,
            messages: req.flash('success'),
        });
    });
};

exports.getApprovalError = (req, res) => {
    res.render('approval-error', { error: {}, value: {} });
};

exports.getUsers = (req, res) => {
    userInfo.find({}, (error, users) => {
        res.render('users', {
            users,
            messages: req.flash('success'),
        });
    });
};

exports.getLogout = (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(error);
            return next(error);
        }

        return res.redirect('/');
    });
};

// Post Controllers

exports.postRegister = (req, res) => {
    const { username, email, phone, password, agreement } = req.body;

    const errors = validationResult(req).formatWith(errorFormetter);

    if (!errors.isEmpty()) {
        return res.render('register', {
            error: errors.mapped(),
            value: {
                username,
                email,
                phone,
                password,
                agreement,
            },
        });
    }

    try {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            const registerInfo = new userInfo({
                username,
                email,
                phone,
                password: hash,
                agreement,
            });
            registerInfo
                .save()
                .then(async () => {
                    // Creating Mail information
                    let mailInfo = {
                        from: '"Sofolotar Dak" <sofolotardak@gmail.com>',
                        to: 'sahreyararafat@gmail.com',
                        subject: `নতুন অ্যাকাউন্ট তৈরি হয়েছে!`,
                        html: `<p>সফলতার ডাক -এ নতুন অ্যাকাউন্ট খুলেছেন <b>" ${username} "</b>.<br>
                        তার ইমেইল ঠিকানা:<b> ${email}</b><br>
                        তার ফোন নম্বর:<b> ${phone}</b><br><br>
                        ধন্যবাদ!</p>`,
                    };

                    // Sending Mail via Nodemailer
                    const info = await transporter.sendMail(mailInfo);

                    // console.log('Message sent: %s', info.messageId);

                    req.flash(
                        'success',
                        'অভিনন্দন! নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।'
                    );
                    res.redirect('/login');
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;

    const errors = validationResult(req).formatWith(errorFormetter);

    if (!errors.isEmpty()) {
        return res.render('login', {
            error: errors.mapped(),
            value: { email, password },
            messages: [],
        });
    }

    try {
        const userEmail = await userInfo.findOne({ email });
        if (!userEmail) {
            return res.json({
                message: 'Invalid user!',
            });
        }

        const userPassword = await bcrypt.compare(password, userEmail.password);

        if (!userPassword) {
            return res.json({
                message: 'Invalid user password!',
            });
        }

        if (
            userEmail.username === 'Admin' &&
            userEmail.email === 'sofolotardak@gmail.com'
        ) {
            req.session.AdminIsLoggedIn = true;
            req.session.isLoggedIn = true;
            req.session.user = userEmail;
            req.session.save((error) => {
                if (error) {
                    console.log(error);
                    return next(error);
                }
                req.flash('success', 'স্বাগতম! এডমিন সাহেব।');
                res.redirect('/approval-page');
            });
        } else {
            req.session.isLoggedIn = true;
            req.session.user = userEmail;
            req.session.save((error) => {
                if (error) {
                    console.log(error);
                    return next(error);
                }
                req.flash('success', 'অভিনন্দন! লগইন সফলভাবে সম্পন্ন হয়েছে।');
                res.redirect('/userstory');
            });
        }
    } catch (error) {
        console.log(error);
        next();
    }
};

exports.postUserStory = (req, res) => {
    const { writter_name } = req.body;
    const { story_title } = req.body;
    const { story } = req.body;
    const { posted_by } = req.body;

    const errors = validationResult(req).formatWith(errorFormetter);
    if (!errors.isEmpty()) {
        return res.render('userstory', {
            error: errors.mapped(),
            value: {
                writter_name,
                story_title,
                story,
            },
            messages: [],
        });
    }

    const UserStoryInfo = new userStoryInfo({
        writter_name,
        story_title,
        story,
        posted_by,
    });
    if (req.file) {
        UserStoryInfo.storyimage = req.file.path;
    }
    UserStoryInfo.save()
        .then(async () => {
            // Creating Mail information
            let mailInfo = {
                from: '"Sofolotar Dak" <sofolotardak@gmail.com>',
                to: 'sahreyararafat@gmail.com',
                subject: `নতুন লিখনি পোষ্ট করা হয়েছে!`,
                html: `<p>সফলতার ডাকে নতুন লিখনি পোষ্ট করা হয়েছে।</p><p>লেখকের নাম: <b>${writter_name}</b></p><p>লিখনির শিরোনাম: <b>${story_title}</b></p><p>পোস্ট করেছেন: <b>${posted_by}</b></p><p>অনুমোদনের জন্য অপেক্ষারত লিখনি।</p>`,
            };

            // Sending Mail via Nodemailer
            const info = await transporter.sendMail(mailInfo);

            // console.log('Message sent: %s', info.messageId);

            req.flash(
                'success',
                'পোষ্ট সম্পন্ন হয়েছে! আপনার লিখনি এডমিন কর্তৃক অনুমোদনের অপেক্ষায় রয়েছে।'
            );

            res.redirect('/likhoni');
        })
        .catch((error) => {
            console.log(error);
        });
};

exports.postUserBook = (req, res) => {
    const { book_name } = req.body;
    const { writter_name } = req.body;
    const { book_subject } = req.body;
    const { book_discription } = req.body;
    const { book_reading_link } = req.body;
    const { posted_by } = req.body;

    const errors = validationResult(req).formatWith(errorFormetter);
    if (!errors.isEmpty()) {
        return res.render('userbook', {
            error: errors.mapped(),
            value: {
                book_name,
                writter_name,
                book_subject,
                book_discription,
                book_reading_link,
                storyimage: req.file ? req.file.path : '',
            },
            messages: [],
        });
    }

    const UserBookInfo = new userBookInfo({
        book_name,
        writter_name,
        book_subject,
        book_discription,
        book_reading_link,
        posted_by,
    });
    if (req.file) {
        UserBookInfo.storyimage = req.file.path;
    } else {
        UserBookInfo.storyimage = '';
    }
    UserBookInfo.save()
        .then(async () => {
            req.flash(
                'success',
                `অভিনন্দন! আপনার "'${book_name}'" বইটি সফল ভাবে পোষ্ট করা হয়েছে।`
            );

            res.redirect('/all-books');
        })
        .catch((error) => {
            console.log(error);
        });
};

exports.postUserApprovedstory = (req, res) => {
    const { golpo_id } = req.body;
    const { writter_name } = req.body;
    const { story_title } = req.body;
    const { story } = req.body;
    const { storyimage } = req.body;
    const { post_time } = req.body;

    const errors = validationResult(req).formatWith(errorFormetter);
    if (!errors.isEmpty()) {
        return res.render('approval-error', {
            error: errors.mapped(),
        });
    }

    const approvedStoryInfo = new userApprovedStoryInfo({
        writter_name,
        story_title,
        story,
        post_time,
        storyimage,
    });
    approvedStoryInfo
        .save()
        .then(async () => {
            // Delete user verification info from database
            await userStoryInfo.deleteOne({ _id: golpo_id });

            req.flash('success', 'অনুমোদন সফল হয়েছে!');

            res.redirect('/likhoni');
        })
        .catch((error) => {
            console.log(error);
        });
};

exports.postResetPasswordCode = async (req, res) => {
    const { user_email } = req.body;

    function generateRandomNumber() {
        var randomDecimal = Math.random();
        var randomInteger = Math.floor(randomDecimal * 10000);
        var randomNumber = randomInteger.toString().padStart(4, '0');
        // Return the random number as a string
        return randomNumber;
    }

    var verificationCode = generateRandomNumber();

    // Creating Mail information
    let mailInfo = {
        from: '"Sofolotar Dak" <sofolotardak@gmail.com>',
        to: user_email,
        subject: `Verification Code`,
        html: `<p>Dear User,</p>
        <p>We received a request to change your password for your SofolotarDak account:
        <p><strong>${user_email}</strong></p>
        Use the verification code below to complete the password reset process:</p>
        <h2 style="font-size: 24px; font-weight: bold; margin: 20px 0;">${verificationCode}</h2>
        <p> <b>Do not share this code with anyone.</b> It is for your use only. If you did not request this code, please ignore this message.</p>
        `,
    };

    const verificationCodeInfo = new userVerificationCodeInfo({
        user_email,
        verificationCode,
    });

    verificationCodeInfo
        .save()
        .then(async () => {
            // Sending Mail via Nodemailer
            const info = await transporter.sendMail(mailInfo);
            // console.log('Message sent: %s', info.messageId);

            res.redirect('/password-reset');
        })
        .catch((error) => {
            console.log(error);
        });
};

// Update Controllers

exports.postUserPasswordReset = async (req, res, next) => {
    const { verificationCode, email, new_password, confirm_new_password } =
        req.body;

    const errors = validationResult(req).formatWith(errorFormetter);

    if (!errors.isEmpty()) {
        return res.render('password-reset', {
            error: errors.mapped(),
            value: {
                verificationCode,
                email,
                new_password,
                confirm_new_password,
            },
            messages: [],
        });
    }

    try {
        const userEmail = await userInfo.findOne({ email });
        const userVerificationEmail = await userVerificationCodeInfo.findOne({
            user_email: email,
        });

        const verification_id = userVerificationEmail._id;

        const sentVerificationCode = userVerificationEmail.verificationCode;

        if (verificationCode != sentVerificationCode) {
            return res.json({
                message: 'Invalid verification code!',
            });
        } else if (!userEmail || !userVerificationEmail) {
            return res.json({
                message: 'Invalid user!',
            });
        } else {
            // hash the new password
            const newHashedPassword = await bcrypt.hash(
                new_password,
                saltRounds
            );

            // Update the user's password in the database
            await userInfo.updateOne(
                { email },
                { password: newHashedPassword }
            );

            // Delete user verification info from database after Update
            await userVerificationCodeInfo.deleteOne({ _id: verification_id });

            req.flash(
                'success',
                'অভিনন্দন! পাসওয়ার্ড সফলভাবে নবায়ন করা হয়েছে।'
            );

            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
        next();
    }
};

// Delete Controllers

exports.deleteUserBook = async (req, res) => {
    const { book_id } = req.body;
    const book = await userBookInfo.findOne({ _id: book_id });
    const book_name = book.book_name;
    try {
        await userBookInfo.deleteOne({ _id: book_id });
        req.flash('success', `'${book_name}' বইটি সফলভাবে ডিলিট করা হয়েছে।`);
        res.redirect('/all-books');
    } catch (error) {
        console.log(error);
    }
};

exports.deleteUserStory = async (req, res) => {
    const { golpo_id } = req.body;
    const golpo = await userStoryInfo.findOne({ _id: golpo_id });
    const golpo_title = golpo.story_title;
    try {
        await userStoryInfo.deleteOne({ _id: golpo_id });
        req.flash('success', `'${golpo_title}' সফল্ভাবে ডিলিট করা হয়েছে!`);
        res.redirect('/approval-page');
    } catch (error) {
        console.log(error);
    }
};

exports.deleteUser = async (req, res) => {
    const { user_id } = req.body;
    const user = await userInfo.findOne({ _id: user_id });
    const userName = user.username;
    try {
        await userInfo.deleteOne({ _id: user_id });
        req.flash(
            'success',
            `User '${userName}' has been deleted successfully!`
        );
        res.redirect('/all-users');
    } catch (error) {
        console.log(error);
    }
};
