# STUDY GUIDE: Get Started with Lakehouses in Microsoft Fabric

> **Module for DP-700 (Microsoft Fabric Data Engineering) Exam Preparation**

---



## 1. Introduction to Lakehouses in Microsoft Fabric


### 1.1 What is a Lakehouse?


A lakehouse in Microsoft Fabric is a unified analytics platform that combines the best of two traditional data architectures:

- The flexible and scalable storage of a DATA LAKE (which can store any type of data — structured, semi-structured, or unstructured)
- The querying and analytical power of a DATA WAREHOUSE (which provides structured, optimized data for business analytics)

A lakehouse uses Apache Spark and SQL compute engines to process and analyze data at scale. All data in a lakehouse is stored in the OneLake storage layer, which is Microsoft Fabric's centralized data storage.

### 1.2 Why Do We Need a Lakehouse?


Traditional data architectures force organizations to choose between two systems:

- Data Lakes: Great for flexibility and scalability, but lack structure, performance, and querying capabilities needed for business analytics.
- Data Warehouses: Excellent for structured analytical queries, but struggle with diverse data formats (like logs, IoT data, images) and can be expensive to scale.

**This creates problems such as:**
- Data silos — different systems store different data
- Data duplication — the same data is copied across systems
- Complex integration — connecting separate systems requires significant effort

A lakehouse solves these challenges by bringing database-like capabilities directly into the data lake, eliminating the need to maintain separate systems. Organizations can store all their data (structured, semi-structured, unstructured) in one place and still run powerful analytical queries.

### 1.3 Key Takeaway


A lakehouse = Data Lake flexibility + Data Warehouse analytics, unified on OneLake in Microsoft Fabric.


## 2. Lakehouse Features and Capabilities


### 2.1 Lakehouse Data Organization: Tables and Files


**A lakehouse organizes data into two main storage areas:**

- **A)** TABLES FOLDER
    This folder contains Delta Lake tables that provide structured, queryable data.
    **Key characteristics:**
  - Support SQL queries through the SQL analytics endpoint
  - Enforce schemas (the structure of data is validated)
  - Support ACID transactions (data consistency is guaranteed)
  - Can be accessed in Power BI for reporting
  - Benefit from automatic optimization and maintenance

- **B)** FILES FOLDER
    This folder stores raw or semi-structured data files in their native format.
    **Key characteristics:**
  - Support any file format: CSV, JSON, Parquet, images, documents, etc.
  - Provide flexibility for data exploration and processing
  - Can be staged (temporarily stored) before transformation into tables
  - Do NOT enforce schema
  - Do NOT support direct SQL queries

  **Why This Separation Matters:**
  This design lets you keep both raw data (for compliance, auditing, or reprocessing) and structured tables (for analytics and reporting) within the same lakehouse. You can process files using Spark notebooks or Dataflows Gen2, then load the cleaned results into tables for querying and reporting.

### 2.2 Delta Lake Tables


At the core of every lakehouse are Delta Lake tables. Delta Lake is an open-source storage layer that brings reliability to data lakes. When you create a table in a lakehouse, the data is stored in Delta format in the underlying OneLake storage.

  **Key Advantages of Delta Lake Tables:**

- **A)** ACID TRANSACTIONS
    Delta Lake ensures data consistency even when multiple users read and write data at the same time. ACID stands for Atomicity, Consistency, Isolation, Durability — this means operations either fully complete or fully fail, preventing partial or corrupt writes.

- **B)** SCHEMA ENFORCEMENT
```python
 Delta Lake validates that the data you write matches the defined table schema. This prevents corrupt or mismatched data from being written to the table.
```

- **C)** TIME TRAVEL
    Delta Lake maintains a transaction log that records every change made to the data. This allows you to:
  - Query previous versions of your data
  - Roll back to an earlier state if something goes wrong

- **D)** EFFICIENT UPDATES AND DELETES
    Unlike traditional data lake files (which are typically append-only), Delta tables support efficient update and delete operations directly on the data.

  **How Delta Tables Work Internally:**
  **Each Delta table consists of:**
  - Parquet data files (the actual data stored in columnar format)
  - A transaction log that tracks all changes

  This architecture enables both batch and streaming workloads to work reliably with the same data.

### 2.3 Managing Lakehouse Access and Security


When you centralize data in a lakehouse, protecting that data is critical. Fabric provides layered access controls to secure data at multiple levels:

- **A)** WORKSPACE ROLES
    Use workspace roles for collaborators who need access to ALL items in a workspace.

- **B)** ITEM-LEVEL SHARING
    Use item-level sharing to grant read-only access for specific needs, such as analytics or Power BI report development.

- **C)** ROW-LEVEL AND COLUMN-LEVEL SECURITY
    The SQL analytics endpoint supports row-level security (RLS) and column-level security (CLS), allowing you to restrict what specific users see when they query through SQL.

- **D)** SCHEMA-LEVEL PERMISSIONS
    If you organize tables into schemas, you can apply schema-level permissions to control access by business domain.

- **E)** DATA GOVERNANCE
    Fabric lakehouses support data governance features including sensitivity labels, and can be extended using Microsoft Purview with your Fabric tenant.

### 2.4 Building a Foundation for Intelligent Analytics


The data you structure in a lakehouse serves more than just traditional reports and dashboards. Well-organized lakehouse data becomes the foundation for intelligent experiences across Microsoft Fabric.

  **Key Points:**

- When you create tables with clear schemas, consistent naming conventions, and descriptive column names, you make that data accessible to both human analysts and AI-powered tools.

- Fabric IQ data agents can query your lakehouse tables through the SQL analytics endpoint, translating natural language questions into SQL queries. The accuracy of the answers depends on how well you structure and document your data.

- Copilot in Power BI can generate reports and answer business questions when it can reason over clearly defined tables and relationships.

- The same lakehouse data can feed semantic models that support natural language exploration across Microsoft 365 experiences.

  Key Takeaway: Good data engineering practices (clear naming, organized schemas, well-defined relationships) create a reusable foundation for intelligent experiences across the entire platform.


## 3. Ingesting and Transforming Data in a Lakehouse


### 3.1 Creating and Exploring a Lakehouse


You create lakehouses within a Fabric-enabled workspace. Every lakehouse has:

- Tables: Stores Delta Lake tables (structured, queryable, schema-enforced, ACID-compliant)
- Files: Stores raw or semi-structured data in native format (CSV, JSON, Parquet, etc.)
- SQL analytics endpoint: Automatically created with every lakehouse for read-only SQL access

  **Schemas in Lakehouses:**
  When you create a lakehouse, schemas are ENABLED BY DEFAULT. A schema named "dbo" is created automatically.

  **What Schemas Do:**
  - Organize tables into logical groups based on business domains or functions (e.g., sales, marketing, hr)
  - Support schema-level permissions for access control
  - Enable cross-workspace queries using the four-part namespace:
    workspace.lakehouse.schema.table
  - Improve discoverability for users and AI tools like Fabric IQ data agents

### 3.2 Working Modes in a Lakehouse


**You can interact with your lakehouse in two modes:**

- **A)** LAKEHOUSE EXPLORER
  - Add and interact with tables, files, and folders
  - Manage data, upload files, create tables, and make changes
  - Add reference lakehouses to browse and manage tables across multiple lakehouses side by side

- **B)** SQL ANALYTICS ENDPOINT
  - Query Delta tables using T-SQL in READ-ONLY mode
  - Create views, functions, and apply SQL security
  - Cannot modify the underlying data

### 3.3 Ingesting Data into a Lakehouse


Ingesting data is the first step in the ETL (Extract, Transform, Load) process. Microsoft Fabric provides several methods:

- **A)** UPLOAD
    Upload local files or folders directly through the lakehouse explorer.

- **B)** LOAD TO TABLE
    Select a file or folder in the lakehouse explorer and choose "Load to Table" to create a Delta table without writing any code.
  - This is a NO-CODE option
  - Supports Parquet and CSV files
  - Lets you append or overwrite data in new or existing tables

- **C)** DATAFLOWS GEN2
    Import and transform data using the Power Query interface. Best suited for users familiar with Power BI or Excel.

- **D)** NOTEBOOKS
    Use Apache Spark to ingest, transform, and load data programmatically. Best for data engineers familiar with PySpark, SQL, and Scala.

- **E)** DATA FACTORY PIPELINES
```python
 Use the Copy data activity to move data from external sources.
```

  **Data Loading Pattern Consideration:**
  **You can either:**
  - Load raw data as files first (for staging and later processing)
  - Load directly into tables when data is already in a supported format

### 3.4 Accessing Data Using Shortcuts


Shortcuts let you integrate data into your lakehouse WITHOUT copying it. A shortcut creates a reference to data stored in an external location and makes it appear as a folder in your lakehouse.

  **Why Shortcuts Are Valuable:**
  - Reduce data duplication (no need to copy data from other sources)
  - Can reference data in different storage accounts, other cloud providers, or other Fabric items
  - OneLake manages source data permissions and credentials
  - When accessing data through a shortcut to another OneLake location, OneLake uses YOUR identity to authorize access — you must have permissions in the target location

  **Schema Shortcuts:**
  You can also create schema shortcuts that map an entire schema to a folder of Delta tables in another lakehouse or in Azure Data Lake Storage Gen2. All referenced tables appear as local tables within the schema.

### 3.5 Transforming Data in a Lakehouse


Most data requires transformation before loading into tables. You can ingest raw data into the Files area, then transform and load it into tables.

  **Transformation Tools:**

- **A)** NOTEBOOKS
```python
 Favored by data engineers who work with programming languages like PySpark, SQL, and Scala. Copilot in notebooks can generate transformation code from natural language descriptions and explain existing Spark code.
```

- **B)** DATAFLOWS GEN2
    Suited for users familiar with Power BI or Excel, since they use the Power Query interface.

- **C)** PIPELINES
    Provide a visual interface to orchestrate ETL processes. Pipelines can include multiple activities that run in sequence or in parallel.


## 4. Querying and Analyzing Lakehouse Data


### 4.1 Querying Data Using the SQL Analytics Endpoint


The SQL analytics endpoint provides READ-ONLY access to lakehouse tables using T-SQL queries. It is automatically created with every lakehouse.

  **What You Can Do:**
  - Write queries to explore data, filter rows, aggregate values, and join tables
  - Does not affect the underlying data files (read-only)

  **Common Use Cases:**
  - Ad-hoc queries: Quickly investigate data to answer business questions
  - Business intelligence connections: Connect tools like Power BI, Excel, or Azure Data Studio for reports
  - Data validation: Verify transformation results after loading or processing data

  **SQL Views:**
  You can create SQL views to store reusable query logic. Views are useful for:
  - Applying business rules
  - Simplifying complex joins
  - Providing curated data for downstream consumers
    Example: Create a view that joins sales and product tables and filters for active products only

  **Security:**
  The SQL analytics endpoint supports row-level security and column-level security to control which users see which data.

  **Copilot for SQL:**
  Copilot for SQL queries can help you write T-SQL queries from natural language descriptions. You describe what you want to analyze, and Copilot suggests query code.

### 4.2 Querying Data Using Spark Notebooks


Notebooks provide a flexible, code-based environment for querying and analyzing lakehouse data. You can use:

- **A)** SPARK SQL
  - Use SQL syntax within a notebook cell
  - Write queries like: SELECT * FROM schema.table
  - Works well for familiar SQL patterns

- **B)** PYSPARK
  - Use Python code to manipulate data
  - Write SQL queries using spark.sql()
  - Use the DataFrame API with methods like df.select() and df.filter()
  - Provides greater flexibility for complex transformations and integration with Python libraries

  **Common Use Cases for Spark Notebooks:**
  - Exploratory data analysis: Investigate patterns, outliers, and relationships
  - Complex transformations: Apply business logic that's easier to express in code than SQL
  - Cross-workspace queries: Use the four-part namespace (workspace.lakehouse.schema.table) to join data across multiple lakehouses in a single query

  **Copilot for Notebooks:**
  Copilot can generate PySpark or Spark SQL code from natural language prompts and explain existing code, accelerating development and helping you learn Spark syntax.

### 4.3 Analyzing and Visualizing with Power BI


Power BI is the business intelligence and reporting layer in Microsoft Fabric. It serves as the consumption layer where business users access data through interactive reports and dashboards.

  **Power BI Connects to Lakehouse Data in Two Ways:**

- **A)** QUERY THE SQL ANALYTICS ENDPOINT
    Analysts can connect directly to the SQL analytics endpoint using Power BI, Excel, or other tools to run ad-hoc queries and explore data before building reports.

- **B)** CREATE A SEMANTIC MODEL
    You can create a semantic model that references specific lakehouse tables. A semantic model defines:
  - Relationships between tables
  - Measures (calculated metrics)
  - Business logic that Power BI reports consume

  **Direct Lake Mode:**
  When you build reports on a lakehouse semantic model, Power BI uses DIRECT LAKE mode by default.
  - Direct Lake reads data directly from Delta Lake Parquet files
  - It does NOT import or copy data
  - Provides fast query performance
  - Reports always reflect the current (most up-to-date) lakehouse data

  **Intelligent Experiences:**
  When you define clear relationships and business measures in a semantic model, Copilot in Power BI can generate visualizations and answer business questions by reasoning over your lakehouse data.
