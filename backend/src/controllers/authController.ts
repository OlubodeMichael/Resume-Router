// src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../utils/appError";
import sendEmail from "../../config/email";
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
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
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

export const logout = (req: Request, res: Response) => {
  res.clearCookie("authToken");
  res.status(200).json({ message: "Logged out successfully" });
};

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return next(new AppError('A valid email is required', 400));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetCode,
      resetCodeExpires,
    },
  });

  try {
    const emailSent = await sendEmail(
      email,
      'Password Reset Code',
      `Your password reset code is: ${resetCode}. It will expire in 10 minutes.`
    );
    if (!emailSent) {
      return next(new AppError('Failed to send reset code. Please try again later.', 500));
    }

    res.status(200).json({
      message: 'Password reset code sent to your email. It will expire in 10 minutes.',
    });
  } catch (error) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode: null, resetCodeExpires: null },
    });
    return next(new AppError('Failed to send reset code. Please try again later.', 500));
  }
});



export const verifyResetCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, resetCode } = req.body;

  // Validate input
  if (!email || !resetCode) {
    return next(new AppError('Email and reset code are required', 400));
  }
  if (typeof resetCode !== 'string' || !/^\d{6}$/.test(resetCode)) {
    return next(new AppError('Invalid reset code format', 400));
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }

  // Verify reset code and expiration
  if (!user.resetCode || user.resetCode !== resetCode || !user.resetCodeExpires || user.resetCodeExpires < new Date()) {
    return next(new AppError('Invalid or expired reset code', 400));
  }

  // Generate a temporary resetToken (not stored in DB)
  const resetToken = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET!, { expiresIn: '10m' });

  res.status(200).json({
    message: 'Reset code verified successfully. Please set your new password.',
    resetToken, // Returned to the client to use in resetPassword
  });
});


export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { resetToken, newPassword } = req.body;

  // Validate input
  if (!resetToken || !newPassword) {
    return next(new AppError('Reset token and new password are required', 400));
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return next(new AppError('New password must be at least 8 characters long', 400));
  }

  // Verify resetToken
  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET!) as { userId: string, email: string };
  } catch (error) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || user.email !== decoded.email) {
    return next(new AppError('Invalid user for reset token', 400));
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear reset fields
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetCode: null,
      resetCodeExpires: null,
    },
  });

  res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
});



export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any)?.id; // Assuming user is authenticated via middleware
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Current password and new password are required', 400));
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return next(new AppError('New password must be at least 8 characters long', 400));
  }
  if (currentPassword === newPassword) {
    return next(new AppError('New password must be different from the current password', 400));
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.password && !(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      updatedAt: new Date(),
    },
  });

  res.status(200).json({ message: 'Password updated successfully.' });
});