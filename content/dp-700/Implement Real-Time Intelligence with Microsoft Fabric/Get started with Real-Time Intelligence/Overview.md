# DP-700 Study Guide: Get Started with Real-Time Intelligence in Microsoft Fabric

A complete revision guide for the **Get Started with Real-Time Intelligence** module. A student should be able to revise the entire module from this single file.

---

## 1. Introduction — Why Real-Time Intelligence Matters

### Explanation

Traditional data analytics works in batches — data is collected, stored, and processed on a schedule (e.g., nightly reports). By the time insights are available, the conditions that generated the data may have already changed. This lag is acceptable for historical analysis, but it fails in scenarios where decisions must be made *right now*.

**Real-Time Intelligence in Microsoft Fabric** addresses this by enabling the processing, analysis, and action on data as it is generated — typically within seconds to minutes of an event occurring.

### Real-World Scenario

Consider a **delivery company** that needs to monitor packages, vehicles, and customer routes across a large distribution network. If their reports only refresh overnight:
- A vehicle breakdown might go unnoticed for hours, leaving hundreds of packages delayed.
- Customer notification systems won't send updates until the next day.
- Route optimization decisions are made on yesterday's data, not today's reality.

With Real-Time Intelligence, the company can stream GPS data from trucks, package scanning events, and customer feedback in real time — spotting delays the moment they happen, estimating delivery windows based on *current* conditions, and triggering automated customer notifications without human intervention.

### Key Points or Rules

- Real-Time Intelligence deals with **streaming data** — data that flows continuously from sources as events happen.
- It is also called **near real-time analytics** because there is always some small amount of processing and network latency involved; true zero-latency is not achievable.
- The goal is to move from **historical snapshots** to **current-state awareness**.

---

## 2. What is Real-Time Data Analytics?

### Explanation

**Real-time analytics** is the practice of processing, analyzing, and acting on data as it is generated — typically within seconds to minutes of the events occurring. It is fundamentally different from traditional analytics, which works with static snapshots of data stored in databases.

### Key Concepts: Events and Streams

To understand real-time analytics, you need to understand its two foundational concepts:

#### Events

An **event** is a record of something that happened in a system at a specific point in time. Events capture moments when something occurs, changes, or is completed. Examples include:
- A customer clicking a button on a website
- A stock price changing
- A customer completing a purchase
- A patient's heart rate reading changing
- A temperature sensor recording a new value

Think of events as **digital log entries** that document activity across your systems.

#### Streams

A **stream** is a continuous, ordered sequence of events — typically ordered by the time each event occurred. Events flow through streams continuously as they happen.

For example, a stream from an equipment temperature sensor contains an ongoing series of temperature readings taken at different points in time. This continuous flow allows you to:
- **Detect patterns** over time
- **Identify opportunities or risks** as they emerge
- **Take action immediately** after something happens

Streams are the **delivery mechanism** that carries events from where they happen (the source) to where they need to be processed, analyzed, or acted upon (the destination).

### Why it Matters

The combination of events and streams is what makes real-time analytics possible. Without understanding this pipeline — things happening → captured as events → delivered via streams → processed and acted upon — you cannot design or operate a real-time analytics solution.

### Components of a Real-Time Analytics Solution

A complete real-time analytics solution requires five integrated capabilities:

| Component | What it Does |
|---|---|
| **Real-time data ingestion** | Collects data from multiple sources simultaneously as information is generated (databases, sensors, APIs, logs) |
| **Stream processing** | Transforms and analyzes data *while it flows* — filtering, aggregating, joining, and detecting patterns with minimal latency |
| **Low-latency storage** | Specialized databases designed to handle high-velocity data writes and provide fast query responses |
| **Interactive dashboards** | Visualizations that update automatically as new data arrives, showing current state and trends |
| **Automated decision making** | Event-driven rules and triggers that initiate actions, send alerts, or start workflows based on real-time conditions |

### What Real-Time Analytics Enables

- **Respond immediately** to opportunities or problems as they emerge
- **Optimize operations** by adjusting resources based on current conditions
- **Enhance customer experiences** through personalized, contextual interactions
- **Prevent issues** by detecting anomalies before they become critical problems

---

## 3. Real-Time Intelligence in Microsoft Fabric — Components Overview

### Explanation

Microsoft Fabric's **Real-Time Intelligence** is an integrated set of components that work together to handle streaming data through its entire lifecycle — from capture, through transformation and storage, to visualization and automated response.

### Why it Matters

No single tool can handle all stages of a real-time analytics pipeline alone. Microsoft Fabric addresses this by providing purpose-built components that each handle a specific stage, and that are designed to work seamlessly together.

### The Six Real-Time Intelligence Components

#### 1. Eventstreams — Ingest and Process Data in Motion

**Eventstreams** are the entry point for streaming data into Fabric. They capture streaming data from various sources and apply real-time transformations as data flows through the system.

Think of an Eventstream like a **water pipe system**:
- The **source** is the faucet — where data originates.
- **Transformations** are filters along the pipe — shaping and cleaning the data mid-flow.
- The **destination** is the sink or bucket — where the processed data lands for storage or further use.

Eventstreams can filter, enrich, and transform data, and route it to different destinations.

---

#### 2. Eventhouse (KQL Databases) — Store Real-Time Data

Real-Time Intelligence stores data in **KQL (Kusto Query Language) databases** housed inside **Eventhouses**. These databases are specifically designed for:
- **Time-series data** — data that is indexed and partitioned by time for optimal query performance
- **High-velocity ingestion** — handling streams of fast-arriving data
- **Fast query responses** — enabling near-instant analytical queries

The Eventhouse's storage also integrates with **OneLake**, making the data available to other Fabric tools (like Power BI or notebooks) without duplication.

---

#### 3. KQL Queryset — Analyze Data

A **KQL Queryset** is a workspace for running and managing queries against KQL databases. It allows you to:
- Save queries for future use
- Organize multiple query tabs in one place
- Share queries with colleagues for collaboration

Importantly, the KQL Queryset also supports **T-SQL queries**, so data professionals familiar with SQL syntax can query the same data without learning KQL from scratch.

---

#### 4. Real-Time Dashboards — Visualize Insights

**Real-Time Dashboards** connect directly to KQL databases and **refresh automatically** as new data arrives. Unlike static Power BI reports, they are designed for live monitoring of current conditions. They also allow interactive exploration — users can drill into data, apply filters, and change visualizations.

---

#### 5. Activator — Act on Data Automatically

**Activator** is the automation engine of Real-Time Intelligence. It continuously monitors streaming data against user-defined rules and thresholds. When a condition is met, Activator can:
- Send **notifications** (e.g., email or Teams messages)
- Trigger **workflows** in Power Automate
- Execute **Fabric data pipelines or notebooks**

This creates event-driven automation that responds to real-time conditions without human intervention.

---

#### 6. Real-Time Hub — Discover Streaming Data

The **Real-Time Hub** is a central catalog for all data-in-motion that you have access to within Fabric. It is your single location to **discover, connect, and manage** streaming data sources.

To access it, select the **Real-Time icon** in the main Fabric menu bar.

The Real-Time Hub organizes streaming data into four main categories:

| Category | What it Contains |
|---|---|
| **Data sources** | Browse and connect to available streaming sources (Microsoft sources, CDC feeds, external cloud sources) |
| **Azure sources** | Discover and configure Azure streaming sources like Azure IoT Hub, Azure Service Bus, Azure Data Explorer |
| **Fabric events** | Subscribe to system-generated events in Fabric — job status changes, OneLake file/folder events, workspace item changes |
| **Azure events** | Subscribe to system events from Azure services — e.g., actions on files or folders in Azure Blob Storage |

Once a connection to a data source or event source is configured in the Real-Time Hub, it becomes the foundation for building dashboards, setting up alerts, triggering automated workflows, and analyzing trends.

### Real-Time Intelligence Use Cases

| Industry / Domain | Example Use Case |
|---|---|
| **Logistics** | Monitor vehicle locations and alert customers when packages are delayed |
| **Manufacturing** | Track machine temperature readings to prevent costly equipment breakdowns |
| **Finance** | Analyze purchase patterns and block suspicious transactions in real time |
| **Technology** | Monitor website page load times to improve user experience |
| **IT Operations** | Track application errors to maintain service reliability |

---

## 4. Ingest and Transform Real-Time Data

### Explanation

Real-Time Intelligence provides **two primary approaches** for getting streaming data into the platform. Understanding both is essential for choosing the right ingestion pattern for a given scenario.

---

### Approach 1: Eventstreams

An **Eventstream** has three stages — Sources → Transformations → Destinations.

#### Data Sources for Eventstreams

Once you create an Eventstream in Fabric, you can connect it to a wide range of sources:

| Source Category | Examples |
|---|---|
| **Microsoft sources** | Azure Event Hubs, Azure IoT Hub, Azure Service Bus, Change Data Capture (CDC) from databases |
| **Azure events** | Azure Blob Storage events |
| **Fabric events** | Fabric workspace item changes, OneLake data changes, Fabric job events |
| **External sources** | Apache Kafka, Google Cloud Pub/Sub, MQTT (preview) |

#### Event Transformations in Eventstreams

Raw data from a source is rarely in the exact format needed for analysis. Transformations shape and prepare the data **while it flows through the Eventstream** — before it reaches its destination. This is called **in-flight transformation**.

Available transformation types include:
- **SQL code** — write custom transformation logic using SQL
- **Filter** — include or exclude records based on conditions
- **Manage fields** — add, remove, or rename columns
- **Aggregate** — compute summaries (sum, count, average, etc.)
- **Group by** — group records by one or more fields
- **Expand** — unpack nested or array data
- **Join** — combine data from multiple streams

#### Data Destinations for Eventstreams

Streaming data is temporary by nature — it must be captured and stored immediately or it is lost. The destination is where processed stream data becomes persistently available. Supported destinations include:

- **KQL database in an Eventhouse** — for real-time analytics queries
- **Lakehouse** — for longer-term storage and batch analytics
- **Derived stream** — to chain into another Eventstream for further processing
- **Fabric Activator** — to trigger automated actions
- **Custom endpoint** — for integration with external systems

---

### Approach 2: Direct Ingestion into a KQL Database in an Eventhouse

Data can also be loaded **directly into a KQL database** without going through an Eventstream. This is useful when the source is a file, a cloud storage account, or a database — rather than a live stream.

Supported direct ingestion sources include: local files, Azure Storage, Amazon S3, Azure Event Hubs, OneLake, and more. Ingestion can be configured using **connectors** or via the **Get Data** option directly in the KQL database.

#### Transformation via Update Policies (Post-Ingestion)

When using direct ingestion, data lands in the KQL database *first*, and is then transformed using **update policies**. This is different from Eventstream transformations, which occur *during* the flow (before storage).

- An **update policy** is an automation mechanism in KQL that is **triggered when new data is written to a table**.
- It runs a query to transform the newly ingested data and saves the result to a separate destination table.
- This allows raw data to be kept in one table, while a clean, transformed version is maintained in another — automatically.

### Key Points or Rules

- **Eventstreams** = transform data **in motion** (before it lands in storage) — suitable for live streaming sources.
- **Direct ingestion + Update Policies** = transform data **after landing** in the KQL database — suitable for file or batch-like sources.
- Both approaches route data into a **KQL database in an Eventhouse** as the primary analytics store.

---

## 5. Store and Query Real-Time Data

### Explanation

Once data is in a **KQL database inside an Eventhouse**, you use the **Kusto Query Language (KQL)** — or T-SQL — to query and analyze it. The Eventhouse is purpose-built for time-series and streaming data, optimized for both fast writes and fast reads.

### What You Can Create Inside an Eventhouse

| Object | What it Does |
|---|---|
| **KQL databases** | Real-time optimized data stores containing tables, stored functions, materialized views, shortcuts, and data streams |
| **KQL querysets** | Collections of KQL queries for working with KQL database tables; supports both KQL and T-SQL |

### The Kusto Query Language (KQL)

**KQL** is specifically designed for analyzing large volumes of structured, semi-structured, and unstructured data with exceptional performance. It is the same language used in **Azure Data Explorer**, **Azure Monitor Log Analytics**, and **Microsoft Sentinel** — making it a widely transferable skill.

KQL databases index incoming data by **ingestion time** and partition it for **optimal query performance**, making them ideal for time-based analysis.

#### KQL Syntax Basics

A KQL query starts with a **table name**, followed by one or more **pipe (`|`) operators** that filter, transform, aggregate, or join data.

**Simple example** — retrieve any 10 rows from the `stock` table:
```kql
stock
| take 10
```

**More complex example** — find the average stock price per symbol over the last 5 minutes:
```kql
stock
| where ["time"] > ago(5m)
| summarize avgPrice = avg(todouble(bidPrice)) by symbol
| project symbol, avgPrice
```

**Breaking down the operators:**
- `where` — filters rows based on a condition (here: only records from the last 5 minutes)
- `summarize` — aggregates data (here: calculates the average `bidPrice` grouped by `symbol`)
- `project` — selects which columns to include in the output
- `ago(5m)` — a KQL time function meaning "5 minutes ago"

### Automating Data Processing with Management Commands

Beyond interactive queries, KQL databases support powerful automation mechanisms:

| Mechanism | What it Does |
|---|---|
| **Update policies** | Automatically transform incoming data and save it to different tables as it arrives |
| **Materialized views** | Precalculate and store summary results for faster repeated queries |
| **Stored functions** | Save frequently used query logic that can be reused across multiple queries |

### Other Query Options

#### Using T-SQL

KQL databases in Eventhouses also support a **subset of T-SQL expressions**, allowing data professionals already comfortable with SQL to query real-time data without learning KQL first.

```sql
SELECT TOP 10 * FROM stock;
```

#### Using Copilot for KQL

Microsoft Fabric includes **Copilot for Real-Time Intelligence**, which uses AI to help you write KQL queries. You describe what you're looking for in natural language, and Copilot generates the corresponding KQL query code — lowering the barrier to getting insights from Eventhouse data.

---

## 6. Visualize Real-Time Data

### Explanation

Querying data in a KQL Queryset is powerful but not always the best way to *monitor* data. For ongoing operational visibility, **Real-Time Dashboards** are the visualization layer of Real-Time Intelligence.

### Real-Time Dashboards

A **Real-Time Dashboard** is a collection of **tiles**, each displaying a different visualization based on a KQL query that extracts real-time data from tables in an Eventhouse.

Key characteristics:
- Tiles can be customized to show charts, maps, tables, and other visual types.
- By default, a tile shows query results as a **table**; you edit it to apply a chart or other visualization.
- When published, tiles allow **interactive exploration** — viewers can drill into data, filter, aggregate, and change visualization types using a visual interface.
- Dashboards **refresh automatically** as new data arrives, keeping the visualizations current.

#### How to Create a Real-Time Dashboard

You have two options:
1. Create a dashboard directly in a **Fabric workspace** and then configure its data source.
2. Create one directly from a **KQL Queryset** inside an Eventhouse — a faster path when you've already written your queries.

### Visualizing with Power BI

In addition to Real-Time Dashboards, you can also create **Power BI reports** from KQL database data. This is useful when you need richer report formatting, enterprise distribution, or integration with other Power BI content — though Power BI reports are generally less suited to true real-time monitoring than Real-Time Dashboards.

### Key Points or Rules

- **Real-Time Dashboards** are the preferred tool for live monitoring of streaming data.
- Each tile in a dashboard is driven by a **KQL query**.
- Default tile visualization is a **table** — customize to charts or maps as needed.
- Published dashboards support **interactive filtering and drill-down**.
- **Power BI reports** can also be built from KQL data for broader enterprise reporting needs.

---

## 7. Automate Actions with Activator

### Explanation

**Activator** is Microsoft Fabric's technology for event-driven automation. It continuously monitors streaming data and triggers automated actions when user-defined conditions are met — without requiring manual intervention.

For example, you could configure Activator to:
- Send an email notification when a sensor value deviates from an acceptable range.
- Run a notebook (Spark-based processing) when a Real-Time Dashboard is updated.
- Alert when package delivery failures are detected in an Eventstream.

### Activator's Four Core Concepts

Activator's logic is built around four interconnected concepts:

| Concept | Definition |
|---|---|
| **Events** | Each record in a data stream represents an **event** — something that occurred at a specific point in time |
| **Objects** | The data in an event record can represent a business **object**, such as a sales order, a delivery vehicle, an IoT sensor, or any other entity you care about |
| **Properties** | The fields in the event data are mapped to **properties** of the business object — representing some aspect of its current state (e.g., a `temperature` field represents the current temperature of a sensor; a `total_amount` field represents the value of a sales order) |
| **Rules** | **Rules** define the conditions under which an action is triggered, based on the property values of objects. For example: "send an email to the maintenance manager if the temperature property of any sensor object exceeds 85°C" |

### Why it Matters

Without automation, someone must manually watch dashboards and query data to detect problems. Activator removes this human bottleneck by watching the data *for* you and acting *on your behalf* the moment a condition is met. This transforms Real-Time Intelligence from a passive monitoring system into an **active, event-driven decision-making system**.

### Activator Use Cases

| Scenario | What Activator Does |
|---|---|
| Product sales drop | Initiate marketing actions automatically |
| Temperature change affecting perishable goods | Send notification to logistics team |
| App or website performance issue | Flag real-time issues affecting user experience |
| Shipment not updated within expected timeframe | Trigger an alert to the operations team |
| Customer account balance crosses a threshold | Send alert to the customer or account manager |
| Anomaly or failure in a data processing workflow | Respond immediately with automated remediation |
| Same-store sales decline detected | Trigger an ad campaign automatically |
| Grocery store freezer failure detected | Alert store managers before food spoils |

### Key Points or Rules

- Activator **continuously monitors** streaming data — it does not need to be manually triggered.
- Actions are triggered by **Rules** — logical conditions defined on object Properties.
- Activator can trigger: **notifications**, **Power Automate workflows**, **Fabric pipelines**, and **notebooks**.
- It connects to data from **Eventstreams**, **KQL databases**, and **Real-Time Dashboards**.
- Activator is accessed through the **Real-Time Hub** or directly from an Eventstream or dashboard.

---

## Summary — How the Components Work Together

The Real-Time Intelligence components form a complete end-to-end pipeline:

```
[Data Sources]
     ↓
[Eventstreams] — ingest + transform in-flight
     ↓
[Eventhouse / KQL Databases] — store + query with KQL
     ↓
[KQL Querysets] — analyze and explore
     ↓
[Real-Time Dashboards] — visualize and monitor
     ↓
[Activator] — automate actions when conditions are met
     ↑
[Real-Time Hub] — discover and connect all streaming data sources
```

### Quick-Reference Component Table

| Component | Primary Purpose | Key Detail |
|---|---|---|
| **Real-Time Hub** | Discover and connect streaming data sources | Central catalog; access via Real-Time icon in Fabric menu |
| **Eventstreams** | Ingest and transform streaming data in motion | Sources → Transformations → Destinations |
| **Eventhouse / KQL Databases** | Store real-time data optimized for time-series queries | Indexed by ingestion time; integrates with OneLake |
| **KQL Queryset** | Run and manage analytical queries | Supports KQL and a subset of T-SQL |
| **Real-Time Dashboards** | Monitor live data through auto-refreshing visualizations | Tiles driven by KQL queries |
| **Activator** | Automate actions based on real-time conditions | Events → Objects → Properties → Rules → Actions |
| **Copilot for RTI** | AI-assisted query writing | Generates KQL from natural language descriptions |
