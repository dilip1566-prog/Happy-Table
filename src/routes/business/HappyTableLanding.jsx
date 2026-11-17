import { Link } from 'react-router-dom'
import { PRIMARY_DOMAIN, tenantUrl } from '../../tenant/resolve'
import {
  FloorMock,
  HeroShowcase,
  PassMock,
  PhoneMock,
  Reveal,
} from './LandingShowcase'

/**
 * Happy Table's own front page — ours, not a restaurant's.
 *
 * It renders on the apex, where no tenant resolves, and it is written for
 * one reader: somebody who runs a restaurant and is deciding whether to
 * spend half an hour finding out more.
 *
 * Two decisions shape it. The pictures are the real interface, drawn in the
 * product's own components, because a restaurant owner does not want a
 * feature list — they want to see the thing their waiters would be holding.
 * And the three live demos sit near the top rather than buried at the
 * bottom, because the strongest argument this product has is that you can
 * go and use it right now.
 *
 * Every claim here is about something that exists and can be clicked
 * through to. Nothing is aspirational, and the pricing block says plainly
 * that no payment is taken, because a quiet pricing box reads as a card
 * form.
 */

const DEMOS = [
  {
    slug: 'bobbys',
    name: "Bobby's",
    kind: 'Vegetarian Indian kitchen',
    dishes: '171 dishes',
    tables: '20 tables',
    note: 'A full printed menu book, numbered exactly as the paper version.',
  },
  {
    slug: 'starvashnu',
    name: 'Star Vashnu Dhaba',
    kind: 'Vegetarian, Italian & Indo-Chinese',
    dishes: '163 dishes',
    tables: '12 tables',
    note: 'Three cuisines under one roof, with photography on the cards that have it.',
  },
  {
    slug: 'feastindia',
    name: 'Feast India',
    kind: 'Tandoor, curry house & grill',
    dishes: '26 dishes',
    tables: '16 tables',
    note: 'A newly onboarded restaurant, on its own domain.',
  },
]

const SURFACES = [
  {
    id: 'guest',
    eyebrow: 'The guest’s own phone',
    title: 'They order before you’ve crossed the room',
    lead: 'No app to download, no hardware to buy, nothing to charge overnight. They scan the code on the table and your menu is in their hand — but only a waiter can let them order.',
    points: [
      'Scanning opens the menu to read, and does nothing else',
      'A waiter takes a first name and hands over a short code',
      'That code is what unlocks ordering, so nobody orders uninvited',
      'Diet and allergen marks on every dish, nuts tracked separately',
      'Order notes in the guest’s own words, straight to the pass',
      'A live countdown once the kitchen quotes a time',
      'Several codes on one table, so eight people can split a bill',
    ],
    Mock: PhoneMock,
    mockWrap: 'flex justify-center',
  },
  {
    id: 'floor',
    eyebrow: 'The floor, on a tablet',
    title: 'The room on one screen, shaped like the room',
    lead: 'Not a list of table numbers. The actual layout, with who is sitting where and which tables still need wiping down.',
    points: [
      'Live table states, including “guests gone, not yet cleared”',
      'Seat a party under their first name and hand them a code in one tap',
      'Push 6, 7 and 8 together into one party and one bill',
      'Join latecomers to a table already eating, or merge two parties',
      'Settle by cash or card at the table and close the tab',
      'Takings and covers, visible only to the roles you choose',
    ],
    Mock: FloorMock,
    mockWrap: '',
  },
  {
    id: 'pass',
    eyebrow: 'The pass',
    title: 'A ticket rail that never stops counting',
    lead: 'Built for a hot, bright, wet-handed metre of stainless steel — high contrast, big type, readable at arm’s length.',
    points: [
      'An elapsed clock on every ticket until it is away',
      'Fire a ticket and quote a time; the guest’s phone updates as you do',
      'Mark a dish off and it greys out on every table at once',
      'Order notes shown with the ticket, not hidden behind a tap',
      'One tap to ready — the waiter running it already knows',
      'Nothing to install; it is a browser tab on any screen you own',
    ],
    Mock: PassMock,
    mockWrap: '',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Send us your menu',
    body: 'Spreadsheet, PDF, or photographs of the printed book. Loading it properly is the real work of onboarding, and it is work we do rather than work we hand you as a template.',
  },
  {
    n: '02',
    title: 'Get your own address',
    body: `You live at yourname.${PRIMARY_DOMAIN}, with your name on it and nobody else's data anywhere near it. Bring your own domain instead if you have one.`,
  },
  {
    n: '03',
    title: 'Add your team',
    body: 'Owner, manager, waiter and kitchen, with fourteen permissions you set yourself. Everyone chooses their own password from a link — you never hold anybody else’s.',
  },
  {
    n: '04',
    title: 'Print the codes',
    body: 'One QR sticker per table and the room is live. A guest scans it and is reading your menu before a waiter has crossed the floor.',
  },
]

const FAQS = [
  {
    q: 'Do our guests have to download anything?',
    a: 'No. They scan the code on the table and the menu opens in whatever browser their phone already has. There is no app, no account and no sign-up. Scanning only opens the menu to read — a waiter hands over a short code when the party is seated, and that is what lets them order.',
  },
  {
    q: 'What hardware do we need to buy?',
    a: 'None. The floor plan and the kitchen screen are browser tabs — they run on a tablet, an old laptop or a monitor you already own. If it opens a web page, it runs Happy Table.',
  },
  {
    q: 'How do guests pay?',
    a: 'At the table, by cash or card, exactly as they do now. Happy Table records what was ordered and totals the bill; it does not take payments from your guests and does not sit between you and your money.',
  },
  {
    q: 'Can one party sit across several tables?',
    a: 'Yes, and it is one of the things the app is actually built around. Push tables together and they become one party with one bill. Latecomers can join a table already eating, and two parties can be merged outright.',
  },
  {
    q: 'Can a waiter see the day’s takings?',
    a: 'Only if you say so. Permissions are set per action rather than per screen, so “the manager runs service but does not see the money” is a rule you can actually write. Changes take effect on every signed-in device immediately.',
  },
  {
    q: 'What happens to our data if we leave?',
    a: 'It is yours. Your menu, your orders and your staff list live under your restaurant alone and are never mixed with anyone else’s. Ask and we will export it.',
  },
]

export default function HappyTableLanding() {
  return (
    <div className="min-h-full">
      <SiteHeader />

      <main>
        <Hero />
        <Demos />
        <Surfaces />
        <HowItWorks />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <a href="#top" className="font-display text-[20px] leading-none">
          Happy Table
        </a>

        <nav className="hidden items-center gap-7 text-[13px] text-ink-soft md:flex">
          <a href="#demos" className="transition-colors hover:text-ink">
            See it running
          </a>
          <a href="#surfaces" className="transition-colors hover:text-ink">
            The three screens
          </a>
          <a href="#pricing" className="transition-colors hover:text-ink">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-ink">
            Questions
          </a>
        </nav>

        {/* On a phone there is room for one button, and it is not the one
            for us. The visitor's CTA stays; the operator console moves to
            the footer, where the three people who need it will look. */}
        <div className="flex items-center gap-2">
          <a
            href={`mailto:hello@${PRIMARY_DOMAIN}?subject=Happy%20Table%20enquiry`}
            className="rounded-control bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Get set up
          </a>
          <Link
            to="/admin/login"
            className="hidden rounded-control border border-line-strong bg-raised px-3.5 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:text-ink sm:block"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section id="top" className="wash relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-12 lg:pb-20 lg:pt-20">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-pill border border-accent/30 bg-accent-wash px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            Three restaurants running it today
          </span>

          <h1 className="mt-6 font-display text-[44px] leading-[1.02] tracking-[-0.01em] sm:text-[60px] lg:text-[68px]">
            The zero-hardware restaurant operating system
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            Your guests order from the phone already in their pocket. Your floor
            runs on a tablet showing the room as it actually is. Your pass gets
            a ticket rail that never loses a ticket and never stops counting.
            Nothing to buy, nothing to mount, nothing to replace in two years.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#demos"
              className="inline-flex items-center justify-center gap-2 rounded-control bg-accent px-6 py-4 text-[15px] font-semibold text-white shadow-raise transition-colors hover:bg-accent-hover"
            >
              Open a real restaurant
              <span aria-hidden>&rarr;</span>
            </a>
            <a
              href={`mailto:hello@${PRIMARY_DOMAIN}?subject=Happy%20Table%20enquiry`}
              className="inline-flex items-center justify-center rounded-control border border-line-strong bg-raised px-6 py-4 text-[15px] font-semibold text-ink transition-colors hover:bg-line"
            >
              Talk to us
            </a>
          </div>

          <p className="mt-5 text-[13px] text-ink-faint">
            &pound;30 a month per restaurant &middot; no card needed to look
            &middot; we load your menu for you
          </p>
        </Reveal>

        <Reveal delay={120} className="lg:pl-4">
          <HeroShowcase />
        </Reveal>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function Demos() {
  return (
    <section id="demos" className="scroll-mt-16 border-b border-line bg-sunken">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <Reveal>
          <SectionHead
            eyebrow="Not a video"
            title="Three restaurants, open right now"
            body="Complete restaurants with their real menus in them. Open one and you are standing in it — browse as a guest, sign in as the owner, watch a ticket land on the pass."
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {DEMOS.map((demo, index) => (
            <Reveal key={demo.slug} delay={index * 90}>
              <DemoCard {...demo} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-7 max-w-2xl text-[13px] leading-relaxed text-ink-faint">
            Every demo signs in with the password{' '}
            <span className="tabular text-ink-soft">demo1234</span>. Each
            restaurant&rsquo;s own sign-in screen lists its people, so you can
            come in as the owner, a waiter or the kitchen and see exactly how
            much each of them is shown.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function DemoCard({ slug, name, kind, dishes, tables, note }) {
  return (
    <div className="flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-colors hover:border-line-strong">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-faint">
        {kind}
      </p>
      <h3 className="mt-2 font-display text-[26px] leading-tight">{name}</h3>
      <p className="tabular mt-1.5 text-[12px] text-ink-faint">
        {dishes} &middot; {tables}
      </p>
      <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{note}</p>

      <a
        href={tenantUrl(slug, '/')}
        className="mt-5 flex items-center justify-center gap-2 rounded-control bg-accent px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Open {name}
        <span aria-hidden>&rarr;</span>
      </a>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <DemoLink href={tenantUrl(slug, '/customer/3')} label="Guest" />
        <DemoLink href={tenantUrl(slug, '/manager')} label="Floor" />
        <DemoLink href={tenantUrl(slug, '/kitchen')} label="Pass" />
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
    <section id="surfaces" className="scroll-mt-16 border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <Reveal>
          <SectionHead
            eyebrow="One subscription, three screens"
            title="Everybody gets the screen built for where they stand"
            body="A guest at a table, a waiter crossing the room and a chef at a hot pass are doing three different jobs in three different conditions. They do not want one interface between them, so they do not get one."
          />
        </Reveal>

        <div className="mt-14 space-y-16 sm:space-y-20">
          {SURFACES.map((surface, index) => (
            <Reveal
              key={surface.id}
              className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                index % 2 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
                  {surface.eyebrow}
                </p>
                <h3 className="mt-3 font-display text-[32px] leading-[1.1] sm:text-[38px]">
                  {surface.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                  {surface.lead}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {surface.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-[14px] leading-relaxed">
                      <span
                        aria-hidden
                        className="mt-[8px] size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <span className="text-ink-soft">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={surface.mockWrap}>
                <surface.Mock />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function HowItWorks() {
  return (
    <section className="border-b border-line bg-sunken">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <Reveal>
          <SectionHead
            eyebrow="Getting started"
            title="Live in four steps, and only one of them is yours"
            body="You send us a menu. We do the rest, and we do not charge you for it."
          />
        </Reveal>

        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Reveal key={step.n} as="li" delay={index * 80}>
              <div className="flex h-full flex-col rounded-card border border-line bg-surface p-5">
                <span className="font-display text-[26px] leading-none text-accent">
                  {step.n}
                </span>
                <h3 className="mt-3.5 text-[16px] font-semibold leading-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <Reveal className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-center">
          <div>
            <SectionHead
              eyebrow="Pricing"
              title="£30 a month, per restaurant"
              body="One price for all three screens and everyone who works for you. No per-cover fee, no commission on what your guests spend, no charge for adding a waiter."
            />

            <ul className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {[
                'Unlimited staff accounts',
                'Unlimited tables',
                'Your whole menu, however long',
                'Your own subdomain',
                'Your own domain, if you prefer',
                'Menu loading and setup included',
              ].map((line) => (
                <li key={line} className="flex gap-2.5 text-[14px] leading-relaxed">
                  <span aria-hidden className="mt-[8px] size-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-ink-soft">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-accent/40 bg-accent-wash p-6 sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
              Standard plan
            </p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-[52px] leading-none">&pound;30</span>
              <span className="text-[14px] text-ink-faint">per month</span>
            </p>
            <p className="mt-3.5 text-[14px] leading-relaxed text-ink-soft">
              Tell us your name, your menu and how many tables you have. We set
              up a restaurant with your own dishes in it for you to try.
            </p>

            <a
              href={`mailto:hello@${PRIMARY_DOMAIN}?subject=Happy%20Table%20enquiry`}
              className="mt-6 flex items-center justify-center gap-2 rounded-control bg-accent px-5 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              hello@{PRIMARY_DOMAIN}
            </a>

            {/* Said plainly, because a pricing box that stays quiet about this
                is the kind of quiet that gets read as a card form. */}
            <p className="mt-4 text-[12px] leading-relaxed text-ink-faint">
              There is no card form and no sign-up wizard. We set your
              restaurant up by hand and invoice you directly. The app takes no
              payment from you here and none from your guests, who pay at the
              table exactly as they do now.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 border-b border-line bg-sunken">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <Reveal>
          <SectionHead eyebrow="Questions" title="The ones we get asked" />
        </Reveal>

        <div className="mt-9 divide-y divide-line border-y border-line">
          {FAQS.map((faq, index) => (
            <Reveal key={faq.q} delay={index * 50}>
              {/* <details> rather than a JavaScript accordion: it opens
                  without us, it is findable by the browser's own in-page
                  search, and it prints. */}
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-semibold leading-snug marker:hidden">
                  {faq.q}
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 text-[18px] leading-none text-ink-faint transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 pr-8 text-[14px] leading-relaxed text-ink-soft">
                  {faq.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function FinalCta() {
  return (
    <section className="wash">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:py-24">
        <Reveal>
          <h2 className="font-display text-[38px] leading-[1.08] sm:text-[48px]">
            Put the menu in their hands before the waiter gets there
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-ink-soft">
            Send us your menu and we will build you a restaurant to try, with
            your own dishes in it.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`mailto:hello@${PRIMARY_DOMAIN}?subject=Happy%20Table%20enquiry`}
              className="inline-flex items-center justify-center gap-2 rounded-control bg-accent px-7 py-4 text-[15px] font-semibold text-white shadow-raise transition-colors hover:bg-accent-hover"
            >
              hello@{PRIMARY_DOMAIN}
            </a>
            <a
              href="#demos"
              className="inline-flex items-center justify-center rounded-control border border-line-strong bg-raised px-7 py-4 text-[15px] font-semibold text-ink transition-colors hover:bg-line"
            >
              Have a look first
            </a>
          </div>
        </Reveal>
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
      <h2 className="mt-3 font-display text-[34px] leading-[1.08] sm:text-[42px]">
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
            <p className="font-display text-[18px] leading-none">Happy Table</p>
            <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-ink-faint">
              Guest ordering, floor management and kitchen display, for
              restaurants that would rather not buy a till.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-faint">
            <a href="#demos" className="transition-colors hover:text-ink">
              See it running
            </a>
            <a href="#surfaces" className="transition-colors hover:text-ink">
              The three screens
            </a>
            <a href="#pricing" className="transition-colors hover:text-ink">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-ink">
              Questions
            </a>
            <a
              href={`mailto:hello@${PRIMARY_DOMAIN}`}
              className="transition-colors hover:text-ink"
            >
              Contact
            </a>
            <Link to="/admin/login" className="transition-colors hover:text-ink">
              Platform admin
            </Link>
          </nav>
        </div>

        <p className="mt-9 border-t border-line pt-6 text-[12px] text-ink-faint">
          Already work at a restaurant that uses Happy Table? Your sign-in is on
          your own restaurant&rsquo;s address, not here &mdash;{' '}
          <span className="text-ink-soft">yourname.{PRIMARY_DOMAIN}</span>.
        </p>
      </div>
    </footer>
  )
}
