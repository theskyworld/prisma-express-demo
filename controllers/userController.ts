const asyncHandler = require("express-async-handler");
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
const saltRound = Number(process.env.SALT_ROUND);

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

module.exports = {
  register,
};
