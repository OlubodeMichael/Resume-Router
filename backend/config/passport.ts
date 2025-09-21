// src/config/passport.ts
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { prisma } from "../lib/prisma";
import sendEmail from "./email";
import * as jwt from "jsonwebtoken";
import passport from "passport";

interface Profile extends passport.Profile {
  email: string;
  displayName: string;
  picture: string;
}

interface UserAuth {
  id: string;
  token: string;
  email: string;
  name: string;
  picture: string;
}


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        "http://localhost:8000/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (request: any, accessToken: any, refreshToken: any, profile: Profile, done: any) => {
      try {
        console.log("Google OAuth callback - profile:", profile);
        
        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!user) {
          console.log("Creating new user for email:", profile.email);
          user = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.displayName,
              createdAt: new Date(),
            },
          });
        } else {
          console.log("Found existing user:", user.id);
          const emailSent = await sendEmail(user.email, "Welcome to our platform", "Welcome to our platform");
          if (!emailSent) {
            console.error("Failed to send welcome email");
          }
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name, picture: profile.picture },
          process.env.JWT_SECRET!,
          { expiresIn: "1d" }
        );

        const userAuth = { id: user.id, token, email: user.email, name: user.name, picture: profile.picture } as UserAuth;
        console.log("Returning user auth object:", userAuth);
        
        return done(null, userAuth);
      } catch (error) {
        console.error("Error in Google OAuth strategy:", error);
        return done(error as Error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

export default passport;