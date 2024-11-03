const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");

require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("views", "./templates");
app.set("view engine", "ejs");
app.use("/styles", express.static(path.join(__dirname, "templates", "styles")))
app.use("/js", express.static(path.join(__dirname, "templates", "js")))


app.use("/", require("./routes/api"));

app.listen(process.env.port || 800);