# DP-700 Study Guide: Organize a Fabric lakehouse using medallion

This study guide details the medallion architecture (Bronze, Silver, and Gold layers), deployment topologies in Microsoft Fabric, processing tools, materialized lake views, querying mechanisms, security controls, and version governance.

---

## 1. What is the Medallion Architecture?

### Explanation
The **Medallion Architecture** is an industry-standard data design pattern used to organize data within a lakehouse progressively. Data from operational source systems (which are designed for transactional efficiency rather than analytics) is ingested, validated, and reshaped through three distinct stages: **Bronze** (raw), **Silver** (cleaned/validated), and **Gold** (modeled for business use).

### Why it Matters
Raw incoming data is frequently inconsistent, duplicates exist, and structures vary. Without a structured pipeline, analysts spend the majority of their time cleaning data instead of analyzing it. The medallion architecture provides a progressive refinement pipeline that establishes a clear path from raw ingestion to reliable business intelligence.

### Key Layers of the Architecture

#### Bronze Layer
* **Role:** Landing zone for all raw incoming data (structured, semi-structured, or unstructured).
* *Rule:* Stored in its original format without modifications. Keeping data raw is intentional; if a downstream transformation bug is discovered, the data engineer can reprocess the silver and gold layers from the raw bronze tables without needing to query source systems again.

#### Silver Layer
* **Role:** Refined, validated, and integrated dataset.
* *Rule:* Conducts cleansing activities such as standardizing schemas, converting formats, removing nulls, deduplicating records, and joining related source feeds. The resulting tables are clean and reliable, serving as the source for advanced analysis by data scientists and fueling the Gold layer.

#### Gold Layer
* **Role:** Business-oriented, modeled consumption layer.
* *Rule:* Typically organized as a dimensional star schema (facts and dimensions) aggregated to the granularity needed for corporate reporting. You can have multiple distinct Gold layers targeting different business functions (e.g., flat feature tables for machine learning vs. aggregated dimensional schemas for finance) utilizing the same Silver tables underneath.

---

## 2. Medallion Topology Options in Fabric

### Explanation
When implementing a medallion pattern in Fabric, you must decide how to distribute the three layers across workspaces and lakehouses.

### Why it Matters
Choosing the right structure balances simplicity (maintenance overhead) with isolation (security boundaries and capacity allocation).

### Topology Options
* **Single Lakehouse with Schemas:**
  * Tables are organized into schemas named `bronze`, `silver`, and `gold`.
  * *Best for:* Smaller teams, early-stage projects. Simpler to manage with lower overhead.
* **Separate Lakehouses:**
  * Bronze, Silver, and Gold each have their own dedicated lakehouse item within the same workspace.
  * *Best for:* Medium-sized teams needing a clear visual separation of objects and different layer-level permissions.
* **Separate Workspaces:**
  * Each layer has its own workspace.
  * *Best for:* Regulatory or strict compliance scenarios requiring separate billing/capacity, distinct administrators, and complete isolation.

---

## 3. Data Processing & Materialized Lake Views

### Explanation
Moving data through the medallion layers requires transformation logic. Fabric supports low-code Dataflows Gen2, code-first Notebooks, and T-SQL using Materialized Lake Views.

### Key Processing Tools
* **Dataflows Gen2 (Low-Code):** Power Query interface used for simple transformations like column renaming, type casting, and filtering without writing code.
* **Notebooks (Code-First):** Uses PySpark, Spark SQL, or Scala for processing large datasets, complex business logic, custom API integrations, and machine learning.
* **Materialized Lake Views (SQL-First):** A SQL-based declaration of a transformation table.
  ```sql
  CREATE MATERIALIZED LAKE VIEW silver.sales AS
  SELECT order_id, customer_id, UPPER(TRIM(region)) AS region,
         CAST(order_date AS DATE) AS order_date, unit_price * quantity AS total_amount
  FROM bronze.sales
  WHERE order_id IS NOT NULL;
  ```
  * **How it Works:** Unlike a regular SQL view (which executes the query from scratch on every run), a materialized lake view saves the results as a physical Delta table. 
  * *Rule:* When new data arrives in the Bronze source table, Fabric automatically checks the Delta transaction logs and incrementally updates only the changed or new rows in the Silver table. You do not need to schedule or trigger a processing pipeline.

---

## 4. Querying and Reporting on the Gold Layer

### Explanation
Once data reaches the modeled Gold layer, it is served to end-users via the SQL Analytics Endpoint or Power BI Semantic Models.

### Key Points
* **SQL Analytics Endpoint:**
  * Provides read-only T-SQL query access over the Gold Delta tables.
  * Enables SQL users to write queries, create views, and apply row/column security natively without moving files.
* **Power BI Semantic Models:**
  * Surfaced directly from selected Gold tables.
  * Uses **Direct Lake mode**, which reads directly from the Delta Parquet files in OneLake without importing data into Power BI capacity memory. Reports remain real-time and load instantly.

---

## 5. Security & Governance in Medallion

### Explanation
Access control boundaries are aligned with the medallion layers: data engineers manage Bronze and Silver, while analysts, business users, and reports consume Gold.

### Access Control Tools
* **Workspace & Item Permissions:** Broad access roles (Admin, Member, Contributor, Viewer) apply to all objects in a workspace. Item sharing can grant read-only access to a specific Gold lakehouse without granting workspace access.
* **OneLake Data Access Roles:** Enables granular table-level security within a single lakehouse. You can restrict users to the Gold schema tables while blocking access to Bronze and Silver.
  * *Rule:* Every lakehouse includes a default `DefaultReader` role (granting all read users access to everything). Modify or delete this default role to secure individual schemas.
* **Git Integration:**
  * Connects Fabric workspaces to a Git repository to version control pipelines, notebooks, and lakehouse schema definitions. Allows teams to work in branches, review code, and revert bad changes.
* **Deployment Pipelines:**
  * Promotes workspace configurations across Dev, Test, and Prod stages in a managed sequence to prevent manual schema deployment errors in production.
