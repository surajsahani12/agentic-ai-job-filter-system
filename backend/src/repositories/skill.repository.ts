import prisma from '../config/db'

export const findSkillsByUserId = async (id: number) => {
    const userSkills = await prisma.userSkill.findMany({
        where: { user_id: id },
        include: { skill: true }
    })

    return userSkills.map(us => us.skill.name)
}

export const replaceUserSkills = async (id: number, skillNames: string[]) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Upsert all skills into master table, collect their ids
        const skillIds: number[] = []
        for (const name of skillNames) {
            const skill = await tx.skill.upsert({
                where: { name },
                update: {},
                create: { name }
            })
            skillIds.push(skill.id)
        }

        // 2. Delete existing user_skills for this user
        await tx.userSkill.deleteMany({
            where: { user_id: id }
        })

        // 3. Create new user_skills
        await tx.userSkill.createMany({
            data: skillIds.map(skill_id => ({
                user_id: id,
                skill_id
            }))
        })
    })
}