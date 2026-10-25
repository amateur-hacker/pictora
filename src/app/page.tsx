import { ImageIcon, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
			<header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
				<div className="flex items-center gap-2">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
						<Sparkles className="h-5 w-5" />
					</div>
					<span className="text-xl font-bold tracking-tight">Pictora</span>
				</div>
				<nav className="flex items-center gap-3">
					<Link href="/sign-in">
						<Button variant="ghost">Sign in</Button>
					</Link>
					<Link href="/sign-up">
						<Button>Get started</Button>
					</Link>
				</nav>
			</header>

			<section className="mx-auto max-w-6xl px-6 py-20 text-center">
				<div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm">
					<Zap className="h-4 w-4 text-amber-500" />
					Powered by Puter.js AI
				</div>
				<h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
					Turn words into
					<span className="block bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
						stunning profile images
					</span>
				</h1>
				<p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
					Pictora is your AI-powered text-to-profile-image generator. Describe
					the vibe, pick a style, and get a unique avatar in seconds. No design
					skills required.
				</p>
				<div className="mt-10 flex items-center justify-center gap-4">
					<Link href="/sign-up">
						<Button size="lg" className="gap-2">
							<Sparkles className="h-4 w-4" />
							Start creating free
						</Button>
					</Link>
					<Link href="/sign-in">
						<Button size="lg" variant="outline">
							I have an account
						</Button>
					</Link>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-6 py-16">
				<div className="grid gap-6 sm:grid-cols-3">
					<div className="rounded-2xl border bg-white p-6 shadow-sm">
						<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
							<ImageIcon className="h-5 w-5" />
						</div>
						<h3 className="text-lg font-semibold">Text to image</h3>
						<p className="mt-2 text-sm text-slate-600">
							Describe any profile picture you can imagine and let AI bring it
							to life instantly.
						</p>
					</div>
					<div className="rounded-2xl border bg-white p-6 shadow-sm">
						<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
							<Zap className="h-5 w-5" />
						</div>
						<h3 className="text-lg font-semibold">Lightning fast</h3>
						<p className="mt-2 text-sm text-slate-600">
							Generations complete in seconds thanks to Puter.js serverless AI
							infrastructure.
						</p>
					</div>
					<div className="rounded-2xl border bg-white p-6 shadow-sm">
						<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
							<Shield className="h-5 w-5" />
						</div>
						<h3 className="text-lg font-semibold">Secure accounts</h3>
						<p className="mt-2 text-sm text-slate-600">
							Username and password authentication powered by Better Auth. Your
							data stays yours.
						</p>
					</div>
				</div>
			</section>

			<footer className="border-t py-8 text-center text-sm text-slate-500">
				© 2026 Pictora. Built with Next.js, Tailwind, shadcn & Puter.js.
			</footer>
		</main>
	);
}
