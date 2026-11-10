import { Link } from 'react-router-dom'
import { PRIMARY_DOMAIN, tenantUrl } from '../../tenant/resolve'

/**
 * Happy Table's own front page — ours, not a restaurant's.
 *
 * It renders on the apex, where no tenant resolves, and it is written for one
 * reader: somebody who runs a restaurant and is deciding whether to spend
 * half an hour finding out more. So the three demos are the second thing on
 * the page rather than buried at the bottom. A restaurant owner does not want
 * a feature list; they want to hold the thing their waiters would hold.
 *
 * Every claim below is about something that exists and can be clicked
 * through to in the demos. Nothing here is aspirational.
 */

const DEMOS = [
  {
    slug: 'bobbys',
    name: "Bobby's",
    kind: 'Vegetarian Indian kitchen',
    detail: '171 dishes across 19 sections, 20 tables',
    note: 'The big one — a full printed menu book, numbered exactly as the paper version.',
  },
  {
    slug: 'starvashnu',
    name: 'Star Vashnu Dhaba',
    kind: 'Pure vegetarian, Italian & Indo-Chinese',
    detail: '163 dishes, 12 tables, dish photography',
    note: 'Three cuisines under one roof, with images on the cards that have them.',
  },
  {
    slug: 'feastindia',
    name: 'Feast India',
    kind: 'Tandoor, curry house & grill',
    detail: '26 dishes, 16 tables, own domain',
    note: 'A newly onboarded restaurant, and the only one here serving meat.',
  },
]

const SURFACES = [
  {
    eyebrow: 'The guest’s own phone',
    title: 'Scan, browse, order',
    lead: 'No app to download, no hardware to buy, nothing to charge overnight.',
    points: [
      'Browse the whole menu freely the moment they sit down — no waiting to be handed anything',
      'A waiter gives out a short table code when the party is ready to order',
      'Dietary and allergen marks on every dish, including nuts tracked separately from diet',
      'Order notes in the guest’s own words, straight through to the pass',
      'A live countdown on their ticket once the kitchen quotes a time',
      'Several codes on one table, so a party of eight can split the bill before the food arrives',
    ],
  },
  {
    eyebrow: 'The floor, on a tablet',
    title: 'Run the room',
    lead: 'The whole dining room on one screen, in the shape of the actual room.',
    points: [
      'Interactive floor plan with live table states, including “wiped down and ready”',
      'Seat a party in one tap; approve the ones who scanned before you got there',
      'Push tables 6, 7 and 8 together into one party and one bill',
      'Join latecomers to a table already eating, or merge two parties outright',
      'Settle by cash or card at the table and close the tab',
      'Takings, covers and average spend for the day, visible only to who you choose',
    ],
  },
  {
    eyebrow: 'The pass',
    title: 'Never miss a ticket',
    lead: 'Built for a hot, bright, wet-handed metre of stainless steel.',
    points: [
      'High-contrast ticket rail, readable at arm’s length across the kitchen',
      'An elapsed clock on every ticket that keeps counting until it is away',
      'Fire a ticket and quote a time; the guest’s phone updates as you do it',
      'Mark a dish off and it greys out on every table in the building at once',
      'Order notes shown with the ticket, not hidden behind a tap',
      'One tap to ready — the waiter who needs to run it already knows',
    ],
  },
]

export default function HappyTableLanding() {
  return (
    <div className="wash min-h-full">
      <SiteHeader />

      <main>
        <Hero />
        <Demos />
        <Surfaces />
        <HowItWorks />
        <Pricing />
      </main>

      <SiteFooter />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function Wordmark({ size = 'text-[19px]' }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className={`font-display leading-none ${size}`}>Happy Table</span>
    </span>
  )
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Wordmark />

        <nav className="hidden items-center gap-7 text-[13px] text-ink-soft md:flex">
          <a href="#demos" className="transition-colors hover:text-ink">
            Live demos
          </a>
          <a href="#surfaces" className="transition-colors hover:text-ink">
            The three screens
          </a>
          <a href="#how" className="transition-colors hover:text-ink">
            Getting started
          </a>
          <a href="#pricing" className="transition-colors hover:text-ink">
            Pricing
          </a>
        </nav>

        <Link
          to="/admin/login"
          className="rounded-control border border-line-strong bg-raised px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-line"
        >
          Platform admin
        </Link>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-6 pt-16 sm:pt-24">
      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">
        Restaurant software, Happy Table
      </p>

      <h1 className="mt-5 max-w-3xl font-display text-[46px] leading-[1.03] sm:text-[68px] lg:text-[80px]">
        The zero-hardware restaurant operating system
      </h1>

      <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-ink-soft sm:text-[19px]">
        Your guests order from the phone already in their pocket. Your floor
        runs on a tablet that shows the room as it actually is. Your pass gets
        a ticket rail that never loses a ticket and never stops counting. No
        tills to buy, no terminals to mount, nothing to replace in two years.
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="#demos"
          className="inline-flex items-center justify-center gap-2 rounded-control bg-accent px-6 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Try a real restaurant
          <span aria-hidden>&rarr;</span>
        </a>
        <a
          href="#how"
          className="inline-flex items-center justify-center rounded-control border border-line-strong bg-raised px-6 py-4 text-[15px] font-semibold text-ink transition-colors hover:bg-line"
        >
          How we get you live
        </a>
      </div>

      <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-line pt-9 sm:grid-cols-4">
        <HeroFact value="3" label="screens, one subscription" />
        <HeroFact value="0" label="pieces of hardware to buy" />
        <HeroFact value="£30" label="per restaurant, per month" />
        <HeroFact value="QR" label="on the table, that is the whole setup" />
      </dl>
    </section>
  )
}

function HeroFact({ value, label }) {
  return (
    <div>
      <dt className="font-display text-[34px] leading-none sm:text-[40px]">{value}</dt>
      <dd className="mt-2 text-[12px] leading-relaxed text-ink-faint">{label}</dd>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function Demos() {
  return (
    <section id="demos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-20">
      <SectionHead
        eyebrow="Open and poke at it"
        title="Three restaurants, running right now"
        body="Not screenshots and not a video. These are complete restaurants with their real menus in them. Open one and you are standing in it — browse as a guest, sign in as the owner, watch a ticket land on the pass."
      />

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {DEMOS.map((demo) => (
          <DemoCard key={demo.slug} {...demo} />
        ))}
      </div>

      <p className="mt-7 max-w-2xl text-[13px] leading-relaxed text-ink-faint">
        Every demo signs in with the password{' '}
        <span className="tabular text-ink-soft">demo1234</span>. The staff
        list is printed on each restaurant&rsquo;s own sign-in screen, so you
        can come in as the owner, a waiter or the kitchen and see exactly how
        much each of them is shown.
      </p>
    </section>
  )
}

function DemoCard({ slug, name, kind, detail, note }) {
  return (
    <div className="flex flex-col rounded-card border border-line bg-surface p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
        {kind}
      </p>
      <h3 className="mt-2 font-display text-[27px] leading-tight">{name}</h3>
      <p className="tabular mt-1.5 text-[12px] text-ink-faint">{detail}</p>
      <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{note}</p>

      <div className="mt-5 space-y-2">
        <a
          href={tenantUrl(slug, '/')}
          className="flex items-center justify-center gap-2 rounded-control bg-accent px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Open {name}
          <span aria-hidden>&rarr;</span>
        </a>
        <div className="grid grid-cols-3 gap-2">
          <DemoLink href={tenantUrl(slug, '/customer/3')} label="Guest" />
          <DemoLink href={tenantUrl(slug, '/manager')} label="Floor" />
          <DemoLink href={tenantUrl(slug, '/kitchen')} label="Pass" />
        </div>
      </div>
    </div>
  )
}

function DemoLink({ href, label }) {
  return (
    <a
      href={href}
      className="rounded-control border border-line-strong bg-raised px-2 py-2.5 text-center text-[12px] font-semibold text-ink-soft transition-colors hover:text-ink"
    >
      {label}
    </a>
  )
}

/* -------------------------------------------------------------------------- */

function Surfaces() {
  return (
    <section
      id="surfaces"
      className="scroll-mt-20 border-y border-line bg-sunken py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5">
        <SectionHead
          eyebrow="One subscription, three screens"
          title="Everybody gets the screen built for where they stand"
          body="A guest at a table, a waiter crossing the room and a chef at a hot pass are doing three different jobs in three different conditions. They do not want one interface between them, so they do not get one."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {SURFACES.map((surface) => (
            <article
              key={surface.title}
              className="flex flex-col rounded-card border border-line bg-surface p-6"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
                {surface.eyebrow}
              </p>
              <h3 className="mt-2.5 text-[22px] font-semibold leading-tight tracking-[-0.02em]">
                {surface.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                {surface.lead}
              </p>

              <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                {surface.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                    <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="text-ink-soft">{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    n: '1',
    title: 'We set you up',
    body: 'You send us your menu in whatever shape you have it — spreadsheet, PDF, photographs of the printed book. We load it, set your table count and hand you your own address.',
  },
  {
    n: '2',
    title: 'You get your own address',
    body: `Your restaurant lives at yourname.${PRIMARY_DOMAIN}, with your name on it and nobody else's data anywhere near it. Bring your own domain instead if you have one.`,
  },
  {
    n: '3',
    title: 'You add your team',
    body: 'Owner, manager, waiter and kitchen, with twenty-odd permissions you set yourself — because “the manager does everything except the takings” is a rule only you can write.',
  },
  {
    n: '4',
    title: 'You print the codes',
    body: 'One QR sticker per table and the room is live. A guest scans it and is on your menu before a waiter has crossed the floor.',
  },
]

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-20">
      <SectionHead
        eyebrow="Getting started"
        title="Live in four steps, and only one of them is yours"
        body="Loading a menu properly is the real work of onboarding, and it is work we do rather than work we hand you as a spreadsheet template."
      />

      <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.n} className="rounded-card border border-line bg-surface p-5">
            <span className="grid size-9 place-items-center rounded-full bg-accent-wash font-display text-[19px] text-accent">
              {step.n}
            </span>
            <h3 className="mt-4 text-[16px] font-semibold leading-tight">{step.title}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-line bg-sunken py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center">
          <div>
            <SectionHead
              eyebrow="Pricing"
              title="£30 a month, per restaurant"
              body="One price for all three screens and every member of staff. No per-cover fee, no commission on what your guests spend, no charge for adding a waiter."
            />
            <ul className="mt-7 space-y-2.5">
              {[
                'Unlimited staff accounts and unlimited tables',
                'Your whole menu, however long it is',
                'Your own subdomain, or your own domain if you prefer',
                'Menu loading and setup done by us, included',
              ].map((line) => (
                <li key={line} className="flex gap-2.5 text-[14px] leading-relaxed">
                  <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-ink-soft">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-accent/40 bg-accent-wash p-6 sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
              Talk to us
            </p>
            <h3 className="mt-2.5 text-[21px] font-semibold leading-tight tracking-[-0.02em]">
              Tell us about your restaurant
            </h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
              Send us your name, your menu and how many tables you have, and
              we will set up a restaurant for you to try with your own dishes
              in it.
            </p>

            <a
              href={`mailto:hello@${PRIMARY_DOMAIN}?subject=Happy%20Table%20enquiry`}
              className="mt-6 flex items-center justify-center gap-2 rounded-control bg-accent px-5 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              hello@{PRIMARY_DOMAIN}
            </a>

            {/* Said plainly, because a pricing box that stays quiet about
                this is the kind of quiet that gets read as a card form. */}
            <p className="mt-4 text-[12px] leading-relaxed text-ink-faint">
              There is no card form and no sign-up wizard. We set your
              restaurant up by hand and invoice you directly — the app itself
              takes no payments from you and none from your guests, who pay at
              the table by cash or card exactly as they do now.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function SectionHead({ eyebrow, title, body }) {
  return (
    <div className="max-w-2xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-[34px] leading-[1.08] sm:text-[44px]">
        {title}
      </h2>
      {body && (
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft sm:text-[16px]">
          {body}
        </p>
      )}
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Wordmark size="text-[17px]" />
            <p className="mt-2 text-[12px] text-ink-faint">
              Restaurant ordering, floor management and kitchen display.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-faint">
            <a href="#demos" className="transition-colors hover:text-ink">
              Live demos
            </a>
            <a href="#surfaces" className="transition-colors hover:text-ink">
              The three screens
            </a>
            <a href="#pricing" className="transition-colors hover:text-ink">
              Pricing
            </a>
            <a
              href={`mailto:hello@${PRIMARY_DOMAIN}`}
              className="transition-colors hover:text-ink"
            >
              Contact
            </a>
            <Link to="/admin/login" className="transition-colors hover:text-ink">
              Platform admin login
            </Link>
          </nav>
        </div>

        <p className="mt-9 border-t border-line pt-6 text-[12px] text-ink-faint">
          Already work at a restaurant that uses Happy Table? Your sign-in is
          on your own restaurant&rsquo;s address, not here &mdash;{' '}
          <span className="text-ink-soft">yourname.{PRIMARY_DOMAIN}</span>.
        </p>
      </div>
    </footer>
  )
}
