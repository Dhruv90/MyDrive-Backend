const nodemailer = require('nodemailer');

let transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dgdeveloper90@gmail.com',
    pass: 'developerpass90'
  }
})


exports.sendEmail = async (token, email, type) => {
  try{
    if(type == 'confirmUser') {
      let info = await transport.sendMail({
        from: 'dgdeveloper90@gmail.com', // sender address
        to: email,
        subject: "My Drive - Confirm your Account ✔", // Subject line
        text: "Click on the below link to confirm", // plain text body
        html: `<a href = 'https://mydrive-5969d.web.app/auth/confirm/${token}'>Confirm Link</a>`, // html body
      })
      console.log('Email Sent', info.messageId);
    }
    if(type === 'resetPass') {
      let info = await transport.sendMail({
        from: 'dgdeveloper90@gmail.com', // sender address
        to: email,
        subject: "My Drive - Reset Password", // Subject line
        text: "Click on the below link to reset your password", // plain text body
        html: `<a href = 'https://mydrive-5969d.web.app/auth/resetPass/${token}'>Reset Password</a>`, // html body
      })
      console.log('Email Sent', info.messageId);
    }
  } catch (err) {
    console.log(err);
  }
}