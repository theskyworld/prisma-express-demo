const express = require("express");
const router = (module.exports = express.Router());
const { register } = require("../controllers/userController");

import type { Request, Response } from "express";

router.get("/", register);
