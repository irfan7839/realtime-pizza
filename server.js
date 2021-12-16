require('dotenv').config()
const express=require('express')
const app=express()
const ejs=require('ejs')
const path=require('path')
const expressLayout=require('express-ejs-layouts')

// set template engine
app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')
const mongoose=require('mongoose');
const session=require('express-session');
const flash = require('express-flash');
const MongoDbStore=require('connect-mongo')(session)
const passport = require('passport')




// Database connection
const url='mongodb://localhost/pizza';
mongoose.connect(url,{useNewUrlParser:true, useCreateIndex:true , useUnifiedTopology:true, useFindAndModify:true});
const connection=mongoose.connection;
connection.once('open',()=>{
    console.log('database connected...')
}).catch(err=>{
    console.log('connection failed')
});


// session store
let mongoStore = new MongoDbStore({
    mongooseConnection:connection,
    collection:'sessions'
})
//session config
app.use(session({
    secret:process.env.COOKIE_SECRET,
    resave:false,
    store:mongoStore,
    saveUninitialized:false,
    cookie:{maxAge:1000 * 60 * 60 * 24 } // 24 hours
    
}))

//passport config
const passpotInit=require('./app/config/passport')
passpotInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash());

// global middleware
app.use((req,res,next)=>{
    res.locals.session = req.session
    res.locals.user=req.user
    //console.log(session)
    next()
})

//Assets
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}))
app.use(express.json())

require('./routes/web')(app)



const PORT = process.env.PORT|| 3000
app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`)
})