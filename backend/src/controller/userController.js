const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer=require('nodemailer')
const uploadFile = require("./awsController");
const jwt = require("jsonwebtoken");
const {
  isValid,
  isValidObjectId,
  isValidRequestBody,
  isValidPassword,
  isValidFiles
} = require("../validation/validator");
let saltRounds = 10;

let { AgeFromDateString } = require("age-calculator");

/*************Create User (1st Api)*******************************/
const userSignin = async (req, res) => {
  try {
    let data = req.body;

    if (!isValidRequestBody(data))
      return res.status(400).send({
        status: false,
        message: "Request body can't be empty",
      });

    const { name, email, mobile, password, AdharNumber, PanNumber, DOB } = data;

    const files = req.files;
    if (!isValidFiles(files))
      return res.status(400).send({
        status: false,
        Message: "Please provide user's profile picture",
      });

    if (!isValid(name))
      return res
        .status(400)
        .send({ status: false, Message: "Please provide your first name" });
    if (!name.trim().match(/^[a-zA-Z ]{2,30}$/))
      return res.status(400).send({
        status: false,
        message: "name should only contain alphabet",
      });
    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, Message: "Please provide your email address" });

    if (!isValid(mobile))
      return res.status(400).send({
        status: false,
        Message: "Please provide your phone number",
      });
      let passwardregex=/(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/




    if (!isValid(password))
      return res
        .status(400)
        .send({ status: false, Message: "Please provide your password" });
        if(!passwardregex.test(password)){
          return res.status(400).send({status:false,msg:"password should be taken one capital letter,one sppecial char,one small letter"})
        }
    let emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;

    if (!email.trim().match(emailRegex))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid email" });

    if (!mobile.trim().match(phoneRegex))
      return res.status(400).send({
        status: false,
        message: "Please enter valid pan -Indian phone number",
      });

    if (!isValidPassword(password))
      return res.status(400).send({
        status: false,
        message:
          "Please provide a valid password ,Password should be of 8 - 15 characters",
      });
    const isRegisterEmail = await userModel.findOne({ email: email });

    if (isRegisterEmail)
      return res
        .status(400)
        .send({ status: false, message: "Email id already registered" });

    const isRegisterPhone = await userModel.findOne({ mobile: mobile });

    if (isRegisterPhone)
      return res
        .status(400)
        .send({ status: false, message: "phone number is already registered" });

    

    const profilePicture = await uploadFile(files[0])

    const encryptPassword = await bcrypt.hash(password, saltRounds);

    if (!isValid(AdharNumber)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide your adhar number" });
    }
    let adharReg = /^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$/;

    if (!adharReg.test(AdharNumber)) {
      return res.status(400).send({
        status: false,
        message: `${AdharNumber} is not a valid adhar number or provide adhar number in '0000 0000 0000' formate`,
      });
    }

    const isRegisterAdhar = await userModel.findOne({
      AdharNumber: AdharNumber,
    });

    if (isRegisterAdhar)
      return res
        .status(400)
        .send({ status: false, message: "Adhar number is already registered" });

    if (!isValid(PanNumber)) {
      return res
        .status(400)
        .send({ status: false, message: "please provide pan number" });
    }
    let PAN=PanNumber.toUpperCase()
    let panReg = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panReg.test(PAN)) {
      return res.status(400).send({
        status: false,
        message: "please provide a valid pan card number",
      });
    }
    const isRegisterPanNumber = await userModel.findOne({
      PanNumber: PAN,
    });

    if (isRegisterPanNumber)
      return res
        .status(400)
        .send({ status: false, message: "PAN number is already registered" });

    if (DOB == undefined) {
      return res
        .status(400)
        .send({ statua: false, message: "please provide DOB" });
    }
    let dobReg = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
    if (!dobReg.test(DOB)) {
      return res.status(400).send({
        status: false,
        message: "please provide date of birth in 'yyyy-mm-dd' formate",
      });
    }
    let age = new AgeFromDateString(DOB).age;

    const userData = {
      name: name,
      email: email,
      mobile: mobile,
      password: encryptPassword,
      profileImage:profilePicture,
      AdharNumber: AdharNumber,
      PanNumber: PAN,
      DOB: DOB,
      Age: age,
    };
   

    const createUser = await userModel.create(userData);

    res.status(201).send({
      status: true,
      message: `User registered successfully`,
      data: createUser,
    });
 
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//------------login------------------/////
const loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;
    if (!Object.keys(req.body).length) {
      return res
        .status(400)
        .send({ status: false, message: "Body can not be empty!" });
    }
    if (!isValid(email))
      return res
        .status(400)
        .send({ status: false, msg: "email must be given" });
    // Email Validation
    if (!email.trim().match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+/))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid email" });

    if (!isValid(password))
      return res
        .status(400)
        .send({ status: false, msg: "password must be given" }); // Passsword Validation

    if (!isValidPassword(password))
      return res.status(400).send({
        status: false,
        message:
          "Please provide a valid password ,Password should be of 8 - 15 characters",
      });

    let user = await userModel.findOne({ email: email }); // DB Call

    if (!user) {
      return res.status(404).send({ status: false, msg: "email  is invalid!" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(400)
        .send({ status: false, Message: "Incorrect password" });
    }

    let token = jwt.sign(
      // JWT Creation
      {
        userId: user._id.toString(),
        group: "twenty-four", // Payload
        project: "ProductsManagement",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 48 * 60 * 60,
      },
      "group24-project5" // Secret Key
    );
    return res.status(200).send({
      status: true,
      message: "User login successfull",
      data: { userId: user._id, token: token },
    });
  } catch (err) {
    console.log("This is the error:", err.message);
    return res.status(500).send({ status: false, msg: err.message });
  }
};

////////-------for sending link to mail-----------////////
const sendVerifyEmail=async(req,res)=>{
  try{
    var name=req.body.name;
    var email=req.body.email;
    let userId = req.params.userId
    if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "Please enter a valid user Id" })
    }
const transporter=nodemailer.createTransport({
  host:'smtp.gmail.com',
  port:587,
  requireTLS:true,
  auth:{
    //use author emailid as user here i put demoemailid
    user:"mailto:john@example.com",
    //use password which you can give app password(follow-go to google account-signin-select security-goto app password-generate-get-password) i used as demo
    pass:'ixvaixkthpwnqajn',
  }
})

const mailOptions={
  from:"sarojkumarirani345@gmail.com",
  to:email,
  subject:'for email otp verification',
  html:'<p> Hii '+`${name}`+',please click here to <a href="http://localhost:3000/verify">varify </a> your '+`${email}`+''
}
transporter.sendMail(mailOptions,function(err,info){
  if(err){
    return res.status(400).send({status:false,msg:err.message})
  }
  else{
    return res.status(200).send({status:true,msg:"email-varified"})
  }
})
const check=await userModel.findById({ _id: userId })
if(!check){
  return res.status(400).send({status:false,msg:"userid is not exist"})
}
else{
return res.status(200).send({status:true,msg:"email-varified"})
}
}
catch(err){
  return res.status(400).send({status:false,msg:err.message})
}
}



  

module.exports = { userSignin,loginUser,sendVerifyEmail};
