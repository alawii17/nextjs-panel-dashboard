import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            message: 'Method not allowed'
        });
    }

    try {
        const { email, name, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'User with this email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return res.status(201).json({
            message: 'User registerd successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}