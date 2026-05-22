# STUDY GUIDE: Work with Delta Lake tables in Microsoft Fabric

> **Module for DP-700 (Microsoft Fabric Data Engineering) Exam Preparation**

---


This guide summarizes all key architectural concepts, table creation techniques,
maintenance operations, programmatic access patterns, and streaming designs for
Delta Lake tables in Microsoft Fabric.

- -------------------------------------------------------------------------------

## 1. Understanding Delta Lake in Microsoft Fabric

Delta Lake is an open-source storage layer that brings relational database
semantics (ACID transactions, schema enforcement, time travel) to Spark-based
data lakes.

- Under the Hood:
- Tables in Fabric lakehouses are Delta tables (indicated by a triangle Δ icon).
- Storage consists of:
  1. Parquet files containing the actual data.
  2. A "_delta_log" folder containing transaction details in JSON format.
- Fabric's SQL analytics endpoint and Direct Lake mode in Power BI can query
    these underlying Parquet files directly.

- Key Benefits:
- CRUD Support: Enables INSERT, UPDATE, and DELETE operations.
- ACID Transactions: Ensures Atomicity, Consistency, Isolation, and Durability
    using a transaction log and serializable isolation.
- Data Versioning & Time Travel: Maintains historical versions of files,
    allowing querying data as it existed at a past version or timestamp.
- Batch & Streaming: Supports Delta tables as both streaming sources and sinks
    using the Spark Structured Streaming API.
- Interoperability: Underlying data is standard open-source Parquet format.

- -------------------------------------------------------------------------------

## 2. Creating Delta Tables

Fabric allows creating managed and external tables, as well as saving raw delta
files without metastore definitions.

- Creating a Table from a DataFrame (PySpark):
- Saves the DataFrame as a managed table:
```python
df = spark.read.load('Files/mydata.csv', format='csv', header=True)
df.write.format("delta").saveAsTable("mytable")
```

- Underlying Parquet and log files are saved to the "Tables" storage area.

- Managed vs. External Tables:
- Managed Tables: Spark runtime manages both the metadata definition in the
    lakehouse metastore and the physical Parquet files in the "Tables" location.
  - > Deleting (dropping) the table deletes BOTH metadata and physical data.
- External Tables: The table definition in the metastore is mapped to an
    alternative file path (e.g., in "Files" or external cloud storage URL):
```python
df.write.format("delta").saveAsTable("myexternaltable", path="Files/myexternaltable")
```

  - > Deleting an external table drops only the metastore schema definition.
    The underlying Parquet and log files are NOT deleted.

- Defining Table Metadata (Without Ingesting First):
1. DeltaTableBuilder API:
```python
 from delta.tables import *
 DeltaTable.create(spark) \
   .tableName("products") \
   .addColumn("Productid", "INT") \
   .addColumn("ProductName", "STRING") \
   .addColumn("Category", "STRING") \
   .addColumn("Price", "FLOAT") \
   .execute()
```

2. Spark SQL (Managed):
```sql
 %%sql
 CREATE TABLE salesorders (
   Orderid INT NOT NULL,
   OrderDate TIMESTAMP NOT NULL,
   CustomerName STRING,
   SalesTotal FLOAT NOT NULL
 ) USING DELTA
```

3. Spark SQL (External):
```sql
 %%sql
 CREATE TABLE MyExternalTable
 USING DELTA
 LOCATION 'Files/mydata'
```

  - - Note: Schema is auto-inferred from existing delta files in 'Files/mydata'

- Saving Delta Files without Metastore Definitions:
- Saves data as Parquet files with transaction logs without registering it in
    **the lakehouse metastore:**
```python
df.write.format("delta").save("Files/mydatatable")
```

- Modes:
  - Overwrite: df.write.format("delta").mode("overwrite").save(path)
  - Append: df.write.format("delta").mode("append").save(path)
- Automatic Table Discovery: If you save delta files to the "Tables" directory,
    Fabric automatically creates metadata in the lakehouse metastore.

- -------------------------------------------------------------------------------

## 3. Optimizing Delta Tables

Spark is a distributed compute framework. Since Parquet files are immutable,
updates or inserts write new files. Over time, this leads to the "small file
problem" where reading data involves scanning millions of tiny files, degrading
query performance.

- OptimizeWrite:
- Reduces the number of files written dynamically during write operations by
    coalescing smaller partitions into fewer larger files.
- Enabled by default in Microsoft Fabric.
- Session control:
```python
spark.conf.set("spark.microsoft.delta.optimizeWrite.enabled", True/False)
```

- OPTIMIZE Command:
- Consolidates existing small Parquet files in a table into larger ones
    (typically 1 GB) to improve query response times.
- Can be run from Lakehouse Explorer (Table -> ... -> Maintenance -> Run OPTIMIZE)
    **or via SQL inside a Notebook:**
```sql
%%sql
OPTIMIZE products;
```

- V-Order Optimization:
- A Microsoft proprietary Parquet-level optimization designed for the Fabric
    compute engine (Direct Lake in Power BI, SQL, Spark).
- V-Order works by applying special sorting, row group distribution,
    dictionary encoding, and compression.
- 100% open-source Parquet compliant (can be read by any Parquet engine).
- Applied automatically on writes by default in Fabric. Incurs ~15% write
    overhead but provides lightning-fast reads (Verti-Scan tech leverages it
    for SQL and Power BI Direct Lake; Spark gets 10% to 50% read performance).
- Can be turned off for write-intensive staging tables where reads are rare.
- Run via Table Maintenance OPTIMIZE command or SQL.

- VACUUM Command:
- Removes old Parquet files that are no longer referenced in the active active
    Delta transaction log and are older than a specific retention period.
- Does NOT remove Delta transaction log JSON files.
- Once run, "time travel" to versions older than the retention threshold is no
    longer possible.
- The default and minimum retention period is 7 days (168 hours). The system
    prevents setting a lower period unless security overrides are applied.
- SQL Notebook execution:
```sql
%%sql
VACUUM lakehouse2.products RETAIN 168 HOURS;
```

- View history using: DESCRIBE HISTORY lakehouse2.products;

- Partitioning Delta Tables:
- Organizes data files into physical subfolders matching column values
    (e.g., "/year=2024/").
- Boosts read performance through "data skipping" (ignoring files in
    partitions that do not match the query filter).
- Rules of Thumb:
  - ONLY partition tables with very large volumes of data.
  - Partitioning columns should have low cardinality (few distinct values).
  - NEVER partition small datasets, as it worsens the "small file problem".
- Code Examples:
  - PySpark: df.write.format("delta").partitionBy("Category").saveAsTable("partitioned_products", path="abfs_path/partitioned_products")
  - SQL: CREATE TABLE partitioned_products (...) PARTITIONED BY (Category);

- -------------------------------------------------------------------------------

## 4. Working with Delta Tables in Spark

- Spark SQL Operations:
- Execute DML statements on registered tables.
- Programmatic: spark.sql("INSERT INTO products VALUES (1, 'Widget', 'Accs', 2.99)")
- Notebook Magic:
```sql
%%sql
UPDATE products SET ListPrice = 2.49 WHERE ProductId = 1;
```

- Delta Lake API:
- Ideal when interacting directly with Delta files in storage rather than
    registered metastore tables.
- Code Example:
```python
from delta.tables import *
deltaTable = DeltaTable.forPath(spark, "Files/mytable")
deltaTable.update(
  condition = "Category == 'Accessories'",
  set = { "Price": "Price * 0.9" }
)
```

- Time Travel & Versioning:
- Retrieve the transaction history of a table:
```sql
%%sql
DESCRIBE HISTORY products
```

  - - Or for files: DESCRIBE HISTORY 'Files/mytable'
- Load a specific older version using "versionAsOf":
```python
df = spark.read.format("delta").option("versionAsOf", 0).load("Files/mytable")
```

- Load a historical point-in-time using "timestampAsOf":
```python
df = spark.read.format("delta").option("timestampAsOf", '2022-01-01').load("Files/mytable")
```

- -------------------------------------------------------------------------------

## 5. Use Delta Tables with Streaming Data

Delta Lake integrates seamlessly with Spark Structured Streaming, acting as
either a streaming source (input stream) or a streaming sink (output stream).

- Delta Table as a Streaming Source:
- Constantly monitors the Delta table's Parquet folder and log directory to
    read new records in near real-time.
- Read stream:
```python
stream_df = spark.readStream.format("delta").option("ignoreChanges", "true").table("orders_in")
```

- Critical constraint: By default, Delta streaming sources only support
    append operations. If rows are updated or deleted, Spark throws an error.
- Mitigation: Use ".option("ignoreChanges", "true")" or "ignoreDeletes" to
    allow reading updates/deletes without failing the streaming job.
- Check status: stream_df.isStreaming returns True.

- Delta Table as a Streaming Sink:
- Continuous streaming dataframes can be processed and written directly to a
    Delta table destination.
- Write stream:
```python
deltastream = transformed_df.writeStream.format("delta") \
  .option("checkpointLocation", "Files/delta/checkpoint") \
  .start("Tables/orders_processed")
```

- Checkpointing: The "checkpointLocation" is mandatory. It logs metadata and
    state files so that if a streaming job crashes, it can resume processing
```python
from the exact checkpointed state without missing or duplicating records.
```

- Stopping the Stream: Streaming jobs run continuously and consume fabric
    **capacity. Always stop the active stream when finished:**

## Deltastream.stop()

