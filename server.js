const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const port = 3000;

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var Message = mongoose.model("Message", { name: String, message: String });

let messages = [
  { name: "Joaquin", message: "Hello" },
  { name: "Peter", message: "Hello Bro" }
];

app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});

app.get("/messages/:user", (req, res) => {
    let user = req.params.user;
    Message.find({name: user}, (err, messages) => {
      res.send(messages);
    });
  });

app.post("/messages", async (req, res) => {
  try {
    var message = new Message(req.body);
    var savedMessage = await message.save();
    let censored = await Message.findOne({ message: "badword" });

    if (censored) {
      await Message.remove({ _id: censored.id });
    } else {
      io.emit("message", req.body);
    }
    res.sendStatus(200);
  } catch (error) {
      res.sendStatus(500);
  } finally{
      //logger.log('message post called');
  }
});

io.on("connection", socket => {
  console.log("a user connected");
});

mongoose.connect("mongodb://localhost:27017/chat", { autoIndex: false });

http.listen(port, () => {
  console.log(`App running on port: ${port}`);
});

module.exports = app;
