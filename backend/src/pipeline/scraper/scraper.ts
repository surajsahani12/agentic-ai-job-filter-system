import { ScrapedJob } from "../../types/job.types";
export interface Scraper {
    scrape(): Promise<ScrapedJob[]>;
}