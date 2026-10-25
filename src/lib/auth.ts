import { DatabaseSync } from "node:sqlite";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { username } from "better-auth/plugins";

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

const { runMigrations } = await getMigrations(auth.options, {
	throwOnUnsafe: false,
});
await runMigrations();

// Seed an example account on fresh/ephemeral databases (e.g. Vercel /tmp).
try {
	await auth.api.signUpEmail({
		body: {
			name: "Amateur Hacker",
			email: "amateurhacker2004@gmail.com",
			password: "st26042004",
			username: "amateur_hacker",
		},
	});
} catch {
	// Account already exists; ignore.
}
