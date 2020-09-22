const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require('../utilities/sendemail').sendEmail

exports.postSignup = async (req, res, next) => {
  try {
    console.log('register running');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Invalid Entries");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      console.log('user exists')
      res.status(400).json({ message: "Email already exists" });
    }
    else if (password !== confirmPassword) {
      const err = new Error("Passwords Dont Match");
      err.statusCode = 400;
      throw err;
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email: email,
        password: hashedPassword,
        confirmed: false
      });
      await user.save();
      const token = jwt.sign(
        {
          email: email,
        },
        "email-secret",
        { expiresIn: "24h" }
      );
      sendEmail(token, email, 'confirmUser');
      res.status(201).json({ message: "Account Created, please verify your account on email" });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Invalid Entries");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      const err = new Error("Email does not exists, please register first");
      err.statusCode = 404;
      throw err;
    }
    const isEqual = await bcrypt.compare(password, existingUser.password);
    if (!isEqual) {
      const err = new Error("Incorrect Password");
      err.statusCode = 400;
      throw err;
    }
    if(!existingUser.confirmed){
      const err = new Error("Account not verified, please verify your account via email");
      err.statusCode = 400;
      throw err;
    }
    const token = jwt.sign(
      {
        email: existingUser.email,
        userId: existingUser._id.toString(),
      },
      "secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({message: 'User Logged In', token:token})
  } catch (err) {
    // console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.confirmUser = async (req, res, next) => {
  const token = req.body.token;
  console.log(req.body.token);
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'email-secret');
    if(!decodedToken) {
      const error = new Error('An Error Occured');
      error.statusCode = 401;
      throw error;
    }
    const email = decodedToken.email;
    const user = await User.findOne({email: email})
    if (!user) {
      const err = new Error("Email does not exists, please register first");
      err.statusCode = 404;
      throw err;
    }
    user.confirmed = true;
    await user.save();
    res.status(200).json({message: true});
  } catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.forgotPass = async(req, res, next) => {
  try{
    const email = req.body.email.toLowerCase();
    const user = await User.findOne({email: email});
    if(user){
      const token = jwt.sign(
        {
          email: email,
        },
        "email-secret",
        { expiresIn: "24h" }
      );
      sendEmail(token, email, 'resetPass');
      res.status(200).json({message: 'Email Verified'});
    }
  } catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.resetPass = async(req, res, next) => {
  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Invalid Entries");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const token = req.body.key
    const email = req.body.email.toLowerCase();
    const password = req.body.pass;
    const confirmPassword = req.body.confirmPass;
    
    let decodedToken = jwt.verify(token, 'email-secret');

    if(!decodedToken) {
      const error = new Error('An Error Occured');
      error.statusCode = 401;
      throw error;
    }

    const decodedEmail = decodedToken.email;
    
    if(decodedEmail !== email){
      const error = new Error('Email doesnt match');
      error.statusCode = 401;
      throw error;
    }

    if (password !== confirmPassword) {
      const err = new Error("Passwords Dont Match");
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({email: email});
    
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();
    console.log('Password Changed Successfully');
    res.status(200).json({message: 'Password Changed Successfully'});
    
  } catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
