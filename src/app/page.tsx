import Link from "next/link";
import { ArrowRight, Calendar, CreditCard, Users, ClipboardList } from "lucide-react";

const valueProps = [
  {
    icon: Calendar,
    title: "Booking, Doctolib-style",
    body: "Lessons, services, and one-shot pros. Riders book in two taps; pros fill their week without a phone call.",
  },
  {
    icon: CreditCard,
    title: "Payments that don't slip",
    body: "Prepayment, Apple Pay, and Stripe-backed invoicing. US tax handled from day one.",
  },
  {
    icon: Users,
    title: "Everyone, on the same page",
    body: "Owners, trainers, grooms, riders, and external providers — each with the right view, the right info, the right permissions.",
  },
  {
    icon: ClipboardList,
    title: "Nothing forgotten",
    body: "A clear daily view of what matters: next up, my to-do, the barn's plan. Mental load, gone.",
  },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <header className="flex items-center justify-between">
        <Logo />
        <nav className="hidden gap-2 sm:flex">
          <Link href="#features" className="btn-ghost">
            Features
          </Link>
          <Link href="#waitlist" className="btn-primary">
            Join the waitlist
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="mt-20 sm:mt-28">
        <span className="pill">Ocala · Wellington · Winter 2027</span>
        <h1 className="mt-5 font-serif text-5xl leading-[1.05] tracking-tight text-ink sm:text-7xl">
          The operating system
          <br />
          for <span className="text-sage-500">high-performance</span> barns.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-soft">
          HopOn turns the daily chaos of a professional stable — lessons, payments, grooms, vets,
          shows — into one calm, shared plan. Built for the barns that win.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#waitlist" className="btn-primary">
            Get early access
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
          <Link href="#features" className="btn-ghost">
            See what's inside
          </Link>
        </div>
      </section>

      <section id="features" className="mt-24 grid gap-6 sm:grid-cols-2">
        {valueProps.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-50 text-sage-600">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </section>

      <section id="waitlist" className="mt-24 card sm:p-10">
        <div className="grid items-center gap-8 sm:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-serif text-3xl text-ink sm:text-4xl">
              Be one of the first five barns.
            </h2>
            <p className="mt-3 text-ink-soft">
              We're onboarding a handful of barns in Ocala and Wellington before the winter show
              season. If that's you, leave a note — we'll be in touch.
            </p>
          </div>
          <form className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Your barn"
              className="rounded-full border border-sage-100 bg-canvas-raised px-5 py-3 text-sm outline-none focus:border-sage-400"
            />
            <input
              type="email"
              placeholder="you@barn.com"
              className="rounded-full border border-sage-100 bg-canvas-raised px-5 py-3 text-sm outline-none focus:border-sage-400"
            />
            <button type="button" className="btn-primary">
              Request access
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      <footer className="mt-24 flex flex-col items-start justify-between gap-4 border-t border-sage-100 pt-8 text-sm text-ink-muted sm:flex-row sm:items-center">
        <Logo small />
        <p>© {new Date().getFullYear()} HopOn. Built for barns that mean business.</p>
      </footer>
    </main>
  );
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`grid place-items-center rounded-xl bg-sage-500 font-serif font-semibold text-white ${
          small ? "h-7 w-7 text-sm" : "h-9 w-9 text-base"
        }`}
      >
        H
      </div>
      <span
        className={`font-serif tracking-tight text-ink ${small ? "text-base" : "text-lg"}`}
      >
        Hop<span className="text-sage-500">O</span>n
      </span>
    </div>
  );
}
