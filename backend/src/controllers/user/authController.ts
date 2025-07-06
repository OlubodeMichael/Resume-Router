import { prisma } from "../../../lib/prisma";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // You can make this more specific based on your User model
    }
  }
}

// JWT payload interface
interface JWTPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

const generateToken = (id: string, email: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id, user.email);

    res.status(201).json({ 
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");

    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id, user.email);

    res.status(200).json({ 
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const me = async (req: Request, res: Response) => {
    try {
        res.status(200).json({
            message: "User fetched successfully",
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name
            }
        });
    } catch (error) {
        console.error("User fetch error:", error);
    }
}