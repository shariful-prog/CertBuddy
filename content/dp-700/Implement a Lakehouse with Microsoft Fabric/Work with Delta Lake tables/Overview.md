# DP-700 Study Guide: Work with Delta Lake tables

This study guide details the architecture of Delta Lake, creation of managed and external tables in Apache Spark, table optimization techniques (Optimize, V-Order, Vacuum, Partitioning), Delta APIs, and integration with Structured Streaming.

---

## 1. What is Delta Lake?

### Explanation
**Delta Lake** is an open-source storage layer that brings relational database semantics and ACID transaction guarantees to Spark-based data lake files. In Microsoft Fabric, tables in a lakehouse's Tables folder are stored in the Delta format. 
* Under the hood, a Delta table consists of compressed **Parquet data files** storing the data, accompanied by a **`_delta_log` folder** containing the transaction log in JSON format.

### Why it Matters
Standard data lakes store data in flat files (CSV, Parquet, JSON) which do not support database-like features. Delta Lake bridges this gap, allowing developers to run concurrent reads and writes, perform transactions, version data, and query data tables using SQL.

### Key Capabilities of Delta Lake
* **CRUD Support:** Supports `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations using SQL or Spark APIs.
* **ACID Transactions:** Enforces Atomicity, Consistency, Isolation, and Durability to prevent half-written files or write conflicts.
* **Schema Enforcement:** Validates incoming records against the table schema, preventing data corruption.
* **Time Travel:** Uses the transaction log to access and query historical row versions or rollback tables to previous states.
* **Streaming & Batch Unified:** Serves as a source or destination for both static batch processing and real-time streaming data.

---

## 2. Creating Delta Tables in Spark

### Explanation
In a Fabric Lakehouse, tables are registered in the metastore. Apache Spark provides programmatic control to create managed tables, external tables, or raw Delta files.

### Key Points or Rules

#### Managed Tables
* Both the table definition in the metastore and the underlying data files in the `Tables` storage folder are managed by Spark.
* *Rule:* Dropping a managed table deletes both its catalog metadata AND the underlying physical data files.
```python
# Create managed table from a DataFrame
df = spark.read.load('Files/mydata.csv', format='csv', header=True)
df.write.format("delta").saveAsTable("mytable")
```

#### External Tables
* The table definition is registered in the metastore, but the data files are saved to a custom storage path (such as the `Files` folder in the lakehouse or an external Azure Data Lake Storage URI).
* *Rule:* Dropping an external table deletes only the catalog metadata in the metastore. The physical Parquet data files remain intact in the custom location.
```python
# Save DataFrame as an external table
df.write.format("delta").saveAsTable("myexternaltable", path="Files/myexternaltable")
```

#### Creating Empty Metadata Structures
If you need to define a table schema without immediately loading data, you can use:
* **DeltaTableBuilder API:**
  ```python
  from delta.tables import *
  DeltaTable.create(spark) \
      .tableName("products") \
      .addColumn("Productid", "INT") \
      .addColumn("ProductName", "STRING") \
      .execute()
  ```
* **Spark SQL:**
  ```sql
  %%sql
  CREATE TABLE salesorders (
      Orderid INT NOT NULL,
      SalesTotal FLOAT NOT NULL
  ) USING DELTA;
  ```

#### Saving Raw Delta Files (No Metastore Registration)
To save data in Delta format without registering it in the catalog:
```python
# Save to directory
df.write.format("delta").save("Files/mydatatable")

# Overwrite mode
new_df.write.format("delta").mode("overwrite").save("Files/mydatatable")

# Append mode
new_rows_df.write.format("delta").mode("append").save("Files/mydatatable")
```
* *Fabric Automatic Discovery:* Saving data to the `Tables/` directory via this method triggers Fabric to automatically register the metadata in the workspace catalog.

---

## 3. Optimizing Delta Tables

### Explanation
Spark writes partition files across worker nodes. Over time, frequent small writes, updates, and deletes can generate a large volume of tiny files (the **small file problem**), degrading query performance. Fabric provides optimization tools to consolidate, sort, and prune files.

### Optimization Techniques

#### Optimize Write
* Consolidates files during the write phase, ensuring fewer, larger Parquet files are created. Enabled by default in Fabric.
* *Configure at Spark Session level:*
  ```python
  spark.conf.set("spark.microsoft.delta.optimizeWrite.enabled", True)
  ```

#### Optimize Command
* A maintenance feature that merges existing small Parquet files into larger, contiguous files to improve read performance.
* *How to Run:* In Lakehouse Explorer, click the ellipsis next to the table -> select **Maintenance** -> click **Run OPTIMIZE command**.

#### V-Order
* A proprietary Microsoft optimization format for Parquet files. V-Order applies advanced sorting, group distribution, encoding, and compression.
* *Why it matters:* Enables extremely fast data scanning (Verti-Scan) for Fabric compute engines (especially Power BI and SQL). Reads are 10% to 50% faster.
* *Rule:* Applied by default during writes in Fabric (incurring a ~15% write overhead). Disabling V-Order is recommended for write-intensive staging tables where data is only read once or twice.

#### Vacuum
* Removes old Parquet files that are no longer referenced by the current transaction log.
* *Why it matters:* Reclaims storage space.
* *Rule:* You cannot time-travel to a state older than your vacuum retention threshold. The default retention threshold is **7 days (168 hours)**, and Fabric prevents using a lower setting.
```sql
%%sql
VACUUM lakehouse2.products RETAIN 168 HOURS;
```

#### Table Partitioning
* Divides a table into subfolders based on a specific column's values (e.g., partitioning by `Category`), enabling the query engine to skip irrelevant files (data skipping).
* *Rule:* Use partitioning only on **large volumes of data** with low-cardinality columns. Partitioning small tables increases the file count and worsens the small file problem.
```python
df.write.format("delta").partitionBy("Category").saveAsTable("partitioned_products")
```

---

## 4. Querying and Manipulating Delta Tables in Spark

### Explanation
You can query and modify Delta tables programmatically in notebooks using Spark SQL, PySpark DataFrame APIs, or the Delta Lake API.

### Key Access Patterns
* **Using Spark SQL:**
  ```python
  spark.sql("INSERT INTO products VALUES (1, 'Widget', 'Accessories', 2.99)")
  ```
* **Using Delta Table Path API:**
  ```python
  from delta.tables import *
  # Load using path
  deltaTable = DeltaTable.forPath(spark, "Files/mytable")
  # Perform update
  deltaTable.update(
      condition = "Category == 'Accessories'",
      set = { "Price": "Price * 0.9" }
  )
  ```
* **Time Travel Queries:**
  * To inspect the transaction history of a table:
    ```sql
    %%sql
    DESCRIBE HISTORY products;
    ```
  * To retrieve data as of a specific version or timestamp:
    ```python
    # Retrieve Version 0
    df = spark.read.format("delta").option("versionAsOf", 0).load(delta_path)

    # Retrieve by Date
    df = spark.read.format("delta").option("timestampAsOf", '2022-01-01').load(delta_path)
    ```

---

## 5. Integrating Delta Tables with Structured Streaming

### Explanation
Many scenarios require near-real-time ingestion (e.g., reading IoT device feeds). Spark Structured Streaming treats streaming datasets as a boundless table, allowing real-time data to be processed using standard APIs.

### Key Streaming Concepts
* **Delta Source:** Using a Delta table as a streaming source allows near-real-time alerts/reporting as new rows are appended to the table.
  * *Rule:* By default, only `append` operations can be streamed. If rows are modified or deleted, you must configure `ignoreChanges` or `ignoreDeletes` to prevent stream execution failures.
  ```python
  stream_df = spark.readStream.format("delta") \
      .option("ignoreChanges", "true") \
      .table("orders_in")
  ```
* **Delta Sink:** Real-time data streams are written to a Delta table as a destination.
  * *Rule:* You must configure a `checkpointLocation`. Checkpointing writes progress logs to OneLake, allowing the stream to recover from failure at the exact point it stopped.
  ```python
  transformed_df.writeStream.format("delta") \
      .option("checkpointLocation", "Files/delta/checkpoint") \
      .start("Tables/orders_processed")
  ```
* **Terminating Streams:** You must call `.stop()` on the stream object to prevent ongoing compute costs.
  ```python
  deltastream.stop()
  ```
