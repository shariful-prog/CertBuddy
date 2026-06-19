# DP-700 Study Guide: Query a data warehouse

This study guide explains the architectural schemas, analytical query patterns, built-in editors, and client-tool configurations used to query a Microsoft Fabric Data Warehouse.

---

## 1. Schema Architectures for Data Warehousing

### Explanation
Data warehouses store historical business data organized in structures optimized for analytical queries. The two most common modeling approaches are the **Star Schema** and the **Snowflake Schema**. Both designs require classifying tables as either facts or dimensions.
* **Fact Tables:** Store measurable, quantitative data about a business (e.g., sales quantities, transaction amounts, revenue).
* **Dimension Tables:** Contain descriptive attributes that provide context to the fact data (e.g., customer details, product names, store locations, dates).

### Why it Matters
Without dimension tables, fact tables are just collections of numbers without meaning. Structuring data in star or snowflake schemas enables fast aggregation and makes it intuitive for business intelligence tools to generate reports.

### Key Points or Rules
* **Star Schema:** A single central fact table directly joined to surrounding dimension tables. This is the simplest, most performant layout.
* **Snowflake Schema:** Dimensions are partially normalized, splitting detailed attributes into separate, hierarchical tables (e.g., normalizing a Product dimension to reference a separate Category dimension).
  * *Query Rule:* Slicing facts by normalized snowflake attributes requires traversing the entire relationship chain with multiple joins, even if columns from the intermediate tables do not appear in the final query results.

##### Snowflake Schema Query Example:
```sql
SELECT cat.ProductCategory, SUM(sales.OrderQuantity) AS ItemsSold
FROM dbo.FactSales AS sales
JOIN dbo.DimProduct AS prod ON sales.ProductKey = prod.ProductKey
JOIN dbo.DimCategory AS cat ON prod.CategoryKey = cat.CategoryKey
GROUP BY cat.ProductCategory
ORDER BY cat.ProductCategory;
```

---

## 2. Analytical Query Patterns in T-SQL

### Explanation
Analyzing warehouse data involves aggregating measures, ranking performance, and exploring metrics across massive volumes of records. T-SQL provides specific ranking, partitioning, and approximate aggregation functions to support these analytical workflows.

### Why it Matters
Standard query logic is insufficient for complex analytics like finding top-performing stores, calculating running totals, or counting unique active items quickly across millions of rows.

### Key Points or Rules

#### Ranking Functions
Ranking functions partition data across specified categories and return a value indicating the relative position of each row within its partition.
* **`ROW_NUMBER()`:** Assigns a sequential integer to each row within a partition, starting at 1.
* **`RANK()`:** Assigns a rank to each row. If values are identical, they receive the same rank (a tie). However, the ranking sequence skips subsequent numbers to account for ties (e.g., 1, 2, 2, 4).
* **`DENSE_RANK()`:** Behaves like `RANK()`, but does not skip numbers when ties occur (e.g., 1, 2, 2, 3).
* **`NTILE(N)`:** Distributes rows in an ordered partition into a specified number of groups (percentiles/quartiles), returning the group number (1 to N).

##### T-SQL Example: Ranking by List Price within Categories
```sql
SELECT 
    ProductCategory, ProductName, ListPrice,
    ROW_NUMBER() OVER (PARTITION BY ProductCategory ORDER BY ListPrice DESC) AS RowNumber,
    RANK() OVER (PARTITION BY ProductCategory ORDER BY ListPrice DESC) AS Rank,
    DENSE_RANK() OVER (PARTITION BY ProductCategory ORDER BY ListPrice DESC) AS DenseRank,
    NTILE(4) OVER (PARTITION BY ProductCategory ORDER BY ListPrice DESC) AS Quartile
FROM dbo.DimProduct;
```

#### Approximate Distinct Counts
Calculating exact distinct counts over large tables is highly resource-intensive and slow.
* **`APPROX_COUNT_DISTINCT(column)`:** Uses the **HyperLogLog** algorithm to estimate the number of unique values.
* *Rule:* It guarantees a maximum error rate of **2%** with a **97% probability**. It runs significantly faster than `COUNT(DISTINCT column)` and is ideal for initial data exploration.

---

## 3. SQL Query Editor in Fabric

### Explanation
The SQL Query Editor is a built-in Fabric interface that enables developers to write, edit, and run T-SQL scripts directly against a data warehouse.

### Why it Matters
Eliminates the need to install external database IDEs for basic tasks and provides integrated tools to export, preview, and visualize results.

### Key Points or Rules
* **Launching and Saving:** Select a warehouse in the Fabric portal. Queries created here are automatically saved in the **My queries** folder in the Explorer pane.
* **Row Limits:** The Results preview pane is capped at a maximum of **10,000 rows**.
* **Results Toolbar Actions:**
  * **Open in Excel:** Creates a live, refreshable connection to the warehouse in Microsoft Excel. It does not just download a static CSV/XLSX file. It requires Microsoft account authentication.
  * **Explore this data (preview):** Opens a side-by-side matrix view for ad hoc data exploration.
  * **Visualize results:** Generates a Power BI chart directly within the editor. 
    * *Restriction:* Does not support queries that contain an `ORDER BY` clause.
  * **Copy:** Allows copying results only, column names only, or both.
  * **Save as view / Save as table:** Prompts for a schema and name to immediately save the highlighted SELECT query results as a new view or table.
* **Copilot Integration (F2/P1 capacity or higher):**
  * **Explain query:** Adds comments to the query describing its logic.
  * **Fix query errors:** Automatically corrects syntax/logical errors. It remains disabled until the editor identifies a problem.

---

## 4. Visual Query Editor (No-Code querying)

### Explanation
The Visual Query Editor provides a drag-and-drop, graphical interface to design queries and inspect data without writing code.

### Why it Matters
Enables business analysts and non-technical stakeholders to query data warehouses, while also helping engineers build complex query shapes visually.

### Key Points or Rules
* **Launching:** Select the dropdown arrow next to **New SQL query** and click **New visual query**.
* **Core Actions:**
  * Drag tables from the Explorer onto the canvas.
  * Right-click a table and select **Merge queries** to define joins, selecting common keys and join types.
  * Click **Run** to execute the query and view results.
* **SQL Interoperability:** The editor automatically generates the underlying T-SQL. You can select **View SQL** to inspect the code or **Edit SQL script** to export it into the standard SQL query editor.

---

## 5. Connecting and Querying with Client Tools

### Explanation
Fabric Data Warehouses can be queried using standard external database administration tools, such as SQL Server Management Studio (SSMS).

### Why it Matters
Database professionals often prefer using full-featured desktop IDEs for complex scripting, object management, and advanced database development workflows.

### Key Points or Rules
* **Connection Steps:**
  1. In the Fabric portal, select the ellipsis (`...`) next to your warehouse and click **Copy SQL connection string**.
  2. Open SSMS, set Server type to *Database Engine*, and paste the string into the **Server name** field.
  3. **Database Name Field (CRITICAL):** You must open the Connection Properties dialog and enter the exact name of the warehouse (e.g., `sample-dw`) in the *Database Name* field. Leaving this blank causes the connection to fail, even with correct credentials.
* **Authentication Support:** Microsoft Fabric supports **Microsoft Entra ID authentication only** (e.g., Microsoft Entra MFA, Password, or Integrated). **Standard SQL Server Authentication is NOT supported**.
* **Firewall Requirements:** TCP **port 1433** must be open in your network firewall to allow communication with the Fabric endpoint.
* **Third-Party Compatibility:** Any tool supporting ODBC or OLE DB drivers can connect to the warehouse using the SQL connection string and Entra ID authentication.
