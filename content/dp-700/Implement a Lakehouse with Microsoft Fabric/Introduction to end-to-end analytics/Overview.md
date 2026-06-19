# DP-700 Study Guide: Introduction to end-to-end analytics

This study guide provides an overview of the Microsoft Fabric platform, its collaborative workspaces, the unified data lake (OneLake), team workflows, and the platform's native AI capabilities.

---

## 1. What is Microsoft Fabric?

### Explanation
Microsoft Fabric is an end-to-end, unified analytics Software-as-a-Service (SaaS) platform. It integrates diverse data tooling—from ingestion and transformation to machine learning, real-time streaming, and business intelligence reporting—into a single logical environment. All data in Fabric is stored in a centralized data lake called **OneLake** using open file formats.

### Why it Matters
Traditional analytics solutions are highly fragmented, requiring organizations to integrate, configure, and pay for multiple disconnected systems (e.g., Azure Data Factory, Azure Synapse Analytics, Power BI). This fragmentation creates data silos, increases maintenance costs, and complicates data governance. Fabric eliminates these boundaries by consolidating all capabilities into one SaaS product.

### Where it is Used
Used across entire organizations to manage the complete data lifecycle, providing a single plane of glass for data engineers, analysts, scientists, and business users.

### Key Points or Rules
* **Unified SaaS Platform:** Simplifies setup by eliminating the need to provision individual Azure PaaS resources (like Spark clusters, SQL databases, or pipelines) manually.
* **Open Formats:** Tabular data in Fabric is written in the open **Delta-Parquet** format. Any Fabric compute engine can read and write this format without data movement or transformation.

---

## 2. OneLake Architecture & Governance

### Explanation
**OneLake** is Fabric's single, logical, and centralized data lake for the entire organization. Built on top of Azure Data Lake Storage Gen2 (ADLS Gen2), OneLake functions similarly to OneDrive but is designed for enterprise data. 

### Why it Matters
Without OneLake, data must be duplicated and copied between data engineering lakes, SQL warehouses, and reporting tools. OneLake acts as the "single source of truth," allowing multiple compute engines to run over the same files in place.

### Key Points or Rules
* **Shortcuts:** Logical references that point to external storage accounts (ADLS Gen2, Amazon S3, Dataverse) or other internal OneLake paths. Shortcuts make files appear local without copying the actual data.
* **Workspaces:** Logical containers within Fabric used to organize items (lakehouses, warehouses, reports) and control access. 
  * Workspaces support Git integration for version control and CI/CD pipelines.
  * Workspaces allow configuring performance settings (like Spark compute parameters).
* **OneLake Catalog:** A centralized hub to discover, monitor, and govern data items. It displays metadata, data refresh statuses, and sensitivity labels, but only exposes items a user has permission to see.
* **Centralized Administration:** Managed via the **Admin Portal > Tenant Settings**, where admins can configure permissions, gateways, and manage capacity properties.

---

## 3. Collaborative Team Workflows

### Explanation
Microsoft Fabric aligns tools around job roles, allowing data engineers, scientists, analysts, and business users to collaborate seamlessly within shared workspaces.

### Why it Matters
In traditional architectures, teams work in silos, leading to hand-off delays and miscommunications (e.g., engineers building tables that do not align with the business logic analysts need). 

### How Fabric Evolves Workflows by Role
* **Data Engineers:** Ingest and orchestrate data flows using Pipelines and Dataflows Gen2, write complex transformation scripts using Spark notebooks, and store curated data in lakehouses in Delta-Parquet format.
* **Analytics Engineers:** Bridge the gap by curating datasets inside lakehouses, validating data quality, and building semantic models to define business measures and relationships.
* **Data Analysts:** Connect directly to OneLake using Power BI's **Direct Lake** mode (bypassing the need to duplicate data or perform downstream transforms in Power BI Desktop).
* **Data Scientists:** Train, test, and deploy machine learning models using Spark notebooks, and operationalize predictions through integrations with Azure Machine Learning.
* **Citizen Developers / Business Users:** Find certified datasets via the OneLake Catalog, use Power BI templates for quick dashboarding, perform light visual ETL using Dataflows Gen2, and interact with data using natural language.

---

## 4. Enabling Fabric & Administrative Roles

### Explanation
Before an organization can use Fabric, it must be enabled in the Power BI tenant. This requires specific administrative roles.

### Why it Matters
Centralized control ensures that capacity, security compliance, and licensing are managed correctly before features are rolled out to the broader company.

### Key Points or Rules
* **Required Admin Roles:** Fabric can be enabled by a **Fabric Administrator**, a **Power Platform Administrator**, or a **Global Administrator** (who has implicit Fabric admin rights).
* **Activation Scope:** Admins can enable Fabric in the Admin Portal for the entire organization, specific Microsoft Entra/365 security groups, or delegate permissions at the capacity level.
* **Trial Capacity:** If Fabric is not enabled, users can sign up for a free Fabric trial capacity to explore features.

---

## 5. AI Capabilities in Microsoft Fabric

### Explanation
Fabric natively supports generative AI and semantic intelligence across all workloads. The platform includes tools to optimize data for AI reasoning and incorporates Microsoft Copilot to assist users in their daily work.

### Why it Matters
Generative AI tools and conversational agents require highly accurate, governed, and structured business data to prevent hallucinations and provide meaningful responses.

### Key AI Components
* **Fabric IQ (Preview):** A dedicated workload that organizes data according to business concepts, rules, and relationships using **ontologies**, graphs, and semantic models. 
  * Ontologies define business rules so AI agents can reason across domains using consistent business terminology rather than database tables.
* **Fabric IQ vs. Other IQ Workloads:**
  * **Fabric IQ:** Models business data, ontologies, and semantic models for analytics.
  * **Foundry IQ:** Connects structured/unstructured enterprise knowledge across SharePoint, Azure, and OneLake.
  * **Work IQ:** Captures collaboration signals (documents, chats, meetings) from M365 to understand organization operations.
* **Fabric Data Agents:** Conversational interfaces where users query organizational data using natural language. Agents translate user prompts into structured queries against warehouses/lakehouses.
* **Microsoft Copilot in Fabric:** An AI assistant available across workloads:
  * *Code Generation:* Autocomplete PySpark, T-SQL, and KQL in notebooks and SQL editors.
  * *Data Factory:* Assists with code generation for data transformations and simplifies complex pipeline logic.
  * *Power BI:* Automatically generates report pages, page summaries, and answers natural language questions over semantic models.
  * *Administration:* Copilot is enabled by default, but admins can disable it or limit access in the Tenant Settings.
