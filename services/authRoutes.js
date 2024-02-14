const jwt = require("jsonwebtoken");
const { Long } = require("mongodb");
const maxAge = 3 * 24 * 60 * 60;
const User = require("../models/userModel");


const createToken = (id) => {
  return jwt.sign({ id }, "secret", {
    expiresIn: maxAge,
  });
};


const isLogin = (req, res, next) => {

               const token = req.cookies.jwt;
                  if (token) {
                    jwt.verify(token, "secret", (err, decodedToken) => {
                    if (err) {
                        console.log(err.message);
                        res.redirect("/register");
                    } else {
                        console.log(decodedToken);
                        next();
                    }
                    });
                } else {
                    res.redirect("/register");
                }
};




const isAdminLogin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "secret", (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/admin/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/admin/login");
  }
};


    const checkUser = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, "secret", async (err, decodedToken) => {
        if (err) {
            console.log("Error:", err.message);
             res.locals.currentUser = null;
            next();
        } else {
            try {
            let user = await User.findById(decodedToken.id);
            console.log("User:", user.name);
            res.locals.currentUser = user;
            next();
            } catch (userError) {
            console.log("User Error:", userError.message);
               res.locals.currentUser = null;
            next();
            }
        }
        });
    } else {
         res.locals.currentUser = null;
        console.log("No token found");
        next();
    }
    };




module.exports = {
  createToken,
  maxAge,
  isLogin,
  isAdminLogin,
  checkUser,
};
