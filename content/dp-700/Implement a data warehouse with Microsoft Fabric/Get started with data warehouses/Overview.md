# Get Started with Data Warehouses — Study Guide

---

## 1. What Is a Data Warehouse?

A **data warehouse** is a centralized, structured store designed specifically for analytical queries and reporting. It is different from operational databases (which handle day-to-day business transactions) because it consolidates data from multiple sources into a format optimized for analysis — not for fast transactions.

**Why it matters:** Organizations need a single trusted source for business intelligence (BI). Without a data warehouse, analysts would query live production systems, slowing down operations and getting inconsistent results.

**Key points:**
- Designed for read-heavy analytical workloads, not operational writes
- Consolidates data from many source systems
- Optimized for queries that aggregate large volumes of data

---

## 2. Building a Modern Data Warehouse

A modern data warehouse solution involves four stages:

| Stage | Description |
|---|---|
| **Data Ingestion** | Moving data from source systems into the warehouse |
| **Data Storage** | Storing data in a format optimized for analytics |
| **Data Processing** | Transforming data into a format ready for consumption |
| **Data Analysis & Delivery** | Analyzing data and delivering insights to the business |

---

## 3. Dimensional Modeling: Tables in a Data Warehouse

Data warehouse tables are organized using **dimensional modeling** — a design approach that groups numerical data by different attributes for efficient analysis.

### Fact Tables
- Contain the **numerical data** (measures) you want to analyze
- Typically have a **large number of rows**
- Are the primary source of data for analysis
- Example: A fact table might store the total amount paid for each sales order, on each date, at each store

### Dimension Tables
- Contain **descriptive (context) information** about the data in fact tables
- Typically have **fewer rows** than fact tables
- Provide the "who, what, where, when, why" context for facts
- Example: A dimension table might store customer names, regions, and IDs

### Surrogate Keys vs Alternate Keys

Each dimension table contains two types of key columns:

| Key Type | Description | Purpose |
|---|---|---|
| **Surrogate Key** | A unique integer generated automatically by the database when a row is inserted | Maintains consistency and accuracy within the warehouse |
| **Alternate Key** | A natural or business key from the source system (e.g., product code, customer ID) | Maintains traceability between the warehouse and source systems |

**Why both are needed:** Surrogate keys ensure the warehouse has its own stable identity for each record. Alternate keys allow you to trace records back to the original source system.

---

## 4. Special Types of Dimension Tables

### Time Dimensions
- Provide information about **when** an event occurred
- Enable data analysts to aggregate data over temporal intervals
- Typically include columns for year, quarter, month, day, etc.
- Example: A time dimension enables you to sum all sales in Q3 of a given year

### Slowly Changing Dimensions (SCDs)
- Track **changes to dimension attributes over time**
- Examples: a customer's address changing, a product's price being updated
- **Why they matter:** They allow you to analyze and understand how data changed over time, which is critical for accurate historical reporting and good business decisions
- Without SCDs, you would lose the historical record of what a customer's address was at the time of a sale

---

## 5. Data Warehouse Schema Designs

### Normalization vs. Denormalization
- In **operational (OLTP) databases**, data is **normalized** to reduce duplication
- In a **data warehouse**, dimension data is **denormalized** to reduce the number of joins needed for analytical queries — which speeds up query performance

### Star Schema
- The most common data warehouse schema
- A **fact table** sits in the center, directly connected to multiple **dimension tables**
- Simple structure with fewer joins needed
- Example: FactSales connects directly to DimCustomer, DimProduct, DimDate, DimStore

**Why it matters:** The star schema balances simplicity with performance — analysts can write straightforward queries.

### Snowflake Schema
- An extension of the star schema
- Dimension tables are **further normalized** into sub-dimension tables
- Useful when many levels or attributes are shared between different dimension tables
- Example: A DimProduct table might split into DimProduct → DimCategory and DimProduct → DimSupplier

**When to use snowflake:** When there are many hierarchies or shared attributes across dimensions that would lead to significant data duplication in a star schema.

---

## 6. Microsoft Fabric Data Warehouse

### What Is a Fabric Data Warehouse?

A Fabric data warehouse is a **fully managed, enterprise-scale relational database built on OneLake**. It provides:
- Full **transactional T-SQL capabilities**: DDL statements (CREATE, ALTER, DROP) and DML statements (INSERT, UPDATE, DELETE, MERGE)
- **ACID compliance** for data consistency
- Data stored in **open Delta format on OneLake**, making it accessible to other Fabric workloads without duplication

### Key Capabilities

| Capability | Description |
|---|---|
| **Full T-SQL support** | Write DDL and DML including MERGE for upsert scenarios |
| **Fully managed** | No infrastructure to configure; compute scales automatically and independently from storage |
| **OneLake integration** | Data stored in Delta format, accessible by other Fabric workloads without copying |
| **Cross-database querying** | Query across warehouses and lakehouses using three-part naming: `database.schema.table` |
| **Familiar tooling** | Connect via SSMS, Azure Data Studio, or any SQL client through standard TDS connections |
| **Copilot assistance** | Generates SQL from natural language, provides code completion, explains/fixes queries |

### Warehouse vs SQL Analytics Endpoint

| Capability | Warehouse | SQL Analytics Endpoint |
|---|---|---|
| Read data | Yes | Yes |
| Write data (INSERT, UPDATE, DELETE, MERGE) | **Yes** | **No** |
| Create tables (DDL) | **Yes** | **No** |
| Create views and stored procedures | Yes | Yes |
| Data source | Native warehouse tables | Lakehouse Delta tables |

**Rule of thumb:**
- Use a **warehouse** when you need full read/write T-SQL capabilities
- Use the **SQL analytics endpoint** when you need read-only SQL access to lakehouse data

---

## 7. Creating a Fabric Data Warehouse

You can create a data warehouse in Fabric from:
- The **create hub**, or
- Within a **workspace**

After creation, you get an empty warehouse where you add tables, views, and other objects using the SQL query editor in the Fabric portal.

---

## 8. Ingesting Data into a Fabric Warehouse

There are four main ingestion methods:

### COPY INTO
- **Bulk loads data** from external files (CSV, Parquet) stored in Azure storage into warehouse tables
- Fast, efficient method for large file loads

```sql
COPY INTO dbo.Region
FROM 'https://mystorageaccount.blob.core.windows.net/data/Region.csv'
WITH (
    FILE_TYPE = 'CSV',
    CREDENTIAL = (IDENTITY = 'Shared Access Signature', SECRET = 'xxx'),
    FIRSTROW = 2
)
GO
```
> `FIRSTROW = 2` skips the header row and starts loading from row 2.

### OPENROWSET
- Queries files **directly from external storage or OneLake** for ad hoc analysis or ingestion
- Does not require creating tables first
- Good for one-off explorations

### Pipelines and Dataflows
- Use **Data Factory pipelines** or **Dataflows Gen2** for orchestrated data movement and transformation
- Best for scheduled, repeatable, or complex ETL workflows

### Cross-database Queries
- Query lakehouse tables directly from the warehouse using **three-part naming** without copying data
- Example: `SELECT * FROM MyLakehouse.dbo.DimProduct`
- Use this when you want to read lakehouse data without creating duplicates

---

## 9. Creating Tables and Loading Data

### Creating Tables with T-SQL

Use `CREATE TABLE` statements with appropriate data types for analytics workloads:

```sql
CREATE TABLE dbo.DimCustomer (
    CustomerKey   INT          NOT NULL,
    CustomerAltKey NVARCHAR(10) NOT NULL,
    CustomerName  NVARCHAR(100) NOT NULL,
    Region        NVARCHAR(50)  NULL
);

CREATE TABLE dbo.FactSales (
    SalesKey    INT            NOT NULL,
    CustomerKey INT            NOT NULL,
    ProductKey  INT            NOT NULL,
    DateKey     INT            NOT NULL,
    SalesAmount DECIMAL(10,2)  NOT NULL,
    Quantity    INT            NOT NULL
);
```

**Data type guidance:**
- `INT` for key columns
- `NVARCHAR` for text that may include special characters
- `DECIMAL` for financial values requiring precision

### Using Staging Tables

A **staging table** is a temporary holding area that mirrors the structure of source data. The common pattern is:
1. Load raw data from source systems into staging tables (using COPY INTO or pipelines)
2. Transform and load data from staging into final dimension and fact tables with key lookups

```sql
INSERT INTO dbo.FactSales (SalesKey, CustomerKey, ProductKey, DateKey, SalesAmount, Quantity)
SELECT s.OrderID, c.CustomerKey, p.ProductKey, d.DateKey, s.Amount, s.Qty
FROM dbo.StgSales AS s
INNER JOIN dbo.DimCustomer AS c ON s.CustomerID = c.CustomerAltKey
INNER JOIN dbo.DimProduct  AS p ON s.ProductID  = p.ProductAltKey
INNER JOIN dbo.DimDate     AS d ON s.OrderDate  = d.DateValue;
```

**Why use staging tables:** This pattern keeps source data intact while you apply business rules and surrogate key lookups during the load process.

---

## 10. Table Clones

A **table clone** creates a **zero-copy copy** of a table — it copies the table metadata but still references the same underlying data files in OneLake. No data is physically duplicated, keeping storage costs low.

```sql
-- Clone creation within the same schema
CREATE TABLE dbo.Employee AS CLONE OF dbo.EmployeeUSA;
```

**When to use table clones:**
- Development and testing (test schema changes without affecting production)
- Data recovery after a failed release
- Preserving data at a specific point in time for historical reporting

---

## 11. Querying and Transforming Data

### SQL Query Editor
- Provides IntelliSense, code completion, syntax highlighting, client-side parsing, and validation
- Familiar to users of SSMS or Azure Data Studio
- **Copilot** is integrated — it can generate queries from natural language, complete code as you type, and explain or fix existing queries

### Visual Query Editor
- A **no-code, drag-and-drop** interface similar to Power Query online
- Drag tables onto the canvas and use the Transform menu to add columns, filters, and transformations
- Good for analysts who prefer a visual approach over T-SQL

### Views
- A **view** is a saved query that you can reference like a table
- Use views to:
  - Standardize how analysts access data
  - Combine fact and dimension tables into a reporting-friendly format
  - Filter rows to a specific business context
- Views also serve as stable, AI-queryable surfaces — Copilot and Fabric IQ data agents can query views just like tables

```sql
CREATE VIEW dbo.vw_SalesByRegion AS
SELECT c.Region,
       SUM(f.SalesAmount) AS TotalSales,
       COUNT(f.OrderID)   AS OrderCount
FROM dbo.FactSales     AS f
INNER JOIN dbo.DimCustomer AS c ON f.CustomerKey = c.CustomerKey
GROUP BY c.Region;
```

### Stored Procedures
- Contain T-SQL logic that can be executed on demand
- Use for repeatable transformation tasks: loading staging data into final tables, applying business rules
- Can be created and managed in the SQL query editor

---

## 12. Modeling Data in a Warehouse

Data modeling embeds structure, business logic, and documentation directly into the warehouse. This affects every downstream experience — T-SQL queries, Power BI reports, and AI-driven natural language analytics.

### Preparing Data for Consumption

In the **model view**, clean up what consumers see:

| Action | Purpose |
|---|---|
| **Hide internal objects** | Remove staging tables, surrogate key columns, ETL artifacts from the field list |
| **Rename columns** | Use business-friendly names (e.g., rename `CustRgn` to `Customer Region`) |
| **Add descriptions** | Explain what tables and columns represent |

**Why naming and descriptions matter:** Copilot in Power BI and Fabric IQ data agents rely on table names, column names, and descriptions to interpret natural language questions. A column named `Customer Region` with a good description produces far more accurate natural language results than `CustRgn` with no description.

### Relationships Between Tables

A **relationship** is a logical connection between two tables that enables filtering, grouping, and aggregation across them.

Key properties of a relationship:

| Property | Description |
|---|---|
| **Cardinality** | How rows correspond between tables. In a star schema, fact-to-dimension relationships are typically **many-to-one** (many fact rows map to one dimension row) |
| **Cross-filter direction** | Which way filters propagate. **Single direction** (dimension filters the fact table) is the standard for star schemas — keeps behavior predictable and performant |

**Why relationships matter:** Without defined relationships, every consumer must write explicit JOIN logic. Relationships encode that connection once, so Power BI, Copilot, and Fabric IQ data agents can use them to generate accurate joins automatically.

### Views and Measures

| Object | Purpose | Consumer |
|---|---|---|
| **Views** | Standardize how T-SQL consumers access and query data — encapsulates JOINs, filters, column selections | T-SQL analysts, report tools |
| **Measures** | Reusable DAX expressions defining calculations (totals, averages, ratios, counts) — create in the warehouse model view | Power BI reports, dashboards |

**Why measures matter:** A `Total Sales` measure that sums `SalesAmount` becomes the **single source of truth** for that metric. When the business changes how revenue is calculated, you update it in one place rather than every report.

### Semantic Models and Direct Lake Mode

When building Power BI reports from a Fabric warehouse, create a **semantic model**:
- Uses **Direct Lake mode** — reads data directly from OneLake Parquet files
- Reports reflect the **latest warehouse data** without scheduled refreshes
- **No separate data copy** is maintained — avoids storage and processing overhead of import mode

---

## 13. Security

Fabric data warehouse security operates at **multiple layers**:

### Layer 1 — Workspace Roles

| Role | Access Level |
|---|---|
| **Admin** | Full control |
| **Member** | Can manage items |
| **Contributor** | Can create and edit items |
| **Viewer** | Can view items, cannot make changes |

### Layer 2 — Item Permissions

Grant item-level permissions to share individual warehouses without granting access to the entire workspace:

| Permission | What It Allows |
|---|---|
| **Read** | Connect using the SQL analytics endpoint |
| **ReadData** | Read data from any table or view in the warehouse |
| **ReadAll** | Read raw Parquet files in OneLake |

> A user connection to the SQL analytics endpoint **fails** without at minimum the **Read** permission.

### Layer 3 — Granular SQL Security (T-SQL)

For precise access control, use T-SQL-based security features:

| Feature | Description |
|---|---|
| **Object-level security (OLS)** | Control access to specific tables, views, or stored procedures |
| **Row-level security (RLS)** | Restrict which rows a user can see using WHERE clause predicates |
| **Column-level security (CLS)** | Restrict which columns are visible to specific users |
| **Dynamic data masking (DDM)** | Mask sensitive data (e.g., email addresses, account numbers) from non-privileged users — they can still run queries but see masked values |

**Why security matters beyond compliance:** Security policies defined in T-SQL are enforced regardless of how the data is accessed — including by Copilot and data agents.

---

## 14. Monitoring

### Query Insights

**Query insights** provides a central location for historical query data and actionable performance information:
- Retains data for **30 days**
- Helps identify long-running queries, track performance changes, and understand resource-heavy queries

System views available for querying:

| View | Returns |
|---|---|
| `queryinsights.exec_requests_history` | Information about each completed SQL request |
| `queryinsights.long_running_queries` | Queries ranked by execution time |
| `queryinsights.exec_sessions_history` | Information about completed sessions |

### Dynamic Management Views (DMVs)

Use **DMVs** to monitor **active** connections, sessions, and requests in real time:

```sql
SELECT request_id, session_id, start_time, total_elapsed_time
FROM sys.dm_exec_requests
WHERE status = 'running'
ORDER BY total_elapsed_time DESC;
```

This returns currently running queries, sorted longest-first — useful for identifying queries that need to be optimized or terminated.

> **Important:** Only **workspace Admins** can run the `KILL` command to terminate long-running sessions. Members, Contributors, and Viewers can only see their own query results.

---

## Summary: Key Concepts at a Glance

| Concept | Key Fact |
|---|---|
| Data warehouse purpose | Centralized store for analytical queries and reporting |
| Fact table | Contains numerical measures (large row count) |
| Dimension table | Contains descriptive context (smaller row count) |
| Surrogate key | Auto-generated integer, warehouse-specific |
| Alternate key | Natural/business key from source system |
| Star schema | Fact table directly connected to dimension tables |
| Snowflake schema | Dimension tables further normalized into sub-dimensions |
| SCD | Tracks attribute changes over time |
| Fabric warehouse storage | Delta format on OneLake |
| COPY INTO | Bulk load from external CSV/Parquet files |
| Table clone | Zero-copy copy referencing same OneLake files |
| Query insights retention | 30 days |
| KILL command permission | Workspace Admin only |
| Direct Lake mode | Reads directly from OneLake Parquet — no refresh needed |
| Warehouse vs SQL endpoint | Warehouse = read/write; SQL endpoint = read-only |
