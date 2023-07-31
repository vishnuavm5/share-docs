/*GOVINDA*/
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const DocumentModel = require("./models/Document");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
dotenv.config();

app.use(cors());

mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_room", async (data) => {
    socket.join(data);
    console.log(data);
    const doc = await findByIDorCreateDoc(data);
    socket.emit("load_document", doc);
  });
  socket.on("send_message", async (data) => {
    socket.to(data.documentId).emit("receive_message", data);
    await DocumentModel.findByIdAndUpdate(data.documentId, {
      data: data.value,
    });
  });
});

server.listen(3000, () => {
  console.log("SERVER IS RUNNING");
});

async function findByIDorCreateDoc(docid) {
  try {
    let isdocID = await DocumentModel.findById(docid);
    if (isdocID) {
      return isdocID;
    } else {
      await DocumentModel.create({ _id: docid, data: "" });
    }
  } catch (err) {
    console.log(err);
  }
}
