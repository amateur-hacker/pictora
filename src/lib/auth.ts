import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { DatabaseSync } from "node:sqlite";
import { getMigrations } from "better-auth/db/migration";

const dbPath =
	process.env.DATABASE_PATH ??
	(process.env.VERCEL ? "/tmp/database.sqlite" : "database.sqlite");

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
	secret: process.env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
	},
	plugins: [username()],
	database: new DatabaseSync(dbPath),
});

// Ensure tables exist (auto-migrate) for ephemeral/serverless databases.
const { runMigrations } = await getMigrations(auth.options, {
	throwOnUnsafe: false,
});
await runMigrations();
