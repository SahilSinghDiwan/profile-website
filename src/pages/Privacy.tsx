import { Link } from "react-router-dom";
import { Seo } from "../lib/meta";
import type { ReactNode } from "react";

const UPDATED = "18 October 2026";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-semibold tracking-tight mb-4">{title}</h2>
    <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
  </section>
);

const ext = (href: string, label: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
    {label}
  </a>
);

const Privacy = () => (
  <>
    <Seo
      title="Privacy Policy — Sahil Singh Diwan"
      description="What sahildiwan.in and the Latent Workshop Analytics app collect, why, and how long it is kept."
      url="https://sahildiwan.in/privacy"
    />
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated {UPDATED}</p>
        </header>

        <Section title="Who this covers">
          <p>
            This policy covers sahildiwan.in, run by Sahil Singh Diwan, and the Google API app
            "Latent Workshop Analytics", which I use for my YouTube channel{" "}
            {ext("https://www.youtube.com/@latentworkshop", "Latent Workshop")}. I don't sell personal
            data, show ads, or use advertising cookies.
          </p>
        </Section>

        <Section title="Visiting the site">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-foreground">Analytics.</strong> The site uses{" "}
              {ext("https://www.cloudflare.com/web-analytics/", "Cloudflare Web Analytics")}, which counts
              page views and load times in aggregate. It sets no cookies and does not fingerprint or
              track you across sites.
            </li>
            <li>
              <strong className="text-foreground">Hosting.</strong> Vercel serves the site and keeps standard
              request logs (such as IP address, user agent and requested URL) to run and secure its service.
            </li>
            <li>
              <strong className="text-foreground">Your browser.</strong> The site saves your light or dark theme
              and a cooldown timestamp for AI project summaries in your browser's local storage. Nothing in
              local storage is sent to me.
            </li>
          </ul>
        </Section>

        <Section title="The resume chat">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Questions you type go to my API on Cloudflare Workers and are answered by{" "}
              {ext("https://developers.cloudflare.com/workers-ai/", "Cloudflare Workers AI")}. Don't enter
              personal or sensitive information.
            </li>
            <li>
              {ext("https://www.cloudflare.com/products/turnstile/", "Cloudflare Turnstile")} checks that
              you're not a bot before the chat answers.
            </li>
            <li>
              To save repeat work, each answer is cached for 7 days under a one-way hash of the conversation.
              The question text itself is not stored as readable text.
            </li>
            <li>
              Your IP address is used for rate limiting (10 messages a minute) and expires within 2 minutes.
            </li>
          </ul>
        </Section>

        <Section title="Latent Workshop Analytics (Google API app)">
          <p>
            Latent Workshop Analytics is a private tool that only I sign in to. It reads statistics for my
            own YouTube channel through the YouTube Data API and YouTube Analytics API, using read-only
            access. It never accesses a visitor's Google account, and nobody else is asked to sign in.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-foreground">What it reads:</strong> channel and video metadata, plus
              aggregate metrics such as views, watch time, average view duration and subscribers gained.
            </li>
            <li>
              <strong className="text-foreground">How it's used:</strong> to write a weekly progress note for
              my own planning. It cannot upload, edit or delete anything.
            </li>
            <li>
              <strong className="text-foreground">Storage and sharing:</strong> the numbers are kept in my
              private notes on my own computer. They are not sold, not used for advertising, and not
              shared with anyone.
            </li>
            <li>
              <strong className="text-foreground">Revoking access:</strong> the access can be removed at any time
              from {ext("https://myaccount.google.com/permissions", "Google Account permissions")}.
            </li>
          </ul>
          <p>
            Latent Workshop Analytics' use and transfer of information received from Google APIs adheres to
            the{" "}
            {ext(
              "https://developers.google.com/terms/api-services-user-data-policy",
              "Google API Services User Data Policy",
            )}
            , including the Limited Use requirements.
          </p>
        </Section>

        <Section title="Third parties">
          <p>
            The services above have their own privacy policies:{" "}
            {ext("https://www.cloudflare.com/privacypolicy/", "Cloudflare")},{" "}
            {ext("https://vercel.com/legal/privacy-policy", "Vercel")} and{" "}
            {ext("https://policies.google.com/privacy", "Google")}. Links to LinkedIn, GitHub, YouTube and X
            lead to sites with their own policies.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For questions or data requests, message me on{" "}
            {ext("https://www.linkedin.com/in/diwan-sahil", "LinkedIn")}. If this policy changes, the date at
            the top changes with it.
          </p>
        </Section>

        <Link to="/" className="text-primary underline underline-offset-4">
          ← Back to home
        </Link>
      </main>
    </div>
  </>
);

export default Privacy;
