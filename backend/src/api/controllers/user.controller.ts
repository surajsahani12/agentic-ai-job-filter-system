import { Request, Response, NextFunction } from 'express'
import * as userService from '../../services/user.service'
import { AuthenticatedRequest } from "../../types/express.types";

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user.user_id;
        const profile = await userService.getProfile(userId);
        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user.user_id;
        const updatedProfile = await userService.updateProfile(userId, { full_name: req.body.full_name, email: req.body.email });
        res.status(200).json({ message: "Profile updated successfully", user: updatedProfile });
    } catch (error) {
        next(error);
    }
}

export const getPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user.user_id;
        const preferences = await userService.getPreferences(userId);
        res.status(200).json({ message: "Preferences retrieved successfully", preferences });
    } catch (error) {
        next(error);
    }
}

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user.user_id;
        const updatedPreferences = await userService.updatePreferences(userId, req.body);
        res.status(200).json({ message: "Preferences updated successfully", preferences: updatedPreferences });
    } catch (error) {
        next(error);
    }
}

export const getSkills = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user.user_id;
        const skills = await userService.getSkills(userId);
        res.status(200).json({ message: "Skills retrieved successfully", skills });
    } catch (error) {
        next(error);
    }
}

export const updateSkills = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user.user_id;
        const updatedSkills = await userService.updateSkills(userId, req.body.skills);
        res.status(200).json({ message: "Skills updated successfully", skills: updatedSkills });
    } catch (error) {
        next(error);
    }
}

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthenticatedRequest).user.user_id;
        await userService.deleteAccount(userId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}