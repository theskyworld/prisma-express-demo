const asyncHandler = require("express-async-handler");
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const saltRound = Number(process.env.SALT_ROUND);
const SECRET_KEY = process.env.SECRET_KEY;

// @desc    注册用户
// @route   POST /api/user/register
// @access  Public
const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  if (username && password && email) {
    try {
      // 判断用户是否已注册
      const existedUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!existedUser) {
        // 生成盐值
        bcrypt.genSalt(saltRound, (err: Error, salt: string) => {
          if (err) {
            res.status(400);
            throw new Error(err.message);
          }
          if (salt) {
            // hash密码
            bcrypt.hash(password, salt, async (err: Error, hash: string) => {
              if (err) {
                res.status(400);
                throw new Error(err.message);
              }
              if (hash) {
                try {
                  // 注册用户
                  const user = await prisma.user.create({
                    data: {
                      name: username,
                      email,
                      password: hash,
                    },
                  });
                  if (user) {
                    // 返回相应
                    res.status(200).json({
                      id: user.id,
                      name: user.name,
                      email: user.email,
                    });
                  } else {
                    res.status(400);
                    throw new Error("创建用户失败");
                  }
                } catch (err) {
                  res.status(400);
                  throw new Error((err as any).message);
                } finally {
                  await prisma.$disconnect();
                }
              }
            });
          }
        });
      } else {
        res.status(400);
        throw new Error("用户已注册");
      }
    } catch (err) {
      res.status(400);
      throw new Error((err as any).message);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(400);
    throw new Error("字段填写不完整");
  }
});

// @desc    登录
// @route   POST /api/user/login
// @access  Public
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const existedUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (existedUser) {
        bcrypt.compare(
          password,
          existedUser.password,
          (err: Error, result: boolean) => {
            if (err) {
              res.status(400);
              throw new Error(err.message);
            }
            if (result) {
              const token = jwt.sign(
                {
                  id: existedUser.id,
                },
                SECRET_KEY,
                {
                  expiresIn: "7d",
                }
              );
              res.status(200).json({
                token,
                user: {
                  ...existedUser,
                  password: undefined,
                },
              });
            } else {
              // TODO,bcrypt.compare内部的错误，errorHandler捕获不到
              res.status(400);
              throw new Error("邮箱地址或密码不正确");
            }
          }
        );
      } else {
        res.status(400);
        throw new Error("用户未注册");
      }
    } catch (err) {
      res.status(400);
      throw new Error((err as any).message);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(400);
    throw new Error("字段填写不完整");
  }
});

// @desc    获取用户信息
// @route   GET /api/user
// @access  Private
const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user || {};
  res.status(200).json(user);
});

module.exports = {
  register,
  login,
  getUser,
};
