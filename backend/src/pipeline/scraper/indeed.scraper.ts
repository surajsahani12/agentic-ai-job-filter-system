import { Scraper } from "./scraper";
import { ScrapedJob } from "../../types/job.types";

export const indeedScraper: Scraper = {
    scrape: async () => {
        console.log("Scraping Indeed jobs...");
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const scrapedJobs: ScrapedJob[] = [
                    {
                        external_job_id: "12345",
                        source: "Indeed",
                        title: "Software Engineer",
                        company: "Tech Company",
                        job_description: "We are looking for a Software Engineer...",
                        job_type: "PERMANENT",
                        work_mode: "REMOTE",
                        salary_offered: "$100,000 - $120,000",
                        location: "San Francisco, CA",
                        posted_at: new Date(),

                        scraped_at: new Date(),
                        job_link: "https://www.indeed.com/jobs/view/12345"
                    },
                    {
                        external_job_id: "67890",
                        source: "Indeed",
                        title: "Product Manager",
                        company: "Tech Company",
                        job_description: "We are looking for a Product Manager...",
                        job_type: "PERMANENT",
                        work_mode: "REMOTE",
                        salary_offered: "$120,000 - $140,000",
                        location: "San Francisco, CA",
                        posted_at: new Date(),

                        scraped_at: new Date(),
                        job_link: "https://www.indeed.com/jobs/view/67890"
                    }
                ];
                resolve(scrapedJobs);
            }, 1000);
        });

    },
};