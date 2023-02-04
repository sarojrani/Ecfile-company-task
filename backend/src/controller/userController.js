const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
// const uploadFile = require("./awsController")
const jwt = require("jsonwebtoken")
const {isValid,isValidRequestBody,isValidPassword} = require("../validation/validator")
let saltRounds = 10

/*************Create User (1st Api)*******************************/
const userSignin = async (req, res) => {
    try {
        let data = req.body

        if (!isValidRequestBody(data))
            return res.status(400).send({
                status: false,
                message: "Request body can't be empty",
            })

        const { name, email, mobile, password} = data

        // const files = req.files
        // if (!isValidFiles(files))
        //     return res.status(400).send({
        //         status: false,
        //         Message: "Please provide user's profile picture",
        //     })


        if (!isValid(name)) return res.status(400).send({ status: false, Message: "Please provide your first name" })
        if (!name.trim().match(/^[a-zA-Z ]{2,30}$/))
            return res.status(400).send({
                status: false,
                message: "name should only contain alphabet",
            })
            if (!isValid(email)) return res.status(400).send({ status: false, Message: "Please provide your email address" })

            if (!isValid(mobile))
                return res.status(400).send({
                    status: false,
                    Message: "Please provide your phone number",
                })
    
            if (!isValid(password)) return res.status(400).send({ status: false, Message: "Please provide your password" })
            let emailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
        let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/

        if (!email.trim().match(emailRegex))
            return res.status(400).send({ status: false, message: "Please enter valid email" })

        if (!mobile.trim().match(phoneRegex))
            return res.status(400).send({ status: false, message: "Please enter valid pan -Indian phone number" })

        if (!isValidPassword(password))
            return res.status(400).send({
                status: false,
                message: "Please provide a valid password ,Password should be of 8 - 15 characters",
            })
            const isRegisterEmail = await userModel.findOne({ email: email })

            if (isRegisterEmail) return res.status(400).send({ status: false, message: "Email id already registered" })
    
            const isRegisterPhone = await userModel.findOne({ mobile: mobile })
    
            if (isRegisterPhone) return res.status(400).send({ status: false, message: "phone number is already registered" })
    
            /********************************************************************************/
    
            // const profilePicture = await uploadFile(files[0])
    
            const encryptPassword = await bcrypt.hash(password, saltRounds)
    
            const userData = {
                name: name,
                // profileImage: profilePicture,
                email: email,
                mobile: mobile,
                password: encryptPassword,
                
            }
            console.log(userData)
    
            const createUser = await userModel.create(userData)
    
            res.status(201).send({
                status: true,
                message: `User registered successfully`,
                data: createUser,
            })
        } catch (error) {
            res.status(500).send({ status: false, message: error.message })
        }
    }

    const loginUser = async function (req, res) {
        try {
            let { email, password } = req.body;
            if (!Object.keys(req.body).length) {
                return res.status(400).send({ status: false, message: "Body can not be empty!" })
            }
            if (!isValid(email)) return res.status(400).send({ status: false, msg: "email must be given" })
            // Email Validation
            if (!email.trim().match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+/))
                return res.status(400).send({ status: false, message: "Please enter valid email" })
    
            if (!isValid(password)) return res.status(400).send({ status: false, msg: "password must be given" })  // Passsword Validation
    
    
            if (!isValidPassword(password))
                return res.status(400).send({
                    status: false,
                    message: "Please provide a valid password ,Password should be of 8 - 15 characters",
                })
    
    
    
            let user = await userModel.findOne({ email: email })    // DB Call
    
            if (!user) { return res.status(404).send({ status: false, msg: "email  is invalid!" }) }
    
            const passwordMatch = await bcrypt.compare(password, user.password)
            if (!passwordMatch) {
                return res.status(400).send({ status: false, Message: "Incorrect password" })
            }
    
    
            let token = jwt.sign(                         // JWT Creation
                {
                    userId: user._id.toString(),
                    group: "twenty-four",                                      // Payload
                    project: "ProductsManagement",
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 48 * 60 * 60
                },
                "group24-project5"              // Secret Key 
            )
            return res.status(200).send({ status: true, message: "User login successfull", data: { userId: user._id, token: token } })
    
        }
        catch (err) {
            console.log("This is the error:", err.message)
            return res.status(500).send({ status: false, msg: err.message })
        }
    }
    module.exports = { userSignin, loginUser}