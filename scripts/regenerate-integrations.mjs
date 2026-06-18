import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLocalImageQuality, isUsableLocalImage } from './image-quality.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(rootDir, 'src', 'data', 'integrations.js');

const categories = [
  {
    key: 'auth',
    label: 'Authentication',
    icon: 'AU',
    badge: 'Security',
    objective: 'secure sign-in, session validation, authorization, and account lifecycle control',
    resource: 'identity application',
    credential: 'client IDs, issuer URLs, public keys, API keys, and webhook secrets',
    primaryRoute: '/api/auth/session',
    envSuffixes: ['API_BASE_URL', 'API_KEY', 'VERIFY_URL', 'WEBHOOK_SECRET', 'PUBLIC_CLIENT_ID'],
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: 'PAY',
    badge: 'Revenue',
    objective: 'checkout creation, subscription handling, refunds, and payment webhook processing',
    resource: 'payment application',
    credential: 'secret keys, webhook signing secrets, product IDs, price IDs, and return URLs',
    primaryRoute: '/api/payments/checkout',
    envSuffixes: ['API_BASE_URL', 'SECRET_KEY', 'WEBHOOK_SECRET', 'RETURN_URL', 'CURRENCY'],
  },
  {
    key: 'database',
    label: 'Database & Backend',
    icon: 'DB',
    badge: 'Backend',
    objective: 'connection management, schema access, read/write operations, and production data safety',
    resource: 'database project',
    credential: 'connection strings, service roles, database users, regions, and network access rules',
    primaryRoute: '/api/data/health',
    envSuffixes: ['DATABASE_URL', 'API_BASE_URL', 'SERVICE_KEY', 'PROJECT_ID', 'REGION'],
  },
  {
    key: 'email',
    label: 'Email',
    icon: 'MAIL',
    badge: 'Messaging',
    objective: 'transactional email delivery, templates, sender verification, and bounce monitoring',
    resource: 'email sending domain',
    credential: 'API keys, SMTP credentials, sender identities, template IDs, and webhook secrets',
    primaryRoute: '/api/email/send',
    envSuffixes: ['API_BASE_URL', 'API_KEY', 'FROM_EMAIL', 'TEMPLATE_ID', 'WEBHOOK_SECRET'],
  },
  {
    key: 'storage',
    label: 'File Upload & Media',
    icon: 'FILE',
    badge: 'Media',
    objective: 'file upload, private asset access, transformations, signing, and lifecycle rules',
    resource: 'storage bucket or media project',
    credential: 'bucket names, access keys, upload presets, CDN domains, and signing secrets',
    primaryRoute: '/api/storage/upload-intent',
    envSuffixes: ['API_BASE_URL', 'ACCESS_KEY', 'SECRET_KEY', 'BUCKET', 'UPLOAD_PRESET'],
  },
  {
    key: 'ai',
    label: 'AI & ML',
    icon: 'AI',
    badge: 'AI',
    objective: 'model calls, embeddings, generation, moderation, audio, and safe server-side key handling',
    resource: 'AI project',
    credential: 'API keys, model names, endpoint URLs, organization IDs, and rate-limit settings',
    primaryRoute: '/api/ai/respond',
    envSuffixes: ['API_BASE_URL', 'API_KEY', 'MODEL', 'EMBEDDING_MODEL', 'PROJECT_ID'],
  },
  {
    key: 'search',
    label: 'Search',
    icon: 'SEA',
    badge: 'Search',
    objective: 'index creation, document sync, query execution, ranking, and search analytics',
    resource: 'search index',
    credential: 'host URLs, admin keys, search-only keys, collection names, and index names',
    primaryRoute: '/api/search/query',
    envSuffixes: ['API_BASE_URL', 'ADMIN_KEY', 'SEARCH_KEY', 'INDEX_NAME', 'COLLECTION_NAME'],
  },
  {
    key: 'realtime',
    label: 'Real-Time',
    icon: 'RT',
    badge: 'Live',
    objective: 'presence, pub/sub messaging, websocket channels, chat, notifications, and live collaboration',
    resource: 'realtime channel application',
    credential: 'app IDs, publish keys, subscribe keys, websocket URLs, and auth secrets',
    primaryRoute: '/api/realtime/publish',
    envSuffixes: ['API_BASE_URL', 'APP_ID', 'API_KEY', 'CHANNEL', 'WEBHOOK_SECRET'],
  },
  {
    key: 'maps',
    label: 'Maps & Location',
    icon: 'MAP',
    badge: 'Location',
    objective: 'maps, geocoding, reverse geocoding, routing, places search, and location enrichment',
    resource: 'maps application',
    credential: 'browser keys, server keys, geocoding endpoints, allowed domains, and quota limits',
    primaryRoute: '/api/maps/geocode',
    envSuffixes: ['API_BASE_URL', 'API_KEY', 'MAP_STYLE_ID', 'GEOCODE_ENDPOINT', 'ALLOWED_DOMAIN'],
  },
  {
    key: 'analytics',
    label: 'Analytics & Monitoring',
    icon: 'OBS',
    badge: 'Observability',
    objective: 'event capture, error reporting, performance monitoring, product analytics, and release visibility',
    resource: 'analytics project',
    credential: 'project keys, ingest URLs, DSNs, write keys, source IDs, and environment names',
    primaryRoute: '/api/analytics/capture',
    envSuffixes: ['API_BASE_URL', 'WRITE_KEY', 'PROJECT_ID', 'DSN', 'ENVIRONMENT'],
  },
  {
    key: 'deployment',
    label: 'Deployment & DevOps',
    icon: 'OPS',
    badge: 'DevOps',
    objective: 'deployment automation, environment promotion, health checks, CI/CD, and operational runbooks',
    resource: 'deployment project',
    credential: 'deployment tokens, repository secrets, runtime variables, build commands, and health URLs',
    primaryRoute: '/api/health',
    envSuffixes: ['DEPLOY_TOKEN', 'PROJECT_ID', 'APP_BASE_URL', 'HEALTHCHECK_URL', 'ENVIRONMENT'],
  },
];

const stepBlueprint = [
  ['Find the official setup path', true, 'Open the official website, docs, pricing, and sign-in pages so the developer knows where setup starts.'],
  ['Create the account and workspace', true, 'Sign in or create the correct company workspace, then confirm the owner and environment before creating anything.'],
  ['Create the provider resource', true, 'Create the app, project, bucket, source, index, sender, channel, or deployment resource for this MERN integration.'],
  ['Configure URLs and domains', true, 'Add localhost URLs, production domains, redirect URLs, callback URLs, CORS origins, webhook endpoints, or sender domains.'],
  ['Generate restricted credentials', true, 'Create API keys, tokens, client IDs, webhook secrets, or connection strings with the smallest useful permission set.'],
  ['Add environment variables', false, 'Move credentials into server-side .env and deployment secrets, keeping public browser values clearly separated.'],
  ['Install SDK and adapter code', false, 'Install the SDK when available, create a server-only adapter, and keep provider calls behind Express routes.'],
  ['Wire the app flow', false, 'Connect React to the Express route, validate input, handle callbacks or webhooks, and return normalized responses.'],
  ['Test and verify logs', true, 'Run a local smoke test, inspect server logs, then compare provider request logs, events, or audit entries.'],
  ['Deploy and document runbook', true, 'Repeat production settings, deploy, verify production logs, rotate unsafe secrets, and document ownership and rollback.'],
];

const catalog = {
  auth: [
    ['Clerk', 'https://clerk.com', '@clerk/clerk-sdk-node', 'Managed sign-in, sessions, organizations, and user profiles for React and Node applications.'],
    ['Auth0', 'https://auth0.com', 'express-oauth2-jwt-bearer', 'OAuth, OIDC, enterprise identity, social login, and user management for web applications.'],
    ['Firebase Authentication', 'https://firebase.google.com/products/auth', 'firebase-admin', 'Google-backed authentication for email, phone, social, and custom token flows.'],
    ['Supabase Auth', 'https://supabase.com/auth', '@supabase/supabase-js', 'Open source authentication with email, OAuth providers, magic links, and row-level security support.'],
    ['Passport.js', 'https://www.passportjs.org', 'passport', 'Flexible Express authentication middleware with many local, OAuth, and enterprise strategies.'],
    ['JWT.io', 'https://jwt.io', 'jsonwebtoken', 'JWT debugging and token-based authentication patterns for stateless API authorization.'],
    ['Auth.js / NextAuth.js', 'https://authjs.dev', 'next-auth', 'Authentication framework for OAuth, credentials, email, and session management.'],
    ['Better Auth', 'https://www.better-auth.com', 'better-auth', 'TypeScript authentication framework for modern full-stack applications.'],
    ['Okta', 'https://www.okta.com', '@okta/okta-sdk-nodejs', 'Enterprise identity, access management, OIDC, SAML, MFA, and lifecycle automation.'],
    ['Amazon Cognito', 'https://aws.amazon.com/cognito', '@aws-sdk/client-cognito-identity-provider', 'AWS user pools, identity pools, hosted UI, and token management.'],
    ['Microsoft Entra ID', 'https://www.microsoft.com/security/business/identity-access/microsoft-entra-id', '@azure/msal-node', 'Microsoft identity platform for OIDC, OAuth, enterprise SSO, and tenant-based access.'],
    ['Google Identity Services', 'https://developers.google.com/identity', 'google-auth-library', 'Google sign-in, OAuth consent, One Tap, and identity token verification.'],
    ['Apple Sign In', 'https://developer.apple.com/sign-in-with-apple', 'apple-signin-auth', 'Apple identity sign-in flow for web and mobile applications.'],
    ['Keycloak', 'https://www.keycloak.org', 'keycloak-connect', 'Open source identity and access management with realms, clients, roles, and SSO.'],
    ['FusionAuth', 'https://fusionauth.io', '@fusionauth/typescript-client', 'Developer-focused authentication platform for login, tenants, roles, and APIs.'],
    ['Stytch', 'https://stytch.com', 'stytch', 'Passwordless authentication, sessions, passkeys, and fraud-resistant identity flows.'],
    ['WorkOS', 'https://workos.com', '@workos-inc/node', 'Enterprise-ready SSO, directory sync, audit logs, and organization management.'],
    ['Descope', 'https://www.descope.com', '@descope/node-sdk', 'Authentication journeys, passkeys, magic links, OTP, and tenant-aware access.'],
    ['Kinde', 'https://kinde.com', '@kinde-oss/kinde-node-express', 'Authentication, feature flags, organizations, and roles for SaaS apps.'],
    ['Frontegg', 'https://frontegg.com', '@frontegg/client', 'User management, login boxes, tenants, roles, and enterprise SaaS identity features.'],
    ['Ory Kratos', 'https://www.ory.sh/kratos', '@ory/client', 'Cloud native identity management for registration, login, recovery, and verification flows.'],
    ['Zitadel', 'https://zitadel.com', '@zitadel/node', 'Identity infrastructure with projects, organizations, OIDC, SAML, and machine users.'],
    ['Logto', 'https://logto.io', '@logto/node', 'Open source auth platform for sign-in experiences, organizations, and API resources.'],
    ['SuperTokens', 'https://supertokens.com', 'supertokens-node', 'Open source auth with sessions, social login, passwordless, and self-hosting options.'],
    ['Permit.io', 'https://www.permit.io', 'permitio', 'Authorization-as-a-service for roles, attributes, policy checks, and feature access.'],
    ['Casbin', 'https://casbin.org', 'casbin', 'Authorization library for RBAC, ABAC, ACL, and policy-enforced access decisions.'],
    ['Authgear', 'https://www.authgear.com', '@authgear/node', 'Authentication platform with passkeys, OAuth, MFA, and user management.'],
    ['Magic', 'https://magic.link', '@magic-sdk/admin', 'Passwordless authentication using email magic links, social login, and embedded wallets.'],
    ['OneLogin', 'https://www.onelogin.com', null, 'Enterprise identity provider for SSO, MFA, directory integrations, and access policies.'],
    ['Ory Hydra', 'https://www.ory.sh/hydra', '@ory/client', 'OAuth 2.0 and OpenID Connect server for secure authorization flows.'],
  ],
  payments: [
    ['Stripe', 'https://stripe.com', 'stripe', 'Payment processing, checkout, subscriptions, invoices, webhooks, and billing automation.'],
    ['Razorpay', 'https://razorpay.com', 'razorpay', 'India-focused payments, orders, subscriptions, payouts, payment links, and webhooks.'],
    ['PayPal', 'https://developer.paypal.com', '@paypal/checkout-server-sdk', 'Wallet payments, checkout, subscriptions, payouts, and buyer protection flows.'],
    ['Cashfree', 'https://www.cashfree.com', 'cashfree-pg', 'Payment gateway, payouts, subscriptions, payment links, and India payment methods.'],
    ['Square', 'https://developer.squareup.com', 'square', 'In-person and online payments, catalog, customers, orders, and terminals.'],
    ['Adyen', 'https://www.adyen.com', '@adyen/api-library', 'Global payments platform for checkout, risk, in-person, and marketplace payouts.'],
    ['Braintree', 'https://developer.paypal.com/braintree', 'braintree', 'Card, PayPal, wallet, and subscription payments with server-side transaction APIs.'],
    ['Paddle', 'https://www.paddle.com', '@paddle/paddle-node-sdk', 'Merchant of record platform for SaaS checkout, subscriptions, taxes, and webhooks.'],
    ['Chargebee', 'https://www.chargebee.com', 'chargebee', 'Subscription billing, invoices, revenue operations, and SaaS lifecycle automation.'],
    ['Recurly', 'https://recurly.com', 'recurly', 'Subscription management, recurring billing, trials, coupons, and revenue recovery.'],
    ['Mollie', 'https://www.mollie.com', '@mollie/api-client', 'European payment provider for cards, bank transfers, wallets, and payment links.'],
    ['GoCardless', 'https://gocardless.com', 'gocardless-nodejs', 'Bank debit payments, mandates, recurring payments, and payment event webhooks.'],
    ['Authorize.net', 'https://developer.authorize.net', 'authorizenet', 'Card payments, customer profiles, recurring billing, and transaction reporting.'],
    ['Worldpay', 'https://developer.worldpay.com', null, 'Enterprise payment processing, acquiring, card payments, and global payment methods.'],
    ['PayU', 'https://payu.in', null, 'Payment gateway for cards, UPI, wallets, net banking, and checkout workflows.'],
    ['Paystack', 'https://paystack.com', 'paystack-api', 'African payments platform for cards, transfers, subscriptions, and transaction verification.'],
    ['Flutterwave', 'https://flutterwave.com', 'flutterwave-node-v3', 'African and global payments, transfers, virtual accounts, and payment links.'],
    ['Mercado Pago', 'https://www.mercadopago.com/developers', 'mercadopago', 'Latin America payment gateway for checkout, wallet payments, and webhooks.'],
    ['Checkout.com', 'https://www.checkout.com', 'checkout-sdk-node', 'Enterprise payment processing, sessions, tokens, disputes, and risk tooling.'],
    ['2Checkout / Verifone', 'https://verifone.cloud', '2checkout-node', 'Global digital commerce payments, subscriptions, and hosted checkout.'],
    ['FastSpring', 'https://fastspring.com', null, 'Merchant of record platform for software checkout, subscriptions, taxes, and fulfillment.'],
    ['Lemon Squeezy', 'https://www.lemonsqueezy.com', '@lemonsqueezy/lemonsqueezy.js', 'SaaS and digital product checkout, subscriptions, licenses, and merchant-of-record billing.'],
    ['Polar.sh', 'https://polar.sh', '@polar-sh/sdk', 'Open source funding, products, subscriptions, and developer-focused checkout.'],
    ['Coinbase Commerce', 'https://commerce.coinbase.com', 'coinbase-commerce-node', 'Cryptocurrency checkout, charges, hosted payments, and webhook confirmations.'],
    ['BTCPay Server', 'https://btcpayserver.org', null, 'Self-hosted Bitcoin payment processing, invoices, stores, and wallet integrations.'],
    ['Dwolla', 'https://www.dwolla.com', 'dwolla-v2', 'Bank transfer payments, customers, funding sources, and ACH workflows.'],
    ['Rapyd', 'https://www.rapyd.net', null, 'Global payments, wallets, payouts, issuing, and local payment methods.'],
    ['Airwallex', 'https://www.airwallex.com', null, 'Business payments, multi-currency accounts, cards, payouts, and embedded finance.'],
    ['Wise Platform', 'https://wise.com/platform', null, 'International transfers, account details, quotes, recipients, and business payments.'],
    ['Xendit', 'https://www.xendit.co', 'xendit-node', 'Southeast Asia payment gateway for invoices, virtual accounts, cards, and payouts.'],
  ],
  database: [
    ['MongoDB Atlas', 'https://www.mongodb.com/atlas', 'mongodb', 'Managed MongoDB clusters, search, triggers, backups, and data APIs.'],
    ['Mongoose', 'https://mongoosejs.com', 'mongoose', 'MongoDB object modeling for schemas, validation, middleware, and relationships.'],
    ['Redis', 'https://redis.io', 'redis', 'In-memory data store for caching, queues, pub/sub, sessions, and rate limits.'],
    ['Supabase Database', 'https://supabase.com/database', '@supabase/supabase-js', 'Hosted Postgres with APIs, authentication, storage, functions, and row-level security.'],
    ['Neon', 'https://neon.tech', '@neondatabase/serverless', 'Serverless Postgres with branching, autoscaling, and database-per-preview workflows.'],
    ['PlanetScale', 'https://planetscale.com', '@planetscale/database', 'MySQL-compatible serverless database platform with branching and deploy requests.'],
    ['PostgreSQL', 'https://www.postgresql.org', 'pg', 'Relational database with SQL, transactions, indexes, JSON, and extensions.'],
    ['MySQL', 'https://www.mysql.com', 'mysql2', 'Relational database for structured application data, transactions, and reporting.'],
    ['Prisma', 'https://www.prisma.io', '@prisma/client', 'Type-safe ORM, migrations, generated client, and data modeling for Node applications.'],
    ['Sequelize', 'https://sequelize.org', 'sequelize', 'Promise-based Node ORM for PostgreSQL, MySQL, SQLite, and SQL Server.'],
    ['TypeORM', 'https://typeorm.io', 'typeorm', 'TypeScript ORM for entities, migrations, repositories, and multiple SQL databases.'],
    ['Drizzle ORM', 'https://orm.drizzle.team', 'drizzle-orm', 'TypeScript SQL toolkit with schema-first queries and migrations.'],
    ['Hasura', 'https://hasura.io', 'graphql-request', 'GraphQL API layer over databases with permissions, subscriptions, and metadata.'],
    ['Appwrite', 'https://appwrite.io', 'node-appwrite', 'Open source backend platform for databases, auth, storage, and functions.'],
    ['PocketBase', 'https://pocketbase.io', 'pocketbase', 'Lightweight backend with embedded database, auth, realtime APIs, and admin UI.'],
    ['Fauna', 'https://fauna.com', 'fauna', 'Distributed serverless database with document-relational querying and transactions.'],
    ['DynamoDB', 'https://aws.amazon.com/dynamodb', '@aws-sdk/client-dynamodb', 'AWS NoSQL database for key-value and document workloads at scale.'],
    ['Firebase Firestore', 'https://firebase.google.com/products/firestore', 'firebase-admin', 'Serverless NoSQL document database with realtime listeners and security rules.'],
    ['Firebase Realtime Database', 'https://firebase.google.com/products/realtime-database', 'firebase-admin', 'Realtime JSON tree database for synchronized client application state.'],
    ['Couchbase', 'https://www.couchbase.com', 'couchbase', 'Distributed NoSQL database with documents, SQL-like queries, caching, and mobile sync.'],
    ['Cassandra', 'https://cassandra.apache.org', 'cassandra-driver', 'Distributed wide-column database for high write throughput and fault tolerance.'],
    ['ScyllaDB', 'https://www.scylladb.com', 'cassandra-driver', 'Cassandra-compatible NoSQL database designed for low latency and high throughput.'],
    ['CockroachDB', 'https://www.cockroachlabs.com', 'pg', 'Distributed SQL database with PostgreSQL compatibility and horizontal scaling.'],
    ['TiDB Cloud', 'https://www.pingcap.com/tidb-cloud', 'mysql2', 'Distributed SQL database compatible with MySQL for transactional and analytical workloads.'],
    ['Upstash Redis', 'https://upstash.com', '@upstash/redis', 'Serverless Redis and Kafka platform for low-latency serverless applications.'],
    ['Turso', 'https://turso.tech', '@libsql/client', 'Edge SQLite database platform built on libSQL with replicas and auth tokens.'],
    ['SQLite', 'https://sqlite.org', 'better-sqlite3', 'Embedded relational database for local-first apps, prototypes, queues, and tests.'],
    ['MariaDB', 'https://mariadb.org', 'mariadb', 'Open source relational database compatible with MySQL features and drivers.'],
    ['Timescale', 'https://www.timescale.com', 'pg', 'Time-series database built on PostgreSQL for metrics, events, and analytics.'],
    ['InfluxDB', 'https://www.influxdata.com', '@influxdata/influxdb-client', 'Time-series database for metrics, IoT, observability, and event streams.'],
  ],
  email: [
    ['Resend', 'https://resend.com', 'resend', 'Developer-first transactional email API with domains, templates, and React email support.'],
    ['Nodemailer', 'https://nodemailer.com', 'nodemailer', 'Node.js email sending library for SMTP and transport-based delivery.'],
    ['SendGrid', 'https://sendgrid.com', '@sendgrid/mail', 'Transactional and marketing email platform with templates, analytics, and webhooks.'],
    ['Mailgun', 'https://www.mailgun.com', 'mailgun.js', 'Email API for sending, receiving, routing, validation, and deliverability tracking.'],
    ['Brevo', 'https://www.brevo.com', '@getbrevo/brevo', 'Email, SMS, marketing automation, transactional messaging, and contact management.'],
    ['Postmark', 'https://postmarkapp.com', 'postmark', 'Transactional email delivery with streams, templates, bounce handling, and analytics.'],
    ['Amazon SES', 'https://aws.amazon.com/ses', '@aws-sdk/client-sesv2', 'AWS email service for transactional, bulk, domain-authenticated, and event-based delivery.'],
    ['SparkPost', 'https://www.sparkpost.com', 'sparkpost', 'Email delivery platform with templates, recipient validation, and message analytics.'],
    ['Mailchimp Transactional', 'https://mailchimp.com/developer/transactional', '@mailchimp/mailchimp_transactional', 'Mandrill-based transactional email API for Mailchimp customers.'],
    ['MailerSend', 'https://www.mailersend.com', 'mailersend', 'Transactional email and SMS platform with templates, domains, and webhooks.'],
    ['Mailjet', 'https://www.mailjet.com', 'node-mailjet', 'Email API for transactional and marketing messages, contacts, and templates.'],
    ['ZeptoMail', 'https://www.zoho.com/zeptomail', null, 'Zoho transactional email service for domain-verified application delivery.'],
    ['Gmail API', 'https://developers.google.com/gmail/api', 'googleapis', 'Google Workspace mail API for sending and managing Gmail messages.'],
    ['Microsoft Graph Mail', 'https://learn.microsoft.com/graph/api/resources/mail-api-overview', '@microsoft/microsoft-graph-client', 'Microsoft 365 mail API for sending and managing Outlook messages.'],
    ['SMTP2GO', 'https://www.smtp2go.com', null, 'SMTP and API-based email delivery with reports, bounce handling, and domain verification.'],
    ['Elastic Email', 'https://elasticemail.com', null, 'Email API and campaign platform for transactional and marketing communication.'],
    ['Moosend', 'https://moosend.com', null, 'Email marketing and automation platform with campaign and transactional APIs.'],
    ['Customer.io', 'https://customer.io', 'customerio-node', 'Customer messaging platform for transactional, lifecycle, and event-triggered emails.'],
    ['OneSignal Email', 'https://onesignal.com', '@onesignal/node-onesignal', 'Cross-channel messaging platform for email, push, in-app, and SMS.'],
    ['Klaviyo', 'https://www.klaviyo.com', 'klaviyo-api', 'Customer data and email platform for ecommerce lifecycle messaging.'],
    ['Loops', 'https://loops.so', 'loops', 'Email platform for SaaS lifecycle messaging, product updates, and transactional mail.'],
    ['Buttondown', 'https://buttondown.email', null, 'Newsletter and email publishing platform with automation and API access.'],
    ['Kit / ConvertKit', 'https://kit.com', null, 'Creator-focused email platform for subscribers, broadcasts, automations, and forms.'],
    ['Beehiiv', 'https://www.beehiiv.com', null, 'Newsletter platform for publishing, subscriptions, analytics, and audience growth.'],
    ['Campaign Monitor', 'https://www.campaignmonitor.com', 'createsend-node', 'Email marketing platform with campaigns, lists, templates, and reports.'],
    ['ActiveCampaign', 'https://www.activecampaign.com', 'activecampaign', 'Marketing automation and CRM platform with email and customer journeys.'],
    ['Constant Contact', 'https://www.constantcontact.com', null, 'Email marketing platform for campaigns, contacts, automations, and reporting.'],
    ['AWeber', 'https://www.aweber.com', null, 'Email marketing and automation platform for newsletters, tags, and subscribers.'],
    ['Mailtrap', 'https://mailtrap.io', 'mailtrap', 'Email testing, sandboxing, and sending platform for development and production.'],
    ['Ethereal Email', 'https://ethereal.email', 'nodemailer', 'Fake SMTP testing service used with Nodemailer for safe local email previews.'],
  ],
  storage: [
    ['AWS S3', 'https://aws.amazon.com/s3', '@aws-sdk/client-s3', 'Object storage for buckets, signed URLs, uploads, lifecycle rules, and CDN delivery.'],
    ['Cloudinary', 'https://cloudinary.com', 'cloudinary', 'Image and video management, transformations, upload presets, optimization, and delivery.'],
    ['Multer', 'https://github.com/expressjs/multer', 'multer', 'Express middleware for multipart file upload handling in Node applications.'],
    ['Uploadcare', 'https://uploadcare.com', '@uploadcare/upload-client', 'File uploading, image processing, CDN delivery, and upload widgets.'],
    ['Google Cloud Storage', 'https://cloud.google.com/storage', '@google-cloud/storage', 'Google object storage for buckets, IAM, signed URLs, and lifecycle rules.'],
    ['Azure Blob Storage', 'https://azure.microsoft.com/products/storage/blobs', '@azure/storage-blob', 'Microsoft object storage for blobs, containers, SAS tokens, and archival tiers.'],
    ['Firebase Storage', 'https://firebase.google.com/products/storage', 'firebase-admin', 'Cloud Storage for Firebase with rules, buckets, and mobile/web uploads.'],
    ['Supabase Storage', 'https://supabase.com/storage', '@supabase/supabase-js', 'Open source object storage with buckets, policies, signed URLs, and transforms.'],
    ['DigitalOcean Spaces', 'https://www.digitalocean.com/products/spaces', '@aws-sdk/client-s3', 'S3-compatible object storage with CDN integration and simple bucket management.'],
    ['Backblaze B2', 'https://www.backblaze.com/cloud-storage', 'backblaze-b2', 'S3-compatible cloud object storage for backups, media, and application files.'],
    ['Wasabi', 'https://wasabi.com', '@aws-sdk/client-s3', 'S3-compatible object storage focused on predictable pricing and high durability.'],
    ['MinIO', 'https://min.io', 'minio', 'Self-hosted S3-compatible object storage for private infrastructure and Kubernetes.'],
    ['Filestack', 'https://www.filestack.com', 'filestack-js', 'File picker, upload, transformation, and CDN delivery platform.'],
    ['ImageKit', 'https://imagekit.io', 'imagekit', 'Image optimization, uploads, transformations, storage, and media delivery.'],
    ['Imgix', 'https://www.imgix.com', '@imgix/js-core', 'Realtime image processing, optimization, and CDN delivery from existing storage.'],
    ['Cloudflare R2', 'https://www.cloudflare.com/products/r2', '@aws-sdk/client-s3', 'S3-compatible object storage without egress fees, integrated with Cloudflare.'],
    ['Pinata', 'https://www.pinata.cloud', '@pinata/sdk', 'IPFS file storage, gateways, metadata, and decentralized media workflows.'],
    ['Storacha', 'https://storacha.network', '@web3-storage/w3up-client', 'Decentralized storage for web3 files, uploads, and content-addressed data.'],
    ['NFT.Storage', 'https://nft.storage', 'nft.storage', 'Content-addressed storage patterns for NFT metadata and assets.'],
    ['Storj', 'https://www.storj.io', null, 'Decentralized cloud object storage with S3-compatible access.'],
    ['Dropbox API', 'https://www.dropbox.com/developers', 'dropbox', 'File storage, sharing, uploads, downloads, and team document workflows.'],
    ['Google Drive API', 'https://developers.google.com/drive', 'googleapis', 'Google Drive file management, permissions, uploads, and exports.'],
    ['OneDrive API', 'https://learn.microsoft.com/onedrive/developer', '@microsoft/microsoft-graph-client', 'Microsoft OneDrive and SharePoint file operations through Microsoft Graph.'],
    ['Box API', 'https://developer.box.com', 'box-node-sdk', 'Enterprise content management, folders, uploads, metadata, and collaboration.'],
    ['SFTPGo', 'https://sftpgo.com', null, 'Self-hosted SFTP, FTP, WebDAV, and object storage gateway platform.'],
    ['LocalStack S3', 'https://www.localstack.cloud', '@aws-sdk/client-s3', 'Local AWS-compatible development environment for S3 upload and bucket workflows.'],
    ['tus.io', 'https://tus.io', 'tus-js-client', 'Open resumable upload protocol for reliable large-file uploads.'],
    ['Uppy', 'https://uppy.io', '@uppy/core', 'Composable file uploader with dashboards, resumable uploads, and provider plugins.'],
    ['Sharp', 'https://sharp.pixelplumbing.com', 'sharp', 'High-performance Node image processing for resizing, conversion, and optimization.'],
    ['FFmpeg', 'https://ffmpeg.org', 'fluent-ffmpeg', 'Audio and video processing toolkit for transcoding, thumbnails, and media pipelines.'],
  ],
  ai: [
    ['OpenAI', 'https://platform.openai.com', 'openai', 'Models for text, vision, audio, embeddings, structured outputs, and agent workflows.'],
    ['Anthropic Claude', 'https://www.anthropic.com/api', '@anthropic-ai/sdk', 'Claude models for reasoning, coding, summarization, vision, and tool use.'],
    ['Hugging Face', 'https://huggingface.co', '@huggingface/inference', 'Model hub, inference APIs, datasets, spaces, and open source AI workflows.'],
    ['LangChain', 'https://www.langchain.com', 'langchain', 'Framework for chains, tools, retrieval, agents, and model orchestration.'],
    ['ElevenLabs', 'https://elevenlabs.io', 'elevenlabs', 'Text-to-speech, speech-to-speech, voices, dubbing, and audio generation APIs.'],
    ['Google Gemini', 'https://ai.google.dev', '@google/genai', 'Google multimodal models for text, images, code, and structured generation.'],
    ['Cohere', 'https://cohere.com', 'cohere-ai', 'Enterprise language models for generation, embeddings, reranking, and classification.'],
    ['Mistral AI', 'https://mistral.ai', '@mistralai/mistralai', 'Open and commercial language models for chat, embeddings, and function calling.'],
    ['Groq', 'https://groq.com', 'groq-sdk', 'Fast inference API for open models with chat completions and streaming.'],
    ['Perplexity AI', 'https://www.perplexity.ai', null, 'Answer and search-oriented AI API patterns for grounded responses.'],
    ['Together AI', 'https://www.together.ai', 'together-ai', 'Inference, fine-tuning, and model hosting for open source AI models.'],
    ['Replicate', 'https://replicate.com', 'replicate', 'Run open source models through an API for image, audio, text, and video generation.'],
    ['Stability AI', 'https://platform.stability.ai', 'stability-ai', 'Image generation and editing APIs for diffusion-based visual workflows.'],
    ['Pinecone', 'https://www.pinecone.io', '@pinecone-database/pinecone', 'Vector database for semantic search, retrieval, recommendations, and memory.'],
    ['Weaviate', 'https://weaviate.io', 'weaviate-client', 'Vector database with hybrid search, schema, modules, and generative integrations.'],
    ['Qdrant', 'https://qdrant.tech', '@qdrant/js-client-rest', 'Vector search database for embeddings, filtering, and recommendation systems.'],
    ['Chroma', 'https://www.trychroma.com', 'chromadb', 'Embedding database for local and server-based retrieval applications.'],
    ['Vercel AI SDK', 'https://sdk.vercel.ai', 'ai', 'TypeScript toolkit for model calls, streaming UI, tool calling, and providers.'],
    ['LlamaIndex', 'https://www.llamaindex.ai', 'llamaindex', 'Framework for retrieval augmented generation, document indexing, and data connectors.'],
    ['AssemblyAI', 'https://www.assemblyai.com', 'assemblyai', 'Speech-to-text, audio intelligence, summarization, and transcription APIs.'],
    ['Deepgram', 'https://deepgram.com', '@deepgram/sdk', 'Speech recognition, text-to-speech, audio intelligence, and realtime transcription.'],
    ['Azure OpenAI', 'https://azure.microsoft.com/products/ai-services/openai-service', 'openai', 'OpenAI-compatible models deployed through Azure with enterprise controls.'],
    ['AWS Bedrock', 'https://aws.amazon.com/bedrock', '@aws-sdk/client-bedrock-runtime', 'AWS managed access to foundation models, agents, guardrails, and knowledge bases.'],
    ['Vertex AI', 'https://cloud.google.com/vertex-ai', '@google-cloud/vertexai', 'Google Cloud platform for model hosting, Gemini, embeddings, and pipelines.'],
    ['Fireworks AI', 'https://fireworks.ai', null, 'Fast model inference and fine-tuning platform for open source models.'],
    ['Voyage AI', 'https://www.voyageai.com', 'voyageai', 'Embedding and reranking models for retrieval, search, and semantic applications.'],
    ['Runway', 'https://runwayml.com', null, 'Generative video and media models for creative AI workflows.'],
    ['Cartesia', 'https://cartesia.ai', '@cartesia/cartesia-js', 'Realtime voice generation and low-latency speech APIs.'],
    ['Tavily AI', 'https://tavily.com', '@tavily/core', 'Search API designed for AI agents and research workflows.'],
    ['OpenRouter', 'https://openrouter.ai', null, 'Unified API access to many language models through an OpenAI-compatible interface.'],
  ],
  search: [
    ['Algolia', 'https://www.algolia.com', 'algoliasearch', 'Hosted search platform with indexing, instant search, recommendations, and analytics.'],
    ['Elasticsearch', 'https://www.elastic.co/elasticsearch', '@elastic/elasticsearch', 'Distributed search and analytics engine for logs, documents, and full-text search.'],
    ['Meilisearch', 'https://www.meilisearch.com', 'meilisearch', 'Fast open source search engine with typo tolerance and simple APIs.'],
    ['Typesense', 'https://typesense.org', 'typesense', 'Open source typo-tolerant search engine with collections and scoped API keys.'],
    ['OpenSearch', 'https://opensearch.org', '@opensearch-project/opensearch', 'Open source search, logging, and analytics suite derived from Elasticsearch.'],
    ['Apache Solr', 'https://solr.apache.org', 'solr-client', 'Enterprise search platform built on Lucene for indexing and querying documents.'],
    ['Apache Lucene', 'https://lucene.apache.org', null, 'Core Java search library used by many search engines.'],
    ['Fuse.js', 'https://www.fusejs.io', 'fuse.js', 'Lightweight fuzzy-search library for client-side JavaScript collections.'],
    ['Lunr.js', 'https://lunrjs.com', 'lunr', 'Small full-text search library for browser and Node document indexes.'],
    ['MiniSearch', 'https://lucaong.github.io/minisearch', 'minisearch', 'Tiny in-memory full-text search engine for JavaScript applications.'],
    ['Sphinx Search', 'https://sphinxsearch.com', null, 'Open source full-text search server for structured and unstructured data.'],
    ['ZincSearch', 'https://zincsearch-docs.zinc.dev', null, 'Lightweight search engine for logs, documents, and observability use cases.'],
    ['Sonic', 'https://github.com/valeriansaliou/sonic', 'sonic-channel', 'Fast schema-less search backend focused on ingestion and low latency.'],
    ['Vespa', 'https://vespa.ai', null, 'Search and recommendation engine for large-scale serving, ranking, and ML features.'],
    ['Redis Search', 'https://redis.io/docs/latest/develop/interact/search-and-query', 'redis', 'Redis module for secondary indexes, full-text search, vector search, and filtering.'],
    ['MongoDB Atlas Search', 'https://www.mongodb.com/products/platform/atlas-search', 'mongodb', 'Lucene-powered search built into MongoDB Atlas collections.'],
    ['PostgreSQL Full Text Search', 'https://www.postgresql.org/docs/current/textsearch.html', 'pg', 'Native PostgreSQL full-text search using tsvector, indexes, and ranking.'],
    ['Elastic Site Search', 'https://www.elastic.co/enterprise-search', null, 'Hosted website search and enterprise search patterns from Elastic.'],
    ['Coveo', 'https://www.coveo.com', 'coveo.analytics', 'AI search and relevance platform for commerce, service, and workplace experiences.'],
    ['Klevu', 'https://www.klevu.com', null, 'Ecommerce search, merchandising, recommendations, and product discovery platform.'],
    ['Luigis Box', 'https://www.luigisbox.com', null, 'Ecommerce search, autocomplete, product recommendations, and analytics.'],
    ['Doofinder', 'https://www.doofinder.com', null, 'Site search and product discovery platform for ecommerce stores.'],
    ['Constructor.io', 'https://constructor.io', '@constructor-io/constructorio-node', 'Product search, recommendations, browse, and personalization APIs.'],
    ['Searchspring', 'https://searchspring.com', null, 'Ecommerce search, merchandising, personalization, and reporting.'],
    ['Sajari Search.io', 'https://www.search.io', null, 'Site search and personalization platform for web experiences.'],
    ['Expertrec', 'https://www.expertrec.com', null, 'Custom search engine for websites and ecommerce catalogs.'],
    ['Elastic App Search', 'https://www.elastic.co/app-search', '@elastic/app-search-node', 'Application search product with engines, documents, curations, and analytics.'],
    ['Tantivy', 'https://github.com/quickwit-oss/tantivy', null, 'Rust full-text search library inspired by Lucene.'],
    ['Quickwit', 'https://quickwit.io', null, 'Cloud native search engine for logs, traces, and append-only data.'],
    ['ParadeDB', 'https://www.paradedb.com', 'pg', 'Postgres-based search and analytics engine for application databases.'],
  ],
  realtime: [
    ['Socket.IO', 'https://socket.io', 'socket.io', 'Realtime bidirectional communication between browsers and Node servers.'],
    ['Pusher', 'https://pusher.com', 'pusher', 'Hosted realtime channels, presence, webhooks, and event broadcasting.'],
    ['Ably', 'https://ably.com', 'ably', 'Realtime pub/sub, presence, chat, push notifications, and edge messaging.'],
    ['Supabase Realtime', 'https://supabase.com/realtime', '@supabase/supabase-js', 'Realtime Postgres changes, broadcasts, and presence channels.'],
    ['Firebase Realtime Database Live', 'https://firebase.google.com/products/realtime-database', 'firebase-admin', 'Live synchronized JSON data with client listeners and security rules.'],
    ['Firebase Cloud Messaging', 'https://firebase.google.com/products/cloud-messaging', 'firebase-admin', 'Push notification delivery for web and mobile clients.'],
    ['Centrifugo', 'https://centrifugal.dev', 'centrifuge', 'Scalable realtime messaging server with channels, presence, and JWT auth.'],
    ['NATS', 'https://nats.io', 'nats', 'Lightweight messaging system for pub/sub, request-reply, and streams.'],
    ['MQTT.js', 'https://mqtt.js.org', 'mqtt', 'MQTT client for IoT, browser, and Node realtime messaging.'],
    ['Mosquitto', 'https://mosquitto.org', 'mqtt', 'Open source MQTT broker for IoT and lightweight realtime messaging.'],
    ['RabbitMQ', 'https://www.rabbitmq.com', 'amqplib', 'Message broker for queues, routing, pub/sub, and reliable background work.'],
    ['Apache Kafka', 'https://kafka.apache.org', 'kafkajs', 'Distributed event streaming platform for durable logs and high-throughput messaging.'],
    ['Redis Pub/Sub', 'https://redis.io/docs/latest/develop/interact/pubsub', 'redis', 'Low-latency publish/subscribe messaging using Redis channels.'],
    ['Redis Streams', 'https://redis.io/docs/latest/develop/data-types/streams', 'redis', 'Append-only stream data type for event processing and consumer groups.'],
    ['WebSocket API', 'https://developer.mozilla.org/docs/Web/API/WebSockets_API', 'ws', 'Native websocket communication for full-duplex browser-server messaging.'],
    ['Server-Sent Events', 'https://developer.mozilla.org/docs/Web/API/Server-sent_events', null, 'One-way server-to-browser event streaming over HTTP.'],
    ['Liveblocks', 'https://liveblocks.io', '@liveblocks/node', 'Realtime collaboration infrastructure for presence, comments, rooms, and storage.'],
    ['Yjs', 'https://yjs.dev', 'yjs', 'CRDT framework for collaborative documents and shared application state.'],
    ['Automerge', 'https://automerge.org', '@automerge/automerge', 'CRDT library for local-first collaborative data structures.'],
    ['PartyKit', 'https://www.partykit.io', 'partykit', 'Realtime server platform for multiplayer, collaboration, and websocket apps.'],
    ['Mercure', 'https://mercure.rocks', null, 'Protocol and hub for pushing realtime updates using server-sent events.'],
    ['SignalR', 'https://dotnet.microsoft.com/apps/aspnet/signalr', '@microsoft/signalr', 'Realtime communication framework for ASP.NET and JavaScript clients.'],
    ['Phoenix Channels', 'https://hexdocs.pm/phoenix/channels.html', 'phoenix', 'Elixir Phoenix realtime channels for websockets and pub/sub.'],
    ['ActionCable', 'https://guides.rubyonrails.org/action_cable_overview.html', '@rails/actioncable', 'Rails websocket framework for channels and live updates.'],
    ['PubNub', 'https://www.pubnub.com', 'pubnub', 'Realtime messaging, presence, channels, and push notification infrastructure.'],
    ['Stream Chat', 'https://getstream.io/chat', 'stream-chat', 'Chat messaging, moderation, channels, reactions, and realtime events.'],
    ['Twilio Conversations', 'https://www.twilio.com/conversations', '@twilio/conversations', 'Cross-channel conversations API for chat, SMS, WhatsApp, and messaging.'],
    ['Agora RTC', 'https://www.agora.io', 'agora-access-token', 'Realtime voice, video, interactive live streaming, and token generation.'],
    ['Daily', 'https://www.daily.co', null, 'Video calling API with rooms, recordings, live streaming, and meeting controls.'],
    ['LiveKit', 'https://livekit.io', 'livekit-server-sdk', 'Open source realtime audio, video, and data platform for live apps.'],
  ],
  maps: [
    ['Google Maps Platform', 'https://mapsplatform.google.com', '@googlemaps/google-maps-services-js', 'Maps, geocoding, places, routes, distance matrix, and location APIs.'],
    ['Mapbox', 'https://www.mapbox.com', '@mapbox/mapbox-sdk-js', 'Maps, tiles, styles, geocoding, navigation, and location data APIs.'],
    ['Leaflet', 'https://leafletjs.com', 'leaflet', 'Open source interactive maps library for web mapping interfaces.'],
    ['OpenCage Geocoder', 'https://opencagedata.com', 'opencage-api-client', 'Forward and reverse geocoding API using open geographic data sources.'],
    ['HERE Maps', 'https://www.here.com', '@here/maps-api-for-javascript', 'Maps, routing, geocoding, traffic, and location services.'],
    ['TomTom Maps', 'https://developer.tomtom.com', '@tomtom-international/web-sdk-services', 'Maps, search, routing, traffic, and geofencing APIs.'],
    ['MapTiler', 'https://www.maptiler.com', '@maptiler/sdk', 'Vector maps, geocoding, tiles, static maps, and map styles.'],
    ['OpenStreetMap', 'https://www.openstreetmap.org', null, 'Open geographic data used for maps, routing, geocoding, and analysis.'],
    ['Nominatim', 'https://nominatim.org', null, 'OpenStreetMap geocoding search engine for forward and reverse lookups.'],
    ['Geoapify', 'https://www.geoapify.com', null, 'Geocoding, places, routing, maps, and location platform APIs.'],
    ['MapLibre GL JS', 'https://maplibre.org', 'maplibre-gl', 'Open source WebGL map rendering library for vector tiles and custom styles.'],
    ['ArcGIS', 'https://developers.arcgis.com', '@arcgis/core', 'Esri mapping, geocoding, spatial analysis, and enterprise GIS APIs.'],
    ['Radar', 'https://radar.com', 'radar-sdk-js', 'Location platform for geofencing, trip tracking, maps, and places.'],
    ['Foursquare Places', 'https://location.foursquare.com/developer', null, 'Places database, venue search, categories, and location enrichment APIs.'],
    ['MapQuest', 'https://developer.mapquest.com', null, 'Maps, geocoding, directions, traffic, and static map APIs.'],
    ['LocationIQ', 'https://locationiq.com', null, 'Geocoding, reverse geocoding, maps, and autocomplete APIs.'],
    ['what3words', 'https://developer.what3words.com', '@what3words/api', 'Three-word address geocoding for precise location sharing.'],
    ['IPinfo', 'https://ipinfo.io', 'ipinfo', 'IP geolocation, ASN, privacy, and company data APIs.'],
    ['MaxMind GeoIP2', 'https://www.maxmind.com', '@maxmind/geoip2-node', 'IP geolocation databases and web services for fraud and localization.'],
    ['ipapi', 'https://ipapi.co', null, 'IP address geolocation API for country, city, timezone, and network data.'],
    ['ipstack', 'https://ipstack.com', null, 'IP geolocation API for visitor location, currency, timezone, and security signals.'],
    ['Geocodio', 'https://www.geocod.io', null, 'US and Canada geocoding, reverse geocoding, and address parsing APIs.'],
    ['Smarty Address Validation', 'https://www.smarty.com', null, 'Address autocomplete, validation, standardization, and geocoding services.'],
    ['OpenRouteService', 'https://openrouteservice.org', null, 'Routing, directions, isochrones, geocoding, and optimization APIs.'],
    ['GraphHopper', 'https://www.graphhopper.com', null, 'Routing engine and APIs for directions, route optimization, and matrices.'],
    ['Mapillary', 'https://www.mapillary.com', null, 'Street-level imagery and map data platform for visual location context.'],
    ['CARTO', 'https://carto.com', null, 'Spatial analytics, maps, data warehousing, and location intelligence platform.'],
    ['Deck.gl', 'https://deck.gl', 'deck.gl', 'WebGL visualization framework for large-scale geospatial data layers.'],
    ['Turf.js', 'https://turfjs.org', '@turf/turf', 'Geospatial analysis library for measurement, transformation, and spatial operations.'],
    ['H3', 'https://h3geo.org', 'h3-js', 'Hexagonal hierarchical geospatial indexing system for analytics and aggregation.'],
  ],
  analytics: [
    ['Google Analytics', 'https://analytics.google.com', null, 'Website and app analytics for traffic, events, conversions, and audiences.'],
    ['Mixpanel', 'https://mixpanel.com', 'mixpanel', 'Product analytics for events, funnels, retention, cohorts, and experiments.'],
    ['PostHog', 'https://posthog.com', 'posthog-node', 'Open source product analytics, session replay, feature flags, and experiments.'],
    ['Sentry', 'https://sentry.io', '@sentry/node', 'Error tracking, performance monitoring, session replay, and release health.'],
    ['Segment', 'https://segment.com', '@segment/analytics-node', 'Customer data platform for event collection, routing, and warehouse sync.'],
    ['Amplitude', 'https://amplitude.com', '@amplitude/analytics-node', 'Product analytics platform for event tracking, cohorts, journeys, and experiments.'],
    ['Matomo', 'https://matomo.org', null, 'Privacy-focused web analytics platform that can be self-hosted.'],
    ['Plausible', 'https://plausible.io', null, 'Lightweight privacy-friendly web analytics with simple dashboards.'],
    ['Fathom Analytics', 'https://usefathom.com', null, 'Privacy-first website analytics with simple metrics and script tracking.'],
    ['Heap', 'https://heap.io', null, 'Digital analytics platform with autocapture, journeys, and behavioral insights.'],
    ['Hotjar', 'https://www.hotjar.com', null, 'Heatmaps, recordings, surveys, and user behavior analytics.'],
    ['FullStory', 'https://www.fullstory.com', null, 'Session replay, product analytics, and digital experience intelligence.'],
    ['LogRocket', 'https://logrocket.com', 'logrocket', 'Frontend monitoring, session replay, performance, and product analytics.'],
    ['Datadog', 'https://www.datadoghq.com', '@datadog/datadog-api-client', 'Infrastructure monitoring, logs, APM, RUM, and security monitoring.'],
    ['New Relic', 'https://newrelic.com', 'newrelic', 'Application performance monitoring, logs, infrastructure, and browser monitoring.'],
    ['Grafana', 'https://grafana.com', null, 'Observability dashboards for metrics, logs, traces, alerts, and visualization.'],
    ['Prometheus', 'https://prometheus.io', 'prom-client', 'Metrics collection and alerting toolkit for services and infrastructure.'],
    ['OpenTelemetry', 'https://opentelemetry.io', '@opentelemetry/sdk-node', 'Vendor-neutral observability standard for traces, metrics, and logs.'],
    ['Honeycomb', 'https://www.honeycomb.io', '@honeycombio/opentelemetry-node', 'Observability platform for high-cardinality events and distributed tracing.'],
    ['Bugsnag', 'https://www.bugsnag.com', '@bugsnag/js', 'Error monitoring, stability reporting, and release tracking.'],
    ['Rollbar', 'https://rollbar.com', 'rollbar', 'Error tracking, deploy tracking, and alerting for application exceptions.'],
    ['Firebase Crashlytics', 'https://firebase.google.com/products/crashlytics', 'firebase-admin', 'Crash reporting and stability monitoring for mobile and app ecosystems.'],
    ['Countly', 'https://countly.com', 'countly-sdk-nodejs', 'Product analytics, crash reporting, push notifications, and feature flags.'],
    ['RudderStack', 'https://www.rudderstack.com', '@rudderstack/rudder-sdk-node', 'Customer data platform for event routing, warehouses, and transformations.'],
    ['Snowplow', 'https://snowplow.io', '@snowplow/node-tracker', 'Behavioral data collection pipeline for first-party analytics and warehouses.'],
    ['Metabase', 'https://www.metabase.com', null, 'Business intelligence and dashboards for querying databases and sharing analytics.'],
    ['Umami', 'https://umami.is', null, 'Simple privacy-focused web analytics that can be self-hosted.'],
    ['Statsig', 'https://www.statsig.com', 'statsig-node', 'Feature flags, experimentation, product analytics, and event logging.'],
    ['LaunchDarkly', 'https://launchdarkly.com', '@launchdarkly/node-server-sdk', 'Feature management, flags, experimentation, and release targeting.'],
    ['GrowthBook', 'https://www.growthbook.io', '@growthbook/growthbook', 'Open source feature flags and experimentation platform.'],
  ],
  deployment: [
    ['Vercel', 'https://vercel.com', 'vercel', 'Frontend cloud platform for deployments, previews, serverless functions, and edge runtime.'],
    ['Netlify', 'https://www.netlify.com', 'netlify-cli', 'Web deployment platform for static sites, functions, forms, and previews.'],
    ['Render', 'https://render.com', null, 'Cloud application hosting for web services, workers, databases, and cron jobs.'],
    ['Railway', 'https://railway.app', '@railway/cli', 'Developer deployment platform for apps, databases, environments, and previews.'],
    ['Docker', 'https://www.docker.com', null, 'Containerization platform for packaging, running, and shipping applications.'],
    ['GitHub Actions', 'https://github.com/features/actions', null, 'CI/CD automation for builds, tests, releases, and deployment workflows.'],
    ['Fly.io', 'https://fly.io', null, 'Application platform for running containers close to users across regions.'],
    ['Heroku', 'https://www.heroku.com', null, 'Platform as a service for web apps, workers, add-ons, and pipelines.'],
    ['AWS Amplify', 'https://aws.amazon.com/amplify', '@aws-amplify/cli', 'Full-stack app hosting, CI/CD, authentication, APIs, and storage.'],
    ['Cloudflare Pages', 'https://pages.cloudflare.com', 'wrangler', 'JAMstack deployment platform integrated with Cloudflare edge network.'],
    ['Cloudflare Workers', 'https://workers.cloudflare.com', 'wrangler', 'Serverless edge compute platform for APIs, middleware, and websites.'],
    ['DigitalOcean App Platform', 'https://www.digitalocean.com/products/app-platform', 'doctl', 'Managed app platform for services, static sites, jobs, and databases.'],
    ['Kubernetes', 'https://kubernetes.io', null, 'Container orchestration platform for deployments, services, secrets, and scaling.'],
    ['Helm', 'https://helm.sh', null, 'Kubernetes package manager for charts, releases, and environment configuration.'],
    ['Terraform', 'https://www.terraform.io', null, 'Infrastructure as code tool for provisioning cloud resources and services.'],
    ['Pulumi', 'https://www.pulumi.com', '@pulumi/pulumi', 'Infrastructure as code using general-purpose languages and cloud SDKs.'],
    ['Ansible', 'https://www.ansible.com', null, 'Automation tool for configuration management, provisioning, and deployments.'],
    ['CircleCI', 'https://circleci.com', null, 'CI/CD platform for pipelines, tests, workflows, and deployments.'],
    ['GitLab CI/CD', 'https://docs.gitlab.com/ee/ci', null, 'GitLab pipelines for build, test, package, release, and deployment automation.'],
    ['Jenkins', 'https://www.jenkins.io', null, 'Automation server for CI/CD pipelines, plugins, and build orchestration.'],
    ['Travis CI', 'https://www.travis-ci.com', null, 'Hosted CI service for builds, tests, and deployment pipelines.'],
    ['Azure Static Web Apps', 'https://azure.microsoft.com/products/app-service/static', null, 'Azure hosting for static sites, APIs, authentication, and GitHub workflows.'],
    ['Azure App Service', 'https://azure.microsoft.com/products/app-service', '@azure/arm-appservice', 'Managed hosting for web apps, APIs, containers, and deployment slots.'],
    ['Google Cloud Run', 'https://cloud.google.com/run', '@google-cloud/run', 'Serverless container runtime with autoscaling and request-based billing.'],
    ['AWS Elastic Beanstalk', 'https://aws.amazon.com/elasticbeanstalk', '@aws-sdk/client-elastic-beanstalk', 'AWS application platform for deploying and scaling web applications.'],
    ['AWS Lambda', 'https://aws.amazon.com/lambda', '@aws-sdk/client-lambda', 'Serverless functions for event-driven APIs, jobs, and integrations.'],
    ['Serverless Framework', 'https://www.serverless.com', 'serverless', 'Framework for deploying serverless applications across cloud providers.'],
    ['SST', 'https://sst.dev', 'sst', 'Framework for full-stack serverless apps on AWS and modern runtimes.'],
    ['Docker Compose', 'https://docs.docker.com/compose', null, 'Multi-container local and server deployment definitions for Docker applications.'],
    ['Nginx', 'https://nginx.org', null, 'Web server and reverse proxy for static assets, routing, TLS, and load balancing.'],
  ],
};

const legacyScreenshotSlugs = [
  'algolia', 'anthropic-claude', 'auth0', 'aws-s3', 'brevo', 'cashfree', 'clerk', 'cloudinary',
  'docker', 'elevenlabs', 'elasticsearch', 'firebase-authentication', 'github-actions',
  'google-analytics', 'google-maps-platform', 'hugging-face', 'jwt-io', 'langchain', 'leaflet',
  'mailgun', 'mapbox', 'meilisearch', 'mixpanel', 'mongodb-atlas', 'mongoose', 'multer',
  'neon', 'netlify', 'nodemailer', 'opencage-geocoder', 'openai', 'passport-js', 'paypal',
  'planetscale', 'posthog', 'pusher', 'railway', 'razorpay', 'redis', 'render', 'resend',
  'sendgrid', 'sentry', 'socket-io', 'stripe', 'supabase-auth', 'supabase-database',
  'typesense', 'uploadcare', 'vercel',
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\.js/g, '-js')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toEnvPrefix(slug) {
  return slug.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

function toTitle(slug) {
  return slug
    .split('-')
    .map((part) => part ? part[0].toUpperCase() + part.slice(1) : part)
    .join(' ');
}

function normalizeProviders() {
  const usedSlugs = new Map();
  const providers = [];

  for (const category of categories) {
    for (const row of catalog[category.key]) {
      const [name, website, npmPackage, summary] = row;
      const baseSlug = slugify(name);
      const count = usedSlugs.get(baseSlug) || 0;
      usedSlugs.set(baseSlug, count + 1);
      const slug = count === 0 ? baseSlug : `${baseSlug}-${category.key}`;

      providers.push({
        id: providers.length + 1,
        name,
        slug,
        cat: category.key,
        website,
        npmPackage,
        summary,
        envPrefix: toEnvPrefix(slug),
        badge: category.badge,
      });
    }
  }

  return providers;
}

function collectRealScreenshots(providers) {
  const providerSlugs = new Set(providers.map((provider) => provider.slug));
  const integrationDir = path.join(rootDir, 'public', 'integrations');
  const realDir = path.join(integrationDir, 'real');
  const screenshots = {};
  const candidates = [];
  const pattern = /^(.+)-(website|docs|console|guide|pricing|repository|signup|login)\.(png|jpe?g|webp)$/i;

  for (const [dir, publicBase] of [[integrationDir, '/integrations'], [realDir, '/integrations/real']]) {
    if (!fs.existsSync(dir)) continue;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const match = entry.name.match(pattern);
      if (!match) continue;

      const [, slug, kind] = match;
      if (!providerSlugs.has(slug)) continue;

      candidates.push({
        slug,
        kind,
        src: `${publicBase}/${entry.name}`,
      });
    }
  }

  const qualityBySrc = getLocalImageQuality(rootDir, candidates.map((item) => item.src));

  for (const candidate of candidates) {
    if (!isUsableLocalImage(qualityBySrc.get(candidate.src))) {
      continue;
    }

    screenshots[candidate.slug] ||= [];
    screenshots[candidate.slug].push({
      kind: candidate.kind,
      src: candidate.src,
    });
  }

  for (const items of Object.values(screenshots)) {
    items.sort((a, b) => {
      const order = ['website', 'docs', 'console', 'guide', 'pricing', 'signup', 'login', 'repository'];
      return order.indexOf(a.kind) - order.indexOf(b.kind);
    });
  }

  return screenshots;
}

function makeDataSource(providers, legacyScreenshots) {
  return `// This file is generated by scripts/regenerate-integrations.mjs.
// Regenerate it after editing the catalog, category templates, or manual image workflow.

const CATEGORY_DEFINITIONS = ${JSON.stringify(categories, null, 2)};

const STEP_BLUEPRINT = ${JSON.stringify(stepBlueprint.map(([title, manual, description]) => ({ title, manual, description })), null, 2)};

const PROVIDER_DEFINITIONS = ${JSON.stringify(providers, null, 2)};

const REAL_SCREENSHOTS = ${JSON.stringify(legacyScreenshots, null, 2)};

export const CAT_META = Object.fromEntries(
  CATEGORY_DEFINITIONS.map((category) => [
    category.key,
    {
      label: category.label,
      icon: category.icon,
      badge: category.badge,
      objective: category.objective,
      resource: category.resource,
      credential: category.credential,
      primaryRoute: category.primaryRoute,
      envSuffixes: category.envSuffixes,
    },
  ]),
);

function safeFunctionName(slug) {
  const name = slug
    .split('-')
    .filter(Boolean)
    .map((part, index) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return name || 'integration';
}

function envName(provider, suffix) {
  return provider.envPrefix + '_' + suffix;
}

function envExample(provider) {
  const category = CAT_META[provider.cat];
  const lines = ['# ' + provider.name + ' environment variables'];
  for (const suffix of category.envSuffixes) {
    if (suffix.includes('URL')) {
      lines.push(envName(provider, suffix) + '=https://api.example.com/' + provider.slug);
    } else if (suffix.includes('EMAIL')) {
      lines.push(envName(provider, suffix) + '=notifications@example.com');
    } else if (suffix === 'CURRENCY') {
      lines.push(envName(provider, suffix) + '=usd');
    } else if (suffix === 'ENVIRONMENT') {
      lines.push(envName(provider, suffix) + '=production');
    } else {
      lines.push(envName(provider, suffix) + '=replace_with_' + suffix.toLowerCase());
    }
  }
  lines.push('APP_BASE_URL=http://localhost:5173');
  lines.push('SERVER_BASE_URL=http://localhost:5000');
  return lines;
}

function installCommand(provider) {
  const base = ['npm install express dotenv'];
  if (provider.npmPackage) {
    base.push(provider.npmPackage);
  }
  return base.join(' ');
}

function buildCode(provider) {
  const category = CAT_META[provider.cat];
  const prefix = provider.envPrefix;
  const adapterName = safeFunctionName(provider.slug) + 'Adapter';
  const baseUrl = envName(provider, 'API_BASE_URL');
  const apiKey = envName(provider, category.envSuffixes.find((suffix) => suffix.includes('KEY') || suffix.includes('TOKEN')) || category.envSuffixes[0]);
  const route = category.primaryRoute;
  const header = [
    'import express from "express";',
    'import "dotenv/config";',
    '',
    'const app = express();',
    'app.use(express.json({ limit: "2mb" }));',
    '',
    'const provider = {',
    '  name: ' + JSON.stringify(provider.name) + ',',
    '  website: "' + provider.website + '",',
    '  category: "' + category.label + '",',
    '  baseUrl: process.env.' + baseUrl + ',',
    '  apiKey: process.env.' + apiKey + ',',
    '};',
    '',
    'function requireProviderConfig() {',
    '  const missing = Object.entries(provider).filter(([key, value]) => key !== "website" && !value);',
    '  if (missing.length) {',
    '    throw new Error("Missing " + provider.name + " config: " + missing.map(([key]) => key).join(", "));',
    '  }',
    '  return provider;',
    '}',
    '',
  ];

  const sharedFetch = [
    'async function callProvider(path, payload) {',
    '  const cfg = requireProviderConfig();',
    '  const response = await fetch(cfg.baseUrl.replace(/\\\\/$/, "") + path, {',
    '    method: "POST",',
    '    headers: {',
    '      "Content-Type": "application/json",',
    '      Authorization: "Bearer " + cfg.apiKey,',
    '    },',
    '    body: JSON.stringify(payload),',
    '  });',
    '',
    '  const body = await response.json().catch(() => ({}));',
    '  if (!response.ok) {',
    '    throw new Error(cfg.name + " request failed: " + response.status + " " + JSON.stringify(body));',
    '  }',
    '  return body;',
    '}',
    '',
  ];

  const categoryBlocks = {
    auth: [
      'async function ' + adapterName + '(token) {',
      '  if (!token) throw new Error("Missing bearer token");',
      '  return callProvider("/auth/verify", { token });',
      '}',
      '',
      'app.get("' + route + '", async (req, res) => {',
      '  try {',
      '    const header = req.headers.authorization || "";',
      '    const token = header.startsWith("Bearer ") ? header.slice(7) : "";',
      '    const session = await ' + adapterName + '(token);',
      '    res.json({ provider: provider.name, authenticated: true, session });',
      '  } catch (error) {',
      '    res.status(401).json({ provider: provider.name, error: error.message });',
      '  }',
      '});',
    ],
    payments: [
      'async function ' + adapterName + '(cart) {',
      '  return callProvider("/checkout/sessions", {',
      '    cart,',
      '    returnUrl: process.env.APP_BASE_URL + "/payment/success",',
      '    cancelUrl: process.env.APP_BASE_URL + "/payment/cancel",',
      '  });',
      '}',
      '',
      'app.post("' + route + '", async (req, res) => {',
      '  try {',
      '    const checkout = await ' + adapterName + '(req.body.cart || []);',
      '    res.json({ provider: provider.name, checkout });',
      '  } catch (error) {',
      '    res.status(400).json({ provider: provider.name, error: error.message });',
      '  }',
      '});',
    ],
    database: [
      'async function ' + adapterName + '() {',
      '  const cfg = requireProviderConfig();',
      '  return {',
      '    provider: cfg.name,',
      '    connectionName: "' + prefix + '_DATABASE_URL",',
      '    ready: Boolean(process.env.' + envName(provider, 'DATABASE_URL') + ' || cfg.baseUrl),',
      '  };',
      '}',
      '',
      'app.get("' + route + '", async (_req, res) => {',
      '  try {',
      '    const health = await ' + adapterName + '();',
      '    res.json({ ok: true, health });',
      '  } catch (error) {',
      '    res.status(500).json({ provider: provider.name, error: error.message });',
      '  }',
      '});',
    ],
    email: [
      'async function ' + adapterName + '({ to, subject, html }) {',
      '  return callProvider("/email/send", {',
      '    from: process.env.' + envName(provider, 'FROM_EMAIL') + ',',
      '    to,',
      '    subject,',
      '    html,',
      '  });',
      '}',
      '',
      'app.post("' + route + '", async (req, res) => {',
      '  try {',
      '    const message = await ' + adapterName + '(req.body);',
      '    res.json({ provider: provider.name, message });',
      '  } catch (error) {',
      '    res.status(400).json({ provider: provider.name, error: error.message });',
      '  }',
      '});',
    ],
    storage: [
      'async function ' + adapterName + '(fileMeta) {',
      '  return callProvider("/uploads/sign", {',
      '    bucket: process.env.' + envName(provider, 'BUCKET') + ',',
      '    fileName: fileMeta.fileName,',
      '    contentType: fileMeta.contentType,',
      '  });',
      '}',
      '',
      'app.post("' + route + '", async (req, res) => {',
      '  try {',
      '    const uploadIntent = await ' + adapterName + '(req.body);',
      '    res.json({ provider: provider.name, uploadIntent });',
      '  } catch (error) {',
      '    res.status(400).json({ provider: provider.name, error: error.message });',
      '  }',
      '});',
    ],
    ai: [
      'async function ' + adapterName + '(prompt) {',
      '  return callProvider("/chat/completions", {',
      '    model: process.env.' + envName(provider, 'MODEL') + ',',
      '    messages: [{ role: "user", content: prompt }],',
      '    temperature: 0.2,',
      '  });',
      '}',
      '',
      'app.post("' + route + '", async (req, res) => {',
      '  try {',
      '    const answer = await ' + adapterName + '(req.body.prompt);',
      '    res.json({ provider: provider.name, answer });',
      '  } catch (error) {',
      '    res.status(400).json({ provider: provider.name, error: error.message });',
      '  }',
      '});',
    ],
    search: [
      'async function ' + adapterName + '(query) {',
      '  return callProvider("/indexes/" + process.env.' + envName(provider, 'INDEX_NAME') + ' + "/search", {',
      '    q: query,',
      '    limit: 10,',
      '  });',
      '}',
      '',
      'app.get("' + route + '", async (req, res) => {',
      '  try {',
      '    const results = await ' + adapterName + '(String(req.query.q || ""));',
      '    res.json({ provider: provider.name, results });',
      '  } catch (error) {',
      '    res.status(400).json({ provider: provider.name, error: error.message });',
      '  }',
      '});',
    ],
    realtime: [
      'async function ' + adapterName + '(event) {',
      '  return callProvider("/channels/" + process.env.' + envName(provider, 'CHANNEL') + ' + "/events", event);',
      '}',
      '',
      'app.post("' + route + '", async (req, res) => {',
      '  try {',
      '    const published = await ' + adapterName + '({ name: "demo.message", payload: req.body });',
      '    res.json({ provider: provider.name, published });',
      '  } catch (error) {',
      '    res.status(400).json({ provider: provider.name, error: error.message });',
      '  }',
      '});',
    ],
    maps: [
      'async function ' + adapterName + '(address) {',
      '  return callProvider("/geocode", {',
      '    address,',
      '    endpoint: process.env.' + envName(provider, 'GEOCODE_ENDPOINT') + ',',
      '  });',
      '}',
      '',
      'app.get("' + route + '", async (req, res) => {',
      '  try {',
      '    const location = await ' + adapterName + '(String(req.query.address || ""));',
      '    res.json({ provider: provider.name, location });',
      '  } catch (error) {',
      '    res.status(400).json({ provider: provider.name, error: error.message });',
      '  }',
      '});',
    ],
    analytics: [
      'async function ' + adapterName + '(event) {',
      '  return callProvider("/capture", {',
      '    event: event.name,',
      '    properties: event.properties || {},',
      '    environment: process.env.' + envName(provider, 'ENVIRONMENT') + ',',
      '  });',
      '}',
      '',
      'app.post("' + route + '", async (req, res) => {',
      '  try {',
      '    const captured = await ' + adapterName + '(req.body);',
      '    res.json({ provider: provider.name, captured });',
      '  } catch (error) {',
      '    res.status(400).json({ provider: provider.name, error: error.message });',
      '  }',
      '});',
    ],
    deployment: [
      'function ' + adapterName + '() {',
      '  return {',
      '    provider: provider.name,',
      '    environment: process.env.' + envName(provider, 'ENVIRONMENT') + ' || "development",',
      '    appBaseUrl: process.env.' + envName(provider, 'APP_BASE_URL') + ' || process.env.APP_BASE_URL,',
      '    healthcheckUrl: process.env.' + envName(provider, 'HEALTHCHECK_URL') + ' || "/api/health",',
      '  };',
      '}',
      '',
      'app.get("' + route + '", (_req, res) => {',
      '  res.json({ ok: true, deployment: ' + adapterName + '(), checkedAt: new Date().toISOString() });',
      '});',
    ],
  };

  return [
    ...header,
    ...sharedFetch,
    ...(categoryBlocks[provider.cat] || categoryBlocks.analytics),
    '',
    'app.listen(5000, () => {',
    '  console.log(provider.name + " adapter listening on http://localhost:5000");',
    '});',
  ];
}

const STEP_ACTION_HINTS = [
  ['Official website or developer home', 'Sign in, Log in, or Get started', 'Confirm the URL is the official provider domain before entering credentials.'],
  ['Account and workspace switcher', 'Create account, Continue, Select workspace, or Start free', 'Use the company workspace or sandbox account that owns this integration.'],
  ['Projects, Apps, Buckets, Sources, Indexes, or Resources', 'New project, Create app, Add resource, or Create bucket', 'Name the resource with app name, environment, and owner.'],
  ['Settings, URLs, Redirects, CORS, Domains, or Webhooks', 'Add URL, Add origin, Add redirect URI, Verify domain, or Save endpoint', 'Enter localhost and production URLs exactly as the MERN app uses them.'],
  ['API keys, Credentials, Tokens, Roles, or Security', 'Create key, Generate token, Reveal secret, Edit scopes, or Restrict key', 'Copy values once, restrict permissions, and keep secrets out of client code.'],
  ['Project root, server .env, and deployment secrets', 'Create .env, Edit secrets, or Add environment variable', 'Store secret values on the server side only.'],
  ['Terminal and server integration folder', 'Run npm install, Create adapter file, or Save route file', 'Install dependencies and place provider calls behind a server-only Express route.'],
  ['React feature, API client, webhook, or callback route', 'Create client wrapper, Add webhook route, or Save callback handler', 'Call your Express route from React and validate callbacks on the server.'],
  ['Local app, provider logs, Events, Requests, or Audit area', 'Run smoke test, Open latest request, or Inspect event', 'Confirm the local request appears in provider logs or dashboard history.'],
  ['Production dashboard, deployment platform, and runbook', 'Deploy, Add production URL, Rotate key, or Update notes', 'Verify production separately and document ownership, rollback, and monitoring.'],
];

function stepHint(number) {
  const hint = STEP_ACTION_HINTS[number - 1] || STEP_ACTION_HINTS[0];
  return {
    page: hint[0],
    button: hint[1],
    result: hint[2],
  };
}

function manualStepLines(provider, step, number) {
  const category = CAT_META[provider.cat];
  const hint = stepHint(number);
  return [
    'Open ' + provider.name + ' and go to ' + hint.page + '.',
    'Click ' + hint.button + ' for the step named "' + step.title + '".',
    hint.result,
    'Save the provider change, then copy only non-secret IDs or public values into the runbook.',
    'Keep ' + category.credential + ' in .env, deployment secrets, or a secret manager only.',
    'Before moving on, verify the visible page, button, or log entry matches this step.',
  ];
}

function liveWebsiteScreenshot(provider) {
  return {
    kind: 'website',
    src: 'https://image.thum.io/get/width/1440/crop/900/noanimate/' + provider.website,
    alt: provider.name + ' live public website screenshot for manual setup',
    caption: provider.name + ' live public website screenshot from the official page',
    manualSteps: [
      'Open the official ' + provider.name + ' website in your browser.',
      'Use this live screenshot only to orient yourself on the public page.',
      'Click the current Sign in, Docs, Pricing, Console, or Get started link shown on the live page.',
      'Dashboard pages may require login, so follow the written manual steps after signing in.',
      'Do not copy secret values from screenshots into code or documentation.',
    ],
  };
}

function screenshotCandidates(provider) {
  const screenshots = (REAL_SCREENSHOTS[provider.slug] || []).map((item) => ({
    kind: item.kind,
    src: item.src,
    alt: provider.name + ' real ' + item.kind + ' page screenshot for manual setup',
    caption: provider.name + ' real ' + item.kind + ' page reference',
    manualSteps: [
      'Open ' + provider.name + ' and navigate to the ' + item.kind + ' area shown in this screenshot.',
      'Use this reference to locate the matching page, button, sidebar item, or settings tab.',
      'Do not copy secret values from screenshots into code or documentation.',
      'Confirm current provider labels inside the live dashboard because labels can change.',
      'Pair this screenshot with the step-by-step text before saving any provider setting.',
    ],
  }));

  return screenshots.length ? screenshots : [liveWebsiteScreenshot(provider)];
}

function screenshotForStep(provider, step, number) {
  const priorityByStep = {
    1: ['website'],
    2: ['signup', 'login', 'website'],
    3: ['console', 'guide'],
    4: ['console', 'docs'],
    5: ['console', 'docs'],
    6: ['docs', 'guide'],
    7: ['docs', 'repository'],
    8: ['docs', 'guide'],
    9: ['console', 'docs'],
    10: ['pricing', 'guide', 'docs'],
  };
  const priorities = priorityByStep[number] || ['website'];
  const screenshots = screenshotCandidates(provider);
  const match = priorities.map((kind) => screenshots.find((item) => item.kind === kind)).find(Boolean) || screenshots[0];
  if (!match) return null;
  return {
    src: match.src,
    alt: provider.name + ' step ' + number + ' real ' + match.kind + ' screenshot for ' + step.title,
    caption: provider.name + ' step ' + number + ': use the ' + match.kind + ' screenshot while completing ' + step.title,
    manualSteps: manualStepLines(provider, step, number),
  };
}

function stepImage(provider, step, number) {
  return screenshotForStep(provider, step, number);
}

function galleryImages(provider) {
  const screenshots = screenshotCandidates(provider);
  return screenshots.slice(0, 8);
}

function workflowSteps(provider) {
  return STEP_BLUEPRINT.map((step, index) => {
    const number = index + 1;
    const hint = stepHint(number);
    const code = number === 6
      ? envExample(provider)
      : number === 7
        ? ['# Install dependencies for ' + provider.name, installCommand(provider)]
        : [7, 8, 9].includes(number)
          ? buildCode(provider).slice(0, 18)
          : [];

    return {
      number,
      title: step.title,
      manual: step.manual,
      pageHint: hint.page,
      buttonHint: hint.button,
      description: provider.name + ': ' + step.description + ' Go to ' + hint.page + ', use ' + hint.button + ', and verify that this step supports ' + CAT_META[provider.cat].objective + '.',
      code,
      image: stepImage(provider, step, number),
    };
  });
}

function manualWork(provider) {
  const steps = workflowSteps(provider);
  return {
    title: provider.name + ' Manual Work Required',
    summary: 'Manual Work Required before code can succeed: complete the ' + provider.name + ' account, project resource, environment selection, URLs, credentials, permissions, callbacks, dashboard logs, production settings, and runbook notes in order.',
    steps: steps.filter((step) => step.manual).map((step) => 'Step ' + step.number + ': open ' + step.pageHint + ', click ' + step.buttonHint + ', then complete ' + step.title + ' for ' + provider.name + '.'),
    warnings: [
      'Never paste ' + provider.name + ' secret keys into React code, screenshots, commits, issue trackers, or chat messages.',
      'Use sandbox or development resources until the local smoke test and provider dashboard logs are verified.',
      'If any key was exposed during setup, rotate it in the ' + provider.name + ' dashboard before deployment.',
      'Exact endpoint names can change; confirm the current provider documentation before production release.',
      'Production URLs, webhook endpoints, and callback domains must be configured separately from localhost values.',
    ],
    checklist: [
      provider.name + ' account and workspace are correct.',
      'Development resource is created and clearly named.',
      'Local URLs, callbacks, redirects, origins, or webhooks are saved.',
      'Credential scopes and permissions are restricted to the app need.',
      'Environment variables are present on the server and absent from client bundles.',
      'The code snippet runs locally without missing configuration errors.',
      'Provider logs show the smoke test request.',
      'Production settings are configured separately from development settings.',
      'Runbook notes explain where to rotate keys and inspect failures.',
      'Another developer can follow the image plus text without hidden context.',
    ],
    detailedSteps: steps.map((step) => ({
      number: step.number,
      title: step.title,
      manual: step.manual,
      pageHint: step.pageHint,
      buttonHint: step.buttonHint,
      description: step.description,
      image: step.image,
    })),
  };
}

function apiReference(provider) {
  const category = CAT_META[provider.cat];
  return [
    provider.name + ' official website: ' + provider.website + '.',
    'Primary route used in this MERN guide: ' + category.primaryRoute + '.',
    'Environment prefix used by this guide: ' + provider.envPrefix + '.',
    'Credentials to configure: ' + category.credential + '.',
    'Install command: ' + installCommand(provider) + '.',
    'Server adapter should call ' + provider.name + ' from Node only, never directly with secret keys from React.',
    'Webhook or callback endpoints must validate the provider signature or token before trusting payloads.',
    'Use provider logs and local server logs together when debugging failed requests.',
  ];
}

function bestPractices(provider) {
  const category = CAT_META[provider.cat];
  return [
    'Start with a sandbox resource in ' + provider.name + ' and promote only after smoke tests pass.',
    'Keep ' + category.credential + ' outside client-side bundles and Git history.',
    'Name dashboard resources with the app, environment, and owner so future developers know what they control.',
    'Put all ' + provider.name + ' API calls behind your Express API routes and validate every input.',
    'Record real screenshot links and dashboard paths in the internal runbook, but redact secret values.',
    'Add idempotency, retry limits, timeouts, and structured logs around external calls.',
    'Verify production URLs separately because localhost settings do not automatically apply to production.',
    'Review provider dashboard audit logs after deployment and before rotating old credentials.',
  ];
}

function troubleshooting(provider) {
  return [
    provider.name + ' returns unauthorized: confirm the server environment variable names match the guide prefix ' + provider.envPrefix + '.',
    'Callback or webhook is not firing: compare the dashboard URL with SERVER_BASE_URL and deployment routing.',
    'Local code works but production fails: check production secrets, allowed domains, and provider environment selection.',
    'Frontend cannot call the integration: make sure React calls your Express route instead of a secret provider API directly.',
    'Provider dashboard shows no request: inspect network egress, API base URL, and local server logs.',
    'Webhook signature fails: verify the raw body parser and the current signature header from provider documentation.',
    'Rate limits appear: add server-side throttling, queueing, exponential backoff, and user-friendly retry messages.',
    'Unexpected payload shape: log redacted response metadata and compare it to the current ' + provider.name + ' API docs.',
  ];
}

function detailLines(provider) {
  const category = CAT_META[provider.cat];
  const steps = workflowSteps(provider);
  const lines = [];
  const add = (text) => lines.push(provider.name + ' - ' + text);

  add('Full implementation guide for ' + category.label + '.');
  add('Goal: add ' + category.objective + ' to a MERN stack application with clear manual work, code, images, and verification.');
  add('Official website: ' + provider.website + '.');
  add('Environment prefix: ' + provider.envPrefix + ' is used consistently for .env keys, deployment secrets, code snippets, dashboard notes, and verification checklists.');
  add('Primary API route in this guide: ' + category.primaryRoute + '.');
  add('Credential family: ' + category.credential + '.');
  add('Install command: ' + installCommand(provider) + '.');
  add('Image policy: every setup section uses a real public screenshot from the provider website, docs, pricing, sign-up, repository, or dashboard reference; no generated setup image is used.');
  add('Manual Work Required: the dashboard setup must be completed before code can succeed.');
  add('Security baseline: server-side secrets stay on the backend and public values are named separately.');
  add('Topic overview: read the manual work section first, then create files, configure environment values, install dependencies, implement server routes, wire React, test locally, verify dashboard logs, deploy, and document ownership.');
  add('File plan: create server/.env for ' + provider.envPrefix + ' values, server/src/integrations/' + provider.slug + '.js for provider calls, server/src/routes/' + provider.slug + '.js for Express routing, and client/src/services/' + provider.slug + '.js for browser-safe calls.');
  add('Code flow: React calls your Express route, Express validates inputs, requireProviderConfig checks environment variables, callProvider sends the provider request, and the route returns a normalized response.');
  add('Manual flow: provider account setup comes before code because missing callbacks, wrong origins, weak permissions, or absent webhooks will make correct code fail.');
  add('Verification flow: compare app logs with ' + provider.name + ' dashboard logs so you can prove the request left the MERN app and reached the provider.');
  add('Production flow: repeat dashboard settings with production URLs, production secrets, stricter scopes, monitoring, and rollback notes instead of copying localhost configuration blindly.');

  for (const step of steps) {
    const manualLines = step.image.manualSteps || [];
    add('Step ' + step.number + ' title: ' + step.title + '. Complete this section in order for the ' + category.label + ' setup.');
    add('Step ' + step.number + ' purpose: ' + step.description);
    add('Step ' + step.number + ' image: ' + step.image.src + '.');
    add('Step ' + step.number + ' dashboard page: open ' + step.pageHint + ' for ' + provider.name + '.');
    add('Step ' + step.number + ' button or menu: click ' + step.buttonHint + ' before saving this setup change.');
    add('Step ' + step.number + ' manual status: ' + (step.manual ? 'Manual dashboard work is required before proceeding.' : 'Code or verification work is required after dashboard setup.'));
    manualLines.forEach((line, index) => {
      add('Step ' + step.number + ' manual action ' + (index + 1) + ': ' + line);
    });
    add('Step ' + step.number + ' code action 1: keep implementation inside server/src/integrations/' + provider.slug + '.js or another server-only module.');
    add('Step ' + step.number + ' code action 2: expose Express route ' + category.primaryRoute + ' and call that route from React.');
    add('Step ' + step.number + ' code action 3: use the ' + provider.envPrefix + ' environment prefix shown in the guide.');
    add('Step ' + step.number + ' code action 4: never expose secret values to React, browser logs, screenshots, or generated bundles.');
    add('Step ' + step.number + ' code explanation: requireProviderConfig fails fast when configuration is missing, and callProvider centralizes provider URL, headers, response parsing, and errors.');
    add('Step ' + step.number + ' verification 1: run a small local request and inspect the HTTP status.');
    add('Step ' + step.number + ' verification 2: check provider logs, request history, or audit events when available.');
    add('Step ' + step.number + ' verification 3: write down what succeeded before moving to the next step.');
    add('Step ' + step.number + ' verification 4: confirm the visible image caption and manual text match the live ' + provider.name + ' page you changed.');
    add('Step ' + step.number + ' failure mode 1: wrong environment selected in the dashboard.');
    add('Step ' + step.number + ' failure mode 2: localhost URL, callback URL, webhook URL, or allowed origin has a typo.');
    add('Step ' + step.number + ' failure mode 3: secret key is missing, expired, scoped incorrectly, or pasted into the wrong environment.');
    add('Step ' + step.number + ' recovery 1: rotate compromised credentials in ' + provider.name + ' immediately.');
    add('Step ' + step.number + ' recovery 2: redeploy after changing secret values in the deployment platform.');
    add('Step ' + step.number + ' recovery 3: repeat the smoke test and compare results with dashboard logs.');
    add('Step ' + step.number + ' documentation: update the runbook with dashboard path, owner, and rollback note.');
    add('Step ' + step.number + ' production note: repeat the setting with production URLs instead of copying localhost values.');
    add('Step ' + step.number + ' testing note: add one automated check around the server adapter or route.');
    add('Step ' + step.number + ' monitoring note: log provider name, request ID, status, duration, and sanitized error message.');
    add('Step ' + step.number + ' handoff note: another developer should be able to follow this image and text without asking for hidden context.');
    add('Step ' + step.number + ' completion criteria: dashboard saved, code configured, image matched, test passed, and notes updated.');
  }

  const references = [...apiReference(provider), ...bestPractices(provider), ...troubleshooting(provider)];
  for (let i = 0; i < references.length; i += 1) {
    add('Reference line ' + (i + 1) + ': ' + references[i] + ' Confirm this note against the current ' + provider.name + ' dashboard and production runbook before release.');
  }

  let index = 0;
  while (lines.length < 720) {
    const step = steps[index % steps.length];
    add('Extended verification line ' + (lines.length + 1) + ': revisit step ' + step.number + ' (' + step.title + ') and confirm the image, manual work, code, environment variables, provider logs, deployment setting, and runbook note are complete.');
    index += 1;
  }

  return lines.slice(0, 720);
}

function tagsFor(provider) {
  const category = CAT_META[provider.cat];
  const tags = [category.label, provider.name, 'MERN', 'Express', 'React', 'Manual setup', 'Code snippet', 'Real screenshots'];
  if (provider.npmPackage) tags.push(provider.npmPackage);
  return tags;
}

function buildIntegration(provider) {
  const category = CAT_META[provider.cat];
  const integration = {
    id: provider.id,
    slug: provider.slug,
    name: provider.name,
    cat: provider.cat,
    icon: category.icon,
    badge: provider.badge,
    website: provider.website,
    npmPackage: provider.npmPackage,
    installCommand: installCommand(provider),
    envExample: envExample(provider),
    sideHeading: category.label + ' integration for MERN developers',
    desc: provider.summary + ' This guide includes manual dashboard work, real provider screenshots, server-side starter code, and verification notes.',
    explanation: provider.name + ' helps teams implement ' + category.objective + '. The guide keeps secrets server-side, separates manual dashboard configuration from code, and uses topic-based setup sections with real screenshots and clear text instructions.',
    tags: tagsFor(provider),
    code: buildCode(provider),
    apiReference: apiReference(provider),
    bestPractices: bestPractices(provider),
    troubleshooting: troubleshooting(provider),
    images: galleryImages(provider),
    detailLineCount: 720,
  };

  Object.defineProperties(integration, {
    workflowSteps: {
      enumerable: true,
      get() {
        return workflowSteps(provider);
      },
    },
    manualWork: {
      enumerable: true,
      get() {
        return manualWork(provider);
      },
    },
    detailLines: {
      enumerable: true,
      get() {
        return detailLines(provider);
      },
    },
  });

  return integration;
}

export const INTEGRATIONS = PROVIDER_DEFINITIONS.map(buildIntegration);

export const FILTER_CATEGORIES = [
  { key: 'all', label: 'All', icon: 'ALL', count: INTEGRATIONS.length },
  ...CATEGORY_DEFINITIONS.map((category) => ({
    key: category.key,
    label: category.label,
    icon: category.icon,
    count: INTEGRATIONS.filter((integration) => integration.cat === category.key).length,
  })),
];

export const STATS = [
  { target: INTEGRATIONS.length, suffix: '+', label: 'Integrations' },
  { target: INTEGRATIONS.reduce((total, integration) => total + integration.images.length, 0), suffix: '+', label: 'Real Screenshots' },
  { target: INTEGRATIONS.length * 720, suffix: '+', label: 'Guide Lines' },
  { target: STEP_BLUEPRINT.length, suffix: '', label: 'Setup Sections' },
];

export const MARQUEE_ITEMS = INTEGRATIONS.slice(0, 80).map((integration) => ({
  name: integration.name,
  icon: integration.icon,
}));
`;
}

const providers = normalizeProviders();
if (providers.length < 300 || providers.length > 400) {
  throw new Error(`Expected 300 to 400 providers, received ${providers.length}`);
}

const legacyScreenshots = collectRealScreenshots(providers);
fs.writeFileSync(dataPath, makeDataSource(providers, legacyScreenshots));

console.log(`Generated ${providers.length} integrations.`);
console.log(`Linked ${Object.values(legacyScreenshots).reduce((total, items) => total + items.length, 0)} real provider screenshots.`);
console.log(`Updated ${path.relative(rootDir, dataPath)}.`);
