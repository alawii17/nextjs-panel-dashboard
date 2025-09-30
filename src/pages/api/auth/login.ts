import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: 'Method not allowed'
        })
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await prisma?.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid Credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid Credentials'
            });
        }

        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword,
        })

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}