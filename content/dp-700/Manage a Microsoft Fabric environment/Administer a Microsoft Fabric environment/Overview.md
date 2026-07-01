# Administer a Microsoft Fabric Environment

Fabric administration is three jobs: **configure** the platform, **manage** who can do what, and **govern** it so it stays compliant — all without the tenant admin becoming the bottleneck every request routes through.

## The Hierarchy: Five Levels of "Who Owns This?"

Every setting and permission in Fabric lives at one of five levels. Know where something lives and you know who's responsible for it.

- **Tenant** — the organization's entire Fabric world. Maps **1:1** to the Microsoft Entra ID directory, so everyone signing in with a company account shares one tenant. Settings here hit _everyone_.
- **Capacity** — dedicated compute + storage (e.g., F64). Every query, model refresh, and report run burns capacity. Run out, and work stops.
- **Domain** — a logical bundle of workspaces that mirrors the business (Finance domain, Risk domain). The home for governance policy and delegation.
- **Workspace** — a team's collaboration container, where lakehouses, notebooks, and reports get built and shared.
- **Item** — the assets themselves: lakehouses, warehouses, notebooks, semantic models, reports. The Fabric admin **never** touches these directly — workspace admins do.

Two rules to memorize: **one tenant = one Entra ID directory**, and **the Fabric admin sets up the environment but stays out of individual workspaces**.

## Delegation: The Four-Tier Admin Model

Control is handed out through four roles so the tenant admin isn't a human bottleneck.

- **Fabric admin** — rules the **entire tenant**: tenant settings, all capacities and domains, and appointing every other admin.
- **Capacity admin** — rules **one capacity**: watches performance, reassigns workspaces, alerts when limits get close.
- **Domain admin** — rules **one domain**: runs the workspaces in it, enforces policy, and overrides delegated settings.
- **Workspace admin** — rules **one workspace**: day-to-day access, item management, and member permissions.

> ⚠️ **The name trap:** In Microsoft Entra ID, the Fabric admin role is labeled **Power BI Administrator**. That's the name you assign — don't hunt for "Fabric admin."

---

## The Toolbox

The **Fabric admin portal** is home base, but not the only tool.

**Inside the admin portal:**

- **Tenant settings** — turn features on/off across the org.
- **Capacity settings** — create, view, and assign workspaces to capacities.
- **Domains** — build domains, appoint domain admins, organize by function.
- **Users** — hand out Fabric/capacity/domain admin roles.
- **Audit logs** — the compliance and security paper trail.
- **Monitoring** — usage and performance trends.

**Outside it:**

- **Microsoft 365 admin center** — for licenses.
- **Microsoft Entra ID** — for identity and group membership.
- **PowerShell / REST APIs** — to automate provisioning, config, and reporting.

---

## Tenant Settings: Powerful, But Not a Lock

Tenant settings decide which Fabric features exist for users. Each one sits in one of **four states**:

1. Off for the whole org.
2. On for everyone.
3. On for **specific security groups** only.
4. On for **everyone except** certain groups.

Changes take **up to 15 minutes** to propagate across the tenant. The big one is **"Users can create Fabric items"** — the master on/off switch for the platform. No switch, no lakehouses, no warehouses, nothing. Capacity admins can override it at the capacity level for tighter control.

> 🔒 **Read this twice:** Tenant settings are **UI governance, not security.** Turn off **Export data** and the export button vanishes — but a user with read access can still pull that semantic model into Excel or Python. Real security = **item permissions + sensitivity labels.**

Typical configuration moves:

- Enable **"Users can create Fabric items"** org-wide.
- Restrict **Export to Excel** by enabling it for everyone _except_ a "restricted" security group.
- Enable **Certification** but limit it to a designated data-steward group.

---

## Domains: Governance Boundaries, Not Walls

Domains group workspaces to match the org chart so different policies apply to different departments without exceptions scattered everywhere.

The part everyone gets wrong: **a domain organizes governance, it does not restrict access.** Dropping a workspace into the Finance domain does **not** lock it to Finance users — workspace roles and item permissions still decide who sees what. Domains are about _policy_, not _walls_.

**Assigning workspaces to a domain — two ways:**

- **By name** — pattern-match anything with a keyword (e.g., "Finance") in the title.
- **By workspace admin** — grab every workspace whose admin is a given person. **This one scales**: new workspaces auto-join the domain the moment they're created.

Domain admins can name **domain contributors** (workspace admins allowed to pull their own workspaces in), and you can nest **subdomains** for specialized needs (e.g., an **Audit** subdomain under Finance). Start flat; add subdomains as complexity grows.

**Delegated settings** let domain admins customize policy the tenant admin chooses to hand down:

- **Certification** — a domain names its own certifiers, separate from others.
- **Default sensitivity label** — one domain forces **Confidential** on everything while another defaults to **Public**.

---

## Put Workspaces on a Capacity

All Fabric work runs on a capacity, assigned from the **Capacity settings** tab. Skip it and a workspace falls back to **shared capacity** — limited, and no place for production.

Deliberate call worth making: **keep dev/test off the production capacity.** Experimenting with pipelines and training sessions eats serious compute; a test run shouldn't starve production dashboards. Put dev work on a separate trial/test capacity.

---

## Licensing: Where the Money Hides

Two license types stack together — **capacity** (the org's compute) and **per-user** (what each person can do).

A **capacity license** (e.g., F64) is shared org-wide; nobody gets an individual one, workspaces just get assigned to it.

**Per-user licenses come in three flavors:**

- **Fabric Free** — auto-granted on first sign-in. Create/share **non-Power BI** items (lakehouses, notebooks, warehouses, pipelines) on an F capacity. Power BI items only in your personal **My workspace**.
- **Power BI Pro** — needed to create and share Power BI reports/dashboards. On capacities **below F64**, also needed just to _view_ them.
- **Power BI Premium Per User (PPU)** — Premium features per person, but it **doesn't** provision a capacity. No F capacity backing = no lakehouses/warehouses/notebooks.

### 🎯 The F64 Threshold — the rule that saves real money

- **F64 or bigger:** **Free** users can _view_ Power BI reports with a **Viewer** role. **No Pro needed** for read-only consumers.
- **Below F64:** **everyone** who views needs Pro or PPU — even pure viewers.

The payoff: on an F64+, report _viewers_ need only Free licenses — only the people who _build and publish_ Power BI content need Pro. That's the difference between licensing 30 creators and licensing 200 people.

**License by role:**

- Builds lakehouses/notebooks/pipelines → **Free** (Free + F capacity covers non-Power BI items).
- Builds & publishes Power BI reports → **Pro** (or PPU) — required to create/share Power BI content.
- Views Power BI reports on F64+ → **Free** + Viewer role (F64 threshold unlocks free viewing).
- Views dashboards on F64+ → **Free** + Viewer role (no Pro on F64 or larger).

---

## Handing Out Licenses & Sharing Content

Licenses get assigned in the **Microsoft 365 admin center** — not the Fabric portal. Licensing is an M365 job; Fabric just honors whatever's set there.

Key practices:

- **Assign by group, not by person.** Make Entra ID groups (e.g., "Fabric-Pro-Users") and license the _group_ under **Billing > Licenses**. People join or leave, licenses follow automatically.
- **Free licenses need no pre-assignment** — they land on first sign-in.
- **License + workspace type work together** — a Pro user on an F capacity can build everything; a Free user in that same workspace builds Fabric items but no Power BI.

**Getting content to people — two patterns:**

- **Workspace apps** — best for big read-only audiences. Ship finished reports **without** exposing the workspace or works-in-progress. The production-ready choice.
- **Workspace roles** (Admin/Member/Contributor/Viewer) — best for collaborators and builders. Direct access to the workspace; even a **Viewer** sees _everything_, including half-finished drafts.

**Least privilege wins:** consumers get the **app**, builders get workspace access. For **external** partners, tenant **Export and sharing settings** rule — recipients need a proper license, or you embed the content in an app that authenticates via **Microsoft Entra B2B**.

---

## Monitoring: Three Tools, Three Questions

Once the platform's live, the job becomes _"what's actually happening in here?"_ Three tools, each answering a different question — don't mix them up.

**🔧 Monitoring Hub — _"What broke, and when?"_**
Reactive and operational. A tenant-wide view of every Fabric job's status (**running / succeeded / failed**) with a **30-day history**, error details, and location. Open it via **Monitor** in the nav pane; regular users see only their own items, the Fabric admin sees all of it. Filter by status, item type, start time, submitter, and workspace. A **schedule-failures view (preview)** rounds up refresh-failure alerts in one place.

**📈 Admin Monitoring Workspace — _"Is anyone actually using this?"_**
Strategic, about adoption. A workspace tenant admins get by default, home to the **Feature Usage and Adoption** report (and its semantic model). Shows usage trends over time, the most-active users and departments, and where capacity is underused or adoption is low.

**⚙️ Fabric Capacity Metrics App — _"Is the capacity healthy?"_**
Consumption is measured in **Capacity Units (CUs)**. Blow past the limit and Fabric **throttles background jobs** to protect everyone. Watching CU trends tells you when to:

- **Scale up** — bump the SKU (e.g., F64 → **F128** for a quarter-end crunch, then back down).
- **Scale out** — move workspaces to another capacity to spread the load.

You can also **pause** non-production capacities (dev/test overnight or weekends) to save money — but pausing makes **all content on it unavailable**, so it's non-prod only, with a heads-up to users first.

---

## Governance: Compliant and Trusted

**📋 Audit logs — the paper trail.** In the admin portal, logs record _what_ users did, _when_, and _from where_: who viewed or exported a report, who shared externally, who changed permissions, who deleted an item. Filter by activity type and user to answer compliance questions (e.g., "did anyone export sensitive data to Excel last month?").

**🏅 Endorsement — helping people trust the right data.** Two levels:

- **Promoted** — applied by any workspace **Contributor/Admin** to their own items. Signals "this is good, quality work."
- **Certified** — applied by an **authorized certifier** after a formal review, gated by the **Certification** tenant setting. Signals "this is the authoritative source."

Certified items surface in the **OneLake catalog** with a distinct badge, so consumers filtering by domain instantly see which models are safe to reuse.

**🗺️ OneLake Catalog — Govern tab — the aerial view.** A tenant-wide governance snapshot showing:

- **Sensitivity-label coverage** — the % of items with labels applied.
- **Endorsement coverage** — promoted/certified vs. bare items.
- **Recommended actions** — where to focus next (e.g., a domain sitting at 30% label coverage), which can then be delegated to the relevant domain admin.

---

## Quick Recap

1. **Map the terrain** — five-level hierarchy, four-tier delegation; appoint capacity, domain, and workspace admins.
2. **Configure** — master switch on, exports locked down where needed, certification gated; build domains, delegate settings, put production on a dedicated capacity and dev/test elsewhere.
3. **License smart** — group-based assignment via M365, exploit the F64 threshold to skip needless Pro licenses, ship apps to consumers.
4. **Monitor** — Hub for failures, Admin Monitoring Workspace for adoption, Capacity Metrics for CUs; scale up/out and pause as needed.
5. **Govern** — audit logs, endorsement badges, and the OneLake Govern tab keep it compliant and trusted.
