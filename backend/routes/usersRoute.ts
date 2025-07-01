import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/', (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;

    const user = {
        firstName,
        lastName,
        email,
        password
    }

    res.status(201).json(user);
});

export default router;