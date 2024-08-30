import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

const sendVerificationEmail = async ({
  username,
  email,
  token,
}: {
  username: string;
  email: string;
  token: string;
}) => {
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "pronak391@gmail.com",
    subject: "Please Verify Your Email Address",
    html: `<div>
              <div className="email-content">
                <p>Dear ${username},</p>
                <p>
                  Thank you for signing up to Whatsapp Server! To complete your registration, please verify your email address by clicking on the following button:
                </p>
                <a style="background-color:rgb(34,80,244);color:rgb(255,255,255);border-radius:0.5rem;padding-top:0.75rem;padding-bottom:0.75rem;padding-left:18px;padding-right:18px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;mso-padding-alt:0px;padding:12px 18px 12px 18px" target="_blank" href='${process.env.FRONTEND_URL}/verify-email/${token}'><span><!--[if mso]><i style="mso-font-width:450%;mso-text-raise:18" hidden>&#8202;&#8202;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Verify Your Email</span><span><!--[if mso]><i style="mso-font-width:450%" hidden>&#8202;&#8202;&#8203;</i><![endif]--></span></a>
                <p>
                  If you're unable to click the link, please copy below link and paste it into your web browser.
                </p>
                <p>
                  ${process.env.FRONTEND_URL}/verify-email/${token}
                </p>
                <p>Once you click the link, your email address will be verified, and you'll be able to access your account.</p>
                <p>Best regards,</p>
                <p>The Team.</p>
              </div>
          </div>`,
  });
};

export default sendVerificationEmail;
