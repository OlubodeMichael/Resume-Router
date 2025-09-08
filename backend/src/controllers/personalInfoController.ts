import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { catchAsync } from '../../utils/catchAsync';
import { formatDate } from '../../utils/formateDate';

export const getPersonalInfo = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as any)?.id;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    const profile = await prisma.profile.findUnique({
        where: { userId },
    });

    if (!profile) {
        res.status(404).json({ message: 'Profile not found' });
        return;
    }

    const personalInfo = await prisma.personalInformation.findUnique({
        where: { profileId: profile.id },
    });

    // Get user data to include name and email
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
    });

    if (!personalInfo) {
        // Return user data even if personal info doesn't exist
        res.status(200).json({ 
            data: {
                fullName: user?.name || null,
                phone: null,
                location: null,
                linkedIn: null,
                portfolio: null,
                jobTitle: null,
                pronouns: null,
                email: user?.email || null
            }
        });
        return;
    }

    // Return personal info with user's email if personal info email is empty
    res.status(200).json({ 
        data: {
            ...personalInfo,
            fullName: personalInfo.fullName || user?.name || null,
            email: (personalInfo as any).email || user?.email || null
        }
    });
});

export const upsertPersonalInfo = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as any)?.id;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    
    const profile = await prisma.profile.findUnique({
        where: { userId },
    });
    
    if (!profile) {
        res.status(404).json({ message: 'Profile not found' });
        return;
    }

    // Get user data to use as fallback for name
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
    });

    const { fullName, phone, location, linkedIn, portfolio, jobTitle, pronouns, email } = req.body;

    // Use provided fullName or fallback to user's name
    const finalFullName = fullName || user?.name || null;
    // Use provided email or fallback to user's email
    const finalEmail = email || user?.email || null;

    const personalInfo = await prisma.personalInformation.upsert({
        where: { profileId: profile.id },
        update: { 
            fullName: finalFullName, 
            phone, 
            location, 
            linkedIn, 
            email: finalEmail,
            portfolio, 
            jobTitle, 
            pronouns 
        } as any,
        create: { 
            profileId: profile.id,
            fullName: finalFullName, 
            phone, 
            location, 
            linkedIn, 
            email: finalEmail,
            portfolio, 
            jobTitle, 
            pronouns 
        } as any,
    });

    res.status(200).json({ 
        message: 'Personal information updated successfully',
        data: personalInfo
    });
});

