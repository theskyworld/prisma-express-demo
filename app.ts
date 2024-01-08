// @ts-ignore
const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
require("dotenv").config();

const { PORT } = process.env;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", require("./routers/userRouter"));


app.use(errorHandler)
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
