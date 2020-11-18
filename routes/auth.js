const express = require("express");
const authController = require("../controllers/auth");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a Valid Email"),
    body("password", "Password should have minimum 5 characters and should only have alphabets and numbers")
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Enter a Valid Email"),
    body("password", "Password should have minimum 5 characters and should only have alphabets and numbers")
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postSignup
);

router.post('/confirm', authController.confirmUser)

router.post('/forgotPass', authController.forgotPass)

router.post('/resetPass',  [
  body("email").isEmail().withMessage("Enter a Valid Email"),
  body("pass", "Enter a valid Password")
    .isLength({ min: 5 })
    .isAlphanumeric(),
], authController.resetPass)

router.post('/googleLogin', authController.googleLogin)

router.post('/refreshToken', authController.refreshToken)


module.exports = router;
