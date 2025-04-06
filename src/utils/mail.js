import Mailgen from 'mailgen'
import {createTransport} from 'nodemailer'
import dotenv from "dotenv"
dotenv.config();


const sendMail = async (options) => {
    const mailGenerator = new Mailgen({ 
        theme: 'default',
        product: {
            name: 'Task Manager',
            link: 'https://mailgen.js/'
        }
    });

    const emailHTML = mailGenerator.generate(options.mailGenContent);
    const emailText = mailGenerator.generatePlaintext(options.mailGenContent);

    const transporter = createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false, 
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
    })

    const mail = {
        from: 'Maddison.Beer@baddie.com', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: emailText, // plain text body
        html: emailHTML, // html body
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email failed", error);
    }
}

const emailVerificationContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to App! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with our App, please click here:',
                button: {
                    color: '#22BC66', 
                    text: 'Verify your Email',
                    link: verificationUrl,
                }
            },
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    };
}

const forgotPasswordContent = (username, resetPasswordUrl) => {
    return {
        body: {
            name: username,
            intro: 'We got a request to change your password.',
            action: {
                instructions: 'To change the password click the button given below',
                button: {
                    color: '##ff0000', 
                    text: 'reset password',
                    link: resetPasswordUrl,
                }
            },
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    };
}

// sendMail({
//     eamil: user.email,
//     subject: 'hfyegfyeg ',
//     mailGenContent: emailVerificationContent(username, ``)
// })