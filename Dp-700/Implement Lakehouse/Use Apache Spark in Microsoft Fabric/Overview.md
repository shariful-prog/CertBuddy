# STUDY GUIDE: Use Apache Spark in Microsoft Fabric

> **Module for DP-700 (Microsoft Fabric Data Engineering) Exam Preparation**

---



## 1. Introduction to Apache Spark


### 1.1 What is Apache Spark?


Apache Spark is an open-source distributed data processing framework for large-scale data analytics. It works by coordinating work across multiple processing nodes in a cluster.
- "Divide and Conquer": It processes large volumes of data quickly by distributing tasks across multiple computers and collating the results.
- Multi-language Support: Can run code written in Java, Scala, Spark R, Spark SQL, and PySpark (Python). Most data engineering workloads use PySpark and Spark SQL.

### 1.2 Spark Architecture


A Spark pool consists of compute "nodes" that distribute tasks:
- Head Node: Coordinates distributed processes through a "driver" program.
- Worker Nodes: "Executor" processes on these nodes perform the actual data processing tasks.
- Storage: The distributed compute architecture processes data in compatible data stores, like OneLake lakehouses.


## 2. Managing Spark in Microsoft Fabric


### 2.1 Spark Pools


A Spark pool in Fabric is a cluster of compute nodes.
- Starter Pool: Fabric provides a starter pool in each workspace, enabling Spark jobs to start quickly with minimal configuration.
- Custom Pools: You can create custom pools with specific node configurations. (Note: Fabric administrators can disable pool customization at the capacity level).

  **Key Pool Configuration Settings:**
- Node Family: Type of VM. "Memory optimized" nodes provide optimal performance in most cases.
- Autoscale: Whether to automatically provision nodes as needed (setting initial and max limits).
- Dynamic allocation: Whether to dynamically allocate executor processes on worker nodes based on data volumes.

### 2.2 Runtimes and Environments


- Runtime: Determines the version of Apache Spark, Delta Lake, Python, and other core software components installed.
- Environments: Custom configurations that define a specific runtime version, built-in libraries, custom/public libraries, Spark properties, and the default Spark pool to use. Multiple environments can be created for different workflows.

### 2.3 Additional Configuration Options


- **A)** **Native Execution Engine**:
  - A vectorized processing engine that runs Spark operations directly on lakehouse infrastructure.
  - Significantly improves query performance when working with large datasets in Parquet or Delta formats.
  - Can be enabled at the environment level (`spark.native.enabled: true`) or within individual notebook cells via the `%%configure` magic.

- **B)** **High Concurrency Mode**:
  - Shares Spark sessions across multiple concurrent users or processes.
  - Ensures isolation of code while optimizing resource usage (e.g., multiple users using the same session in different notebooks).

- **C)** **Automatic MLFlow Logging**:
  - Enabled by default in Fabric. It implicitly logs machine learning training and model deployment activity without explicit code.

- **D)** **Capacity-Level Admin**:
  - Administrators can manage, restrict, or override Spark settings at the Fabric capacity level for all workspaces.


## 3. Running Spark Code


You can run Spark code interactively or as an automated process.

### 3.1 Notebooks

- Used for interactive exploration and analysis.
- Consist of "cells" containing markdown or executable code.
- You can combine multiple languages by using "magics" (e.g., `%%pyspark`, `%%spark` for Scala, `%%sql`).

### 3.2 Spark Job Definition

- Used to ingest and transform data as part of an automated process.
- Executes a script on-demand or on a schedule. You can specify reference files and the target lakehouse.


## 4. Working with Data in Spark Dataframes


While Spark uses Resilient Distributed Datasets (RDDs) natively, the most common data structure for structured data is the dataframe (part of the Spark SQL library).

### 4.1 Loading Data


You load data into a dataframe using the `spark.read.load()` method.

- Inferring Schema: You can let Spark infer the schema if headers are present:
```python
`df = spark.read.load('path.csv', format='csv', header=True)`
```

- Explicit Schema: Defining an explicit schema using `StructType` and `StructField` is useful when column names are missing, and it also IMPROVES PERFORMANCE.
```python
`df = spark.read.load('path.csv', format='csv', schema=productSchema, header=False)`
```

### 4.2 Transforming Dataframes


**Dataframe methods can be chained together. Common methods:**
- `select()`: Retrieve specific columns.
- `where()`: Filter rows based on conditions.
- `groupBy()` and `count()`: Group and aggregate data.

### 4.3 Saving and Partitioning Dataframes


- Saving: Use `df.write.mode("overwrite").parquet('path')`.
    (Note: Parquet is highly efficient and the preferred format for analytical systems).
- Partitioning: Maximizes performance across worker nodes by eliminating unnecessary disk IO during filtered queries.
    Use `.partitionBy("Category")` when writing. This creates a folder hierarchy (e.g., `Category=Bikes`).
- Loading Partitions: You can read directly from a partitioned folder (`spark.read.parquet('path/Category=Bikes')`). Note that the partitioned column (Category) is omitted from the resulting dataframe.


## 5. Working with Spark Sql


Spark SQL allows you to use SQL expressions to query and manipulate data.

### 5.1 The Spark Catalog


The Spark catalog is a metastore for relational data objects (tables and views).

- Temporary Views: Exist only for the current session.
```python
`df.createOrReplaceTempView("products_view")`
```

- Managed Tables: Persistent tables where Spark manages both metadata and data. Data is stored in the `Tables` section of the lakehouse. Deleting the table deletes the data.
```python
`df.write.format("delta").saveAsTable("products")`
(Delta format provides transactions, versioning, and streaming support).
```

- External Tables: Persistent metadata in the catalog, but the underlying data resides in an external location (like a folder in the `Files` section). Deleting the table does NOT delete the data.
```python
Created using `spark.catalog.createExternalTable()`.
```

### 5.2 Querying with SQL


- In PySpark: `df = spark.sql("SELECT * FROM products")`
- In Notebooks: Use the `%%sql` magic to write pure SQL directly in a cell. Results are automatically displayed as a table.


## 6. Visualizing Data in Notebooks


### 6.1 Built-in Charts

- By default, dataframe output is rendered as a table. You can click the chart icon to quickly summarize data visually using built-in controls without writing extra code.

### 6.2 Python Graphics Libraries

- For complex or customized visualizations, you can use Python libraries like Matplotlib or Seaborn.
- Matplotlib requires data to be in a Pandas dataframe. You must use `.toPandas()` to convert a Spark dataframe before plotting.
```sql
`data = spark.sql("SELECT * FROM table").toPandas()`
```

