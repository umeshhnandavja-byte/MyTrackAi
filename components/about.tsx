import { Sparkles, Target, Zap } from "lucide-react"

export function AboutView() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-xl">
          <Sparkles className="size-3.5 text-foreground" /> Built for focus
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Master your day, elevate your potential.</h1>
        <p className="text-base text-muted-foreground">
          MyTrack is a modern, high-performance productivity and tracking dashboard built to help developers, creators, and high-achievers take absolute control of their routines, streaks, and long-term goals.
        </p>
      </div>

      <hr className="my-10 border-border/70" />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card/40 p-6 backdrop-blur-xl">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/30">
            <Target className="size-5" />
          </div>
          <h2 className="mt-4 font-semibold">Purposeful Design</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Every interface element is crafted to eliminate clutter and keep your focus locked directly onto what matters today.
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/40 p-6 backdrop-blur-xl">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/30">
            <Zap className="size-5" />
          </div>
          <h2 className="mt-4 font-semibold">Speed & Sync</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Powered by modern web standards and secure cloud infrastructure so your tasks, boards, and streaks are always ready when you are.
          </p>
        </div>
      </div>
    </main>
  )
}