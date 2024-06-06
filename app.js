const express = require("express");
const cors = require("cors");
const promptRoutes=require("./routes/promptRoutes");

const app = express();
//allow cross origin requests
app.use(cors("*"));
app.use(express.json({ limit: "50mb" }));

app.use("/api",promptRoutes)
module.exports = app;