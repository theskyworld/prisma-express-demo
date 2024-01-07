const asyncHandler = require("express-async-handler");
import type { Request, Response } from "express";

const register = asyncHandler((req: Request, res: Response) => {
  res.send("user");
});


module.exports = {
  register
}
