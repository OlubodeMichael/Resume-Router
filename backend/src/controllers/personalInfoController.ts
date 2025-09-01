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
        where: { id: profile.id },
    });

    if (!personalInfo) {
        res.status(404).json({ message: 'Personal information not found' });
        return;
    }

    res.status(200).json({ data: personalInfo });
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

    const { fullName, phone, location, linkedIn, portfolio, jobTitle, pronouns } = req.body;

    const personalInfo = await prisma.personalInformation.upsert({
        where: { profileId: profile.id },
        update: { fullName, phone, location, linkedIn, portfolio, jobTitle, pronouns },
        create: { 
            profileId: profile.id,
            fullName, 
            phone, 
            location, 
            linkedIn, 
            portfolio, 
            jobTitle, 
            pronouns 
        },
    });

    res.status(200).json({ 
        message: 'Personal information updated successfully',
        data: personalInfo 
    });
});

