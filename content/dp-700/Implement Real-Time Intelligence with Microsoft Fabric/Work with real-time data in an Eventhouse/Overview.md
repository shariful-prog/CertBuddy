# DP-700 Study Guide: Work with Real-Time Data in an Eventhouse

A complete revision guide for the **Work with Real-Time Data in an Eventhouse** module. A student should be able to revise the entire module from this single file.

---

## 1. Introduction — How KQL Databases Work with Real-Time Data

### Explanation

An **Eventhouse** in Microsoft Fabric is a container that houses one or more **KQL (Kusto Query Language) databases**, each optimized for storing and analyzing real-time data that arrives continuously from various sources. It is the primary storage layer for Real-Time Intelligence in Microsoft Fabric.

Once data is loaded into a KQL database (via an Eventstream or direct ingestion), you can:
- **Query the data** using KQL or T-SQL in a KQL Queryset
- **Visualize the data** using Real-Time Dashboards
- **Automate actions** based on the data using Fabric Activator

### How KQL Databases Handle Real-Time Data — Key Concepts

Understanding what makes KQL databases different from traditional relational databases is fundamental to using them effectively.

#### Time-Series Data

Real-time data has a unique characteristic: it represents **events that happened at specific moments in time**. A temperature reading at 3:15 PM will always be that reading — it represents what actually happened at that exact moment. This creates what is called **time-series data**, where the timestamp is often as important as the value itself.

#### Immutability

Real-time events are **immutable** — they cannot be changed once they have occurred. Because each event is permanently tied to when it happened, real-time data follows an **append-only pattern**: new events are continuously added, but existing records are rarely updated or deleted.

This is fundamentally different from **traditional relational databases**, where you typically update existing records and maintain relationships between different data tables.

#### Partitioning by Ingestion Time

KQL databases automatically **partition data by ingestion time** — they organize data into separate storage locations based on *when* each event arrived. This means:
- When you query for **recent data**, the database knows exactly which partition to search — it does not scan all historical data.
- **Recent data is quickly accessible**, while older data is still available for trend analysis.

Think of it like a **digital conveyor belt**: events flow in continuously, get automatically organized by when they arrive, and are immediately available for analysis while the stream keeps flowing.

### Why it Matters

Understanding this architecture explains *why* KQL databases are so fast for real-time analytics:
- Partitioning by time makes time-based queries extremely fast.
- The append-only, immutable design eliminates the overhead of update and delete operations.
- The time-series nature of the data aligns perfectly with the structure of KQL queries.

### Key Points or Rules

- An **Eventhouse** is a container for one or more **KQL databases**.
- KQL databases store **time-series data** — append-only, immutable events tied to specific timestamps.
- Data is automatically **partitioned by ingestion time** for fast time-based querying.
- KQL databases differ from relational databases: they are **append-only** (not update-focused) and **time-indexed** (not relationship-indexed).

---

## 2. Get Started with an Eventhouse

### Explanation

When you create an Eventhouse in Microsoft Fabric, a **default KQL database is automatically created** with the same name. You can use this default database or create additional KQL databases within the same Eventhouse.

Within a KQL database, you can create and manage:
- **Tables** — where your data is stored
- **Stored functions** — reusable query logic
- **Materialized views** — precomputed aggregations for fast querying
- **Data streams** — connections to live data feeds
- **Shortcuts** — pointers to external data without copying it

---

### Ingesting Data into an Eventhouse

You can load data into a KQL database from a wide variety of sources:

| Source Category | Examples |
|---|---|
| **Files and cloud storage** | Local files, Azure Storage, Amazon S3 |
| **Streaming sources** | Azure Event Hubs, Fabric Eventstream, Real-Time Hub |
| **Fabric integration** | OneLake, Data Factory Copy, Dataflows |
| **External connectors** | Apache Kafka, Confluent Cloud Kafka, Apache Flink, MQTT, Amazon Kinesis, Google Cloud Pub/Sub |

---

### Database Shortcuts

**Database shortcuts** let you create a pointer to an existing KQL database in another Eventhouse or even an Azure Data Explorer database. You can then **query that external data as if it were stored locally** — without physically copying or moving any data.

- **Why use them:** Share data across Eventhouses without duplication; query cross-Eventhouse data in a single query.

---

### OneLake Availability

You can enable **OneLake availability** for individual KQL databases or specific tables. When enabled, your Eventhouse data becomes accessible throughout the broader Fabric ecosystem — including Power BI, Data Warehouse, Lakehouse, and other Fabric services — enabling **cross-workload integration** without duplicating data.

---

### Querying Data in a KQL Database

To query your data, you use either **KQL** or **T-SQL** in a **KQL Queryset**. When you create a KQL database, an **attached KQL Queryset is automatically created** for running and saving queries.

#### Basic KQL Syntax — The Pipeline Model

KQL uses a **pipeline approach** where data flows from one operation to the next using the **pipe (`|`) character**. Think of it as a funnel:

1. You start with an **entire data table**.
2. Each operator **filters, rearranges, or summarizes** the data.
3. The result of each step flows into the next step.
4. The **order of operators matters** — each step works on the output of the previous one.

> **⚠️ Critical Rule: KQL is fully case-sensitive** — table names, column names, function names, operators, keywords, and string values must all match exactly. `TaxiTrips` ≠ `taxitrips` ≠ `TAXITRIPS`.

#### Essential KQL Query Examples

**Simplest query — return all rows from a table:**
```kql
TaxiTrips
```
Returns all columns; the number of rows shown is limited by your query tool's default settings.

---

**Sample data with `take` — retrieve a fixed number of rows:**
```kql
TaxiTrips
| take 100
```
Returns the first 100 rows from `TaxiTrips`. Useful for exploring table structure without loading the entire dataset.

---

**Filter with `where` + select columns with `project` + limit with `take`:**
```kql
TaxiTrips
| where fare_amount > 20
| project trip_id, pickup_datetime, fare_amount
| take 10
```
Breaking this down step by step:
1. `TaxiTrips` — starts with all rows in the table.
2. `| where fare_amount > 20` — keeps only trips where the fare exceeds $20.
3. `| project trip_id, pickup_datetime, fare_amount` — selects only those three columns (discards all others).
4. `| take 10` — returns only the first 10 matching rows.

---

**Aggregate with `summarize`:**
```kql
TaxiTrips
| summarize trip_count = count() by taxi_id
```
Returns a summary table with the total number of trips (`trip_count`) for each unique `taxi_id` — effectively counting how many trips each taxi has made.

---

### The KQL Queryset

The **KQL Queryset** is the workspace for running and managing your queries against a KQL database. Key features:
- **Save queries** for future reuse.
- **Organize multiple query tabs** within one interface.
- **Share queries** with team members for collaboration.
- **Supports both KQL and T-SQL** — switch between them as needed.
- **Create data visualizations** — render query results as charts, tables, and other visual formats directly within the Queryset.

---

### Copilot for Real-Time Intelligence

When enabled by an administrator, **Copilot for Real-Time Intelligence** appears in the Queryset menu bar as a side pane. You can ask questions about your data in **natural language**, and Copilot generates the corresponding **KQL query code** for you — making it accessible to users less familiar with KQL syntax.

### Key Points or Rules

- When you create an Eventhouse, a **default KQL database is automatically created** with the same name.
- A KQL database can contain: tables, stored functions, materialized views, data streams, and shortcuts.
- **Database shortcuts** = query external KQL databases as if local, without copying data.
- **OneLake availability** = makes Eventhouse data accessible to other Fabric workloads without duplication.
- A **KQL Queryset is automatically created** when you create a KQL database.
- **KQL is case-sensitive** — all identifiers and string values must match exactly.
- KQL uses a **pipeline model**: table → `| operator1` → `| operator2` → result.
- Core operators: `take` (sample rows), `where` (filter), `project` (select columns), `summarize` (aggregate).
- **Copilot** can generate KQL from natural language when enabled by an admin.

---

## 3. Use KQL Effectively — Query Optimization

### Explanation

Writing KQL queries that *work* is step one. Writing queries that *work efficiently* is step two — and in Eventhouses that hold millions or billions of rows from streaming sources, the difference matters enormously.

**The core principle of KQL optimization is:**
> **The less data your query needs to process, the faster it runs.**

Query performance in KQL databases depends directly on the **amount of data scanned and processed** at each step.

### Why Optimization Matters

| Optimized Query | Unoptimized Query |
|---|---|
| Filters to thousands of rows before aggregating | Aggregates millions of rows then filters |
| Reads only 3 needed columns from a 50-column table | Reads all 50 columns unnecessarily |
| Works well on 1M rows AND on 10M rows (scales) | Works on 1M rows but degrades badly on 10M rows |

---

### Optimization Technique 1: Filter Data Early and Effectively

Placing filter conditions (`where`) as early as possible in the query pipeline is the single most impactful optimization. Each subsequent operator then works on a much smaller dataset.

#### Time-Based Filtering (Most Effective for Eventhouses)

KQL databases index data by ingestion time. Using time-based filters leverages this index directly, eliminating most data before any other processing occurs:

```kql
TaxiTrips
| where pickup_datetime > ago(30min)  // Filter first — uses time index
| project trip_id, vendor_id, pickup_datetime, fare_amount
| summarize avg_fare = avg(fare_amount) by vendor_id
```

Here, `ago(30min)` means "30 minutes ago" — only the last 30 minutes of data is processed.

#### Order Filters by Data Elimination — Most Selective First

When you have multiple `where` conditions, order them so the filter that **eliminates the most rows comes first**:

```kql
TaxiTrips
| where pickup_datetime > ago(1d)   // Time filter first — eliminates MOST data
| where vendor_id == "VTS"          // Vendor filter — eliminates SOME data
| where fare_amount > 0             // Value filter — eliminates LEAST data
| summarize trip_count = count()
```

Think of this as a funnel: the widest reduction happens first, so each subsequent filter works on progressively smaller data.

---

### Optimization Technique 2: Reduce Columns Early with `project`

Selecting only the columns you actually need — and doing so **early in the pipeline** — reduces the amount of data that flows through all subsequent operations. This is especially important for tables with many columns (wide tables).

```kql
TaxiTrips
| project trip_id, pickup_datetime, fare_amount  // Select only needed columns early
| where pickup_datetime > ago(1d)               // Then filter
| summarize avg_fare = avg(fare_amount)
```

By projecting early, all downstream operators work with only 3 columns instead of the full table width.

---

### Optimization Technique 3: Optimize Aggregations

Aggregations (`summarize`) are computationally expensive because they must process and combine large amounts of data. Two strategies reduce their cost:

**Strategy 1 — Limit results when exploring:**
```kql
TaxiTrips
| where pickup_datetime > ago(1d)
| summarize trip_count = count() by trip_id, vendor_id
| limit 1000   // Limit results for exploratory queries
```

When you're exploring data rather than generating a production report, limiting results avoids unnecessarily processing the full output.

---

### Optimization Technique 4: Optimize Joins — Smaller Table First

In KQL, a join works by processing the **first (left) table** and then matching those rows against the **second (right) table**. Starting with the smaller table means fewer rows to process, making the join significantly more efficient:

```kql
// GOOD — small lookup table first:
VendorInfo
| join kind=inner TaxiTrips on vendor_id

// AVOID — large fact table first (much slower):
TaxiTrips
| join kind=inner VendorInfo on vendor_id
```

Starting with `VendorInfo` (a small lookup table) instead of `TaxiTrips` (a large fact table) dramatically reduces the work the join engine must do.

### Key Points or Rules

- **Core principle:** The less data processed, the faster the query runs.
- **Filter early** — put `where` operators as close to the beginning of the pipeline as possible.
- **Time-based filtering** is the most effective filter type for Eventhouses — it uses the time-based index directly.
- **Order multiple filters** from most-selective (eliminates the most rows) to least-selective.
- **Project early** — select only the columns you need, as early as possible in the pipeline.
- **For joins** — always put the **smaller table first** (left side of the join).
- **For aggregations** — use `limit` when exploring to avoid processing full output unnecessarily.
- `ago()` is a KQL time function — `ago(30min)` = 30 minutes ago, `ago(1d)` = 1 day ago.

---

## 4. Materialized Views and Stored Functions

### Explanation

Beyond basic queries and optimization, KQL databases in Eventhouses support two powerful **database objects** that make working with large, continuously updated datasets more efficient: **materialized views** and **stored functions**.

---

### Materialized Views

#### The Problem They Solve

KQL databases in Eventhouses can contain **millions or billions of rows** from streaming data sources like IoT sensors, application logs, and continuous event feeds. Running aggregation queries across these massive datasets from scratch every time is slow and resource-intensive — especially when the same aggregation (e.g., "total trips per vendor per day") is needed repeatedly for dashboards and reports.

#### What Materialized Views Do

A **materialized view** is a precomputed aggregation that:
- **Stores the aggregation result** so it does not need to be recalculated from scratch every time.
- **Automatically updates** as new data arrives.
- **Always returns current data** — even if the background update process hasn't run recently.

This provides the **speed of precomputed results** combined with the **freshness of real-time data**.

#### How Automatic Updates Work — Two Parts

A materialized view consists of two parts that work together:

| Part | What it Contains |
|---|---|
| **Materialized part** | Precomputed aggregation results from data already processed |
| **Delta** | New data that has arrived since the last background update |

When you **query** a materialized view:
- The system **combines both parts automatically** at query time — you always see up-to-date results.
- You don't need to wait for the background update process.

A **background process** periodically moves data from the delta into the materialized part, keeping precomputed results current over time.

#### Creating a Materialized View

A materialized view encapsulates a `summarize` statement using the `.create materialized-view` command:

```kql
.create materialized-view TripsByVendor on table TaxiTrips
{
    TaxiTrips
    | summarize trips = count(), avg_fare = avg(fare_amount), total_revenue = sum(fare_amount)
      by vendor_id, pickup_date = format_datetime(pickup_datetime, "yyyy-MM-dd")
}
```

Breaking this down:
- `.create materialized-view TripsByVendor` — creates a materialized view named `TripsByVendor`.
- `on table TaxiTrips` — the source table it monitors for new data.
- The `summarize` inside calculates three aggregations (`trips`, `avg_fare`, `total_revenue`) grouped by `vendor_id` and a formatted date string.
- `format_datetime(pickup_datetime, "yyyy-MM-dd")` — converts the datetime to a date-only string for daily grouping.

#### Querying a Materialized View

Once created, a materialized view is **queried exactly like a regular table**:

```kql
TripsByVendor
| where pickup_date >= ago(7d)
| project pickup_date, vendor_id, trips, avg_fare, total_revenue
| sort by pickup_date desc, total_revenue desc
```

No special syntax is needed — treat it just like any other KQL table name.

---

### Stored Functions

#### What They Are

A **stored function** encapsulates a KQL query as a **named, reusable function** that can accept parameters. Instead of writing the same filtering or transformation logic repeatedly across many different queries, you define it once and call it by name.

#### Why They Matter in Eventhouses

In environments with streaming data and multiple people writing queries:
- **Avoid repetition** — define common logic once, reuse it everywhere.
- **Ensure consistency** — when different team members need to apply the same business logic (e.g., "trips with at least N passengers"), they all use the same function and get the same results.
- **Simplify complex queries** — callers use a simple function name instead of duplicating complex logic.

#### Creating a Stored Function

```kql
.create-or-alter function trips_by_min_passenger_count(num_passengers:long)
{
    TaxiTrips
    | where passenger_count >= num_passengers
    | project trip_id, pickup_datetime
}
```

Breaking this down:
- `.create-or-alter function` — creates the function if it doesn't exist, or updates it if it does.
- `trips_by_min_passenger_count` — the function name.
- `(num_passengers:long)` — defines one parameter named `num_passengers` of type `long` (integer).
- The function body filters `TaxiTrips` to only rows where `passenger_count` is at least `num_passengers`, then projects two columns.

#### Calling a Stored Function

You call a stored function **just like referencing a table**, passing in your argument:

```kql
trips_by_min_passenger_count(3)
| take 10
```

This calls the function with `num_passengers = 3`, returning trips with at least 3 passengers, then limits the output to 10 rows. You can pipe further operators after a function call exactly as you would with a table.

### Key Points or Rules

**Materialized Views:**
- Solve the problem of **slow, repeated aggregations** on massive datasets.
- Contain two parts: **materialized part** (precomputed) + **delta** (recent new data).
- Always return **current data** — both parts are combined automatically at query time.
- Created using `.create materialized-view <name> on table <source>` with a `summarize` inside.
- Queried **exactly like regular tables** — no special syntax.
- A **background process** periodically moves delta data into the materialized part.

**Stored Functions:**
- Encapsulate reusable KQL query logic with optional **parameters**.
- Created using `.create-or-alter function <name>(<param>:<type>)`.
- Called **like a table name**, with arguments in parentheses: `function_name(arg)`.
- Can be **piped** with further operators: `function_name(3) | take 10`.
- Ensure **consistency** — the same logic is applied by everyone who calls the function.

---

## Summary — Eventhouse Quick Reference

### Architecture Overview

```
[Eventhouse]
    └── [KQL Database 1]
          ├── Tables (data storage)
          ├── KQL Queryset (query workspace)
          ├── Materialized Views (precomputed aggregations)
          ├── Stored Functions (reusable query logic)
          ├── Database Shortcuts (pointer to external KQL databases)
          └── OneLake Availability (share data across Fabric)
```

### KQL Operators Reference

| Operator | Purpose | Example |
|---|---|---|
| `take N` | Return N sample rows | `\| take 100` |
| `where` | Filter rows by condition | `\| where fare_amount > 20` |
| `project` | Select specific columns | `\| project trip_id, fare_amount` |
| `summarize` | Aggregate data | `\| summarize count() by vendor_id` |
| `sort by` | Sort results | `\| sort by fare_amount desc` |
| `limit N` | Limit output rows | `\| limit 1000` |
| `join` | Combine two tables | `\| join kind=inner OtherTable on key` |

### Optimization Rules Summary

| Rule | Why |
|---|---|
| **Filter early** | Reduces data flowing through all subsequent operators |
| **Time filter first** | Uses the time-based index — most effective filter |
| **Most-selective filter first** | Eliminates the most rows upfront |
| **Project early** | Reduces column width for all downstream operations |
| **Smaller table first in joins** | Fewer rows to match against the second table |
| **Limit aggregation results** when exploring | Avoids processing full output unnecessarily |

### Full Summary Table

| Concept | What it Is | Key Detail |
|---|---|---|
| **Eventhouse** | Container for KQL databases | Houses one or more KQL databases |
| **KQL Database** | Real-time analytics storage | Auto-partitioned by ingestion time |
| **Time-series data** | Events tied to timestamps | Append-only, immutable |
| **Partitioning** | Data organized by ingestion time | Makes time-based queries fast |
| **KQL Queryset** | Query workspace | Supports KQL + T-SQL; auto-created with database |
| **Case-sensitivity** | KQL is fully case-sensitive | All identifiers must match exactly |
| **Database shortcuts** | Pointer to external KQL database | Query without copying data |
| **OneLake availability** | Share data across Fabric workloads | No data duplication needed |
| **Copilot for RTI** | AI-assisted KQL generation | Natural language → KQL code |
| **`ago()`** | KQL time function | `ago(30min)` = 30 minutes ago |
| **Materialized view** | Precomputed auto-updating aggregation | Materialized part + Delta; queried like a table |
| **Stored function** | Reusable parameterized query | Called like a table with arguments |
