import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { INTEGRATIONS, CAT_META } from '@/data/integrations';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Brain,
  Braces,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Database,
  ExternalLink,
  GitBranch,
  Globe2,
  Image as ImageIcon,
  Info,
  KeyRound,
  Link as LinkIcon,
  ListChecks,
  Lock,
  Package,
  RefreshCw,
  Route,
  Server,
  Settings2,
  ShieldCheck,
  Terminal,
  TestTube2,
  Users,
  Webhook,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react';

const SECTION_GROUPS = [
  {
    title: 'Overview',
    links: [
      { id: 's-overview', label: 'Overview', icon: Info },
      { id: 's-how', label: 'How it works', icon: Route },
      { id: 's-prereq', label: 'Prerequisites', icon: ListChecks },
    ],
  },
  {
    title: 'Setup Guide',
    links: [
      { id: 's-setup', label: 'Step-by-step setup', icon: Workflow },
      { id: 's-install', label: 'Installation', icon: Package },
      { id: 's-auth', label: 'Authentication', icon: KeyRound },
      { id: 's-config', label: 'Configuration', icon: Settings2 },
      { id: 's-embed', label: 'Code implementation', icon: Code2 },
      { id: 's-manual', label: 'Manual work', icon: Workflow },
      { id: 's-test', label: 'Testing', icon: TestTube2 },
    ],
  },
  {
    title: 'Reference',
    links: [
      { id: 's-api', label: 'API reference', icon: Braces },
      { id: 's-hooks', label: 'Webhooks', icon: Webhook },
      { id: 's-errors', label: 'Error codes', icon: AlertCircle },
    ],
  },
  {
    title: 'Guides',
    links: [
      { id: 's-bp', label: 'Best practices', icon: ShieldCheck },
      { id: 's-ts', label: 'Troubleshooting', icon: Wrench },
      { id: 's-deep', label: 'Deep notes', icon: Brain },
      { id: 's-links', label: 'Resources', icon: LinkIcon },
    ],
  },
];

const ALL_SECTIONS = SECTION_GROUPS.flatMap((group) => group.links);

const METHOD_STYLES = {
  GET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  POST: 'bg-blue-50 text-blue-700 border-blue-200',
  PUT: 'bg-amber-50 text-amber-700 border-amber-200',
  DEL: 'bg-red-50 text-red-700 border-red-200',
};

const INFO_STYLES = {
  tip: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  warn: 'bg-amber-50 border-amber-200 text-amber-900',
  note: 'bg-blue-50 border-blue-200 text-blue-900',
  danger: 'bg-red-50 border-red-200 text-red-900',
};

function getWorkflowSteps(data) {
  return data.workflowSteps && data.workflowSteps.length > 0 ? data.workflowSteps : [];
}

function getStep(data, number) {
  return getWorkflowSteps(data).find((step) => step.number === number) || getWorkflowSteps(data)[0];
}

function categoryLabel(category) {
  return category?.label || 'Integration';
}

function safeSlug(data) {
  return data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function syntaxHighlight(line) {
  if (!line || line.startsWith('//') || line.startsWith('#')) {
    return <span className="text-white/35 italic">{line || ' '}</span>;
  }
  if (line.startsWith('import ') || line.startsWith('export ')) {
    const keyword = line.startsWith('import ') ? 'import' : 'export';
    return (
      <>
        <span className="text-[#C792EA]">{keyword}</span>
        <span className="text-white/75">{line.slice(keyword.length)}</span>
      </>
    );
  }
  if (line.includes('function ') || line.includes('async ')) {
    const index = line.includes('function ') ? line.indexOf('function') : line.indexOf('async');
    const keyword = line.includes('function ') ? 'function' : 'async';
    return (
      <>
        <span className="text-white/75">{line.slice(0, index)}</span>
        <span className="text-[#82AAFF]">{keyword}</span>
        <span className="text-white/75">{line.slice(index + keyword.length)}</span>
      </>
    );
  }
  if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
    const keyword = line.includes('const ') ? 'const' : line.includes('let ') ? 'let' : 'var';
    const index = line.indexOf(keyword);
    return (
      <>
        <span className="text-white/75">{line.slice(0, index)}</span>
        <span className="text-[#FFCB6B]">{keyword}</span>
        <span className="text-white/75">{line.slice(index + keyword.length)}</span>
      </>
    );
  }
  return <span className="text-white/75">{line}</span>;
}

function CodeBlock({ code, label = 'code', language = 'js' }) {
  const [copied, setCopied] = useState(false);
  const lines = Array.isArray(code) ? code : String(code || '').split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-white/[0.08] bg-[#15161E] shadow-sm">
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.03] px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <Terminal size={12} className="ml-1 text-white/25" />
          <span className="font-mono text-[10px] uppercase text-white/35">{language}</span>
          <span className="font-mono text-[10px] text-white/25">{label}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded border border-white/[0.12] bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-white/60 transition-colors hover:bg-white/[0.11] hover:text-white"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <div className="max-h-[520px] overflow-auto p-4">
        <pre className="font-mono text-[12.5px] leading-[1.75]">
          {lines.map((line, index) => (
            <div key={`${line}-${index}`} className="flex min-h-[22px]">
              <span className="mr-4 w-7 shrink-0 select-none text-right text-white/18">{index + 1}</span>
              <span className="whitespace-pre">{syntaxHighlight(line)}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function SectionHeader({ id, icon: Icon, title, desc }) {
  return (
    <div id={id} data-section={id} className="scroll-mt-8">
      <div className="mb-1 flex items-center gap-2">
        <Icon size={18} className="text-[#6C63FF]" />
        <h2 className="text-[18px] font-medium text-gray-950">{title}</h2>
      </div>
      {desc && <p className="mb-4 max-w-[680px] text-[13px] leading-6 text-gray-500">{desc}</p>}
    </div>
  );
}

function Divider() {
  return <div className="my-9 h-px bg-gray-200" />;
}

function InfoBox({ type = 'note', title, children, icon: Icon = Info }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-[13px] leading-6 ${INFO_STYLES[type] || INFO_STYLES.note}`}>
      <div className="mb-1 flex items-center gap-2 font-medium">
        <Icon size={14} />
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Sidebar({ activeSection }) {
  return (
    <aside className="hidden h-screen w-[230px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white py-5 lg:sticky lg:top-0 lg:block">
      <div className="mb-3 flex items-center gap-2 border-b border-gray-200 px-5 pb-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6C63FF] text-white">
          <Workflow size={15} />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-950">IntegrationDocs</div>
          <div className="text-[11px] text-gray-400">Template v3.0</div>
        </div>
      </div>
      {SECTION_GROUPS.map((group) => (
        <div key={group.title} className="mb-3">
          <div className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-gray-400">
            {group.title}
          </div>
          {group.links.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                className={`flex items-center gap-2 border-l-2 px-5 py-1.5 text-[12.5px] transition-colors ${
                  active
                    ? 'border-[#6C63FF] bg-gray-50 font-medium text-[#6C63FF]'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-950'
                }`}
              >
                <Icon size={14} />
                {label}
              </a>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

function TocGrid() {
  return (
    <div className="mb-9 rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">Contents</div>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {ALL_SECTIONS.map(({ id, label }) => (
          <a key={id} href={`#${id}`} className="flex items-center gap-1.5 py-1 text-[12.5px] text-gray-500 hover:text-[#6C63FF]">
            <span className="font-mono text-[11px] text-gray-300">#</span>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

function ScreenshotFigure({ image, compact = false }) {
  const [failed, setFailed] = useState(false);
  if (!image?.src || failed) {
    return (
      <div className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 text-center">
        <ImageIcon size={28} className="mb-2 text-gray-300" />
        <div className="text-xs font-medium text-gray-500">Screenshot unavailable</div>
        <div className="mt-1 text-[11px] text-gray-400">Use the written setup steps for this page.</div>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
        <ImageIcon size={14} className="text-gray-400" />
        <span className="truncate text-xs font-medium text-gray-500">{image.alt || image.caption || 'Provider screenshot'}</span>
      </div>
      <img
        src={image.src}
        alt={image.alt || image.caption || 'Provider setup screenshot'}
        className={`${compact ? 'h-64' : 'h-80'} w-full bg-gray-50 object-contain`}
        loading={compact ? 'lazy' : 'eager'}
        onError={() => setFailed(true)}
      />
      <figcaption className="border-t border-gray-100 px-3 py-2 text-xs leading-5 text-gray-500">
        {image.caption || 'Use this screenshot as a visual reference for the setup step.'}
      </figcaption>
    </figure>
  );
}

function OverviewCards({ data, category }) {
  const cards = [
    {
      icon: Zap,
      title: 'What it does',
      body: data.summary || data.desc || `${data.name} adds ${categoryLabel(category).toLowerCase()} features to your app.`,
    },
    {
      icon: Users,
      title: "Who it is for",
      body: `Full-stack teams building MERN apps that need ${category.objective}.`,
    },
    {
      icon: Package,
      title: 'What you get',
      body: `${data.npmPackage ? 'SDK package, ' : ''}REST routes, environment setup, manual dashboard steps, screenshots, webhooks, and production checks.`,
    },
    {
      icon: Clock,
      title: 'Time to integrate',
      body: '~15 minutes for a local adapter. Plan about 1 hour for production URLs, logs, webhooks, and runbook notes.',
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
      {cards.map(({ icon: Icon, title, body }) => (
        <div key={title} className="rounded-lg border border-gray-200 bg-white p-4">
          <Icon size={20} className="mb-3 text-[#6C63FF]" />
          <div className="mb-1 text-[13px] font-medium text-gray-950">{title}</div>
          <p className="text-xs leading-5 text-gray-500">{body}</p>
        </div>
      ))}
    </div>
  );
}

function FlowDiagram({ data, category }) {
  const flow = [
    ['Your app', 'React client'],
    ['Express API', category.primaryRoute],
    [data.name, category.resource],
    ['Provider API', 'request or webhook'],
    ['Result', 'data, event, or URL'],
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.07em] text-gray-400">Request flow</div>
      <div className="flex flex-wrap items-center gap-2">
        {flow.map(([title, desc], index) => (
          <React.Fragment key={title}>
            <div className={`min-w-[120px] rounded-md border px-3 py-2 text-center ${
              index === 2 ? 'border-[#AFA9EC] bg-[#EEEDFE] text-[#3C3489]' : 'border-gray-200 bg-gray-50 text-gray-700'
            }`}>
              <div className="mb-1 text-[11px] text-gray-400">{title}</div>
              <div className="truncate text-[12px] font-medium">{desc}</div>
            </div>
            {index < flow.length - 1 && <ChevronRight size={16} className="text-gray-300" />}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-4 border-t border-gray-200 pt-4 text-[13px] leading-6 text-gray-600">
        React calls your server route, the server validates input and credentials, {data.name} handles the provider operation, and async outcomes come back through webhooks or dashboard logs.
      </div>
    </div>
  );
}

function CheckList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[13px] leading-6 text-gray-600">
          <CheckCircle2 size={15} className="mt-1 shrink-0 text-emerald-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ImageGallery({ data }) {
  const images = (data.images || []).slice(0, 6);
  if (!images.length) {
    return (
      <InfoBox type="warn" title="No local screenshot passed quality checks" icon={AlertTriangle}>
        The page still keeps written manual steps and may use the official live website preview where a local screenshot was blank or too small.
      </InfoBox>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {images.map((image, index) => (
        <ScreenshotFigure key={`${image.src}-${index}`} image={image} compact />
      ))}
    </div>
  );
}

function SetupStepCard({ data, category, step }) {
  const manualLines = step.image?.manualSteps || [];
  const codeLines = Array.isArray(step.code) ? step.code.filter(Boolean) : [];
  const hasCode = codeLines.length > 0;
  const verificationItems = [
    `The visible ${data.name} page matches the screenshot or written page hint.`,
    `The dashboard action for "${step.title}" is saved in the correct workspace or environment.`,
    `Any ${category.credential} created in this step is stored outside React and outside git.`,
    'A note exists in the runbook with owner, environment, and rollback detail.',
  ];

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6C63FF] font-mono text-sm font-bold text-white">
            {step.number}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-medium text-gray-950">{step.title}</h3>
            <p className="mt-0.5 text-[12.5px] leading-5 text-gray-500">
              {step.manual ? 'Manual dashboard work' : 'Code and verification work'} for {data.name}.
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.05em] ${
            step.manual ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {step.manual ? 'Manual' : 'Code'}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-4">
        <div className="min-w-0 space-y-4">
          <p className="text-[13px] leading-6 text-gray-600">{step.description}</p>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-gray-400">Where to go</div>
              <p className="text-[12.5px] leading-5 text-gray-700">{step.pageHint || 'Provider dashboard or docs'}</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-gray-400">What to click</div>
              <p className="text-[12.5px] leading-5 text-gray-700">{step.buttonHint || 'Save or continue'}</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-gray-400">Expected result</div>
              <p className="text-[12.5px] leading-5 text-gray-700">
                {manualLines[2] || `This step supports ${category.objective}.`}
              </p>
            </div>
          </div>

          {manualLines.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-950">
                <ListChecks size={15} className="text-[#6C63FF]" />
                Manual actions for this step
              </div>
              <ol className="space-y-2">
                {manualLines.map((line, index) => (
                  <li key={line} className="flex gap-3 text-[13px] leading-6 text-gray-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 font-mono text-[10px] text-gray-500">
                      {index + 1}
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {hasCode && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-950">
                <Code2 size={15} className="text-[#6C63FF]" />
                Code or command for this step
              </div>
              <CodeBlock
                code={codeLines}
                label={step.number === 6 ? '.env' : step.number === 7 ? 'terminal' : `${safeSlug(data)}-step-${step.number}.js`}
                language={step.number === 6 ? 'env' : step.number === 7 ? 'bash' : 'js'}
              />
            </div>
          )}

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-900">
              <CheckCircle2 size={15} />
              Verify before moving on
            </div>
            <CheckList items={verificationItems} />
          </div>
        </div>

        <div className="min-w-0">
          <ScreenshotFigure image={step.image || data.images?.[0]} />
        </div>
      </div>
    </article>
  );
}

function SetupGuideTimeline({ data, category }) {
  const steps = getWorkflowSteps(data);
  if (!steps.length) {
    return (
      <InfoBox type="warn" title="No generated setup steps" icon={AlertTriangle}>
        This integration is missing workflow steps. Regenerate the catalog before publishing this page.
      </InfoBox>
    );
  }

  return (
    <div className="space-y-5">
      <InfoBox type="note" title="Follow these in order" icon={Workflow}>
        This setup guide covers every required phase: official provider path, account and workspace, provider resource, URLs and domains, restricted credentials, environment variables, SDK or adapter code, app wiring, log verification, and production runbook.
      </InfoBox>
      {steps.map((step) => (
        <SetupStepCard key={step.number} data={data} category={category} step={step} />
      ))}
    </div>
  );
}

function InstallSection({ data }) {
  const packageName = data.npmPackage || '';
  const installLines = [
    '# Install Express, dotenv, and the provider SDK when available',
    data.installCommand || `npm install express dotenv ${packageName}`.trim(),
    packageName ? `yarn add express dotenv ${packageName}` : 'yarn add express dotenv',
    packageName ? `pnpm add express dotenv ${packageName}` : 'pnpm add express dotenv',
  ];

  return (
    <>
      <CodeBlock code={installLines} label="terminal" language="bash" />
      <InfoBox type="note" title="Version pinning" icon={RefreshCw}>
        Pin the SDK version in production and review the provider changelog before upgrading. If {data.name} does not publish an official SDK for your use case, keep the REST adapter behind Express.
      </InfoBox>
    </>
  );
}

function AuthSection({ data, category }) {
  const keyStep = getStep(data, 5);
  const image = keyStep?.image || data.images?.[0];

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6C63FF] text-sm font-medium text-white">1</div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-sm font-medium text-gray-950">Create restricted credentials</h3>
          <p className="mb-3 text-[13px] leading-6 text-gray-600">
            In {data.name}, open the credentials or API key area and create only the permissions needed for {category.objective}.
          </p>
          <ScreenshotFigure image={image} />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">2</div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-sm font-medium text-gray-950">Store values once and keep secrets server-side</h3>
          <p className="text-[13px] leading-6 text-gray-600">
            Store {category.credential} in `.env`, deployment secrets, or a secret manager. Public browser values must use clear names and never include server secrets.
          </p>
          <InfoBox type="warn" title="Security rule" icon={AlertTriangle}>

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6C63FF] text-sm font-medium text-white">1</div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-sm font-medium text-gray-950">Create restricted credentials</h3>
          <p className="mb-3 text-[13px] leading-6 text-gray-600">
            In {data.name}, open the credentials or API key area and create only the permissions needed for {category.objective}.
          </p>
          <ScreenshotFigure image={image} />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">2</div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-sm font-medium text-gray-950">Store values once and keep secrets server-side</h3>
          <p className="text-[13px] leading-6 text-gray-600">
            Store {category.credential} in `.env`, deployment secrets, or a secret manager. Public browser values must use clear names and never include server secrets.
          </p>
          <InfoBox type="warn" title="Security rule" icon={AlertTriangle}>
            Never put {data.name} secret keys in React code, screenshots, git commits, issue trackers, or public configuration files.
          </InfoBox>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['Secret value', 'Server only. Used by Express routes and background jobs.'],
          ['Public value', 'Browser safe only when the provider explicitly marks it public.'],
          ['Webhook secret', 'Used to verify incoming events before trusting payloads.'],
          ['Sandbox value', 'Use for local and staging tests before production credentials.'],
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-1 font-mono text-[11.5px] font-semibold text-[#6C63FF]">{title}</div>
            <div className="text-[12.5px] leading-5 text-gray-600">{body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfigSection({ data, category }) {
  const envRows = (data.envExample || []).filter((line) => line && !line.startsWith('#') && line.includes('='));
  const initCode = [
    'import express from "express";',
    'import "dotenv/config";',
    '',
    `const ${safeSlug(data).replace(/-/g, '')}Config = {`,
    `  provider: "${data.name}",`,
    `  baseUrl: process.env.${data.envPrefix || safeSlug(data).toUpperCase()}_API_BASE_URL,`,
    `  route: "${category.primaryRoute}",`,
    '};',
    '',
    'export function requireProviderConfig(config) {',
    '  const missing = Object.entries(config).filter(([, value]) => !value);',
    '  if (missing.length) throw new Error("Missing provider configuration");',
    '  return config;',
    '}',
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-[13px] font-medium text-gray-950">Environment variables</div>
        <CodeBlock code={data.envExample || []} label=".env" language="env" />
        <div className="grid gap-2">
          {envRows.slice(0, 6).map((line) => {
            const [key] = line.split('=');
            const secret = /SECRET|KEY|TOKEN|PASSWORD/i.test(key);
            return (
              <div key={key} className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 text-[12.5px]">
                <span className={`h-2 w-2 rounded-full ${secret ? 'bg-amber-500' : 'bg-emerald-600'}`} />
                <span className="flex-1 font-mono text-[11.5px] text-gray-800">{key}</span>
                <span className="text-gray-400">{secret ? 'server secret' : 'configuration'}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div className="mb-2 text-[13px] font-medium text-gray-950">SDK or REST initialization</div>
        <CodeBlock code={initCode} label={`${safeSlug(data)}-config.js`} />
        <InfoBox type="tip" title="Code explanation" icon={Info}>
          Create configuration once, fail fast when a required value is missing, then reuse the adapter from your Express routes instead of instantiating provider clients inside React.
        </InfoBox>
      </div>
    </div>
  );
}

function ManualWorkPanel({ data }) {
  const manual = data.manualWork;
  if (!manual) return null;

  return (
    <div className="space-y-4">
      <InfoBox type="warn" title={manual.title || 'Manual Work Required'} icon={ShieldCheck}>
        {manual.summary}
      </InfoBox>
      <div className="grid gap-3 md:grid-cols-2">
        {(manual.steps || []).map((step, index) => (
          <div key={step} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-950 font-mono text-xs font-bold text-white">
              {index + 1}
            </span>
            <p className="text-[12.5px] leading-5 text-gray-600">{step}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm font-medium text-gray-950">Final checklist</div>
        <div className="grid gap-x-5 gap-y-1 md:grid-cols-2">
          <CheckList items={(manual.checklist || []).slice(0, 10)} />
        </div>
      </div>
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-900">
          <AlertTriangle size={15} />
          Security and setup warnings
        </div>
        <ul className="space-y-2">
          {(manual.warnings || []).map((warning) => (
            <li key={warning} className="text-[13px] leading-6 text-red-800">{warning}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TestingSection({ data, category }) {
  const testStep = getStep(data, 9);
  const lines = [
    '# Start the Express adapter',
    'npm run dev',
    '',
    '# Send a smoke-test request to your local route',
    `curl -X ${data.cat === 'auth' ? 'GET' : 'POST'} http://localhost:5000${category.primaryRoute} \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"demo": true}'`,
  ];

  return (
    <div className="space-y-4">
      <CodeBlock code={lines} label="smoke-test.sh" language="bash" />
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm font-medium text-gray-950">Verify these before release</div>
        <CheckList
          items={[
            'The local request returns an expected 2xx or documented validation response.',
            `${data.name} dashboard logs show the request, event, or audit entry.`,
            'Errors include sanitized provider name, status, request ID, and duration.',
            'Production URLs and secrets are configured separately from localhost.',
            'Runbook notes explain rollback, key rotation, and owner contact.',
          ]}
        />
      </div>
      <ScreenshotFigure image={testStep?.image || data.images?.[0]} />
    </div>
  );
}

function CodeImplementation({ data }) {
  return (
    <div className="space-y-3">
      <InfoBox type="note" title="Server-only adapter" icon={Server}>
        This code is intentionally Express-first. React should call your backend route, while {data.name} secrets stay in Node or your deployment secret manager.
      </InfoBox>
      <CodeBlock code={data.code || []} label={`${safeSlug(data)}.js`} />
    </div>
  );
}

function apiEndpoints(data, category) {
  const route = category.primaryRoute || `/api/${safeSlug(data)}`;
  return [
    {
      method: 'GET',
      path: `/api/${safeSlug(data)}/health`,
      label: 'Check local configuration',
      params: [
        ['provider', 'string', 'optional', 'Provider name returned for diagnostics.'],
        ['environment', 'string', 'optional', 'development, staging, or production context.'],
      ],
    },
    {
      method: 'POST',
      path: route,
      label: `Run the ${categoryLabel(category).toLowerCase()} operation`,
      params: [
        ['payload', 'object', 'required', `Validated request body for ${data.name}.`],
        ['idempotencyKey', 'string', 'optional', 'Use on write actions to avoid duplicate work.'],
        ['metadata', 'object', 'optional', 'Redacted tracking data for logs and support.'],
      ],
    },
    {
      method: 'POST',
      path: `/api/webhooks/${safeSlug(data)}`,
      label: 'Receive provider events',
      params: [
        ['signature', 'header', 'required', 'Provider signing header used for verification.'],
        ['event', 'object', 'required', 'Raw event payload from the provider.'],
      ],
    },
  ];
}

function EndpointCard({ endpoint }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
        <span className={`rounded border px-2 py-0.5 font-mono text-[11px] font-bold ${METHOD_STYLES[endpoint.method] || METHOD_STYLES.POST}`}>
          {endpoint.method}
        </span>
        <code className="font-mono text-[12.5px] text-gray-950">{endpoint.path}</code>
        <span className="ml-auto hidden text-xs text-gray-400 sm:inline">{endpoint.label}</span>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[560px] border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-gray-200 text-left text-[11px] uppercase tracking-[0.05em] text-gray-400">
              <th className="px-2 py-2 font-medium">Parameter</th>
              <th className="px-2 py-2 font-medium">Type</th>
              <th className="px-2 py-2 font-medium">Required</th>
              <th className="px-2 py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {endpoint.params.map(([name, type, required, desc]) => (
              <tr key={name} className="border-b border-gray-100 last:border-0">
                <td className="px-2 py-2 font-mono text-[11.5px] text-[#6C63FF]">{name}</td>
                <td className="px-2 py-2"><span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-600">{type}</span></td>
                <td className="px-2 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${required === 'required' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{required}</span></td>
                <td className="px-2 py-2 text-gray-600">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiReference({ data, category }) {
  return (
    <div className="space-y-4">
      {apiEndpoints(data, category).map((endpoint) => (
        <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
      ))}
      <CodeBlock
        label="json-response"
        language="json"
        code={[
          '{',
          `  "provider": "${data.name}",`,
          '  "ok": true,',
          '  "requestId": "req_xxxxxxxxxxxx",',
          '  "data": {},',
          '  "checkedAt": "2026-06-18T10:00:00.000Z"',
          '}',
        ]}
      />
    </div>
  );
}

function webhookEvents(data, category) {
  const byCategory = {
    auth: [
      ['user.created', 'A user registered or was provisioned.'],
      ['session.created', 'A session was established and should be synced.'],
      ['token.revoked', 'A credential was revoked and cached access should be cleared.'],
    ],
    payments: [
      ['checkout.completed', 'A checkout or order was paid successfully.'],
      ['payment.failed', 'A payment failed and the user should be notified.'],
      ['refund.created', 'A refund was created and local records should update.'],
    ],
    database: [
      ['record.changed', 'A synced record changed in the provider system.'],
      ['backup.completed', 'A backup or export job completed.'],
      ['migration.failed', 'A schema or sync job failed and needs attention.'],
    ],
    email: [
      ['email.delivered', 'The message reached the receiving server.'],
      ['email.bounced', 'The recipient rejected the message.'],
      ['spam.complaint', 'A recipient reported the message as spam.'],
    ],
    storage: [
      ['file.uploaded', 'A file upload finished and metadata can be saved.'],
      ['file.deleted', 'A file was removed and local references should update.'],
      ['transform.completed', 'A media transform or processing job finished.'],
    ],
    ai: [
      ['job.completed', 'An async model, audio, or batch job completed.'],
      ['job.failed', 'An async generation failed and needs retry or review.'],
      ['usage.threshold', 'Usage crossed a budget or safety threshold.'],
    ],
    search: [
      ['index.updated', 'Documents were indexed or deleted.'],
      ['query.no_results', 'A search query returned no results and may need tuning.'],
      ['synonym.changed', 'Ranking or synonym configuration changed.'],
    ],
    realtime: [
      ['channel.message', 'A realtime message was published.'],
      ['member.joined', 'A client joined a channel or room.'],
      ['presence.updated', 'Presence state changed for a user or device.'],
    ],
    maps: [
      ['geocode.completed', 'A location lookup completed.'],
      ['route.failed', 'A route or distance request failed.'],
      ['quota.warning', 'Map or geocoding usage is near a limit.'],
    ],
    analytics: [
      ['event.ingested', 'An analytics event was accepted.'],
      ['alert.triggered', 'A metric, error, or release alert fired.'],
      ['export.completed', 'A data export or report finished.'],
    ],
    deployment: [
      ['deploy.succeeded', 'A deployment completed successfully.'],
      ['deploy.failed', 'A deployment failed and rollback may be needed.'],
      ['healthcheck.failed', 'A deployed service stopped passing health checks.'],
    ],
  };
  return byCategory[category?.key] || byCategory.analytics;
}

function WebhookSection({ data, category }) {
  const verifyCode = [
    'import crypto from "crypto";',
    '',
    'function verifySignature(rawBody, signature, secret) {',
    '  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");',
    '  return signature === `sha256=${expected}`;',
    '}',
    '',
    `app.post("/api/webhooks/${safeSlug(data)}", express.raw({ type: "*/*" }), (req, res) => {`,
    '  const signature = req.headers["x-provider-signature"];',
    '  const secret = process.env.WEBHOOK_SECRET;',
    '  if (!verifySignature(req.body, signature, secret)) return res.sendStatus(401);',
    '  res.json({ received: true });',
    '  queueProviderEvent(JSON.parse(req.body.toString("utf8")));',
    '});',
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 text-sm font-medium text-gray-950">Available events to plan for</div>
        <div className="grid gap-2">
          {webhookEvents(data, category).map(([event, desc]) => (
            <div key={event} className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-2">
              <span className="min-w-[170px] font-mono text-[11.5px] text-[#6C63FF]">{event}</span>
              <span className="text-[12.5px] leading-5 text-gray-600">{desc}</span>
            </div>
          ))}
        </div>
      </div>
      <CodeBlock code={verifyCode} label="webhook-handler.js" />
      <InfoBox type="warn" title="Respond quickly" icon={AlertTriangle}>
        Return a 2xx response quickly, then process the event asynchronously. Webhooks are usually delivered at least once, so store processed event IDs.
      </InfoBox>
    </div>
  );
}

function ErrorCodes() {
  const rows = [
    ['400', 'validation_failed', 'Bad request body', 'Check the fields array and server-side validation.'],
    ['401', 'unauthorized', 'Missing or invalid key', 'Verify environment variables and rotate exposed keys.'],
    ['403', 'forbidden', 'Key lacks permission', 'Enable the required scope or create a narrower key.'],
    ['404', 'not_found', 'Resource does not exist', 'Check ID, route, provider environment, and ownership.'],
    ['409', 'conflict', 'Duplicate or conflicting write', 'Use idempotency keys and check existing state first.'],
    ['429', 'rate_limited', 'Too many requests', 'Add queueing, backoff, and user-facing retry states.'],
    ['500', 'server_error', 'Provider-side failure', 'Retry with backoff and check provider status.'],
  ];

  return (
    <div className="space-y-4">
      <CodeBlock
        label="error-envelope.json"
        language="json"
        code={[
          '{',
          '  "error": {',
          '    "code": "validation_failed",',
          '    "message": "Required field is missing",',
          '    "status": 400,',
          '    "requestId": "req_xxxxxxxxxxxx"',
          '  }',
          '}',
        ]}
      />
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[680px] border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-[0.05em] text-gray-500">
              <th className="px-3 py-2 font-medium">HTTP</th>
              <th className="px-3 py-2 font-medium">Code</th>
              <th className="px-3 py-2 font-medium">Meaning</th>
              <th className="px-3 py-2 font-medium">How to fix</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([http, code, meaning, fix]) => (
              <tr key={code} className="border-t border-gray-100">
                <td className="px-3 py-2 font-mono text-red-600">{http}</td>
                <td className="px-3 py-2"><code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11.5px]">{code}</code></td>
                <td className="px-3 py-2 text-gray-600">{meaning}</td>
                <td className="px-3 py-2 text-gray-600">{fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BestPractices({ items }) {
  const icons = [KeyRound, Clock, RefreshCw, Database, Activity, Webhook, Lock, Server];
  return (
    <div className="space-y-3">
      {(items || []).slice(0, 8).map((item, index) => {
        const Icon = icons[index % icons.length];
        const [head, ...rest] = item.split(':');
        return (
          <div key={item} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-1 flex items-center gap-2 text-[13.5px] font-medium text-gray-950">
              <Icon size={16} className="text-[#6C63FF]" />
              <span>{rest.length ? head : `Practice ${index + 1}`}</span>
            </div>
            <p className="text-[13px] leading-6 text-gray-600">{rest.length ? rest.join(':').trim() : item}</p>
          </div>
        );
      })}
    </div>
  );
}

function Troubleshooting({ items, data }) {
  return (
    <div className="space-y-2">
      {(items || []).slice(0, 8).map((item) => {
        const [question, ...answerParts] = item.split(':');
        return (
          <div key={item} className="flex gap-3 rounded-md border border-gray-200 bg-white px-4 py-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6C63FF]" />
            <div className="grid gap-1 md:grid-cols-[220px_1fr]">
              <div className="text-[12.5px] font-medium text-gray-950">{question}</div>
              <div className="text-[12.5px] leading-5 text-gray-600">{answerParts.join(':').trim() || item}</div>
            </div>
          </div>
        );
      })}
      <InfoBox type="tip" title="Still stuck?" icon={Info}>
        Check {data.name} provider logs, your Express logs, deployment secrets, and the request ID from the error envelope before opening a support ticket.
      </InfoBox>
    </div>
  );
}

function deepNotes(data, category) {
  return [
    ['Credential boundaries', `${data.name} secrets must stay in backend configuration. Browser-safe values need separate names and reduced permissions.`],
    ['Webhook delivery', `Treat ${data.name} webhooks as at-least-once delivery. Store event IDs and make handlers idempotent.`],
    ['Rate limits', `Use retries with backoff, but avoid retrying validation failures. Queue high-volume ${categoryLabel(category).toLowerCase()} work.`],
    ['Environment drift', 'Sandbox and production dashboards often have separate URLs, keys, origins, webhooks, and feature flags. Verify both.'],
    ['Image policy', 'Screenshots shown on this page are filtered for size and visual detail; blank or tiny captures are skipped in generated data.'],
    ['Code flow', `React calls Express, Express validates input, the ${data.name} adapter calls the provider, and responses are normalized before returning to the browser.`],
  ];
}

function DeepNotes({ data, category }) {
  return (
    <div className="space-y-3">
      {deepNotes(data, category).map(([label, body]) => (
        <div key={label} className="rounded-r-md border-l-[3px] border-[#6C63FF] bg-gray-50 px-4 py-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6C63FF]">{label}</div>
          <p className="text-[13px] leading-6 text-gray-600">{body}</p>
        </div>
      ))}
    </div>
  );
}

function ResourceLinks({ data }) {
  const resources = [
    ['Official site', data.website, 'Provider homepage and product entry point.', Globe2],
    ['Dashboard', data.website, 'Keys, projects, webhooks, logs, and account settings.', Server],
    ['Full API docs', data.website, 'Endpoint reference, SDK docs, examples, and changelog.', BookOpen],
    ['Status page', data.website, 'Incidents, maintenance, uptime, and service health.', Activity],
    ['SDK package', data.website, data.npmPackage || 'Use REST or provider-specific SDK where available.', Package],
    ['Support', data.website, 'Open a ticket with request ID, environment, and sanitized logs.', LinkIcon],
  ];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
      {resources.map(([title, href, desc, Icon]) => (
        <a
          key={title}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-[#6C63FF]"
        >
          <Icon size={18} className="mb-3 text-[#6C63FF]" />
          <div className="mb-1 flex items-center gap-1 text-[13px] font-medium text-gray-950">
            {title}
            <ExternalLink size={12} className="text-gray-300" />
          </div>
          <p className="text-[11.5px] leading-5 text-gray-500">{desc}</p>
        </a>
      ))}
    </div>
  );
}

export default function IntegrationDetailPage() {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('s-overview');
  const data = INTEGRATIONS.find((integration) => integration.id === parseInt(id, 10));

  const category = data ? CAT_META[data.cat] : null;
  const workflowSteps = useMemo(() => (data ? getWorkflowSteps(data) : []), [data]);

  useEffect(() => {
    if (!data) return;
    window.scrollTo(0, 0);
    document.title = `${data.name} Integration Guide | IntegrateKit`;

    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let current = 's-overview';
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 130) current = section.id;
      });
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.title = 'IntegrateKit';
    };
  }, [data]);

  if (!data || !category) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 text-5xl font-black text-gray-200">404</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-950">Integration not found</h2>
          <p className="mb-6 text-gray-500">The integration you are looking for does not exist.</p>
          <Link to="/integrations" className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-5 py-3 text-sm font-medium text-white">
            <ArrowLeft size={16} />
            Back to integrations
          </Link>
        </div>
      </div>
    );
  }

  const prerequisites = [
    `Registered ${data.name} account or access to the correct workspace.`,
    'Node.js v18+ and a working MERN stack project.',
    'Access to server `.env` files and deployment secrets.',
    'HTTPS domain or tunnel for callbacks and webhooks when needed.',
    `Permission to create ${category.resource} and manage ${category.credential}.`,
    'Basic REST, Express, async/await, and provider dashboard familiarity.',
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950">
      <div className="flex min-h-screen">
        <Sidebar activeSection={activeSection} />

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-[980px]">
            <div className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
              <Link to="/" className="hover:text-[#6C63FF]">Docs</Link>
              <ChevronRight size={13} />
              <Link to="/integrations" className="hover:text-[#6C63FF]">Integrations</Link>
              <ChevronRight size={13} />
              <span className="text-gray-600">{data.name}</span>
            </div>

            <header className="relative mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-[#6C63FF]/5 p-7 shadow-sm sm:p-9">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#6C63FF] to-[#4F46E5]" />
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 px-3 py-1 text-[11px] font-medium text-emerald-700 shadow-sm">&#9679; Stable guide</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 text-[11px] font-medium text-blue-700 shadow-sm">&#9679; REST API</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 px-3 py-1 text-[11px] font-medium text-[#3C3489] shadow-sm">&#9679; JS SDK</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1 text-[11px] font-medium text-amber-700 shadow-sm">&#9679; {category.badge}</span>
              </div>
              <h1 className="mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-[28px] font-bold leading-tight text-transparent sm:text-[34px]">
                {data.name} Integration Guide
              </h1>
              <p className="max-w-[720px] text-sm leading-6 text-gray-600">{data.desc}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100/60 px-2.5 py-1.5 text-gray-500"><Clock size={13} className="text-[#6C63FF]" />~15 min setup</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100/60 px-2.5 py-1.5 text-gray-500"><GitBranch size={13} className="text-[#6C63FF]" />Node 18+ / MERN</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100/60 px-2.5 py-1.5 text-gray-500"><Calendar size={13} className="text-[#6C63FF]" />Updated June 2026</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100/60 px-2.5 py-1.5 text-gray-500"><Users size={13} className="text-[#6C63FF]" />{workflowSteps.length} setup sections</span>
              </div>
            </header>

            <TocGrid />

            <SectionHeader id="s-overview" icon={Info} title="Overview" desc="What this integration does and why you would use it." />
            <OverviewCards data={data} category={category} />
            <InfoBox type="note" title="About this tool" icon={Info}>
              <strong>{data.name}</strong> is a {categoryLabel(category).toLowerCase()} integration for MERN developers. It helps teams implement {category.objective} while keeping manual dashboard setup, server code, images, and verification steps in one consistent guide.
            </InfoBox>

            <Divider />

            <SectionHeader id="s-how" icon={Route} title="How it works" desc="The full request or data flow from your MERN app to the provider and back." />
            <FlowDiagram data={data} category={category} />
            <div className="mt-4">
              <InfoBox type="tip" title="Sync vs async" icon={Info}>
                Lightweight reads can return synchronously. Long-running work should return a job or resource ID, then update your app through a webhook, event, or provider log entry.
              </InfoBox>
            </div>

            <Divider />

            <SectionHeader id="s-prereq" icon={ListChecks} title="Prerequisites" desc="Have these ready before you start." />
            <CheckList items={prerequisites} />

            <SectionHeader id="s-setup" icon={Workflow} title="Step-by-step setup guide" desc="Every setup step with dashboard hints, detailed manual actions, code where needed, verification checks, and an image." />
            <SetupGuideTimeline data={data} category={category} />

            <Divider />

            <SectionHeader id="s-install" icon={Package} title="Installation" desc="Install the SDK or REST adapter dependencies for your server route." />
            <InstallSection data={data} />

            <Divider />

            <SectionHeader id="s-auth" icon={KeyRound} title="Authentication" desc="Generate credentials, understand key types, and store them securely." />
            <AuthSection data={data} category={category} />

            <Divider />

            <SectionHeader id="s-config" icon={Settings2} title="Configuration" desc="Environment variables and initialization code." />
            <ConfigSection data={data} category={category} />

            <Divider />

            <SectionHeader id="s-embed" icon={Code2} title="Code implementation" desc="Production-oriented Express adapter code you can copy and adapt." />
            <CodeImplementation data={data} />

            <Divider />

            <SectionHeader id="s-manual" icon={Workflow} title="Manual work" desc="Dashboard work that must be completed before the code can succeed." />
            <ManualWorkPanel data={data} />

            <Divider />

            <SectionHeader id="s-test" icon={TestTube2} title="Testing" desc="Smoke test locally, verify provider logs, and prepare production checks." />
            <TestingSection data={data} category={category} />

            <Divider />

            <SectionHeader id="s-api" icon={Braces} title="API reference" desc="Local route contracts and payload shapes for this MERN integration." />
            <ApiReference data={data} category={category} />

            <Divider />

            <SectionHeader id="s-hooks" icon={Webhook} title="Webhooks" desc="Receive real-time provider events safely on your server." />
            <WebhookSection data={data} category={category} />

            <Divider />

            <SectionHeader id="s-errors" icon={AlertCircle} title="Error codes" desc="Handle errors by stable codes, not display messages." />
            <ErrorCodes />

            <Divider />

            <SectionHeader id="s-bp" icon={ShieldCheck} title="Best practices" desc="Patterns every production integration should follow." />
            <BestPractices items={data.bestPractices} />

            <Divider />

            <SectionHeader id="s-ts" icon={Wrench} title="Troubleshooting" desc="Common issues and fast fixes." />
            <Troubleshooting items={data.troubleshooting} data={data} />

            <Divider />

            <SectionHeader id="s-deep" icon={Brain} title="Deep notes" desc="Edge cases and production details that matter after the happy path works." />
            <DeepNotes data={data} category={category} />

            <Divider />

            <SectionHeader id="s-links" icon={LinkIcon} title="Resources and links" desc="Every important starting point in one place." />
            <ResourceLinks data={data} />

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 px-5 py-4 text-xs text-gray-400 shadow-sm">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />
                Last updated June 18, 2026 — Template v3.0
              </span>
              <Link to="/integrations" className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#4F46E5] px-3.5 py-2 text-[11px] font-medium text-white shadow-sm shadow-[#6C63FF]/20 transition-all duration-300 hover:shadow-md hover:shadow-[#6C63FF]/30">
                <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                All integrations
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
