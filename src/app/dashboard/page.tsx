"use client";

import {
	Camera,
	Download,
	ImageIcon,
	Loader2,
	LogOut,
	Sparkles,
	Upload,
	User,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

const MODELS = [
	{ value: "gpt-image-2", label: "GPT Image 2 (OpenAI)" },
	{ value: "gemini-3.1-flash-image", label: "Gemini 3.1 Flash" },
	{ value: "grok-imagine-image", label: "Grok Imagine" },
];

const ASPECTS = [
	{ value: "1:1", label: "Square (1:1)" },
	{ value: "16:9", label: "Landscape (16:9)" },
	{ value: "9:16", label: "Portrait (9:16)" },
	{ value: "4:3", label: "Standard (4:3)" },
];

const DEFAULT_PREVIEW_IMAGE =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'>
			<defs>
				<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
					<stop offset='0%' stop-color='#a78bfa'/>
					<stop offset='100%' stop-color='#6366f1'/>
				</linearGradient>
			</defs>
			<rect width='128' height='128' fill='url(#g)'/>
			<circle cx='64' cy='50' r='22' fill='rgba(255,255,255,0.85)'/>
			<path d='M24 118c0-22 18-36 40-36s40 14 40 36' fill='rgba(255,255,255,0.85)'/>
		</svg>`,
	);

const INSTAGRAM_FILTERS = [
	{
		name: "Normal",
		values: {
			brightness: 100,
			contrast: 100,
			saturation: 100,
			hue: 0,
			blur: 0,
			sepia: 0,
			grayscale: 0,
			invert: 0,
		},
	},
	{
		name: "Clarendon",
		values: {
			brightness: 100,
			contrast: 120,
			saturation: 125,
			hue: 0,
			blur: 0,
			sepia: 0,
			grayscale: 0,
			invert: 0,
		},
	},
	{
		name: "Gingham",
		values: {
			brightness: 105,
			contrast: 95,
			saturation: 90,
			hue: 0,
			blur: 0,
			sepia: 0,
			grayscale: 0,
			invert: 0,
		},
	},
	{
		name: "Moon",
		values: {
			brightness: 100,
			contrast: 110,
			saturation: 0,
			hue: 0,
			blur: 0,
			sepia: 0,
			grayscale: 100,
			invert: 0,
		},
	},
	{
		name: "Lark",
		values: {
			brightness: 110,
			contrast: 90,
			saturation: 95,
			hue: 0,
			blur: 0,
			sepia: 0,
			grayscale: 0,
			invert: 0,
		},
	},
	{
		name: "Reyes",
		values: {
			brightness: 110,
			contrast: 85,
			saturation: 85,
			hue: 10,
			blur: 0,
			sepia: 25,
			grayscale: 0,
			invert: 0,
		},
	},
	{
		name: "Juno",
		values: {
			brightness: 105,
			contrast: 105,
			saturation: 130,
			hue: 10,
			blur: 0,
			sepia: 0,
			grayscale: 0,
			invert: 0,
		},
	},
	{
		name: "Slumber",
		values: {
			brightness: 100,
			contrast: 90,
			saturation: 75,
			hue: 0,
			blur: 1,
			sepia: 10,
			grayscale: 0,
			invert: 0,
		},
	},
	{
		name: "Crema",
		values: {
			brightness: 105,
			contrast: 90,
			saturation: 95,
			hue: 15,
			blur: 0,
			sepia: 15,
			grayscale: 0,
			invert: 0,
		},
	},
	{
		name: "Ludwig",
		values: {
			brightness: 100,
			contrast: 110,
			saturation: 90,
			hue: 0,
			blur: 0,
			sepia: 0,
			grayscale: 0,
			invert: 0,
		},
	},
	{
		name: "Aden",
		values: {
			brightness: 105,
			contrast: 90,
			saturation: 85,
			hue: 200,
			blur: 0,
			sepia: 0,
			grayscale: 0,
			invert: 0,
		},
	},
];

function filterToCss(v: (typeof INSTAGRAM_FILTERS)[number]["values"]) {
	return `brightness(${v.brightness}%) contrast(${v.contrast}%) saturate(${v.saturation}%) hue-rotate(${v.hue}deg) blur(${v.blur}px) sepia(${v.sepia}%) grayscale(${v.grayscale}%) invert(${v.invert}%)`;
}

export default function DashboardPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [prompt, setPrompt] = useState("");
	const [model, setModel] = useState(MODELS[0].value);
	const [aspect, setAspect] = useState("1:1");
	const [loading, setLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [referenceImages, setReferenceImages] = useState<string[]>([]);
	const [referenceNames, setReferenceNames] = useState<string[]>([]);
	const [selectedFilter, setSelectedFilter] = useState("Normal");
	const [usageData, setUsageData] = useState<{
		monthUsageAllowance: number;
		remaining: number;
	} | null>(null);
	const [webcamOpen, setWebcamOpen] = useState(false);
	const [captureDelay, setCaptureDelay] = useState(3);
	const [countdown, setCountdown] = useState<number | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const [filters, setFilters] = useState({
		brightness: 100,
		contrast: 100,
		saturation: 100,
		hue: 0,
		blur: 0,
		sepia: 0,
		grayscale: 0,
		invert: 0,
	});
	const imgRef = useRef<HTMLImageElement | null>(null);

	const cssFilter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%) invert(${filters.invert}%)`;

	const resetFilters = () => {
		setSelectedFilter("Normal");
		setFilters({
			brightness: 100,
			contrast: 100,
			saturation: 100,
			hue: 0,
			blur: 0,
			sepia: 0,
			grayscale: 0,
			invert: 0,
		});
	};

	const applyFilter = (name: string) => {
		const found = INSTAGRAM_FILTERS.find((f) => f.name === name);
		if (!found) return;
		setSelectedFilter(name);
		setFilters(found.values);
	};

	const handleDownloadFiltered = async () => {
		if (!imageUrl) return;
		try {
			const img = new Image();
			img.crossOrigin = "anonymous";
			await new Promise<void>((resolve, reject) => {
				img.onload = () => resolve();
				img.onerror = () => reject(new Error("load failed"));
				img.src = imageUrl;
			});
			const canvas = document.createElement("canvas");
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("no ctx");
			ctx.filter = cssFilter;
			ctx.drawImage(img, 0, 0);
			canvas.toBlob((blob) => {
				if (!blob) {
					toast.error("Could not export image");
					return;
				}
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `pictora-filtered-${Date.now()}.png`;
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(url);
				toast.success("Filtered image downloaded");
			}, "image/png");
		} catch {
			toast.error("Filter export failed (CORS). Downloading original instead.");
			handleDownload();
		}
	};

	const handleSignOut = async () => {
		await authClient.signOut();
		toast.success("Signed out");
		router.push("/");
		router.refresh();
	};

	const handleReferenceFile = (file: File | null) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			setReferenceImages((prev) => [...prev, reader.result as string]);
			setReferenceNames((prev) => [...prev, file.name]);
		};
		reader.readAsDataURL(file);
	};

	const removeReferenceImage = (index: number) => {
		setReferenceImages((prev) => prev.filter((_, i) => i !== index));
		setReferenceNames((prev) => prev.filter((_, i) => i !== index));
	};

	const handleUseAsReference = () => {
		if (!imageUrl) return;
		setReferenceImages((prev) => [...prev, imageUrl]);
		setReferenceNames((prev) => [...prev, "result.png"]);
		toast.success("Added result as reference image");
	};

	useEffect(() => {
		if (!webcamOpen) {
			setCountdown(null);
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((t) => {
					t.stop();
				});
				streamRef.current = null;
			}
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
				});
				if (cancelled) {
					stream.getTracks().forEach((t) => {
						t.stop();
					});
					return;
				}
				streamRef.current = stream;
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			} catch {
				toast.error("Could not access webcam");
				setWebcamOpen(false);
			}
		})();
		return () => {
			cancelled = true;
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((t) => {
					t.stop();
				});
				streamRef.current = null;
			}
		};
	}, [webcamOpen]);

	const captureFromWebcam = useCallback(() => {
		const video = videoRef.current;
		if (!video) return;
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth || 640;
		canvas.height = video.videoHeight || 480;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const dataUrl = canvas.toDataURL("image/png");
		setReferenceImages((prev) => [...prev, dataUrl]);
		setReferenceNames((prev) => [...prev, "webcam-capture.png"]);
		setWebcamOpen(false);
		toast.success("Captured from webcam");
	}, []);

	useEffect(() => {
		if (countdown === null) return;
		if (countdown <= 0) {
			captureFromWebcam();
			setCountdown(null);
			return;
		}
		const t = setTimeout(
			() => setCountdown((c) => (c === null ? null : c - 1)),
			1000,
		);
		return () => clearTimeout(t);
	}, [countdown, captureFromWebcam]);

	const startCountdown = () => {
		if (countdown !== null) return;
		setCountdown(captureDelay);
		toast.info(`Capturing in ${captureDelay}s...`);
	};

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const { puter } = await import("@heyputer/puter.js");
				const usage = await puter.auth.getMonthlyUsage();
				if (cancelled) return;
				const allowance = usage?.allowanceInfo?.monthUsageAllowance ?? 0;
				const remaining = usage?.allowanceInfo?.remaining ?? 0;
				setUsageData({ monthUsageAllowance: allowance, remaining });
			} catch {
				// Puter may require sign-in; ignore.
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const refreshUsage = async () => {
		try {
			const { puter } = await import("@heyputer/puter.js");
			const usage = await puter.auth.getMonthlyUsage();
			const allowance = usage?.allowanceInfo?.monthUsageAllowance ?? 0;
			const remaining = usage?.allowanceInfo?.remaining ?? 0;
			setUsageData({ monthUsageAllowance: allowance, remaining });
		} catch {
			// ignore
		}
	};

	const handleGenerate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!prompt.trim()) {
			toast.error("Please enter a prompt");
			return;
		}
		setLoading(true);
		setImageUrl(null);
		try {
			const { puter } = await import("@heyputer/puter.js");
			const [w, h] = aspect.split(":").map(Number);
			const options: Record<string, unknown> = {
				model,
				ratio: { w, h },
			};
			if (referenceImages.length > 0) {
				options.input_images = referenceImages;
			}
			const image = await puter.ai.txt2img(prompt.trim(), options);
			const src = (image as HTMLImageElement).src;
			setImageUrl(src);
			toast.success("Profile image generated!");
			refreshUsage();
		} catch (err: unknown) {
			const message =
				(err as { message?: string })?.message ?? "Generation failed";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = () => {
		if (!imageUrl) return;
		const a = document.createElement("a");
		a.href = imageUrl;
		a.download = `pictora-${Date.now()}.png`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
			<header className="border-b bg-white/80 backdrop-blur">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-2">
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
							<Sparkles className="h-5 w-5" />
						</div>
						<span className="text-xl font-bold tracking-tight">Pictora</span>
					</div>
					<div className="flex items-center gap-3">
						{session?.user && (
							<div className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
								<User className="h-4 w-4" />
								{session.user.name ?? session.user.email}
							</div>
						)}
						<Button
							variant="outline"
							size="sm"
							onClick={handleSignOut}
							className="gap-2"
						>
							<LogOut className="h-4 w-4" />
							Sign out
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-6 py-10">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight text-slate-900">
						Text to Profile Image
					</h1>
					<p className="mt-2 text-slate-600">
						Describe the profile image you want and let Pictora craft it with
						AI.
					</p>
				</div>

				{usageData && usageData.monthUsageAllowance > 0 && (
					<Card className="mb-6">
						<CardContent className="py-4">
							<div className="flex items-center justify-between text-sm">
								<span className="text-slate-700">Puter monthly usage</span>
								<span className="tabular-nums text-slate-500">
									{Math.round(
										((usageData.monthUsageAllowance - usageData.remaining) /
											usageData.monthUsageAllowance) *
											100,
									)}
									% used
								</span>
							</div>
							<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
								<div
									className="h-full rounded-full bg-slate-900 transition-all"
									style={{
										width: `${Math.min(
											100,
											((usageData.monthUsageAllowance - usageData.remaining) /
												usageData.monthUsageAllowance) *
												100,
										)}%`,
									}}
								/>
							</div>
							<p className="mt-1 text-xs text-slate-500">
								{usageData.remaining.toLocaleString()} of{" "}
								{usageData.monthUsageAllowance.toLocaleString()} microcents
								remaining
							</p>
						</CardContent>
					</Card>
				)}

				<div className="grid gap-6 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Sparkles className="h-5 w-5 text-violet-600" />
								Generate
							</CardTitle>
							<CardDescription>
								Be as descriptive as you like — style, colors, mood,
								accessories.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleGenerate} className="space-y-5">
								<div className="space-y-2">
									<Label htmlFor="prompt">Prompt</Label>
									<Input
										id="prompt"
										value={prompt}
										onChange={(e) => setPrompt(e.target.value)}
										placeholder="A futuristic neon cyberpunk portrait, glowing eyes, dark background"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label>Model</Label>
									<Tabs value={model} onValueChange={setModel}>
										<TabsList className="grid w-full grid-cols-3">
											{MODELS.map((m) => (
												<TabsTrigger
													key={m.value}
													value={m.value}
													className="text-xs"
												>
													{m.label.split(" ")[0]}
												</TabsTrigger>
											))}
										</TabsList>
										{MODELS.map((m) => (
											<TabsContent
												key={m.value}
												value={m.value}
												className="text-sm text-slate-600"
											>
												{m.label}
											</TabsContent>
										))}
									</Tabs>
								</div>

								<div className="space-y-2">
									<Label>Aspect ratio</Label>
									<div className="flex flex-wrap gap-2">
										{ASPECTS.map((a) => (
											<Button
												key={a.value}
												type="button"
												variant={aspect === a.value ? "default" : "outline"}
												size="sm"
												onClick={() => setAspect(a.value)}
											>
												{a.label}
											</Button>
										))}
									</div>
								</div>

								<div className="space-y-2">
									<Label>Reference image (optional)</Label>
									<div className="flex items-center gap-3">
										<label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
											<Upload className="h-4 w-4" />
											<span>Upload an image</span>
											<input
												type="file"
												accept="image/*"
												className="hidden"
												onChange={(e) =>
													handleReferenceFile(e.target.files?.[0] ?? null)
												}
											/>
										</label>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setWebcamOpen(true)}
											className="gap-2"
										>
											<Camera className="h-4 w-4" />
											Webcam
										</Button>
									</div>
									{referenceImages.length > 0 && (
										<div className="mt-2 flex flex-wrap gap-2">
											{referenceImages.map((img, idx) => (
												<div key={idx} className="relative">
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														src={img}
														alt={referenceNames[idx] ?? "Reference"}
														className="h-20 w-20 rounded-lg object-cover border"
													/>
													<button
														type="button"
														onClick={() => removeReferenceImage(idx)}
														className="absolute -right-1 -top-1 rounded-full bg-slate-900 p-0.5 text-white"
														aria-label="Remove reference"
													>
														<X className="h-3 w-3" />
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								<Button
									type="submit"
									className="w-full gap-2"
									disabled={loading}
								>
									{loading ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Generating…
										</>
									) : (
										<>
											<Sparkles className="h-4 w-4" />
											Generate profile image
										</>
									)}
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ImageIcon className="h-5 w-5 text-indigo-600" />
								Result
							</CardTitle>
							<CardDescription>
								Your generated profile image appears here.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed bg-slate-50">
								{loading && (
									<div className="flex flex-col items-center gap-3 text-slate-500">
										<Loader2 className="h-8 w-8 animate-spin" />
										<p className="text-sm">Crafting your image…</p>
									</div>
								)}
								{!loading && imageUrl && (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										ref={imgRef}
										src={imageUrl}
										alt="Generated profile"
										style={{ filter: cssFilter }}
										className="max-h-[480px] w-full rounded-lg object-contain transition-all"
									/>
								)}
								{!loading && !imageUrl && (
									<div className="flex flex-col items-center gap-2 text-slate-400">
										<ImageIcon className="h-10 w-10" />
										<p className="text-sm">No image yet. Generate one!</p>
									</div>
								)}
							</div>
							{imageUrl && (
								<div className="mt-4 flex items-center justify-between">
									<Badge variant="secondary">Ready</Badge>
									<div className="flex gap-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleUseAsReference}
											disabled={!imageUrl}
											className="gap-2"
										>
											<ImageIcon className="h-4 w-4" />
											Use as reference
										</Button>
										<Button
											onClick={handleDownloadFiltered}
											variant="outline"
											size="sm"
											className="gap-2"
										>
											<Download className="h-4 w-4" />
											Download
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<Card className="mt-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-amber-500" />
							Color grading
						</CardTitle>
						<CardDescription>
							Fine-tune the generated image. Presets or manual sliders.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<p className="text-sm font-medium text-slate-700">
								Instagram-style filters
							</p>
							<div className="flex gap-3 overflow-x-auto pb-2">
								{INSTAGRAM_FILTERS.map((f) => (
									<button
										key={f.name}
										type="button"
										onClick={() => applyFilter(f.name)}
										className={`flex shrink-0 flex-col items-center gap-1.5 rounded-lg border-2 p-1.5 transition ${
											selectedFilter === f.name
												? "border-slate-900"
												: "border-transparent hover:border-slate-300"
										}`}
									>
										<div className="h-16 w-16 overflow-hidden rounded-md bg-slate-100">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={imageUrl ?? DEFAULT_PREVIEW_IMAGE}
												alt={f.name}
												style={{ filter: filterToCss(f.values) }}
												className="h-full w-full object-cover"
											/>
										</div>
										<span className="text-xs text-slate-600">{f.name}</span>
									</button>
								))}
							</div>
						</div>

						{[
							{ key: "brightness", label: "Brightness", min: 0, max: 200 },
							{ key: "contrast", label: "Contrast", min: 0, max: 200 },
							{ key: "saturation", label: "Saturation", min: 0, max: 200 },
							{ key: "hue", label: "Hue rotate", min: 0, max: 360 },
							{ key: "blur", label: "Blur", min: 0, max: 20 },
							{ key: "sepia", label: "Sepia", min: 0, max: 100 },
							{ key: "grayscale", label: "Grayscale", min: 0, max: 100 },
							{ key: "invert", label: "Invert", min: 0, max: 100 },
						].map((item) => (
							<div key={item.key} className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-slate-700">{item.label}</span>
									<span className="tabular-nums text-slate-500">
										{filters[item.key as keyof typeof filters]}
										{item.key === "hue"
											? "°"
											: item.key === "blur"
												? "px"
												: "%"}
									</span>
								</div>
								<Slider
									min={item.min}
									max={item.max}
									value={[filters[item.key as keyof typeof filters]]}
									onValueChange={(v) => {
										const val = Array.isArray(v)
											? (v as number[])[0]
											: (v as number);
										setFilters((f) => ({ ...f, [item.key]: val }));
									}}
								/>
							</div>
						))}

						<div className="flex flex-wrap gap-2 pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={resetFilters}
							>
								Reset
							</Button>
						</div>
					</CardContent>
				</Card>

				<div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold">
						Tips for great profile images
					</h2>
					<ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
						<li>
							• Mention style: "watercolor", "3D render", "flat illustration"
						</li>
						<li>
							• Add lighting: "soft rim light", "cinematic", "golden hour"
						</li>
						<li>• Specify background: "gradient", "solid color", "blurred"</li>
						<li>• Include mood: "confident", "friendly", "mysterious"</li>
					</ul>
				</div>
			</main>

			<Dialog open={webcamOpen} onOpenChange={setWebcamOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Capture reference image</DialogTitle>
					</DialogHeader>
					<div className="space-y-3">
						<div className="relative">
							<video
								ref={videoRef}
								autoPlay
								playsInline
								muted
								className="w-full rounded-lg border bg-black"
							/>
							{countdown !== null && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/40 text-6xl font-bold text-white">
									{countdown}
								</div>
							)}
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-slate-700">Capture delay</span>
								<span className="tabular-nums text-slate-500">
									{captureDelay}s
								</span>
							</div>
							<Slider
								min={0}
								max={10}
								value={[captureDelay]}
								onValueChange={(v) => {
									const val = Array.isArray(v)
										? (v as number[])[0]
										: (v as number);
									setCaptureDelay(val);
								}}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setWebcamOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={captureFromWebcam}
							disabled={countdown !== null}
							className="gap-2"
						>
							<Camera className="h-4 w-4" />
							Capture now
						</Button>
						<Button
							type="button"
							onClick={startCountdown}
							disabled={countdown !== null}
							className="gap-2"
						>
							<Camera className="h-4 w-4" />
							{captureDelay === 0 ? "Capture" : `Capture in ${captureDelay}s`}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
