import { findUserById, updateUser, deleteUser, findUserByEmail } from "../repositories/user.repository";
import { findSkillsByUserId, replaceUserSkills } from "../repositories/skill.repository";
import { findPreferencesByUserId, upsertPreferences } from "../repositories/preferences.repository";
import { Prisma, User } from "@prisma/client";
import { NotFoundError, ConflictError } from "../types/errors.types";

type SafeUser = Omit<User, 'password_hash' | 'refresh_token'>;

export const getProfile = async (userId: number): Promise<SafeUser> => {
    const user = await findUserById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    const { password_hash, refresh_token, ...safeUser } = user
    return safeUser
}

export const updateProfile = async (userId: number, data: { full_name?: string; email?: string }): Promise<SafeUser> => {
    const user = await findUserById(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (data.email) {
        const isExistingUser = await findUserByEmail(data.email)
        if (isExistingUser && isExistingUser.id !== userId) {
            throw new ConflictError('Email already in use')
        }
    }

    const updatedUser = await updateUser(userId, data);
    const { password_hash, refresh_token, ...safeUser } = updatedUser
    return safeUser
}

export const getPreferences = async (userId: number) => {
    const preferences = await findPreferencesByUserId(userId);
    return preferences;
}

export const updatePreferences = async (userId: number, data: Prisma.UserPreferencesUpdateInput) => {
    const updatedPreferences = await upsertPreferences(userId, data);
    return updatedPreferences;
}

export const getSkills = async (userId: number) => {
    const skills = await findSkillsByUserId(userId);
    return skills;
}

export const updateSkills = async (userId: number, skillNames: string[]) => {
    await replaceUserSkills(userId, skillNames);
    const updatedSkills = await findSkillsByUserId(userId);
    return updatedSkills;
}

export const deleteAccount = async (userId: number): Promise<void> => {
    const user = await findUserById(userId)
    if (!user) throw new NotFoundError('User not found')
    await deleteUser(userId)
}