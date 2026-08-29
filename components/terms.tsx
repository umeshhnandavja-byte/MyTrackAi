export function TermsView() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Terms and Conditions</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 30, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing or using MyTrack, you agree to be bound by these Terms and Conditions. If you do not agree, you may not use our platform.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">2. User Accounts</h2>
          <p>You are responsible for safeguarding your account credentials and securing your personal tracker logs.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">3. Platform Compliance</h2>
          <p>This application is built for high-performance personal habit building, workflow management, and buildathon submissions.</p>
        </section>
      </div>
    </main>
  )
}