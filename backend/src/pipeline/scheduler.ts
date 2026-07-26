import cron from 'node-cron';
import { linkedInScraper } from './scraper/linkedin.scraper';
import { naukriScraper } from './scraper/naukri.scraper';
import { indeedScraper } from './scraper/indeed.scraper';
import { dedupJobs } from './dedup';
import { matchJobs } from './matcher';
import { findAllUserPreferences } from '../repositories/preferences.repository'; // adjust path
import { createUserJobMatches } from '../repositories/matcher.repository'; // adjust path
import { claudeQueue } from './queue/queue';
let isRunning = false;

export const startScheduler = () => {
    cron.schedule('*/15 * * * *', async () => {
        if (isRunning) {
            console.warn('Task is already running.');
            return;
        }

        isRunning = true;
        console.log('running a task every 15 minutes');
        try {
            await runPipeline();
        } catch (error) {
            console.error('Error occurred while running pipeline:', error);
        }
        finally {
            isRunning = false;
        }
    });
}



function groupMatchesByUser(
    matches: { user_id: number; job_id: number }[]
): Record<number, number[]> {
    const grouped: Record<number, number[]> = {};

    for (const match of matches) {
        if (!grouped[match.user_id]) {
            grouped[match.user_id] = [];
        }
        grouped[match.user_id].push(match.job_id);
    }

    return grouped;
}

const runPipeline = async () => {
    console.log('Running pipeline...');

    try {
        const scrapedJobs = [
            ...(await linkedInScraper.scrape()),
            ...(await naukriScraper.scrape()),
            ...(await indeedScraper.scrape()),
        ];

        const newJobs = await dedupJobs(scrapedJobs);

        const allPrefs = await findAllUserPreferences();
        const matches = matchJobs(newJobs, allPrefs);

        await createUserJobMatches(matches);

        const grouped = groupMatchesByUser(matches);

        for (const [userId, jobIds] of Object.entries(grouped)) {
            await claudeQueue.add('categorize-jobs', {
                user_id: Number(userId),
                job_ids: jobIds,
            });
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Pipeline execution failed: ${error.message}`);
        }
        throw new Error(`Pipeline execution failed: ${String(error)}`);
    } finally {
        console.log('Pipeline run completed.');
    }
};