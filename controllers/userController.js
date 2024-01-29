const User= require("../models/userModel")

const loadlogin=async(req,res)=>{
    try {
        res.render("loginRegister");
    } catch (error) {
        console.log(error.message);
    }
}

const insertUser=async(req,res)=>{
    try {
      const user = new User({
        name: req.body.fullname,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        is_admin: 0,
      });

      const userData = await user.save();
      if (userData) {
        res.render("loginRegister");
        console.log("registration Success!");
      } else console.log("Registratin not success");
    } catch (error) {
      console.log(error.message);
    }
}

module.exports = {
  loadlogin,
  insertUser,
};