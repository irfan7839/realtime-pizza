const User =require('../../models/user')
const bcrypt = require('bcrypt');
const passport = require('passport');
function authController (){
    return {
        login(req , res) { 
            res.render('auth/login')
        },
        postLogin(req,res,next){
            passport.authenticate('local',(err,user,info)=>{
                if(err){
                    req.flash('error',info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error',info.message)
                    return res.redirect('/login')
                }
                req.logIn(user,(err)=>{
                    if(err){
                        req.flash('error',info.message)
                        return next(err)
                }
                return res.redirect('/')

                })
                })(req,res,next)
            },
        
        register(req , res,next) { 
            res.render('auth/register')
        },
       async postRegister(req,res){
            const {name , email,password} = req.body
            // validate request 
            if(!name || !email || !password){
                req.flash('error','All field required')
                return res.redirect('/register')
            }
            User.exists({email:email},(err,result)=>{
                if(result){
                    req.flash('error','Email already exist')
                    return res.redirect('/register')
                }
            })
            // Hash password (bcrypt)
            const hashedPassword = await bcrypt.hash(password,10)
            // Create a user
            const user=new User({
                name:name,
                email:email,
                password:hashedPassword
            })
            user.save().then((user)=>{
                // Login
                return res.redirect('/')
            }).catch(err=>{
                req.flash('error','Something went wrong')
                return res.redirect('/register')
            })
            
        },
        logout(req,res){
            req.logout()
            return res.redirect('/login')
        }
    
    }
}
module.exports=authController;