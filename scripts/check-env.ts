import { config } from 'dotenv';
config();

console.log("Checking DATABASE_URL...");
const url = process.env.DATABASE_URL;
if (!url) {
    console.error("DATABASE_URL is undefined");
} else {
    console.log(`DATABASE_URL length: ${url.length}`);
    console.log(`Starts with postgresql://: ${url.startsWith('postgresql://')}`);
    console.log(`First 20 chars: ${url.substring(0, 20)}`);
    // Check for quotes
    if (url.startsWith('"') || url.startsWith("'")) {
        console.error("DATABASE_URL starts with a quote!");
    }
}
