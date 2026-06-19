# Study Guide: Use Apache Spark in Microsoft Fabric

This study guide prepares you to use Apache Spark in Microsoft Fabric for the DP-700 exam. It covers Spark architecture, pools, environments, notebooks, job definitions, Spark Dataframes, Spark SQL, and data visualization techniques.

---

## Introduction to Apache Spark in Microsoft Fabric

### Explanation
Apache Spark is an open-source, parallel processing framework designed for large-scale data processing and analytics. It is highly popular in "big data" processing scenarios and is implemented across multiple platforms, including Azure HDInsight, Azure Synapse Analytics, and Microsoft Fabric. In Fabric, Apache Spark is fully integrated, making it easy to work with Spark in the same environment as other data services such as Lakehouses and Warehouses.

### Why it matters
Traditional single-server databases cannot efficiently process terabytes or petabytes of data. Apache Spark solves this by dividing data processing tasks and executing them across a cluster of servers, drastically reducing processing time.

### Where it is used
Used in data engineering, data science, and analytics workloads to ingest, clean, transform, and analyze massive volumes of data stored in OneLake.

### Key points or rules
*   Open-source parallel processing framework.
*   Fully integrated within the Microsoft Fabric portal.
*   Supports multiple languages: Java, Scala, Spark R, Spark SQL, and PySpark (Python).

---

## Spark Pool Architecture

### Explanation
A Spark pool is a cluster of compute nodes that distribute data processing tasks using a "divide and conquer" approach. The architecture consists of two types of nodes:
*   **Head Node:** Runs the **driver** program to coordinate distributed processes, divide tasks, and collate results.
*   **Worker Nodes:** Run **executor** processes that perform the actual data processing tasks.

Fabric offers two options for Spark pools:
*   **Starter Pools:** Enabled by default in every workspace, allowing Spark jobs to start quickly (in seconds) with minimal setup.
*   **Custom Spark Pools:** Tailored pools that let you choose virtual machine types, scale sizes, and node counts.

### Why it matters
Understanding Spark pool configurations helps optimize both performance and cost. For example, memory-optimized VMs and autoscaling ensure that you only pay for the compute resources you need while avoiding bottlenecks during heavy workloads.

### Where it is used
Configured in the **Admin portal** section of the workspace settings under **Capacity settings** $\rightarrow$ **Data Engineering/Science Settings**.

### Key points or rules
*   **Node Family:** Typically, **memory-optimized** nodes provide optimal performance for data engineering tasks.
*   **Autoscale:** Automatically provisions nodes as needed between a specified minimum and maximum limit.
*   **Dynamic Allocation:** Allocates executor processes dynamically on worker nodes based on data volume.
*   Fabric administrators can disable custom Spark pool creation at the Capacity level.

---

## Runtimes and Environments

### Explanation
*   **Spark Runtime:** A pre-packaged suite of software components including specific versions of Apache Spark, Delta Lake, Python, and core libraries.
*   **Environments:** Customized workspaces where you specify a runtime version, install public libraries (from PyPI) or custom library packages (via uploaded files), set a default Spark pool, override Spark configuration properties, and upload required resource files.

### Why it matters
Different data science or data engineering tasks require specific software dependencies. Environments allow teams to build isolated, reproducible runtime configurations so that updates to one project's libraries do not break another project.

### Where it is used
Created and managed in the Fabric workspace settings to set default configurations for notebooks and Spark jobs.

### Key points or rules
*   Microsoft Fabric supports multiple runtime versions and updates them regularly.
*   Custom libraries can be installed from **PyPI** or by uploading custom package files.
*   Environments can override default Spark properties and map to specific pools.

---

## Advanced Spark Configurations

### Explanation
Fabric provides additional features to optimize Spark performance and usability:
*   **Native Execution Engine:** A vectorized processing engine that runs Spark operations directly on Fabric's lakehouse infrastructure. This significantly speeds up query performance on Parquet or Delta file formats.
*   **High Concurrency Mode:** Allows multiple concurrent users or processes to share a single Spark session. This optimizes resource usage while maintaining code isolation between different notebooks.
*   **Automatic MLFlow Logging:** Automatically logs machine learning experiment training details and metrics without requiring explicit tracking code.

### Why it matters
These optimizations improve resource utilization (saving money on Fabric capacity) and speed up data processing without requiring complex manual code rewrites.

### Where it is used
*   **Native Execution Engine:** Enabled at the environment level or within a notebook cell.
*   **High Concurrency Mode:** Configured in the Data Engineering/Science workspace settings.
*   **Automatic MLFlow Logging:** Enabled by default in workspace settings.

### Key points or rules
*   To enable the Native Execution Engine in a notebook cell, use the `%%configure` magic:
    ```json
    %%configure
    {
      "conf": {
        "spark.native.enabled": "true",
        "spark.shuffle.manager": "org.apache.spark.shuffle.sort.ColumnarShuffleManager"
      }
    }
    ```
*   High concurrency mode shares the Spark session but isolates notebook variables.

---

## Running Spark Code: Notebooks vs. Spark Job Definitions

### Explanation
There are two primary interfaces to run Spark code in Microsoft Fabric:
1.  **Notebooks:** Interactive items consisting of cells containing Markdown text or code. Ideal for data exploration, ad-hoc analysis, and collaborative development.
2.  **Spark Job Definitions (SJD):** Non-interactive items designed to run Spark scripts (e.g., Python files) on-demand or on a schedule. Ideal for automated, production-grade ETL pipelines.

### Why it matters
Notebooks are great for designing and testing logic, whereas Spark Job Definitions are designed to run background processes efficiently without the overhead of an interactive user interface.

### Where it is used
*   **Notebooks:** Data exploration and model prototyping.
*   **Spark Job Definitions:** Running nightly batch processes in data pipelines.

### Key points or rules
*   Notebooks support mixed languages in different cells using cell magics (e.g., `%%pyspark`, `%%spark` for Scala, `%%sql`).
*   Spark Job Definitions configure a main script file, reference files (like utility functions), and a target lakehouse reference.

---

## Working with Spark Dataframes

### Explanation
Natively, Apache Spark operates on **Resilient Distributed Datasets (RDDs)**, but the most common structure used by data engineers is the **Dataframe** (part of the Spark SQL library). Dataframes represent data in a tabular format with rows and columns, similar to Python Pandas but optimized for distributed computing.

#### Loading Data
You can load files (like CSVs) using `spark.read.load`:
```python
%%pyspark
df = spark.read.load('Files/data/products.csv', format='csv', header=True)
display(df.limit(10))
```

#### Specifying an Explicit Schema
While Spark can infer schemas, defining an explicit schema using `StructType` and `StructField` improves performance:
```python
from pyspark.sql.types import *
productSchema = StructType([
    StructField("ProductID", IntegerType()),
    StructField("ProductName", StringType()),
    StructField("Category", StringType()),
    StructField("ListPrice", FloatType())
])
df = spark.read.load('Files/data/product-data.csv', format='csv', schema=productSchema, header=False)
```

#### Manipulating Dataframes
You can select columns, filter rows, and aggregate data by chaining methods:
```python
# Selecting and filtering
bikes_df = df.select("ProductName", "Category", "ListPrice")\
             .where((df["Category"] == "Mountain Bikes") | (df["Category"] == "Road Bikes"))

# Grouping and counting
counts_df = df.select("ProductID", "Category").groupBy("Category").count()
```

#### Saving and Partitioning Dataframes
You can write dataframes back to OneLake, typically in the efficient **Parquet** format:
```python
# Save as Parquet
bikes_df.write.mode("overwrite").parquet('Files/product_data/bikes.parquet')

# Save Partitioned by Category
bikes_df.write.partitionBy("Category").mode("overwrite").parquet("Files/bike_data")
```
Partitioning divides files into folders formatted as `column=value` (e.g., `Category=Mountain Bikes`), which optimizes query performance by eliminating unnecessary disk I/O.

### Why it matters
Dataframes provide a powerful, optimized API to clean, shape, and partition data at scale, ensuring downstream systems can read the data quickly.

### Where it is used
Used inside Spark Notebooks to load, clean, transform, and write data files in OneLake.

### Key points or rules
*   Defining an **explicit schema** is faster than let Spark infer it.
*   `select` returns a new DataFrame object.
*   Parquet is the preferred format for files due to its high efficiency.
*   Partitioning folders are named in the `column=value` format. When reading a specific partition directly, the partitioning column is omitted from the resulting dataframe.

---

## Working with Spark SQL and the Catalog

### Explanation
The **Spark Catalog** is a metastore for relational database objects such as tables and views. It allows developers to query dataframes using standard SQL expressions.

#### Views vs. Tables
*   **Temporary Views:** Created using `df.createOrReplaceTempView("view_name")`. These views are session-scoped and are automatically deleted when the Spark session ends.
*   **Tables:** Relational structures persisted in the catalog. In Microsoft Fabric, **managed tables** store their data in the `Tables` section of the Lakehouse.
    *   **Managed Tables:** Deleting the table deletes both the metadata and the underlying data.
    *   **External Tables:** Metadata is registered in the catalog, but the underlying data resides in a custom location (e.g., `Files` folder). Deleting the table only removes the metadata, leaving the source data intact.

#### Querying with SQL
```python
# Saving a DataFrame as a Delta table
df.write.format("delta").saveAsTable("products")

# Querying using Spark SQL API
bikes_df = spark.sql("SELECT ProductID, ProductName FROM products WHERE Category = 'Mountain Bikes'")
```

In a notebook, you can use the `%%sql` cell magic to run queries directly:
```sql
%%sql
SELECT Category, COUNT(ProductID) AS ProductCount 
FROM products 
GROUP BY Category
```

### Why it matters
The Spark catalog and SQL support allow developers who prefer SQL to collaborate easily on Spark projects. Delta format tables bring transactional consistency (ACID compliance) and versioning to your big data workloads.

### Where it is used
*   Registering views and tables to expose lakehouse data to SQL queries.
*   Building Delta Lake tables for robust data warehousing patterns in Microsoft Fabric.

### Key points or rules
*   The preferred table format in Microsoft Fabric is **Delta**.
*   Deleting a **managed table** deletes the underlying data, while deleting an **external table** preserves the files.
*   Delta tables support partitioning just like parquet files.

---

## Visualizing Data in Spark Notebooks

### Explanation
Visualizing data helps identify patterns, trends, and outliers. Fabric Spark notebooks support two charting methods:
1.  **Built-in Charts:** Under any executed query cell, you can toggle the results view from "Table" to "Chart" and configure properties directly in the user interface.
2.  **Graphics Packages (Matplotlib/Seaborn):** For advanced customization, you can use Python libraries. To use these libraries, you must first convert the distributed Spark dataframe into a local Pandas dataframe using the `.toPandas()` method.

Example using Matplotlib:
```python
from matplotlib import pyplot as plt

# Convert Spark SQL query results to a Pandas DataFrame
data = spark.sql("SELECT Category, COUNT(ProductID) AS ProductCount FROM products GROUP BY Category").toPandas()

plt.clf()
fig = plt.figure(figsize=(12, 8))
plt.bar(x=data['Category'], height=data['ProductCount'], color='orange')
plt.title('Product Counts by Category')
plt.xlabel('Category')
plt.ylabel('Products')
plt.xticks(rotation=70)
plt.show()
```

### Why it matters
Built-in charts are great for quick validation, while Python code-based graphics packages (Matplotlib/Seaborn) allow you to produce highly detailed, presentation-ready visualizations.

### Where it is used
Used inside notebooks during data exploration, profiling, and report prototyping phases.

### Key points or rules
*   Python graphics libraries (like Matplotlib and Seaborn) require a **Pandas DataFrame** instead of a Spark DataFrame.
*   Use the `.toPandas()` method to convert Spark DataFrames for visualization libraries.
