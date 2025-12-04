Comprehensive Security Verification Guidelines for Next.js and React Applications
Executive Summary
The transition from traditional server-rendered applications to the modern, hybrid architectures of Next.js and React has fundamentally altered the web security landscape. The introduction of the App Router, React Server Components (RSC), and Server Actions has dissolved the rigid boundary between client and server, creating a unified development experience that simultaneously introduces novel attack vectors. For automated coding agents and security engineers tasked with auditing these applications, relying on legacy heuristics is insufficient. A nuanced understanding of how Next.js handles data serialization, hydration, and server-side execution is paramount to identifying vulnerabilities that slip past standard static analysis tools.

This report establishes an exhaustive verification framework for Next.js and React applications, with a specific focus on the App Router architecture (versions 13, 14, and 15). It synthesizes official documentation, industry standards such as the OWASP Top 10, and emerging security research into a definitive guide. The analysis covers the entire application lifecycle, starting from infrastructure configuration and HTTP hardening, moving through robust authentication and authorization strategies, and culminating in deep-dive verification of Server Actions and client-side rendering risks. Furthermore, it details the integration of automated auditing toolchains—including OSV-Scanner, TruffleHog, and Snyk—to establish a continuous defense-in-depth posture. The guidelines herein are designed to be actionable, rigorous, and adaptable to the evolving threat landscape of modern JavaScript meta-frameworks.

1. The Evolving Security Perimeter in Next.js Architectures
The architectural evolution of Next.js has shifted the security perimeter from the network edge to the component level. Understanding this shift is the prerequisite for any effective security audit.

1.1 The Hybrid Component Model and Attack Surface
In the traditional Model-View-Controller (MVC) paradigm, the server and client were distinct entities separated by a clear API boundary. Next.js, particularly with the advent of React Server Components (RSC), interweaves these environments. The "App Router" allows developers to render components on the server (.tsx files by default) while selectively opting into client-side rendering via the 'use client' directive.   

This hybrid model implies that the security context changes file-by-file, and sometimes line-by-line. A primary risk in this architecture is the accidental exposure of server-side secrets or logic to the client. When a Server Component passes props to a Client Component, that data is serialized and sent to the browser. If a developer inadvertently passes a massive object containing sensitive fields (e.g., a User object with a hashedPassword field) to a Client Component, that data becomes accessible in the browser's source code, even if it isn't visually rendered.   

Consequently, an auditing agent must treat the "prop interface" between Server and Client Components as a critical trust boundary. Unlike a REST API where the response shape is often explicitly defined in a serializer, React props can be dynamic and loosely typed at runtime, increasing the risk of data leakage.

1.2 OWASP Top 10 Relevance to React and Next.js
The Open Web Application Security Project (OWASP) Top 10 remains the gold standard for web security, but its application in Next.js requires specific interpretation.

OWASP Category	Next.js Specific Implication	Verification Focus
A01: Broken Access Control	Middleware (middleware.ts) and Server Actions act as gatekeepers. The fallback to client-side checks (e.g., if (admin) return <AdminPanel />) is a prevalent vulnerability.	
Verify authorization checks exist inside Server Actions and API routes, not just in the UI.

A03: Injection	While React prevents most XSS via auto-escaping, dangerouslySetInnerHTML and javascript: hrefs remain vectors. SQL injection is possible in Server Actions if raw queries are used.	
Audit usage of dangerouslySetInnerHTML and ensure raw database queries use parameterization.

A06: Vulnerable Components	Next.js relies on a massive dependency tree (NPM). Supply chain attacks are a critical risk.	
Implementation of npm audit, osv-scanner, or Snyk in the CI pipeline.

Server-Side Request Forgery (SSRF)	Server Actions fetching data based on user input (e.g., a URL preview feature) can expose internal services.	
Validate all user-supplied URLs against an allowlist before fetch execution.

Security Misconfiguration	Default next.config.js settings may lack strict headers. Exposing source maps or debug info in production.	
Verification of headers() configuration in next.config.js.

  
The analysis of emerging threats suggests a growing concern for "Client-Side Security Risks," such as broken client-side access control and sensitive data leakage in local storage. As logic moves to the client (via Client Components), the temptation to store state in localStorage increases, creating opportunities for token theft via XSS.   

2. Configuration Hardening and HTTP Security
The foundation of a secure Next.js application is its configuration. Before analyzing business logic, the infrastructure definition—specifically next.config.js and the HTTP headers it serves—must be audited for adherence to hardening standards.

2.1 HTTP Security Headers
HTTP headers act as the first line of defense, instructing the browser on how to behave regarding trusted sources, encryption, and framing. Next.js allows configuring these headers globally in next.config.js within the headers() async function.

2.1.1 Strict-Transport-Security (HSTS)
HSTS forces the browser to communicate with the server exclusively over HTTPS, mitigating protocol downgrade attacks and cookie hijacking. A missing or permissive HSTS configuration exposes users to Man-in-the-Middle (MitM) attacks.

Verification Criteria: The agent must verify that the Strict-Transport-Security header is present and configured with a max-age of at least one year (31,536,000 seconds). Crucially, the includeSubDomains directive must be present to protect all subdomains, and the preload directive is recommended to protect the user on their very first visit.   

JavaScript
// Recommended Configuration in next.config.js
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
}
2.1.2 X-Content-Type-Options
This header prevents the browser from "MIME-sniffing" a response away from the declared Content-Type. Without this, a browser might interpret a text file containing JavaScript as executable code, leading to XSS. The only secure value is nosniff. An automated audit must flag any deviation from this value as a high-severity misconfiguration.   

2.1.3 Permissions-Policy
Previously known as Feature Policy, this header allows developers to explicitly disable powerful browser features (like the camera, microphone, or geolocation) that the application does not need. This adheres to the principle of least privilege. An audit should verify that high-risk features are set to () (disabled) unless explicitly required by the application specification.   

2.1.4 Referrer-Policy
This header controls how much referrer information is passed to other sites. Leaking the full URL in the referrer header can expose sensitive data (e.g., session tokens or private IDs in query parameters). The standard recommendation is strict-origin-when-cross-origin, which sends the full URL to the same origin but only the domain to other origins.   

2.2 Content Security Policy (CSP)
A Content Security Policy (CSP) is the most robust defense against Cross-Site Scripting (XSS) and data injection attacks. However, implementing CSP in Next.js is complex due to the framework's hydration process and usage of inline scripts for bootstrapping the application.

2.2.1 Nonce-based CSP
For applications using the App Router and dynamic rendering, a Nonce-based CSP is the recommended approach. A nonce (number used once) is a cryptographic token generated for each request. It is included in the CSP header and added to every trusted <script> tag.

Mechanism and Verification:

Middleware Generation: The nonce must be generated in middleware.ts (or the deprecated proxy.ts) using a cryptographically secure method like crypto.randomUUID().   

Header Construction: The CSP header must include script-src 'self' 'nonce-<generated_value>' and possibly 'strict-dynamic'. It should strictly avoid 'unsafe-inline' which negates the protection of CSP.

Request Decoration: The nonce is typically passed to the application via a request header (e.g., x-nonce) so that Server Components can access it.   

Integration: The agent must verify that the Root Layout or relevant components read this nonce and pass it to the <Script /> component provided by Next.js.   

Implications: Using a nonce forces the page to be dynamically rendered. This means Static Site Generation (SSG) is disabled for pages utilizing the nonce. The auditing agent must recognize this trade-off: if an application requires SSG but has a strict CSP requirement, a nonce is architecturally incompatible, and an alternative must be sought.   

2.2.2 Hash-based CSP (Subresource Integrity)
Next.js offers experimental support for Hash-based CSP, which allows for strict security and static generation.

Verification: The agent should inspect next.config.js for the experimental.sri configuration.

JavaScript
experimental: {
  sri: {
    algorithm: 'sha256',
  },
}
If enabled, Next.js generates hashes of the scripts at build time and includes them in the CSP header. This allows the browser to verify the integrity of the scripts without needing a per-request nonce. This is the preferred method for high-performance marketing sites or blogs that utilize SSG.   

2.3 Cross-Origin Resource Sharing (CORS)
Configuring CORS correctly is vital for API routes. An overly permissive CORS policy (Access-Control-Allow-Origin: *) allows any website to make authenticated requests to the API if credentials (cookies) are included (though strictly speaking, browsers block * with credentials, configurations often workaround this insecurely).

Verification Check: The agent must scrutinize next.config.js headers configuration. If Access-Control-Allow-Origin is present, it must be set to a specific, trusted domain or a list of domains, never a wildcard * for authenticated endpoints.

Server Actions and Origins: Server Actions in Next.js use POST requests. Next.js includes built-in protection that checks the Origin header against the Host header. However, in environments using reverse proxies or containers (like Docker or Kubernetes), the Host header seen by the Node.js process might be internal (e.g., localhost:3000), causing the check to fail. To fix this, developers use allowedOrigins.

Audit Requirement: Check next.config.js for experimental.serverActions.allowedOrigins (or serverActions.allowedOrigins in v15). The agent must ensure that this list contains only the trusted domains where the application is deployed and does not include wildcards unless absolutely necessary for a specific multi-tenant architecture.   

3. Identity, Authentication, and Session Management
Authentication validates who a user is, while authorization determines what they can do. In the context of Next.js, these mechanisms must be robust against both client-side manipulation and server-side bypasses.

3.1 NextAuth.js (Auth.js) Implementation
NextAuth.js is the de facto standard for Next.js authentication, abstracting complex flows like OAuth and OIDC. Its security relies heavily on correct configuration.

Secret Management: The most critical check is ensuring the AUTH_SECRET (or NEXTAUTH_SECRET) is loaded from environment variables. Hardcoding this secret in the codebase is a catastrophic failure, allowing attackers to sign their own session tokens. The agent must scan auth.ts or route.ts files to confirm process.env.AUTH_SECRET is used.   

Session Strategy: Database vs. Stateless: NextAuth.js supports two session strategies:

Stateless (JWT): The session data is encoded in a signed JWE (JSON Web Encryption) cookie. This is performant but makes immediate revocation difficult.

Database: A session ID is stored in a cookie, and the server validates it against a database on every request.

Guideline: For high-security applications (e.g., financial, healthcare), the agent should recommend or verify the use of Database sessions. This ensures that if a user is banned or a device is compromised, the session can be revoked instantly server-side. If JWTs are used, the agent must verify that the token lifespan (maxAge) is reasonably short and that the signing algorithm is robust.   

3.2 Middleware Protection
Middleware (middleware.ts) allows developers to run code before a request is processed. It is the ideal location for global authentication enforcement.

Verification Pattern: The agent must verify that the middleware performs a session check on protected routes.

Matcher Scope: Ensure the matcher config includes all sensitive paths (e.g., /dashboard/:path*, /api/:path*). A common error is protecting UI pages but leaving API routes exposed.   

Logic: The middleware should redirect unauthenticated users to a login page or return a 401 status.

Public Routes: The logic should effectively be "deny by default," defining a specific list of public routes and blocking everything else, rather than the inverse.   

3.3 Authorization and RBAC (Role-Based Access Control)
A dangerous anti-pattern in React apps is relying on client-side checks for security. For example, hiding an "Admin" button because user.role!== 'admin'.

The Server-Side Mandate: The agent must verify that authorization logic is repeated on the server. Every Server Action or API route that performs a sensitive operation must explicitly check the user's role.

Example of Safe Implementation:

TypeScript
export async function deleteUser(id: string) {
  'use server'
  const session = await auth();
  if (!session |

| session.user.role!== 'admin') {
    throw new Error("Unauthorized");
  }
  // Proceed with deletion
}
If the agent encounters a Server Action that modifies data without this initial check, it must flag it as a "Broken Access Control" vulnerability.   

4. Securing the Server-Client Data Bridge
The introduction of Server Actions in Next.js 14 and 15 has revolutionized data mutation, allowing functions to be called directly from the client. This convenience masks the fact that Server Actions are public HTTP endpoints.

4.1 Server Actions as Public Endpoints
Developers often mistakenly believe that because a Server Action is not mapped to a URL like /api/create-user, it is hidden. In reality, Next.js generates a stable, publicly accessible ID for each action. An attacker can invoke any Server Action by sending a POST request with the correct Action ID header, bypassing the UI entirely.   

Implication: Every Server Action must be treated with the same rigor as a public REST API endpoint. The agent must verify that Input Validation and Authorization occur inside the action body.

4.2 Input Validation with Zod
The FormData object received by a Server Action contains untrusted strings. Direct usage of this data (e.g., formData.get('email')) is unsafe.

Validation Protocol: The agent must verify that a schema validation library, primarily Zod, is used to validate all inputs at the start of the action.   

Secure Pattern Checklist:

Schema Definition: Is a Zod schema defined that enforces types, lengths, and formats (e.g., .email(), .min(8))?

Parsing: Does the action use schema.parse() or schema.safeParse() on the input data?

Error Handling: Does the code handle validation errors gracefully without leaking system details?

Type Assertion Avoidance: Does the code avoid TypeScript casting (e.g., as User) which provides no runtime protection?.   

4.3 Closures, Encryption, and Tainting
Server Actions can close over variables from the component scope. Next.js encrypts these variables and sends them to the client, effectively "signing" the state. While this prevents tampering, it does not prevent replay attacks or the exposure of data if the encryption key is compromised (though keys are rotated per build).   

The Taint API: To prevent developers from accidentally passing sensitive objects (like a user object with a password hash) to a Client Component, Next.js introduces the Taint API.

Verification: The agent should scan for experimental_taintObjectReference or experimental_taintUniqueValue usage in the Data Access Layer (DAL).

Requirement: Sensitive data objects fetched from the database should be "tainted" immediately. If a developer tries to pass a tainted object to a Client Component, the build or runtime will throw an error, preventing the data leak.   

4.4 Data Access Layer (DAL) and server-only
To enforce the separation of concerns, modern Next.js architecture advocates for a Data Access Layer (DAL)—a set of utility functions dedicated to DB interaction.

Guideline:

Files containing database queries should import server-only. This package ensures that if a developer accidentally imports a DB utility into a Client Component (which would fail at runtime or bloat the bundle), the build fails immediately.

The agent must verify that all files in lib/db or services/ include import 'server-only'.   

4.5 Injection Risks (SQL & SSRF)
SQL Injection: Even with ORMs like Prisma, raw queries ($queryRaw) open the door to SQL injection if inputs are concatenated strings. The agent must flag any usage of raw queries that do not use tagged templates or parameter binding.   

Server-Side Request Forgery (SSRF): If a Server Action accepts a URL and fetches it (e.g., for an image proxy or webhooks), it is vulnerable to SSRF. An attacker could supply http://localhost:3000/admin or cloud metadata URLs.

Verification: The agent must ensure that any user-supplied URL is validated against a strict allowlist of domains and protocols before being passed to fetch().   

5. Client-Side Defense Mechanisms
While the server handles data integrity, the client (React) handles presentation. Client-side vulnerabilities typically revolve around Cross-Site Scripting (XSS).

5.1 dangerouslySetInnerHTML and Sanitization
React automatically escapes content rendered in JSX (e.g., <div>{content}</div>), neutralizing most XSS attacks. However, the dangerouslySetInnerHTML prop explicitly bypasses this protection.

Audit Protocol: The agent must search the codebase for dangerouslySetInnerHTML.

Context: If found, is the content static or dynamic?

Sanitization: If dynamic, is it passed through a sanitizer like DOMPurify?

Failure Condition: Usage of dangerouslySetInnerHTML with raw user input constitutes a critical vulnerability.

Example: <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} /> is acceptable; omitting DOMPurify.sanitize is not.   

5.2 XSS via Attributes (javascript:)
A subtle XSS vector exists in attributes like href and src. React does not validate that a URL protocol is safe. If an attacker can set a profile link to javascript:alert(cookie), any user clicking it will execute the script.

Verification: The agent must identify all dynamic href attributes in <a> tags or Link components. It must verify that there is logic to validate the protocol (e.g., ensuring it starts with http:// or https:// or /).   

5.3 Secure Client-Side Storage
Storing sensitive data in the browser is a persistent risk. localStorage and sessionStorage are accessible to any JavaScript running on the page. If the application has a single XSS vulnerability, an attacker can dump all data from local storage.

Guideline:

Authentication Tokens: Never store long-lived access tokens or refresh tokens in localStorage. They should be stored in HttpOnly, Secure cookies, which are inaccessible to client-side scripts.   

PII: Personally Identifiable Information should be fetched as needed and kept in React state (memory), not persisted to storage unless necessary and non-sensitive.

Agent Check: grep for localStorage.setItem and analyze the keys for terms like token, auth, password, or secret.

6. Supply Chain, Infrastructure, and Automated Auditing
Security is not a one-time setup but a continuous process. The integration of automated tooling into the CI/CD pipeline ensures that the security posture remains high as code evolves.

6.1 Dependency Auditing
Modern web applications rely on thousands of dependencies. Vulnerabilities in these packages (e.g., in lodash or axios) are frequent.

Tooling Comparison:

Tool	Function	Integration Verification
npm audit	Checks package-lock.json against the NPM registry's advisory database.	
Verify npm audit runs in the CI pipeline (e.g., GitHub Actions).

OSV-Scanner	Google's scanner using the Open Source Vulnerabilities database. Broader coverage than npm.	
Check for osv-scanner -r. command in CI workflow.

Snyk	Commercial grade scanner. deeply integrates with GitHub for PR checks.	
Verify snyk test or Snyk GitHub App integration.

  
The agent must confirm that at least one of these tools is active and configured to fail the build on high-severity vulnerabilities.

6.2 Secret Scanning
Accidentally committing API keys or database credentials to Git is a leading cause of breaches. Once a secret is pushed, it is compromised, even if deleted in a later commit.

TruffleHog Integration: TruffleHog is the industry standard for secret scanning. It scans git history and files for high-entropy strings and specific patterns (e.g., AWS keys, Slack tokens).

Verification: The agent should verify a TruffleHog step in the CI pipeline.

Configuration: The scan should act on Pull Requests to block secrets before they merge. It should ideally be configured to verify secrets (check if they are live) to reduce false positives.   

6.3 Static Application Security Testing (SAST)
Linting tools can catch code-level security issues before execution.

ESLint Security Configuration: The agent must parse .eslintrc.json or eslint.config.mjs to ensure the following plugins are active:

eslint-plugin-security: Detects unsafe regex (ReDoS), eval(), and non-literal filesystem calls.   

eslint-plugin-react-hooks: Ensures React state consistency.   

eslint-config-next: Includes core web vitals and basic Next.js best practices.   

CI Pipeline Example: The agent should look for a workflow file (e.g., .github/workflows/security.yml) that chains these tools:

YAML
steps:
  - name: Checkout
    uses: actions/checkout@v4
  - name: Secret Scan
    uses: trufflesecurity/trufflehog@main
  - name: Dependency Scan
    run: osv-scanner -r.
  - name: SAST
    run: npm run lint
This automated "defense in depth" strategy ensures that human error is caught by machine rigor.

7. Next.js 15 Specifics and Future Outlook
As frameworks update, security configurations often change. Next.js 15 introduces specific changes that impact verification.

7.1 Async Request APIs
In Next.js 15, APIs like cookies(), headers(), and params are asynchronous.

Risk: Accessing these synchronously (e.g., const c = cookies().get('token')) will throw errors or behave unpredictably, potentially leading to authorization bypasses if error handling is weak.

Verification: The agent must ensure that all calls to these APIs use await (e.g., const c = await cookies()).   

7.2 Stable Server Actions and Configuration
In previous versions, Server Actions required an experimental flag. In v15, they are stable.

Configuration Migration: The agent should check next.config.js. serverActions configuration (like allowedOrigins or bodySizeLimit) might need to move from the experimental object to the root or a dedicated configuration key, depending on the exact minor version and migration guide. The agent must verify that the allowedOrigins configuration is preserved during upgrades to maintain CSRF protection.   

7.3 Caching Defaults
Next.js 15 changes caching defaults for fetch requests and Route Handlers to be uncached by default. This is generally a positive change for security (less risk of serving stale sensitive data), but developers might manually opt-in to caching. The agent should audit usage of force-cache to ensure it is not applied to endpoints returning personalized user data.   

Appendix: Automated Verification Protocol (Agent Checklist)
This section provides a summarized, logical protocol for a coding agent to execute when verifying a codebase.

Phase 1: Static Configuration Analysis

[ ] next.config.js: Verify reactStrictMode: true.

[ ] Headers: Check for Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options.

[ ] CSP: Confirm presence of Content Security Policy (Nonce or Hash based).

[ ] Origins: Verify serverActions.allowedOrigins contains only trusted domains (no wildcards).

Phase 2: Authentication & Authorization

[ ] Secrets: Ensure AUTH_SECRET is used via process.env (not hardcoded).

[ ] Middleware: Verify middleware.ts exists and covers sensitive route patterns via matcher.

[ ] RBAC: Identify "Admin" actions and verify explicit role checks (if (role!== 'admin') throw) inside the function body.

Phase 3: Server-Side Logic & Data

[ ] use server: Locate all Server Actions.

[ ] Validation: Confirm Zod schema parsing is the first operation in the action.

[ ] Injection: Grep for raw SQL queries; verify parameterization.

[ ] Isolation: Verify sensitive DB utils use import 'server-only'.

Phase 4: Client-Side Logic

[ ] Sanitization: Grep for dangerouslySetInnerHTML. If present, verify DOMPurify usage.

[ ] Storage: Scan for localStorage usage with sensitive keys (token, password).

[ ] Hrefs: Verify dynamic links are checked for javascript: protocol.

Phase 5: Infrastructure & CI

[ ] Scanning: Confirm TruffleHog (secrets) and OSV/Snyk (dependencies) are in the CI pipeline.

[ ] Linting: Confirm eslint-plugin-security is installed and active.

By rigorously applying this verification protocol, coding agents can ensure that Next.js applications meet the highest standards of modern web security.


nextjs.org
Guides: Data Security - Next.js
Opens in a new window

nextjs.org
How to Think About Security in Next.js
Opens in a new window

mindbowser.com
OWASP Top 10: Essential Web App Security Risks for Frontend Developers - Mindbowser
Opens in a new window

querypie.com
Next.js Server Action and Frontend Security - QueryPie
Opens in a new window

nerdssupport.com
Web Security Vulnerability Management with Snyk and Next.js | Nerds Support, Inc.
Opens in a new window

google.github.io
Usage | OSV-Scanner - Google
Opens in a new window

dev.to
Securing Your Next.js Application: The Basic Defenders (Security Headers)
Opens in a new window

nextjs.org
next.config.js Options: headers
Opens in a new window

owasp.org
OWASP Top 10 Client-Side Security Risks
Opens in a new window

oslavdev.medium.com
Protect your Next.js app with security headers | by Oslaw Dev | Medium
Opens in a new window

nextjs.org
How to set a Content Security Policy (CSP) for your Next.js application
Opens in a new window

nextjs.org
How to set a Content Security Policy (CSP) for your Next.js application
Opens in a new window

nextjs.org
next.config.js: serverActions
Opens in a new window

stackoverflow.com
Next Js Missing origin header from a forwarded Server Actions request - Stack Overflow
Opens in a new window

nextjs.org
App Router: Adding Authentication - Next.js
Opens in a new window

nextjs.org
Guides: Authentication - Next.js
Opens in a new window

nextjs.org
File-system conventions: proxy.js - Next.js
Opens in a new window

nextjs.org
File-system conventions: Middleware | Next.js
Opens in a new window

blog.arcjet.com
Next.js server action security - Arcjet blog
Opens in a new window

leapcell.io
Streamlined Form Handling and Validation in Next.js Server Actions | Leapcell
Opens in a new window

nextjs.org
How to create forms with Server Actions - Next.js
Opens in a new window

yournextstore.com
Type-Safe Server Actions in Next.js with Zod
Opens in a new window

medium.com
5 Security Best Practices for Next.js Applications | by Lior Amsalem | Medium
Opens in a new window

eslint-react.xyz
no-dangerously-set-innerhtml - ESLint React
Opens in a new window

sentry.io
How to Use dangerouslySetInnerHTML in Next.js - Sentry
Opens in a new window

stackoverflow.com
reactjs - Safe alternative to dangerouslySetInnerHTML - Stack Overflow
Opens in a new window

developer.mozilla.org
Content Security Policy (CSP) - HTTP - MDN Web Docs
Opens in a new window

turbostarter.dev
Complete Next.js security guide 2025: authentication, API protection & best practices
Opens in a new window

gocodeo.com
Using OSV for Secure Dependency Management in Open Source Projects - GoCodeo
Opens in a new window

github.com
TruffleHog OSS · Actions · GitHub Marketplace
Opens in a new window

trufflesecurity.com
Running TruffleHog in a GitHub action Truffle Security Co.
Opens in a new window

jit.io
TruffleHog - A Deep Dive on Secret Management and How to Fix Exposed Secrets - Jit.io
Opens in a new window

npmjs.com
eslint-plugin-security - NPM
Opens in a new window

npmjs.com
eslint-plugin-react-hooks - NPM
Opens in a new window

nextjs.org
Configuration: ESLint - Next.js
Opens in a new window

nextjs.org
Next.js 15