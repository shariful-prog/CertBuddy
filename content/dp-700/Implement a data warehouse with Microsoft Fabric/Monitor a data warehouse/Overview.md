# DP-700 Study Guide: Monitor a data warehouse

This study guide explains the tools, techniques, and system views used to monitor costs, connections, sessions, and query performance in a Microsoft Fabric Data Warehouse.

---

## 1. Monitor Capacity Metrics

### Explanation
Microsoft Fabric licenses define the **capacity** (a pool of resources) allocated to an organization. Fabric billing and resource usage are measured in **Capacity Units (CUs)**. In a data warehouse workload, CUs are consumed by data read and write activities, including user queries and operations reading from/writing to OneLake storage.

### Why it Matters
Monitoring capacity utilization allows organizations to:
* Plan and manage costs, ensuring workloads fit within the licensed budget.
* Identify resource bottlenecks.
* Detect **throttling**—a condition where workloads require more capacity units than are available in the purchased capacity license, resulting in degraded performance.

### Where it is Used
Capacity metrics are monitored using the **Microsoft Fabric Capacity Metrics app**, which is installed by administrators in the Fabric environment.

### Key Points or Rules
* **Workload Filtering:** The metrics app can be filtered to show only **Warehouse** activity.
* **Cost Drivers:** In data warehousing, the primary drivers of CU consumption are active queries and direct file read/write operations against OneLake.
* **Optimization:** Analyzing CU usage trends helps determine whether to optimize queries (to reduce CU consumption) or scale up the Fabric capacity license.

---

## 2. Monitor Current Activity (Dynamic Management Views)

### Explanation
Dynamic Management Views (DMVs) are system views that return information about the current, real-time state of the data warehouse. You query DMVs using standard T-SQL to inspect active connections, sessions, and running queries.

### Why it Matters
Real-time monitoring using DMVs helps database engineers identify immediate execution bottlenecks, isolate blocked sessions, and troubleshoot active, long-running queries that are degrading system performance.

### Where it is Used
Queried directly in the Fabric SQL query editor or via external tools (like SQL Server Management Studio).

### Key DMVs
Fabric data warehouses include three primary DMVs for monitoring current activity:
1. **`sys.dm_exec_connections`:** Returns details about active physical connections to the data warehouse.
2. **`sys.dm_exec_sessions`:** Returns information about authenticated user sessions.
3. **`sys.dm_exec_requests`:** Returns details about currently active, executing SQL requests.

#### Querying DMVs (Identifying Long-Running Queries)
To find active, running queries in the current database ordered by their execution time, you can join these three views on `session_id`:
```sql
SELECT 
    sessions.session_id, 
    sessions.login_name, 
    connections.client_net_address, 
    requests.command, 
    requests.start_time, 
    requests.total_elapsed_time
FROM sys.dm_exec_connections AS connections
INNER JOIN sys.dm_exec_sessions AS sessions 
    ON connections.session_id = sessions.session_id
INNER JOIN sys.dm_exec_requests AS requests 
    ON requests.session_id = sessions.session_id
WHERE requests.status = 'running' 
  AND requests.database_id = DB_ID()
ORDER BY requests.total_elapsed_time DESC;
```
* **Tip:** The `requests.total_elapsed_time` value is measured in milliseconds. Ordering descending helps locate the longest-running queries that are currently active.

---

## 3. Monitor Queries (Query Insights)

### Explanation
**Query Insights** is a built-in Fabric feature that provides historical, aggregated data about completed queries. Unlike DMVs (which show active real-time data), Query Insights views allow you to analyze historical trends, query run frequencies, and completion times.

### Why it Matters
Analyzing historical query execution metrics is essential for long-term database tuning. It allows engineers to identify:
* Queries that are run most frequently.
* Queries that consistently take the longest time to complete (long-running queries).
* Success and failure rates of database commands.

### Where it is Used
Queried in the SQL query editor using views in the `queryinsights` schema.

### Key Query Insights Views
1. **`queryinsights.exec_requests_history`:** Details of every completed SQL query.
2. **`queryinsights.long_running_queries`:** Aggregated execution times and statistics for queries.
3. **`queryinsights.frequently_run_queries`:** Execution statistics for frequently run queries.

### Key Points or Rules
* **Data Refresh Latency:** Completed queries do not appear in Query Insights immediately. Depending on active workloads, it can take **up to 15 minutes** for a query to be reflected in these views.
* **Query Parameterization & Aggregation:** To provide useful aggregated statistics (like average/median execution times), Fabric groups queries together. Queries that have the same structure but different filter values (predicates) are parameterized and treated as the identical command.
  * *Example:* These two queries are aggregated as the same statement under Query Insights:
    * `SELECT * FROM sales WHERE orderdate > '01/01/2023'`
    * `SELECT * FROM sales WHERE orderdate > '12/31/2021'`

#### Example Queries

##### 1. Listing Queries Run in the Last Hour
```sql
SELECT start_time, login_name, command
FROM queryinsights.exec_requests_history
WHERE start_time >= DATEADD(MINUTE, -60, GETUTCDATE());
```

##### 2. Identifying Long-Running Queries (Run More Than Once)
```sql
SELECT last_run_command, number_of_runs, median_total_elapsed_time_ms, last_run_start_time
FROM queryinsights.long_running_queries
WHERE number_of_runs > 1
ORDER BY median_total_elapsed_time_ms DESC;
```

##### 3. Listing Frequently Run Queries and Success Rates
```sql
SELECT last_run_command, number_of_runs, number_of_successful_runs, number_of_failed_runs
FROM queryinsights.frequently_run_queries
ORDER BY number_of_runs DESC;
```
