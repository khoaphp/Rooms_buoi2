var express = require("express");
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public/"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

//multer
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()  + "-" + file.originalname)
    }
});  
var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file);
        if( file.mimetype=="image/bmp" || 
            file.mimetype=="image/png" ||
            file.mimetype=="image/jpg" ||
            file.mimetype=="image/jpeg"||
            file.mimetype=="image/gif" 
        ){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("file-0");




var roomPrefix = "Thanos2019-";

io.on("connection", function(socket){
    console.log("New connection " + socket.id);
    io.sockets.emit("server-gui-dsroom", socket.adapter.rooms);

    socket.on("client-gui-tenroom", function(data){
        socket.join(roomPrefix + data);
        io.sockets.emit("server-gui-dsroom", socket.adapter.rooms);
    });

    socket.on("client-gui-hoten", function(data){
        socket.HoTen = data;
    });

    socket.on("client-gui-Avatar", function(data){
        socket.Hinh = data;
        //console.log(data + " " + socket.Hinh);
    });

    socket.on("client-join-roommoi", function(data){
        socket.join(roomPrefix + data);
    });

    socket.on("client-send-message", function(data){
        io.sockets.in(roomPrefix + data.roomName).emit(
            "server-send-ms", 
            {
                "ms"    : data.message, 
                "hoten" : socket.HoTen, 
                "hinh"  : socket.Hinh
            }
        );
    });

});

app.get("/", function(req, res){
    res.render("trangchu");
});

app.post("/xuly",  function(req, res){

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          console.log("A Multer error occurred when uploading."); 
          res.json({"kq":0});
        } else if (err) {
          console.log("An unknown error occurred when uploading." + err);
          res.json({"kq":0});
        }else{
            console.log("Upload is okay");
            res.json({"kq":1, "file": req.file.filename});
        }

    });
});