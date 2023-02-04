const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
         type: String, 
         required: true, 
         min: 4, max: 15 },
    mobile:{ 
        type: String, 
        required: true,
         unique: true, 
         trim: true },
    AadharNumber:{
        type:Number
    },
    PanNumber:{
        type:Number
    },
    
   
},{timestamps:true}
)
module.exports=mongoose.model("User",userSchema)