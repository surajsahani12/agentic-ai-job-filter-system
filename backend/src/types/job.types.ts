
type JobType =
    "PERMANENT" | "CONTRACT";

type WorkMode =
    "REMOTE" | "HYBRID" | "ONSITE";


type JobSource =
    "Naukri" | "LinkedIn" | "Indeed";


export type ScrapedJob = {
    external_job_id: string;
    source: JobSource;

    title: string;
    company: string;
    job_description: string;

    job_type: JobType | null;
    work_mode: WorkMode | null;

    salary_offered: string | null;
    location: string | null;

    posted_at: Date | null;
    scraped_at: Date;

    job_link: string;
};