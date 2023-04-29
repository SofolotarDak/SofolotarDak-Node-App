// External Inputs
const express = require('express');
const router = express.Router();

// Internal Inputs
const {
    getIndex,
    getGolpo,
    getRegister,
    getLogin,
    postRegister,
    postLogin,
    getUserStory,
    getLogout,
    postUserStory,
    getTechnology,
    getApprovalPage,
    deleteUserStory,
    getApprovalError,
    deleteUser,
    postUserApprovedstory,
    getUserBook,
    postUserBook,
    getAllBooks,
    deleteUserBook,
    getUsers,
    postResetLoginPassword,
    getPasswordReset,
    postResetPasswordCode,
    postUserPasswordReset,
    getLikhoni,
} = require('../controllers/user.controller');
const { loginValidator } = require('../validator/user.login.validator');
const { registerValidator } = require('../validator/user.registar.validator');
const {
    isAuthenticated,
    isUnAuthenticated,
    adminIsAuthenticated,
} = require('../middleware/authentication.middleware');
const { userStoryValidator } = require('../validator/user-story.validator');
const upload = require('../utils/multer-upload.util');
const {
    userApproveStoryValidator,
} = require('../validator/user.storyApprove.validator');
const { userBookValidator } = require('../validator/user-book.validator');
const {
    passwordResetValidator,
} = require('../validator/user.password-reset.validator');

// Get Routes
router.get('/', getIndex);

router.get('/likhoni', getLikhoni);

router.get('/all-books', getAllBooks);

router.get('/register', isUnAuthenticated, getRegister);

router.get('/login', isUnAuthenticated, getLogin);

router.get('/password-reset', getPasswordReset);

router.get('/userstory', isAuthenticated, getUserStory);

router.get('/userbook', adminIsAuthenticated, getUserBook);

router.get('/approval-page', adminIsAuthenticated, getApprovalPage);

router.get('/approval-error', adminIsAuthenticated, getApprovalError);

router.get('/all-users', adminIsAuthenticated, getUsers);

router.get('/logout', getLogout);

// Post Routes
router.post('/register', registerValidator, postRegister);

router.post('/login', loginValidator, postLogin);

router.post(
    '/userstory',
    upload.single('storyimage'),
    userStoryValidator,
    postUserStory
);

router.post(
    '/userApprovedStory',
    upload.single('storyimage'),
    userApproveStoryValidator,
    postUserApprovedstory
);

router.post(
    '/userbook',
    upload.single('storyimage'),
    userBookValidator,
    postUserBook
);

router.post('/reset-password-verificationCode', postResetPasswordCode);

// Update Routes

router.post('/password-reset', passwordResetValidator, postUserPasswordReset);

// Delete Routes

router.post('/delete-book', deleteUserBook);

router.post('/delete-golpo', deleteUserStory);

router.post('/delete-user', deleteUser);

module.exports = router;
