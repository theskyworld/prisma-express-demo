// @ts-ignore
const express = require("express");
const router = express.Router();
const validateTokenHandler = require("../middlewares/validateTokenHandler");
const {
  register,
  login,
  getUser,
  updateUser,
} = require("../controllers/userController");
import type { Request, Response, NextFunction } from "express";


router.post("/register", register);
router.post("/login", login);
router.get("/", validateTokenHandler, getUser);
router.put("/", validateTokenHandler,updateUser);

module.exports = router;
