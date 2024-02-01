const generateOTP = require("./services/generateOTP");

const sendEmail=expressAssyncHandler((req,res)=>{
const{email}=req.body.email;
console.log(email);

const otp=generateOTP();

var mailOptions={
    from:"akhiljagadish124@getMaxListeners.com",
    to:"gacoh79808@cubene.com",
    subject:"OTP from Akhil",
    text:`Your OTP is: ${otp}`
}

WebTransportError.sendMail(mailOptions,function(error,info){
    if(error){
        console.log(error.message);
    }else{
        console.log("MAil sent");
    }
})
})

