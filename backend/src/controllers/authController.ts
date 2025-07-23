// src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import passport from "../../config/passport";

// Extend Express Request interface


// JWT payload interface
interface JWTPayload {
  id: string;
  email: string;
}

const generateToken = (id: string, email: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register
export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  if (!email.includes("@")) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return;
  }

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    res.status(400).json({ message: "Email already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      createdAt: new Date(),
    },
  });

  const token = generateToken(user.id, user.email);

  res.status(201).json({
    message: "User created successfully",
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });
});

// Login
export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = generateToken(user.id, user.email);

  res.status(200).json({
    message: "Login successful",
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });
});

// Protect Middleware
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    token = req.cookies.authToken;
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: "Server configuration error" });
    return;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user) {
    res.status(401).json({ message: "Not authorized, user not found" });
    return;
  }

  req.user = user; // This sets req.user as a User object
  next();
});

// Google Authentication
export const googleAuth = (req: Request, res: Response) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
};

export const googleCallback = (req: Request, res: Response) => {
  passport.authenticate("google", { failureRedirect: "/api/auth/failed" })(
    req,
    res,
    () => {
      console.log("Google callback - req.user:", req.user); // Debug log
      
      if (!req.user) {
        console.error("No user found in request");
        return res.redirect("/api/auth/failed");
      }

      const userAuth = req.user as any;
      if (!userAuth.token) {
        console.error("No token found in user object:", userAuth);
        return res.redirect("/api/auth/failed");
      }

      console.log("Setting cookie with token:", userAuth.token.substring(0, 20) + "...");
      
      // Set the cookie first
      res.cookie("authToken", userAuth.token, {
        httpOnly: true,
        secure:  false, // Set to false for development (localhost)
        sameSite: "lax", // Allow cross-origin cookies
        maxAge: 3600000, // 1 hour
        domain: "localhost" // Ensure cookie is available on both ports
      });
      
      
      res.redirect(`http://localhost:3000/dashboard`);
    }
  );
};

export const verifyAuth = async (req: Request, res: Response) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; picture: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      console.log("User not found in database");
      throw new Error("User not found");
    }
    
    console.log("User verified successfully:", user.email);
    res.json({ user: { id: user.id, email: user.email, name: user.name, picture: decoded.picture } });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authFailed = (req: Request, res: Response) => {
  res.status(401).json({ message: "Authentication failed" });
};