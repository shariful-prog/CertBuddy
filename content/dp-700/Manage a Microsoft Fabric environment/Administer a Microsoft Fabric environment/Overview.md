# Study Guide: Administer a Microsoft Fabric Environment

This study guide explains how to configure, manage, and govern a Microsoft Fabric environment. It covers the administration model, tenant settings, licensing structures, monitoring tools, and tenant-wide governance strategies.

---

## 1. The Microsoft Fabric Administration & Delegation Model

### Architectural Hierarchy
Microsoft Fabric organizes its platform-wide architecture into five logical layers:
1.  **Tenant:** The highest level of the environment, representing the organization’s entire Fabric boundary. It aligns directly with the Microsoft Entra ID directory. Tenant settings apply globally.
2.  **Capacity:** Dedicated compute and storage resources (e.g., F64 capacity) that power all active workloads.
3.  **Domain:** A logical grouping of workspaces designed to mirror organizational structures (e.g., Finance, Risk, Marketing domains).
4.  **Workspace:** A collaboration container where team members build, store, and share items.
5.  **Item:** Individual data assets created by users (e.g., lakehouses, warehouses, notebooks, semantic models, reports).

### Administrative Roles & Delegation
Fabric delegates control using a four-tier model, preventing tenant administrators from becoming operational bottlenecks:
*   **Fabric Administrator:** Controls tenant-wide settings, provisions capacities and domains, and assigns top-level roles. *(Note: Registered as "Power BI Administrator" in Microsoft Entra ID).*
*   **Capacity Administrator:** Monitors resource consumption for specific capacities and manages workspace assignments to keep systems running smoothly.
*   **Domain Administrator:** Manages workspaces within a specific domain and enforces localized policies.
*   **Workspace Administrator:** Manages day-to-day access, user roles, and item creation within individual workspaces.

### Management Toolset
*   **Fabric Admin Portal:** The central web-based interface for configuring tenant settings, managing capacities, creating domains, auditing, and monitoring.
*   **Microsoft 365 Admin Center & Entra ID:** Used to allocate licenses, manage identities, and handle group memberships.
*   **PowerShell & REST APIs:** Utilized by admins to automate provisioning, configuration updates, and reporting tasks.

### Crucial Implementation Rules
*   **Administrative Separation:** Fabric Admins manage platform configuration; they do not manage individual workspace permissions or data items directly.
*   **Identity Mapping:** One tenant maps to one Microsoft Entra ID directory.

---

## 2. Tenant Settings, Domains, and Governance Delegation

### Tenant Settings and Feature Governance
Tenant settings in the Fabric Admin Portal control user capabilities globally. Features can be enabled/disabled for the entire organization, specific security groups, or with security group exclusions.
*   **Policy vs. Security:** Tenant settings are interface governance policies rather than true security boundaries. For instance, disabling "Export data" in tenant settings hides the export button in the UI, but users with read access can still query the semantic model via Python or Excel. True data security must be enforced using item permissions and sensitivity labels.

### Designing Domains
Domains create logical governance boundaries around workspaces. Assigning a workspace to a domain organizes policies but does *not* restrict data access. Workspace roles and item permissions still control access.
*   **Workspace Assignment:** Can be done manually, via pattern matching on workspace names, or dynamically based on the workspace administrator. Using the workspace administrator is the most scalable approach.
*   **Subdomains:** Can be created underneath parent domains to handle specialized sub-department compliance needs.

### Policy Delegation
Tenant administrators can delegate specific tenant settings, allowing Domain Admins to override them.
*   **Target Customizations:** Typical delegated settings include **Certification** policies (allowing departments to define their own data certifiers) and **Default Sensitivity Labels** (e.g., forcing a "Confidential" label in the Finance domain while keeping Marketing "Public").

---

## 3. User Access, Licensing, and Distribution

### The Two Licensing Pillars
Fabric access is governed by the interaction between compute resources (Capacity) and individual user access (Per-User Licenses):
1.  **Capacity Licenses:** Provisioned at the organizational level (e.g., F64 capacity) to power the compute and storage needs of all workspaces.
2.  **Per-User Licenses:** Determine what individuals can create or view:
    *   **Fabric Free:** Automatically assigned upon login. Enables users to create and share non-Power BI items (like lakehouses, notebooks, pipelines) in workspaces backed by an F capacity.
    *   **Power BI Pro:** Required to create, publish, and share Power BI reports.
    *   **Power BI Premium Per User (PPU):** Offers Premium features individually but does not provision a Fabric capacity. PPU users cannot build Fabric items (like lakehouses) without an F capacity backing.

### The F64 Threshold Rule
The size of your Fabric capacity impacts per-user licensing costs significantly:
*   **F64 and Larger:** Fabric Free users can view Power BI reports and dashboards in shared workspaces, provided they have a "Viewer" role. No Power BI Pro licenses are required for read-only consumers.
*   **Smaller than F64:** *All* users must have a Power BI Pro or PPU license to view Power BI content, even if they are only read-only viewers.

### License Management Best Practice
Licenses should be managed via Entra ID security groups in the Microsoft 365 Admin Center rather than assigned to individuals. This ensures that permissions adjust dynamically as users join or leave departments.

### Content Distribution Patterns
*   **Workspace Apps:** The recommended method for large, read-only consumer audiences. Apps publish finished reports without exposing the workspace environment, items, or work-in-progress to the audience.
*   **Workspace Roles (Admin, Member, Contributor, Viewer):** Best for collaboration and development. Workspace viewers can see all items and drafts in progress, which is not suitable for general business consumers.

---

## 4. Operational Monitoring and Capacity Management

### centralized Troubleshooting: The Monitoring Hub
The Monitoring Hub is a reactive tool providing a tenant-wide view of Fabric job execution health.
*   **Capabilities:** Tracks jobs (running, succeeded, failed) over a rolling 30-day period. Admins can filter by status, item type, submitter, and workspace location to diagnose failures.
*   **Schedule Failures View:** Provides a centralized view of scheduled item refresh alerts.

### Strategic Adoption Tracking: Admin Monitoring Workspace
Unlike the Monitoring Hub, the Admin Monitoring Workspace is a strategic tool designed to evaluate adoption.
*   **Core Feature:** Contains the **Feature Usage and Adoption** report, highlighting which departments are actively using Fabric items and where training gaps or adoption barriers exist.

### Compute Optimization: Fabric Capacity Metrics App
Compute capacity is measured in **Capacity Units (CUs)**. Exceeding capacity limits causes Fabric to throttle background jobs to protect performance.
*   **Performance Mitigation:** Fabric capacity can be scaled up dynamically (e.g., from F64 to F128) during heavy processing windows (like quarter-end financial closing) and scaled back down afterward.
*   **Cost Control:** Development and test capacities can be paused overnight or over weekends. Pausing makes all data on that capacity unavailable, so it should only be done on non-production capacities.

---

## 5. Security Auditing and Item Endorsement

### Compliance: Audit Logs
Audit logs in the admin portal capture security and compliance evidence. They record operations such as who viewed or exported a report, external sharing events, permission modifications, and item deletions.

### Data Trust: Endorsement Badges
To help users locate reliable datasets in the OneLake Catalog, Fabric supports two endorsement levels:
1.  **Promoted:** Applied by workspace contributors/admins to highlight quality items.
2.  **Certified:** Requires formal validation by authorized certifiers (configured via the Certification tenant setting). Certified items display a distinct trust badge.

### Governance Snapshot: OneLake Catalog Govern Tab
The Govern tab provides Fabric Admins with a tenant-wide governance overview. It tracks:
*   **Sensitivity Label Coverage:** The percentage of items that have security labels applied.
*   **Endorsement Coverage:** The ratio of promoted/certified items to unendorsed items.
*   **Actionable Remediation:** Identifies workspaces requiring immediate security or governance improvements.
