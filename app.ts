// @ts-ignore
const express = require("express");
require("dotenv").config();

const { PORT } = process.env;

const app = express();

app.use("/user", require("./routers/userRouter"));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});