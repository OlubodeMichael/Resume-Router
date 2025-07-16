import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { catchAsync } from '../../utils/catchAsync';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT payload interface
interface JWTPayload {
  id: string;
  email: string;
}

const generateToken = (id: string, email: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Register
export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  // Basic email validation
  if (!email.includes('@')) {
    res.status(400).json({ message: 'Invalid email format' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters' });
    return;
  }

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    res.status(400).json({ message: 'Email already exists' });
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
    message: 'User created successfully',
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });
});

// Login
export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const token = generateToken(user.id, user.email);

  res.status(200).json({
    message: 'Login successful',
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });
});

// Protect Middleware
export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: 'Server configuration error' });
    return;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    res.status(401).json({ message: 'Not authorized, user not found' });
    return;
  }

  req.user = user;
  next();
});