# DP-700 Study Guide: Load data into a data warehouse

This study guide explains the strategies, tools, and methods for loading data into a Microsoft Fabric Data Warehouse.

---

## 1. Data Loading Strategies

### Explanation
Before choosing a loading tool, you must define a data loading strategy. This involves selecting a loading pattern (full vs. incremental), staging the data for preparation, defining key relationships, and loading tables in the correct order (dimensions first, then facts).

### Why it Matters
A well-defined strategy ensures data integrity, maintains warehouse responsiveness during heavy operations, tracks historical changes, and handles updates from source systems cleanly.

### Key Points or Rules

#### Full vs. Incremental Loads
* **Full Load:** Truncates and completely reloads all tables, replacing old data. 
  * *When to use:* Setting up a new warehouse or when performing a complete data refresh. It is simple because you do not track history.
* **Incremental Load:** Updates tables with only the data that has changed since the last load.
  * *When to use:* Regular updates (daily, hourly). It is faster than a full load but requires change-tracking mechanisms in the source system to identify modified/new records.
  * *Typical Pattern:* A full load is run for the initial migration, followed by scheduled incremental loads.

#### Staging Data
* Staging tables, stored procedures, and functions act as a temporary workspace where incoming data is cleaned, transformed, and validated.
* **Purposes:**
  1. Applies business rules and data type conversions without affecting production tables.
  2. Acts as a buffer to keep the warehouse responsive to users while large loads process in the background.

#### Business Keys vs. Surrogate Keys
* **Business Key (Natural Key):** A key originating from the source system that has business meaning (e.g., customer IDs, product SKUs, employee numbers). It is used to trace warehouse records back to source systems.
* **Surrogate Key:** A system-generated integer that uniquely identifies a record in the warehouse and has no business meaning. 
  * *Rule:* Surrogate keys protect database relationships from changes in the source system (e.g., if a source system reuses or changes a business key, the warehouse surrogate key remains unaffected).

#### Loading Dimension Tables & Slowly Changing Dimensions (SCD)
Dimension tables provide descriptive context for analysis and must be loaded first because fact tables reference them. When dimension attributes change over time, Slowly Changing Dimension (SCD) patterns determine how to handle the update:
* **Type 0:** Attributes never change.
* **Type 1:** Overwrites the existing value in the row. No history is kept (best for correcting data entry errors).
* **Type 2:** Marks the old row as inactive/expired and adds a new row for the change. Use when a full historical record of changes is required (e.g., tracking a customer's address at the time of each purchase).
* **Type 3:** Stores the previous value in a separate column, keeping limited history.
* **Type 4:** Moves changing attributes to a separate dimension table.
* **Type 5:** Combines Type 4 and Type 1 (used for large dimensions where Type 2 is impractical).
* **Type 6:** Combines Type 2 and Type 3 to support both current and historical tracking.

##### T-SQL Example: Handling a Type 2 SCD
```sql
IF EXISTS (
    SELECT 1 
    FROM Dim_Products 
    WHERE SourceKey = @ProductID AND IsActive = 'True'
)
BEGIN
    -- Expire the current version by setting the end date and marking active as False
    UPDATE Dim_Products
    SET ValidTo = GETDATE(), IsActive = 'False'
    WHERE SourceKey = @ProductID AND IsActive = 'True';
END
ELSE
BEGIN
    -- Insert the new product record as the active version
    INSERT INTO Dim_Products (SourceKey, ProductName, StartDate, EndDate, IsActive)
    VALUES (@ProductID, @ProductName, GETDATE(), '9999-12-31', 'True');
END
```

#### Loading Fact Tables
Fact tables store quantitative measurements and are loaded after dimensions. The loading process looks up the surrogate keys in the dimension tables using the business keys in the staged data.
* *SCD Type 2 Lookup:* When joining dimensions under Type 2 SCD, you must resolve the correct *version* of the dimension record to match the transaction date, ensuring the fact row links to the historical state.

##### T-SQL Example: Fact Table Lookup using MAX()
This lookup assumes dimension records have incrementing surrogate keys, using `MAX()` to retrieve the most recent version:
```sql
INSERT INTO dbo.FactSales
SELECT 
    (SELECT MAX(DateKey) FROM dbo.DimDate WHERE FullDateAlternateKey = stg.OrderDate) AS OrderDateKey,
    (SELECT MAX(CustomerKey) FROM dbo.DimCustomer WHERE CustomerAlternateKey = stg.CustNo) AS CustomerKey,
    (SELECT MAX(ProductKey) FROM dbo.DimProduct WHERE ProductAlternateKey = stg.ProductID) AS ProductKey,
    (SELECT MAX(StoreKey) FROM dbo.DimStore WHERE StoreAlternateKey = stg.StoreID) AS StoreKey,
    OrderNumber,
    OrderLineItem,
    OrderQuantity,
    UnitPrice,
    Discount,
    Tax,
    SalesAmount
FROM dbo.StageSales AS stg;
```

---

## 2. Loading Data using Data Pipelines

### Explanation
Data pipelines offer a visual, low-code interface to ingest and orchestrate data at scale. Pipelines chain multiple activities (such as Copy jobs, Dataflows, or stored procedures) into structured workflows.

### Why it Matters
Allows engineers to build and schedule complex data movement processes across diverse sources and destinations without writing custom code.

### Where it is Used
Created in the Fabric workspace and built on the pipeline canvas.

### Key Points or Rules
* **Copy Job Wizard Steps:**
  1. Click **+ New item** -> **Copy job** in the workspace.
  2. **Choose Data Source:** Select from the OneLake catalog, Azure Blob Storage, SQL Server, etc.
  3. **Choose Data Destination:** Select the target Fabric Warehouse.
  4. **Choose Copy Mode:** Select **Full copy** (loads all source data every run) or **Incremental** (loads only changed rows).
  5. **Schema Mapping:** Rename columns, alter data types, or exclude columns from the destination load.
  6. **Save + Run:** Executes the pipeline.
* **Scheduling:** Set a recurring pattern (hourly, daily, weekly), start date, and time zone using the **Schedule** options.
* **Monitoring:** Review run status, execution history, and details of failed activities from the pipeline's monitoring view to debug failures.

---

## 3. Loading Data using T-SQL

### Explanation
T-SQL provides direct, code-based control over data loading and transformations. Using the SQL Query Editor, you can execute load scripts, run bulk imports, and join data across different workspace databases.

### Why it Matters
Enables granular control, optimization, automation of data transformations within the database engine, and integration with existing DBA scripts or third-party tools.

### Key Points or Rules

#### COPY Statement
Loads data from external files (CSV, Parquet, etc.) stored in Azure Data Lake Storage Gen2 (ADLS Gen2), Azure Blob Storage, or OneLake lakehouse folders.
* **Requirements:** Target table, file path, and connection credentials (if external).
* **CSV Example:**
  ```sql
  COPY INTO my_table
  FROM 'https://myaccount.blob.core.windows.net/myblobcontainer/folder0/*.csv'
  WITH (
      FILE_TYPE = 'CSV',
      CREDENTIAL = (IDENTITY = 'Shared Access Signature', SECRET = '<SAS_Token>'),
      FIELDTERMINATOR = '|'
  );
  ```
* **Parquet Example:** Format is automatically inferred from the file extension if `FILE_TYPE` is omitted.
  ```sql
  COPY INTO test_parquet
  FROM 'https://myaccount.blob.core.windows.net/myblobcontainer/folder1/*.parquet'
  WITH (
      CREDENTIAL = (IDENTITY = 'Shared Access Signature', SECRET = '<SAS_Token>')
  );
  ```
* **Wildcards:** Wildcard characters (e.g., `*.csv`, `*.parquet`) allow loading multiple files with the same structure in a single statement.
* **Authentication Options:**
  * *Azure Storage:* Explicitly authenticate using Shared Access Signatures (SAS) or Storage Account Keys.
  * *OneLake Lakehouses:* No credentials are required when loading files within the same workspace; the query runs using your workspace identity automatically.
* **Rejected Rows:** For CSV files, use the `REJECTED_ROW_LOCATION` parameter to divert corrupted/failed rows to a separate folder so the overall load doesn't fail.

#### Cross-Asset Loading (Three-Part Naming)
Since all warehouses and lakehouses in a Fabric workspace share a single SQL connection endpoint, you can query and load data across them using three-part naming (`database.schema.table`).

* **CREATE TABLE AS SELECT (CTAS):** Creates a new table dynamically from a query result.
  * *Example:*
    ```sql
    CREATE TABLE [analysis_warehouse].[dbo].[combined_data] AS
    SELECT sales.*, social.social_data
    FROM [sales_warehouse].[dbo].[sales_data] AS sales
    INNER JOIN [social_lakehouse].[dbo].[social_data] AS social
        ON sales.product_id = social.product_id;
    ```
* **INSERT...SELECT:** Appends rows into an existing table.
* **External Client Access:** These cross-database queries can also be executed from external clients like SQL Server Management Studio (SSMS) using the workspace's SQL connection string.

---

## 4. Loading and Transforming with Dataflow Gen2

### Explanation
Dataflow Gen2 is a visual, no-code data preparation tool that utilizes the Power Query interface. It allows users to ingest, clean, and shape data, then load it directly into target databases.

### Why it Matters
Simplifies complex transformations (pivots, merges, data cleaning) visually for developers who prefer GUI interfaces over coding, while maintaining performance by writing directly to Fabric destinations.

### Key Points or Rules
* **Importing Data:** Supports connection to local files (e.g., Excel, Text/CSV) uploaded from a local machine, database engines, and cloud storage providers.
* **Transformations with Copilot:** Activating Copilot in the dataflow lets you describe transformations in plain English (e.g., *"Add a calculated column that multiplies Quantity by UnitPrice and name it TotalRevenue"*), and Copilot generates the steps automatically.
* **Data Destinations:** Data can be sent to Snowflake, Azure SQL, Kusto, SharePoint, Fabric Lakehouse, or **Fabric Warehouse**.
* **Update Methods for Fabric Warehouse:**
  * **Append:** Appends new rows to the existing table. (Best for transactional logs).
  * **Replace:** Replaces the entire contents of the target table on each run. (Best for dimension tables like catalogs or customer lists).
  * *Note:* KQL databases and Azure Data Explorer destinations only support **Append**.
* **Publishing Drafts:** Dataflow Gen2 saves progress as drafts automatically, but changes do not take effect or execute until you click **Publish**. Once published, dataflows can be scheduled or triggered manually.
