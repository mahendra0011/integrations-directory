o# ⚡ IntegrateKit

> The definitive integration directory for MERN Stack developers — real code snippets for Auth, Payments, AI, Database & more.

## 🚀 Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool & dev server
- **Tailwind CSS** — Utility-first CSS
- **Shadcn UI** — Reusable component library
- **Material UI (MUI)** — Component library
- **ReactBits** — React components & animations
- **GSAP** — Scroll & entrance animations
- **Lucide React** — Icon library
- **Framer Motion** — React animation library

## 📁 Folder Structure

```
integrations-directory/
├── public/                          # Static assets
│   └── favicon.svg                  # App favicon
├── src/
│   ├── assets/                      # Images, fonts, static files
│   │   └── images/
│   ├── components/
│   │   ├── layout/                  # Layout components
│   │   │   ├── Layout.jsx           # Main layout wrapper
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   └── Footer.jsx           # Site footer
│   │   ├── sections/                # Page section components
│   │   │   ├── Hero.jsx             # Hero section with terminal
│   │   │   ├── Stats.jsx            # Statistics counter section
│   │   │   ├── Marquee.jsx          # Infinite scrolling marquee
│   │   │   ├── BrowseIntegrations.jsx # Integration browsing section
│   │   │   ├── HowItWorks.jsx       # How it works 3-step section
│   │   │   ├── CodeShowcase.jsx     # Code showcase section
│   │   │   └── CTA.jsx             # Call-to-action newsletter section
│   │   ├── integrations/            # Integration-specific components
│   │   │   ├── IntegrationCard.jsx  # Individual integration card
│   │   │   ├── IntegrationGrid.jsx  # Grid of integration cards
│   │   │   ├── IntegrationModal.jsx # Integration detail modal
│   │   │   └── IntegrationDropdown.jsx # Nav dropdown for integrations
│   │   ├── shared/                  # Shared/reusable components
│   │   │   └── FilterPills.jsx      # Category filter pills
│   │   ├── ui/                      # Shadcn UI primitives
│   │   │   ├── button.jsx           # Button component
│   │   │   ├── badge.jsx            # Badge component
│   │   │   ├── card.jsx             # Card component
│   │   │   ├── dialog.jsx           # Dialog/modal component
│   │   │   └── input.jsx            # Input component
│   │   └── theme-provider.jsx       # Theme context provider
│   ├── data/                        # Static data files
│   │   └── integrations.js          # Integration data & metadata
│   ├── hooks/                       # Custom React hooks
│   │   ├── useScrollReveal.js       # Scroll reveal animation hook
│   │   └── useGSAP.js              # GSAP animation hook
│   ├── lib/                         # Utility functions
│   │   └── utils.js                 # cn() utility for Tailwind
│   ├── styles/                      # Global styles
│   │   └── globals.css              # Tailwind + CSS variables
│   ├── App.jsx                      # Root App component
│   └── main.jsx                     # Entry point
├── .gitignore
├── components.json                  # Shadcn UI configuration
├── jsconfig.json                    # Path aliases config
├── package.json                     # Dependencies & scripts
├── postcss.config.js                # PostCSS config (Tailwind)
├── tailwind.config.js               # Tailwind CSS configuration
├── vite.config.js                   # Vite configuration
└── index.html                       # HTML entry point
```

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Available Integrations

| # | Integration | Category | Description |
|---|-------------|----------|-------------|
| 1 | Clerk | Auth | Complete Authentication for React Apps |
| 2 | Auth0 | Auth | Enterprise-Grade Authentication Platform |
| 3 | Stripe | Payments | The Gold Standard for Online Payments |
| 4 | Razorpay | Payments | India's Leading Payment Gateway |
| 5 | OpenAI | AI & ML | GPT-4o & DALL·E APIs |
| 6 | Claude | AI & ML | Safe, Reliable AI for Enterprise |
| 7 | MongoDB Atlas | Database | Fully Managed Cloud MongoDB |
| 8 | Redis | Database | In-Memory Data Store |
| 9 | Cloudinary | Storage | Image & Video CDN |
| 10 | Socket.IO | Realtime | Bidirectional Event Communication |

## 🎨 Design System

- **Fonts:** Inter (body), JetBrains Mono (code)
- **Colors:** Black/White/Gray scale with Indigo accent (#6366F1)
- **Components:** Shadcn UI primitives with custom brand styles
- **Animations:** GSAP ScrollTrigger, CSS transitions, Framer Motion

## 📄 License

MIT