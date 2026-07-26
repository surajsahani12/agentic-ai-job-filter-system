import { Job, UserPreferences } from '@prisma/client';

function parseSalaryToLPA(salary: string | null): number | null {
    if (!salary) return null;

    const hasLPA = /LPA/i.test(salary);
    // extract numbers, stripping commas
    const numbers = salary.replace(/,/g, '').match(/\d+/g);
    if (!numbers) return null;

    const lower = Math.min(...numbers.map(Number));
    return hasLPA ? lower : lower / 100000;
}

function passesSalaryFilter(salary: string | null, minSalary: number | null): boolean {
    if (minSalary === null) return true;
    const lpa = parseSalaryToLPA(salary);
    return lpa === null || lpa >= minSalary;
}

// matcher.ts
export function matchJobs(jobs: Job[], allUserPreferences: UserPreferences[]) {
    const matches: { user_id: number; job_id: number }[] = [];

    for (const prefs of allUserPreferences) {
        const matchedJobs = jobs.filter(job =>
            job.location === prefs.location &&
            job.work_mode === prefs.work_mode &&
            job.job_type === prefs.employment_type &&
            passesSalaryFilter(job.salary_offered, prefs.min_salary)
        );
        matches.push(...matchedJobs.map(job => ({ user_id: prefs.user_id, job_id: job.id })));
    }

    return matches;
}

