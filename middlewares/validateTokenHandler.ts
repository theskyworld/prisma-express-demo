import type { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function validateTokenHandler(req: Request, res: Response, next: NextFunction) {
  // 获取token
  let token;
  const authHeader: String = req.headers.authorization || "";
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    // 验证token
    jwt.verify(
      token,
      process.env.SECRET_KEY as string,
      async (err: Error, decoded: any) => {
        if (err) {
          res.status(401);
          throw new Error("用户未登录或登录过期");
        }
        try {
          const user = await prisma.user.findUnique({
            where: {
              id: decoded.id,
            },
            select: {
              id: true,
              name: true,
              email: true,
              writtenPosts: true,
              password: false,
            },
          });
          (req as any).user = user;
          next();
        } catch (err) {
          res.status(400);
          throw new Error((err as any).message);
        } finally {
          await prisma.$disconnect();
        }
      }
    );
  } else {
    res.status(401);
    throw new Error("用户未登录或登录过期");
  }
}

module.exports = validateTokenHandler;
