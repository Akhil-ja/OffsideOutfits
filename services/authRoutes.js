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
                      
                        res.redirect("/register");
                    } else {
                       
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
       res.redirect("/admin/login");
      } else {
       
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
           
             res.locals.currentUser = null;
            next();
        } else {
            try {
            let user = await User.findById(decodedToken.id);
            res.locals.currentUser = user;
            next();
            } catch (userError) {
          
               res.locals.currentUser = null;
            next();
            }
        }
        });
    } else {
         res.locals.currentUser = null;
       
        next();
    }
    };
    

    
    const isBlocked = async (req, res, next) => {
         const token = req.cookies.jwt;
    
        jwt.verify(token, "secret", async (err, decodedToken) => {
          if (err) {
           
            next();
          } else {
            try {
              let user = await User.findById(decodedToken.id);
             if(user.is_active==='0'){
                 res.cookie("jwt", "", { maxAge: 1 });
                 res.redirect("/register");
             }
              next();
            } catch (userError) {
           
              res.locals.currentUser = null;
              next();
            }
          }
        });
      } 


   

    



module.exports = {
  createToken,
  maxAge,
  isLogin,
  isAdminLogin,
  checkUser,
  isBlocked,
 
};
