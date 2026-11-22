# CloudRes Lab

**Cloud Infrastructure & Resilience Engineering Lab** is a hands-on project for learning to deploy, monitor, troubleshoot, and recover a containerized application on Microsoft Azure. Work starts locally so the application can be understood and tested before cloud resources are introduced.

The business scenario is a small company that needs an accessible service, secure infrastructure, useful alerts, and a documented recovery process within a controlled budget.

**Current scope:** a local demo application and its tests. Azure deployment, containers, infrastructure automation, and monitoring are planned learning work; they are not implemented in this repository.

## Current architecture and capabilities

```text
Browser or curl -> HTTP -> Node.js application (0.0.0.0:PORT)
                          |-- GET /           HTML demo page
                          |-- GET /styles.css Local stylesheet
                          `-- GET /health     JSON application liveness
```

- Responsive page displaying **Cloud Lab is running** and the lab's purpose.
- `GET /health` returns HTTP `200`, `Content-Type: application/json`, and `{"status":"ok"}`.
- Binds to `0.0.0.0`; `PORT` defaults to `3000` and can be overridden.
- Uses only Node.js built-in modules, with no runtime or test dependencies, external fonts, or third-party assets.
- Supports `HEAD` for the documented routes; unknown routes return `404` and unsupported methods on known routes return `405`.

The page's headline is static text returned by the application. It is not a live monitoring dashboard. `/health` confirms only that this application can respond to an HTTP request. It does **not** verify the VM, network, reverse proxy, security controls, other services, or the health of the entire infrastructure. It does not collect metrics or send alerts.

## Run locally

Prerequisites: Node.js **22 or newer** and npm. A browser and `curl` are useful for manual checks. Docker, Terraform, and Azure CLI are not needed for this step.

```bash
node --version
npm --version
npm start
```

There is no dependency installation or build step. Open <http://localhost:3000>. Stop the application with `Ctrl+C`.

Choose another port on Linux:

```bash
PORT=8080 npm start
```

Then open <http://localhost:8080>. `PORT` accepts whole numbers from `0` to `65535`; `0` lets the operating system select a free port, which is printed at startup and used by the integration tests. Invalid values cause startup to fail with an explanatory message. If a port is already occupied, stop the conflicting process or choose another port.

Binding to `0.0.0.0` prepares the process for later container use and allows access through the machine's network interfaces where firewall rules permit. Use `localhost` in the local browser. Network exposure and HTTPS must be designed before a cloud deployment.

## Test locally

With the application running on the default port:

```bash
curl -i http://localhost:3000/
curl -i http://localhost:3000/health
```

Expected: the page returns `200` and HTML containing `Cloud Lab is running`; `/health` returns `200` and `{"status":"ok"}`. Substitute your chosen port when needed.

Run the automated HTTP integration tests separately:

```bash
npm test
```

The tests launch temporary application processes on operating-system-assigned ports and stop them afterward. They check the page and stylesheet, JSON liveness, method and route handling, binding to all IPv4 interfaces, and invalid configuration. For a visual check, open the page at desktop and mobile widths and check readability, layout, and keyboard focus on the health endpoint link.

## Repository structure

```text
.
|-- .gitignore            Local files and secrets excluded from Git
|-- README.md             Overview, usage, and learning roadmap
|-- package.json          Start and test commands; no dependencies
|-- public/
|   |-- index.html        Accessible demo page
|   `-- styles.css        Responsive styling
|-- src/
|   |-- route/
|   |   `-- index.js              URL routing, methods, and successful responses
|   |-- server/
|   |   |-- index.js              Entry point, PORT validation, and listening
|   |   `-- app.js                HTTP server and request flow composition
|   |-- repo/
|   |   `-- assets.js             Reads and stores the allowed local assets
|   |-- middleware/
|   |   `-- response-headers.js   Shared cache and security headers
|   `-- error/
|       |-- http-error.js         Expected HTTP error type
|       `-- handle-error.js       Central error responses and unexpected error logging
`-- tests/
    `-- server.test.js    HTTP integration tests
```

Request flow: `server/app.js` applies the response-header middleware, calls the router, and forwards thrown errors to the error handler. Routes use the asset repository for the page and stylesheet; `/health` generates its JSON directly. The repository handles local file access only; no database is required. Unexpected request errors return a generic `500` response while details are logged to the terminal.

No passwords, access tokens, or cloud credentials are required. Keep future secrets out of Git; ignore rules are a convenience, not a substitute for reviewing changes before committing.

## Planned architecture and learning objectives

The following is a conceptual direction, not a deployed architecture:

```text
Internet -> Azure networking and security -> Linux Azure VM
                                            `-> Nginx -> Docker -> Demo app

Provisioning: Terraform (AzureRM), with cloud-init as needed
Operations:   Azure Monitor, logs, alerts, and application availability checks
Cost:         Azure Cost Management, budgets, and a resource cleanup plan
```

The owner will design routing, subnets, Network Security Groups, server access, HTTPS, identity permissions, and the monitoring approach before implementation. A database is an optional future extension; the demo does not require one.

The learning focus is Linux administration, network request flow, least-privilege access, reproducible infrastructure, observability, maintenance, incident investigation, and recovery. Tool choices should follow requirements and cost limits.

## Roadmap

### Completed in this repository

- [x] Local Node.js demo application with a responsive web page.
- [x] Application liveness endpoint and configurable listening port.
- [x] Automated HTTP integration tests and local usage instructions.

### Planned — owner-led infrastructure and DevOps work

- [ ] Finalize requirements, architecture diagram, IP/subnet plan, security design, budget, and cleanup plan.
- [ ] Write a Dockerfile and Docker Compose configuration; build and test a container locally.
- [ ] Configure Nginx and understand the request flow to the application.
- [ ] Recheck Azure subscription status, credits, billing, regional availability, and estimated costs before creating resources.
- [ ] Deploy to a Linux Azure VM with appropriate networking, access controls, and HTTPS.
- [ ] Learn Terraform and implement repeatable Azure infrastructure using the AzureRM provider.
- [ ] Design and test metrics/log collection, dashboards, availability checks, alerts, and notifications.
- [ ] Document maintenance, backup, and recovery procedures.
- [ ] Run controlled failure exercises, investigate root causes, restore service, and record measured detection/recovery times.
- [ ] Consider CI/CD and bounded automated recovery after the manual workflow is understood.

Azure Education previously showed zero available credits, and the subscription was previously shown as Disabled. Those are historical observations, not a current account check. No cloud resources or billable operations are needed for the local demo.

## Future portfolio evidence

As each stage is completed, add actual architecture and network diagrams, deployment instructions with validation output, security decisions, monitoring screenshots, tested alert evidence, and cost/cleanup records. Incident reports should include the trigger, timeline, investigation, root cause, recovery verification, and follow-up actions. Report availability and recovery measurements only after collecting evidence; redact credentials, account identifiers, and personal data from screenshots and logs.

## Planning sources and scope

- [Project Context](https://app.notion.com/p/41decdb194c081d89cd7f40dcc89ff73)
- [Step 1 — Infrastructure Design and Requirements](https://app.notion.com/p/420ecdb194c08100be95fea5e4a3b0b0)

The context's decision dated November 22, 2026 selects Azure; older AWS sections remain historical. Step 1 also proposes Docker/Nginx as a next step. This delivery follows the current application-only scope and leaves those infrastructure tasks to the owner. The Notion planning pages have not been changed, and completing this demo does not imply completion of an infrastructure milestone.
