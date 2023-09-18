var express = require('express')
var bodyParser = require('body-parser')
var app = express()
const multer  = require('multer')

var  http =require('http').Server(app)
var io=require('socket.io')(http)
var mongoose =require('mongoose')
var dburl='mongodb+srv://user:user@cluster0.5llirqc.mongodb.net/?retryWrites=true&w=majority'
 var Message=mongoose.model('Message',{
    name:String,
    message:String
 })

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))


app.get('/messages', (req, res) =>{
    Message.find({},(err,messages)=>{
        res.send(messages)
    })

    
})


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  const upload = multer({ storage: storage })

  
  
  app.post('/upload',upload.single("profile image"),(req,res)=>{
    console.log(req.body);
    console.log(req.file);
});
app.post('/stats', upload.single('uploaded_file'), function (req, res) {
   // req.file is the name of your file in the form above, here 'uploaded_file'
   // req.body will hold the text fields, if there were any 
   console.log(req.file, req.body)
});
 



app.post('/messages',(req, res) =>{

    var message=new Message(req.body)
    message.save((err)=>{
        if(err)
        sendStatus(500)
        
        io.emit('message',req.body)
        res.sendStatus(200)
    })
})
 io.on('connection',(socket)=>{
    console.log('a user connected')
 })
 mongoose.connect(dburl).then(()=>console.log('connected successfully')).catch((err)=>{console.error(err)})
var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})
