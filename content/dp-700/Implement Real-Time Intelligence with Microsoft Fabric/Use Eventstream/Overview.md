# DP-700 Study Guide: Use Eventstream in Microsoft Fabric

A complete revision guide for the **Use Eventstream** module. A student should be able to revise the entire module from this single file.

---

## 1. Introduction to Eventstream

### Explanation

**Eventstream** is a feature within Microsoft Fabric's Real-Time Intelligence workload that enables you to **capture, transform, and route real-time events — without writing any code**. It acts as a managed pipeline that moves data from where it originates to wherever it needs to go for storage, analysis, or automated action.

Using a **visual drag-and-drop canvas**, you define the flow of data by adding and connecting nodes — sources, transformations, and destinations. No infrastructure management is required.

### Why it Matters

In real-time analytics, raw streaming data is rarely ready for use the moment it arrives. It may come from multiple different sources, contain noise or errors, need reformatting, or need to be split and sent to different systems for different purposes. Eventstream handles all of this **in a single, no-code visual interface**, making it accessible to both engineers and analysts.

### Key Benefits

- **No-code design** — drag-and-drop canvas to build pipelines without writing infrastructure code.
- **Multiple source connectors** — connect to Azure Event Hubs, Azure IoT Hub, Azure Storage, Apache Kafka, and many more.
- **Flexible routing** — send data to a wide range of destinations simultaneously (Eventhouse, Lakehouse, Activator, custom endpoints, etc.).
- **In-flight transformations** — clean, reshape, and enrich data *while it flows*, before it reaches its destination.

### Key Points or Rules

- Eventstream is the **delivery mechanism** for real-time events in Microsoft Fabric — it carries events from sources to destinations.
- It works entirely through a **visual canvas** — no code or infrastructure management required.
- An Eventstream connects **sources → (optional transformations) → destinations**.

---

## 2. Components of Eventstream

### Explanation

An Eventstream is built from three types of components, connected together on the **eventstream canvas**. Think of the canvas as a flowchart editor for your data pipeline — you see events flowing through the pipeline in real time as you design it.

### The Three Core Components

#### 1. Sources
**Sources** are where your event data originates. A source node represents a connection to a live data feed. Once connected, events flow continuously into the Eventstream from that source.

#### 2. Transformations
**Transformations** are optional processing steps applied to the data as it flows through the pipeline. They reshape, filter, enrich, or aggregate the data *before* it reaches a destination. Multiple transformations can be chained together.

Available transformation types include:
- SQL code, filter, manage fields, aggregate, group by, expand, join *(covered in detail in Section 4)*

#### 3. Destinations
**Destinations** are where your processed event data is sent. Each destination serves a different purpose — storage, analysis, alerting, or integration with external systems.

### The Eventstream Canvas

The **eventstream canvas** is the visual editor where all three component types are designed and connected. Key features:
- Drag and drop nodes (sources, transformations, destinations) onto the canvas
- Connect nodes to define the flow of data
- See event data **flowing through the pipeline in real time** — so you can verify your design is working
- No code or infrastructure management needed

### Example Pipeline (from the source material)

A real example of an Eventstream pipeline:
1. **Source:** `Bicycles` — a real-time data source containing city bike rental data (bike locations, station street names, etc.)
2. **Eventstream:** `Bicycle-data` — ingests the data from the `Bicycles` source
3. **Transformation:** `GroupByStreet` — sums the number of bikes grouped by bike station street name
4. **Destination:** `Bikes-by-street-table` — a table in an Eventhouse where the aggregated data is stored

### Key Points or Rules

- The three components are: **Sources**, **Transformations** (optional), **Destinations**.
- The **eventstream canvas** is the visual editor — drag-and-drop, no code needed.
- You can see **live event data flowing** through the pipeline on the canvas, making it easy to verify correctness.
- Transformations sit **between** sources and destinations — they shape the data mid-flow.
- An Eventstream with **no transformations** is valid — data flows directly from source to destination.

---

## 3. Eventstream Sources and Destinations

### Explanation

One of Eventstream's key strengths is the breadth of **sources** it can connect to and **destinations** it can send data to. Understanding these options is essential for designing real-time data pipelines in Microsoft Fabric.

---

### Eventstream Sources

Sources are organized into four categories:

| Source Category | Examples |
|---|---|
| **Microsoft sources** | Azure Event Hubs, Azure IoT Hub, Azure Service Bus, Change Data Capture (CDC) feeds from database services |
| **Azure events** | Azure Blob Storage events (e.g., file created, file deleted) |
| **Fabric events** | Fabric workspace item changes, OneLake data changes, Fabric job events |
| **External sources** | Apache Kafka, Google Cloud Pub/Sub, MQTT (Message Queuing Telemetry Transport) |

#### Configuring Sources

Sources are added directly on the **eventstream canvas**. You have two options:
- **Create a new source** — configure a brand-new connection to a data source.
- **Connect to an existing source from the Real-Time Hub** — reuse a source that is already set up and discoverable in the Real-Time Hub.

---

### Eventstream Destinations

Destinations are where your processed streaming data lands. Because streaming data is **temporary by nature**, it must be captured immediately or it is lost. Destinations provide the persistence and processing needed to make the data useful.

A critical feature: you can **attach multiple destinations to a single Eventstream simultaneously** — they operate independently and don't interfere with each other. This means the same stream of data can feed an Eventhouse for analytics, an Activator for alerts, and a Lakehouse for long-term storage — all at once.

The five supported destination types are:

#### 1. Eventhouse
Route data into a **KQL database** inside an Eventhouse. Once there, you can use **Kusto Query Language (KQL)** to query and analyze the data.

- **Best for:** Real-time analytics, ad-hoc queries, dashboards backed by KQL databases.
- **Key benefit:** Optimized for time-series data and fast query performance.

#### 2. Lakehouse
Load events into a **Lakehouse table**. Real-time events are automatically converted into **Delta Lake format** before being stored.

- **Best for:** Long-term historical storage, batch analytics, integration with Spark notebooks.
- **Key benefit:** Converts streaming data to Delta format, making it available to the full Fabric analytics ecosystem.

#### 3. Derived Stream
A **derived stream** is a transformed version of your original data stream that enables **content-based routing** — sending different subsets of data to different destinations based on the actual *content* of the data.

- **How it works:** A derived stream filters or transforms the original stream, then routes the result to one or more further destinations.
- **Example:** Filter IoT sensor data so that **high-temperature alerts** go to Fabric Activator for immediate action, while **hourly averages** go to a KQL database for trend analysis.
- **Key concept:** Derived streams enable splitting one stream into multiple targeted outputs based on what the data actually says.

#### 4. Fabric Activator
Connect your streaming data **directly to Activator**, Fabric's event detection and rules engine. When data reaches certain thresholds or matches defined patterns, Activator can:
- Send notifications (email, Teams)
- Launch Power Automate workflows
- Trigger other automated responses

- **Best for:** Real-time condition monitoring and automated alerting.
- **Key benefit:** No separate data movement step needed — streaming events flow directly into the automation engine.

#### 5. Custom Endpoint
Route events to an **external system or custom application** outside Microsoft Fabric.

- **Best for:** Integration with third-party platforms, custom-built applications, or external APIs that need to consume the stream.
- **Key benefit:** Extends Fabric's streaming capabilities beyond the Microsoft ecosystem.

### Content-Based Routing — A Key Pattern

Content-based routing is a powerful pattern enabled by **derived streams**. Instead of sending all data to one destination, you use the *content* of the data to decide where each event goes.

**Example from source material:**
1. The output of a `GroupByStreet` transformation flows into a **derived stream**.
2. The derived stream then simultaneously routes to:
   - **Fabric Activator** — to check if every bike station has bikes available (triggering an alert if not)
   - **Eventhouse** — to insert bike counts by street into a KQL database for analytics

This means different consumers get exactly the data they need, in the format they need, from the same source pipeline.

### Key Points or Rules

- **Four source categories:** Microsoft sources, Azure events, Fabric events, External sources.
- Sources can be configured as **new connections** or reused from the **Real-Time Hub**.
- **Five destination types:** Eventhouse, Lakehouse, Derived stream, Fabric Activator, Custom endpoint.
- **Multiple destinations** can be attached to a single Eventstream simultaneously — they don't interfere with each other.
- **Eventhouse** = real-time analytics with KQL; **Lakehouse** = long-term Delta Lake storage.
- **Derived streams** enable **content-based routing** — splitting one stream into multiple targeted outputs by data content.
- **Activator** as a destination = real-time event detection and automated response.
- **Custom endpoint** = integration with external/custom applications outside Fabric.

---

## 4. Eventstream Transformations

### Explanation

Raw streaming data rarely arrives in the exact format needed for analysis or action. **Transformations** allow you to clean, enrich, and reshape data *while it flows through the Eventstream* — before it ever reaches a destination. This ensures each destination receives data that is optimized for its specific purpose.

Transformations are applied on the **eventstream canvas** using a **no-code, drag-and-drop interface**. You can chain multiple transformations together to build complex data processing pipelines.

### Common Transformation Use Cases

| Scenario | What Transformation Does |
|---|---|
| **Data quality** | Filter out invalid or incomplete records before they reach storage |
| **Content-based routing** | Route different data subsets to different destinations based on data values |
| **Data enrichment** | Add calculated fields, rename columns, or convert data types for downstream compatibility |
| **Aggregation and summarization** | Calculate running totals, averages, or counts over time windows for dashboard displays |
| **Format standardization** | Ensure consistent data structure when combining multiple source streams |

---

### The Seven Transformation Types

#### 1. Filter
**Purpose:** Include only the events that meet a specific condition — discard everything else.

- You define a condition based on the value of a field in the incoming data.
- Only events that satisfy the condition pass through; all others are dropped.
- **Examples:**
  - `temperature > 80` — only pass events with temperature above 80
  - `status = "error"` — only pass error events
  - `customer_type = "premium"` — only pass events for premium customers

#### 2. Manage Fields
**Purpose:** Modify the shape and structure of individual records — the columns available in each event.

You can:
- **Add** calculated fields (derived from existing fields)
- **Remove** unnecessary columns to reduce payload size
- **Rename** fields for clarity or to match destination requirements
- **Change data types** to ensure compatibility with the destination schema

#### 3. Aggregate
**Purpose:** Calculate a running aggregation every time a new event occurs, over a period of time.

- Supported aggregation functions: **Sum**, **Minimum**, **Maximum**, **Average**
- You can rename the calculated output column.
- You can apply filters based on other dimensions in your data.
- Multiple aggregations can be defined in the **same** Aggregate transformation node.
- **Example:** Calculate the running average temperature sensor reading, updated with each new event.

#### 4. Group By
**Purpose:** Calculate aggregations across events grouped by one or more dimensions, within **time windows**.

- Unlike Aggregate (which runs on every new event), Group By calculates totals/averages for defined windows of time.
- Supports two window types:
  - **Tumbling windows** — fixed, non-overlapping intervals (e.g., every hour on the hour)
  - **Sliding windows** — overlapping intervals that slide forward over time
- **Examples:**
  - Hourly sales totals grouped by product category
  - Daily average temperature grouped by sensor location

#### 5. Union
**Purpose:** Merge two or more streams into a **single combined stream**.

- Events from all connected streams are combined into one output.
- Only fields with the **same name AND same data type** across all streams are kept.
- Fields that don't match are **dropped** from the output.
- **Use case:** When you have multiple data sources with overlapping schemas and want to process them as one unified stream.

#### 6. Join
**Purpose:** Combine data from **two streams** by matching events from each stream based on a condition.

- Similar to a SQL JOIN but operating on live streams.
- Events from the two streams are matched based on a specified field relationship.
- **Use case:** Enrich a stream of order events with product details from a separate product stream.

#### 7. Expand
**Purpose:** **Flatten array data** by creating a new row for each value within an array field.

- When an event contains an array field, Expand splits it out so each array element becomes its own row.
- **Use case:** When an IoT message contains an array of multiple sensor readings in a single event, Expand creates one row per reading.

---

### Chaining Transformations — Building Pipelines

Transformations can be **connected in sequence** to build multi-step data processing pipelines. The output of one transformation becomes the input of the next.

**Example pipeline for equipment temperature monitoring:**

```
[Source: IoT temperature readings]
        ↓
[Filter] — Remove sensor errors (e.g., readings = -999)
        ↓
[Manage Fields] — Add a "priority" column calculated from temperature thresholds
        ↓
[Group By] — Calculate hourly average temperature by location
        ↓
[Split output to two destinations:]
  ├── [Fabric Activator] — Evaluate temperature rules and send alerts
  └── [Lakehouse] — Store hourly summaries for historical analysis
```

This pipeline: removes bad data → enriches with business logic → aggregates → sends each processed output to the right place.

### Key Points or Rules

- Transformations are **optional** — an Eventstream can pass data directly from source to destination with no transformation.
- All transformations are configured using the **no-code drag-and-drop canvas**.
- **Seven transformation types:** Filter, Manage Fields, Aggregate, Group By, Union, Join, Expand.
- **Filter** = include/exclude events; **Manage Fields** = reshape columns; **Aggregate** = rolling calculation per event; **Group By** = time-window aggregation; **Union** = merge streams; **Join** = combine two streams; **Expand** = flatten arrays.
- **Tumbling windows** (Group By) = fixed, non-overlapping time slots; **Sliding windows** = overlapping, continuously moving intervals.
- **Union** only keeps fields that match in **both name and data type** across all streams — mismatched fields are dropped.
- Transformations can be **chained** — the output of one feeds into the next, enabling complex, multi-step pipelines.

---

## Summary — Eventstream at a Glance

```
[Sources]
  • Microsoft: Azure Event Hubs, IoT Hub, Service Bus, CDC
  • Azure events: Blob Storage events
  • Fabric events: Workspace, OneLake, Job events
  • External: Kafka, Google Cloud Pub/Sub, MQTT
        ↓
[Eventstream Canvas — No-Code Visual Editor]
        ↓
[Transformations (optional, chainable)]
  • Filter         — keep only matching events
  • Manage Fields  — add, remove, rename, retype columns
  • Aggregate      — rolling aggregations per event
  • Group By       — time-window aggregations (tumbling/sliding)
  • Union          — merge multiple streams
  • Join           — combine two streams by matching condition
  • Expand         — flatten array fields into rows
        ↓
[Destinations — multiple simultaneous, independent]
  • Eventhouse     — KQL database for real-time analytics
  • Lakehouse      — Delta Lake tables for historical storage
  • Derived Stream — content-based routing to further destinations
  • Activator      — automated alerting and event-driven actions
  • Custom Endpoint — external/third-party systems
```

### Quick-Reference Summary Table

| Component | Purpose | Key Detail |
|---|---|---|
| **Eventstream** | Capture, transform, and route real-time events | No-code drag-and-drop canvas |
| **Source** | Where event data originates | Microsoft, Azure, Fabric, External categories |
| **Transformation** | Reshape/clean/enrich data in motion | 7 types; chainable; no code required |
| **Destination** | Where processed data is sent | 5 types; multiple can run simultaneously |
| **Filter** | Keep only matching events | Condition-based — e.g., `temperature > 80` |
| **Manage Fields** | Add, remove, rename, retype columns | Shape the data for downstream compatibility |
| **Aggregate** | Rolling per-event aggregation | Sum, Min, Max, Average |
| **Group By** | Time-window aggregation by dimension | Tumbling (fixed) or Sliding (overlapping) windows |
| **Union** | Merge multiple streams | Only keeps fields matching in name AND data type |
| **Join** | Combine two streams by matching condition | Like a SQL JOIN on live streams |
| **Expand** | Flatten array fields into individual rows | One row per array element |
| **Derived Stream** | Content-based routing | Splits stream by data content into sub-streams |
| **Eventhouse** | Real-time analytics storage | Queryable with KQL |
| **Lakehouse** | Long-term Delta Lake storage | Converted to Delta format on ingestion |
| **Activator** | Automated event detection and response | Rules + Actions engine |
| **Custom Endpoint** | External/third-party integration | Extends streaming outside Fabric |
