# DP-700 Study Guide: Create Real-Time Dashboards in Microsoft Fabric

A complete revision guide for the **Create Real-Time Dashboards** module. A student should be able to revise the entire module from this single file.

---

## 1. Introduction to Real-Time Dashboards

### Explanation

Real-Time Dashboards are a feature in Microsoft Fabric that lets you monitor continuously changing data through visualizations that **refresh automatically**. Unlike traditional reports — which display a static snapshot of historical data — Real-Time Dashboards are designed to show the *current state* of your data, updating at a frequency you configure.

They are powered by **KQL (Kusto Query Language) databases** stored in **Eventhouses**, which are Microsoft Fabric's storage layer purpose-built for real-time, streaming data.

### Why it Matters

In many real-world operations, data changes by the minute or even by the second. Consider a bike-sharing company that needs to track how many bikes are available and how many docking stations are empty across different neighborhoods throughout the day. Operational decisions — such as redistributing bikes to high-demand areas — must be made based on the *latest* data, not data from hours ago.

Real-Time Dashboards solve this by bridging the gap between streaming data and visual monitoring, enabling teams to react to current conditions rather than past ones.

### Where it is Used

Real-Time Dashboards are used in scenarios such as:
- **Operational monitoring** (e.g., logistics, transportation, manufacturing)
- **IoT data tracking** (e.g., sensor readings, device telemetry)
- **Event-driven analytics** (e.g., live sales, user activity streams)

### Key Points or Rules

- Real-Time Dashboards connect to **KQL databases in Eventhouses** as their data source.
- They display visualizations that **refresh automatically**, without requiring manual page reloads.
- They are fundamentally different from Power BI reports — they are optimized for *real-time* monitoring, not historical analysis.
- The core building blocks of a Real-Time Dashboard are **tiles**, each containing a visualization powered by a KQL query.

---

## 2. Creating a Real-Time Dashboard

### Explanation

To build a Real-Time Dashboard, you need two things:

1. **A real-time data source** — typically a KQL database inside an Eventhouse that is receiving streaming data.
2. **A Real-Time Dashboard** — created in Microsoft Fabric, connected to that KQL database via a configured **data source**.

Once the dashboard is connected to the data source, you build it up by adding **tiles**, each of which runs a KQL query against the database to fetch and display data.

### Why it Matters

The creation process is straightforward by design — Fabric provides a structured workflow that takes you from connecting a data source to building and arranging visualizations. Understanding each step ensures you can set up a functional, accurate, and secure dashboard.

### Key Points or Rules

- A Real-Time Dashboard **requires at least one tile** to display data.
- Each tile is backed by a **KQL query** run against the connected data source.
- You connect the dashboard to your KQL database by defining a **data source** within the dashboard settings.

---

## 3. Configuring Authorization for Data Sources

### Explanation

When you connect a Real-Time Dashboard to a KQL database, you must decide **who can access the underlying data** and under whose identity the data is retrieved. Fabric gives you two authorization modes:

| Authorization Mode | How it Works |
|---|---|
| **Pass-through identity** | Each viewer accesses data using **their own permissions**. If a viewer does not have access to certain data in the KQL database, they will not see it in the dashboard. |
| **Dashboard editor's identity** | All viewers — regardless of their own permissions — access data using the **dashboard creator's (editor's) permissions**. Everyone sees the same data as the editor. |

### Why it Matters

Choosing the right authorization model is critical for both **data security** and **user experience**:
- **Pass-through identity** is appropriate when different viewers should see different data based on their role (e.g., a regional manager sees only their region's data).
- **Editor's identity** is appropriate when you want a unified view of the data for all viewers, without worrying about individual permission configurations.

### Key Points or Rules

- **Pass-through identity** = viewer's own permissions are enforced.
- **Editor's identity** = the dashboard creator's permissions are used for all viewers.
- This setting is configured at the **data source level** when connecting the dashboard to the KQL database.

---

## 4. Creating and Configuring Tiles

### Explanation

A **tile** is the fundamental visual unit of a Real-Time Dashboard. Each tile displays the results of a KQL query as a table or a visualization (chart, map, etc.). Tiles are what the viewer actually sees on the dashboard.

#### Step 1 — Write and Test a KQL Query

When you add a new tile, the first thing you do is write the KQL query that will power it. You can test this query directly in the tile editor before saving. The query runs against your connected KQL database.

**Example KQL query** for a bike rental dashboard:

```kql
bikes
| where ingestion_time() between (ago(30min) .. now())
| summarize latest_observation = arg_max(ingestion_time(), *) by Neighbourhood
| project Neighbourhood, latest_observation, No_Bikes, No_Empty_Docks
| order by Neighbourhood asc
```

**Breaking down this query:**
- `bikes` — the source table in the KQL database.
- `where ingestion_time() between (ago(30min) .. now())` — filters to only records ingested in the last 30 minutes, ensuring you're working with recent data.
- `summarize latest_observation = arg_max(ingestion_time(), *) by Neighbourhood` — for each neighborhood, keeps only the **most recently ingested record** (the latest observation). `arg_max` returns the row where `ingestion_time()` is highest.
- `project` — selects only the columns you need: Neighbourhood, the timestamp of the latest observation, number of bikes, and number of empty docking bays.
- `order by Neighbourhood asc` — sorts results alphabetically by neighborhood.

#### Step 2 — Choose a Visualization

By default, a tile displays its query results as a **table**. You can then edit the tile to choose a more appropriate visualization type, such as:
- **Bar chart** (e.g., comparing number of bikes vs. empty docks across neighborhoods)
- **Map** (e.g., plotting geo-located data)
- Other chart types supported by Real-Time Dashboards

#### Step 3 — Arrange Multiple Tiles

A dashboard can contain **multiple tiles**. You can drag and resize tiles to organize the layout in a way that makes sense for the viewer.

You can also add **text tiles** — tiles that contain plain text or markdown — to label sections of the dashboard, add explanations, or provide context to the viewer.

### Why it Matters

Tiles are how raw KQL query data becomes visible, actionable information. Well-designed tiles surface the right metrics instantly so decision-makers can act on current data without any manual querying.

### Key Points or Rules

- Every tile is powered by a **KQL query** — there is no drag-and-drop data picker; you write the query.
- By default, a new tile shows data as a **table**; you must edit it to apply a chart or map visualization.
- You can have **multiple tiles** on a dashboard and arrange them freely.
- **Text tiles** can be added for labels, descriptions, or instructions within the dashboard layout.
- The tile query filters data to a **recent time window** (e.g., last 30 minutes) to ensure real-time relevance.

---

## 5. Organizing Dashboards with Pages

### Explanation

A Real-Time Dashboard starts with a **single page**, but you can add more pages to it. Think of pages like tabs in a workbook — each page acts as a container for a group of related tiles.

### Why it Matters

As dashboards grow in complexity (more data sources, more metrics, more visualizations), keeping everything on one page becomes cluttered and hard to navigate. Pages let you:
- Separate content by **subject area** (e.g., "Bike Availability" on one page, "Dock Capacity" on another).
- Group tiles by **data source** if the dashboard connects to multiple KQL databases.
- Improve **readability and usability** for the viewers.

### Key Points or Rules

- A dashboard has **one page by default**; more pages can be added as needed.
- Pages help **logically group** related tiles.
- Common groupings: by data source, by subject area, by team, or by time dimension.

---

## 6. Adding Parameters to Filter Dashboard Data

### Explanation

**Parameters** are interactive controls you add to a dashboard that allow **viewers to filter the data** displayed in the tiles — without changing the underlying KQL queries. A parameter exposes a UI control (like a dropdown or text box) that viewers interact with, and the selected value is passed into the tile queries at query time.

#### How Parameters Work

- Each parameter has a **variable name** that starts with an underscore (e.g., `_selected_neighbourhoods`).
- You **reference this variable in your tile KQL queries** to apply the filter.
- Parameter values can be:
  - Based on **specific text** (hardcoded list of values), or
  - Based on the **results of a query** (dynamic values drawn from the database).

#### Example — Filtering by Neighborhood

Suppose you create a parameter named `_selected_neighbourhoods` that lets users pick one or more neighborhoods from a list. Your tile query would then be updated to include a filter like this:

```kql
bikes
| where ingestion_time() between (ago(30min) .. now())
    and (isempty(_selected_neighbourhoods) or Neighbourhood in (_selected_neighbourhoods))
| summarize latest_observation = arg_max(ingestion_time(), *) by Neighbourhood
```

**Breaking down the filter:**
- `isempty(_selected_neighbourhoods)` — if the user has not selected any neighborhood (the parameter is empty/blank), this condition is `true`, and **all neighborhoods** are returned.
- `Neighbourhood in (_selected_neighbourhoods)` — if the user *has* selected one or more neighborhoods, only those are returned.
- The `or` between these two conditions means the query gracefully handles **both the "no filter" and "filtered" states**.

### Why it Matters

Parameters make dashboards **interactive and reusable**. Instead of building a separate dashboard for each neighborhood, department, or time period, you build one dashboard and let users self-serve by choosing their filter values. This is far more maintainable and flexible.

### Key Points or Rules

- Parameters are defined at the **dashboard level**, not at the tile level.
- Variable names use an **underscore prefix** (e.g., `_selected_neighbourhoods`).
- Parameter values can come from a **hardcoded list** or from a **dynamic query**.
- Multiple parameters can be added to a single dashboard.
- In the KQL query, `isempty()` is used to handle the case where **no value is selected** (show all data).
- The `in` operator is used to **match against selected values**.

---

## 7. Configuring Auto Refresh

### Explanation

**Auto refresh** is the feature that makes a Real-Time Dashboard truly "real-time." It automatically re-runs the tile queries and updates the visualizations on a scheduled interval — without the viewer needing to manually refresh the browser page.

### Why it Matters

Without auto refresh, a viewer would see a static snapshot of the data from the moment they loaded the dashboard. Auto refresh ensures the dashboard always reflects the **most current available data**, which is the core purpose of a real-time dashboard.

### Key Points or Rules

- **Dashboard editors** can configure a **default refresh rate** (e.g., every 30 seconds, every 1 minute).
- **Viewers** can adjust the refresh rate during their session (e.g., slow it down if they are analyzing data).
- **Editors can set a minimum refresh rate** — a floor below which viewers cannot set the refresh interval. This protects system performance by preventing viewers from setting a very aggressive (e.g., every 1 second) refresh that could overload the KQL database with queries.
- The minimum refresh rate is a **governance control** for editors to manage query load on the backend system.

---

## 8. Using Base Queries for Dashboard Optimization

### Explanation

When a dashboard has **multiple tiles that all query the same underlying data** (with minor differences like different filters or projections), you would normally end up duplicating a large portion of KQL code across all those tiles. **Base queries** solve this problem.

A **base query** is a named, reusable KQL query defined at the dashboard level. Individual tile queries can then **reference the base query by its variable name** instead of re-writing the full data-retrieval logic from scratch.

#### How Base Queries Work

1. You define a base query through the dashboard's **Base Queries** menu.
2. You assign it a **variable name** (with an underscore prefix, e.g., `_base_bike_data`).
3. The base query contains the **shared, common logic** — such as filtering to recent data and getting the latest observation per neighborhood.
4. Each tile query then references `_base_bike_data` as its starting point and adds only the tile-specific logic (e.g., selecting specific columns or sorting).

#### Example

**Base query** (`_base_bike_data`):
```kql
bikes
| where ingestion_time() between (ago(30min) .. now())
| summarize latest_observation = arg_max(ingestion_time(), *) by Neighbourhood
```

**Tile query referencing the base query:**
```kql
_base_bike_data
| project Neighbourhood, latest_observation, No_Bikes, No_Empty_Docks
| order by Neighbourhood asc
```

Instead of repeating the `where` and `summarize` clauses in every tile, each tile simply starts from `_base_bike_data` and adds what it specifically needs.

### Why it Matters

Base queries bring two key benefits:

1. **Maintainability** — If the shared logic needs to change (e.g., you want to extend the time window from 30 minutes to 1 hour), you change it **once** in the base query, and all tiles that reference it are automatically updated. Without base queries, you'd have to update every tile individually.
2. **Readability** — Tile queries become shorter and more focused, making them easier to understand and debug.

### Where it is Used

Base queries are used in dashboards where **multiple tiles need the same foundational data**, just presented in different ways (different chart types, different columns, different filters).

### Key Points or Rules

- Base queries are defined at the **dashboard level** via the **Base Queries** menu.
- They use an **underscore-prefixed variable name** (e.g., `_base_bike_data`).
- Tile queries **reference the base query by its variable name** as if it were a table.
- Base queries help **avoid code duplication** across tiles.
- They improve **maintainability** — one change propagates to all tiles that use the base query.
- The base query contains the **common, shared logic**; tile queries contain only the **tile-specific logic**.

---

## Summary Table

| Concept | Purpose | Key Detail |
|---|---|---|
| **Real-Time Dashboard** | Monitor live, auto-refreshing data | Built on KQL databases in Eventhouses |
| **Tile** | Individual visualization unit | Powered by a KQL query |
| **Text Tile** | Add labels/context to a dashboard | No query — plain text or markdown |
| **Data Source Authorization** | Control data access | Pass-through (viewer's identity) vs. Editor's identity |
| **Pages** | Organize tiles into logical groups | Multiple pages per dashboard |
| **Parameters** | User-controlled data filters | Referenced in KQL queries with `_variablename` |
| **Auto Refresh** | Keep dashboard data current automatically | Editors set default + minimum refresh rate |
| **Base Queries** | Reusable shared query logic | Avoids duplication; referenced by `_variablename` in tile queries |
