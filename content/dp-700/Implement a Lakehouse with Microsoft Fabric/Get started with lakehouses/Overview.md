# DP-700 Study Guide: Get started with lakehouses

This study guide explains the architectural features, ingestion, transformation, and querying capabilities of a Microsoft Fabric Lakehouse.

---

## 1. Microsoft Fabric Lakehouse Architecture

### Explanation
A **Lakehouse** in Microsoft Fabric is a unified data platform that combines the flexible, scalable, and low-cost storage of a data lake with the schema management, ACID transaction support, and querying capabilities of a relational data warehouse. It is built on top of Microsoft Fabric's unified SaaS storage layer, **OneLake**, and uses Apache Spark and SQL compute engines to process data at scale.

### Why it Matters
Traditional analytics architectures require maintaining separate systems: a data lake for raw/unstructured files and a data warehouse for structured business intelligence. This separation creates data silos, complex ETL (extract, transform, load) pipeline management, and synchronicity issues. A lakehouse solves this by providing a single, consolidated platform for all structured, semi-structured, and unstructured data.

### Where it is Used
Used throughout Microsoft Fabric workspaces to host datasets supporting data engineering, data science, and business intelligence (BI) workloads.

### Key Points or Rules
A Fabric Lakehouse separates data into two primary storage areas:
* **Files Folder:**
  * Stores raw, semi-structured, or unstructured data files in their native format (e.g., CSV, JSON, Parquet, images, documents).
  * Does not enforce schemas or support direct T-SQL queries.
  * Provides flexibility for initial staging and data exploration.
* **Tables Folder:**
  * Contains structured, queryable **Delta Lake tables**.
  * Supports SQL queries via the automatically generated SQL Analytics Endpoint.
  * Enforces schemas, supports ACID transactions, and benefits from automatic storage optimizations.
  * Directly accessible by Power BI for reporting.

---

## 2. Delta Lake Tables in the Lakehouse

### Explanation
Delta Lake is an open-source storage layer that brings reliability and performance optimizations to data lakes. In Microsoft Fabric, tables in the Tables folder are stored in the open Delta format (which consists of compressed Parquet data files plus a transaction log that tracks all changes).

### Why it Matters
Raw files in a traditional data lake lack database-like reliability, making it easy to write corrupt data or experience concurrency conflicts. Delta Lake provides structural integrity to the lakehouse so both batch and streaming workloads can safely read and write to the same tables.

### Key Points or Rules
* **ACID Transactions:** Ensures Atomicity, Consistency, Isolation, and Durability, preserving data integrity even when multiple users read and write data simultaneously.
* **Schema Enforcement:** Prevents corrupt data by validating that incoming data matches the pre-defined table schema before writing it.
* **Time Travel:** Maintains a transaction log that enables querying historical versions of data or rolling back unwanted changes.
* **Efficient Updates & Deletes:** Supports standard `UPDATE` and `DELETE` DML statements natively, which is not possible on standard raw files in a data lake.

---

## 3. Data Ingestion, Shortcuts, and Transformations

### Explanation
To make a lakehouse useful, data must be loaded (ingested) and cleaned (transformed). Fabric offers a mix of no-code, low-code, and code-first tools to move and refine data.

### Why it Matters
Data arrives in various formats and states of cleanliness. Selecting the appropriate tool allows data engineers to build efficient ingestion pipelines based on their skillset and the complexity of the data.

### Key Ingestion & Transformation Methods
* **Upload:** Directly upload local files/folders to the Files area via the Lakehouse Explorer.
* **Load to Table:** A no-code option in Lakehouse Explorer to load CSV or Parquet files directly into Delta tables. Supports appending or overwriting.
* **Dataflows Gen2:** A low-code Power Query visual interface for transforming and loading data. Best for users with Power BI or Excel backgrounds.
* **Notebooks:** A code-first environment using PySpark, Spark SQL, or Scala. Highly favored by data engineers for complex coding, machine learning preparation, and massive-scale transformations.
* **Data Factory Pipelines:** Orchestrates complex, multi-activity ETL workflows (e.g., Copy activities, running notebooks, and triggering dataflows).

### OneLake Shortcuts
* **Definition:** References data in external storage (e.g., ADLS Gen2, other clouds, or other Fabric workspaces) making it appear local to the lakehouse without copying the underlying files.
* *Why it matters:* Eliminates redundant data copying, reduces storage costs, and simplifies access control.
* *Permissions:* Managed by OneLake. Accessing shortcuts to other OneLake locations uses the user's active identity to authorize access.
* **Schema Shortcuts:** Map an entire schema of Delta tables from another lakehouse or Azure Data Lake Storage Gen2 as local tables.

### Schemas in the Lakehouse
* Schemas are enabled by default in Fabric lakehouses, automatically generating a default `dbo` schema.
* *Why it matters:* Organizes tables into logical business domains (e.g., `sales`, `marketing`, `hr`) and supports schema-level permissions and cross-workspace queries using a 4-part namespace: `workspace.lakehouse.schema.table`.

---

## 4. Querying and Analyzing Lakehouse Data

### Explanation
Once data is loaded into Delta tables, users can query it using their preferred interface: T-SQL via the SQL Analytics Endpoint, PySpark/SQL in Spark Notebooks, or visual reports in Power BI.

### Why it Matters
Different roles (e.g., SQL developers, data scientists, business analysts) require different tools to interact with the same underlying data. Fabric's multi-engine architecture allows them to query the same Delta tables without moving data.

### Key Querying Methods

#### SQL Analytics Endpoint
* **T-SQL Read-Only Access:** Automatically created with the lakehouse. Allows querying Delta tables using standard T-SQL.
* *Rule:* It is strictly read-only. You can create SQL views, user-defined functions, and apply SQL-level security (RLS and CLS), but you cannot write/insert data.
* *Copilot:* Generates T-SQL query suggestions from natural language prompts.

#### Spark Notebooks
* **Code-Based Environment:** Supports Spark SQL (writing standard `SELECT` statements in notebook cells) and PySpark (using Python DataFrame APIs like `df.select()` and `df.filter()`).
* *Cross-Workspace Queries:* Notebooks can query tables in other workspaces using the 4-part namespace (`workspace.lakehouse.schema.table`).
* *Copilot:* Generates PySpark/SQL code and explains existing notebook code.

#### Power BI Integration
Power BI serves as the visual consumption layer.
* **Direct Lake Mode (Default):** Power BI reports read data directly from the Delta Parquet files in OneLake without importing or copying data.
* *Why it matters:* Provides the performance of import mode with the real-time freshness of Direct Query.
* **Semantic Models:** Define table relationships, business measures, and hierarchies that feed Power BI reports and support AI tools (like Power BI Copilot) in answering business questions.
