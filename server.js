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
const Emitter=require('events')





// Database connection

mongoose.connect(process.env.MONGO_CONNECTION_URL,{useNewUrlParser:true, useCreateIndex:true , useUnifiedTopology:true, useFindAndModify:true});
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
// Event emiiter
const eventEmitter = new Emitter ()
app.set('eventEmitter',eventEmitter)
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

// Heroku
if(process.env.NODE_ENV ==='production'){
    app.use(express.static("public"));
}

require('./routes/web')(app)
app.use((req,res)=>{
    res.status(404).send('<h1>404, Page not found</h1>')
})



const PORT = process.env.PORT|| 3000
const server = app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`)
})

// Socket
 
const io =require('socket.io')(server)
io.on('connection', (socket)=>{
    // Join 
   // console.log(socket.id)
    socket.on('join', (orderId)=>{
       // console.log(orderId)
        socket.join(orderId)
    })

})

eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced', (data)=>{
    io.to('adminRoom').emit('orderPlaced',data)
})