# Study Guide: Ingest Data with Dataflows Gen2 in Microsoft Fabric

This study guide helps you master data ingestion and transformation using Dataflows Gen2 in Microsoft Fabric for the DP-700 exam. It covers how to connect to data sources, perform transformations using Power Query Online, set up destinations, and orchestrate these tasks within data pipelines.

---

## Introduction to Data Ingestion & Dataflows Gen2

### Explanation
Data ingestion is a critical initial step in any end-to-end analytics workflow. It involves extracting raw data from various source systems, transforming it into a consistent and clean format, and loading it into a destination. In Microsoft Fabric, **Dataflows Gen2** serve as a key low-code tool designed to handle these exact tasks. They enable data engineers to connect to multiple disparate data sources, apply cleansing and transformation steps, and land the finalized data into a target system.

### Why it matters
Without an automated and unified ingestion tool like Dataflows Gen2, data engineers would have to manually extract and transform data from every source individually. This manual approach is highly time-consuming, repetitive, and prone to human errors. Dataflows Gen2 automate this process, ensuring that the final semantic model is consistent, reusable, and easy to update.

### Where it is used
*   **Retail/Global Organizations:** Consolidating disparate data from stores located around the world into a single standardized semantic model.
*   **Power BI Reporting:** Serving as a clean, pre-processed data source to reduce report-development time for data analysts.
*   **Orchestrated Workflows:** Operating as a component within larger Data Factory data pipelines.

### Key points or rules
*   Used to ingest and transform data from multiple sources.
*   Lands cleansed data into a specified destination.
*   Can be incorporated into data pipelines for advanced orchestration or used directly in Power BI.

---

## What is a Dataflow? (Dataflows Gen2)

### Explanation
A dataflow is a cloud-based **ETL (Extract, Transform, Load)** tool designed for building and executing scalable data transformation processes. Dataflows Gen2 in Microsoft Fabric leverage the visual **Power Query Online** interface to simplify these steps. A dataflow acts as a container for all the extraction and transformation logic, preserving every step of the data preparation process so it can be executed automatically.

### Why it matters
Traditionally, data engineers spend a significant portion of their time writing custom code to extract, clean, and format data. Dataflows Gen2 democratize and accelerate this process by providing a reusable visual interface. This reduces data preparation time and makes it easier to deliver a curated semantic model that downstream business users and report developers can consume immediately.

### Where it is used
*   **Self-Service BI:** Enabling business analysts to access prepared data directly from Power BI Desktop.
*   **ETL Tasks:** Processing raw datasets and delivering them to structured storage tables.

### Key points or rules
*   ETL stands for **Extract, Transform, Load**.
*   Utilizes Power Query Online for its visual, low-code interface.
*   Preserves all transformation steps even if a target destination is not specified (adding a destination is optional).
*   Can be run manually, on a refresh schedule, or triggered as part of a pipeline.

---

## ETL vs. ELT Processes with Dataflows Gen2 and Pipelines

### Explanation
Microsoft Fabric allows data engineers to choose between two main data processing design patterns depending on the requirements:
1.  **ETL (Extract, Transform, Load):** You create a Dataflow Gen2 first to extract and transform the data, and then load it directly into a lakehouse or other destination. This pattern is ideal for preparing and cleaning data before it lands in your final storage.
2.  **ELT (Extract, Load, Transform):** You use a Data Pipeline to extract raw data and load it directly into your preferred destination (such as a Lakehouse) first. Once the raw data is loaded, you create a Dataflow Gen2 to connect to the Lakehouse, extract the data locally, and then clean/transform it. The output of the dataflow is then offered as a curated semantic model for reporting.

### Why it matters
Choosing the right pattern affects how resources are consumed and how data is staged. ETL cleans data in flight before storage, which is useful when storage space or destination formatting is restricted. ELT lands raw data quickly and does the heavy lifting of transformation inside the Fabric environment, which is useful for auditability (retaining raw historical logs) and utilizing Fabric's internal compute power.

### Where it is used
*   **ETL:** Standardizing external cloud/on-premises sources before they enter the enterprise lakehouse.
*   **ELT:** Ingesting large volumes of raw files into the lakehouse first, then using Dataflows Gen2 to build specialized semantic models for data analysts.

### Key points or rules
*   **ETL Order:** Pipeline/Dataflow $\rightarrow$ Transform $\rightarrow$ Destination.
*   **ELT Order:** Pipeline extracts & loads raw data $\rightarrow$ Dataflow Gen2 connects to Lakehouse to clean and transform.
*   Dataflows can be horizontally partitioned: A global dataflow can be created first, and analysts can reference it to build specialized semantic models.

---

## Dataflows Gen2 Interface Components (Power Query Online)

### Explanation
Dataflows Gen2 can be created within the **Data Factory** workload, a **Power BI** workspace, or directly inside a **Lakehouse**. The interface uses Power Query Online and consists of five primary components:
1.  **Power Query Ribbon:** The top toolbar that provides access to data source connectors (e.g., relational databases, flat files, SharePoint, Salesforce, Spark, Fabric Lakehouses) and various transformation operations (filtering, sorting, pivoting, unpivoting, merging, appending, replacing values, splitting columns, reordering, removing duplicates, and calculating ranks/percentages). It is also where you configure connections, parameters, and destinations.
2.  **Queries Pane:** Lists all active data sources (queries). These queries become tables when loaded into the target data store. Queries can be duplicated or referenced (e.g., to split data and build a star schema) or disabled from loading if they are only needed for staging.
3.  **Diagram View:** A visual canvas representing the lineage of your data. It shows how data sources are connected, duplicated, and transformed step-by-step. Each query is a shape, and transformations are nodes connected by lines. This view can be toggled on or off.
4.  **Data Preview Pane:** Displays a subset of your data in real-time. This allows you to interactively verify how transformations affect the data (e.g., dragging and dropping columns or right-clicking to filter) without waiting for the full dataset to process.
5.  **Query Settings Pane:** Contains the **Applied Steps** list, which documents every single transformation step sequentially. It also contains the **Data Destination** settings.
6.  **Advanced Editor (M Code):** A code editor that allows advanced users to inspect and write the underlying M query formula language directly.

### Why it matters
Understanding the layout and functionality of the Power Query Online interface is essential for building and debugging complex transformation logic. The visual elements (like the Diagram View and Data Preview) prevent errors by showing immediate feedback before the actual dataflow runs.

### Where it is used
Used by data engineers and Power BI developers to visually construct data cleaning workflows directly in the Fabric portal.

### Key points or rules
*   **Queries** in the Queries pane become **Tables** when loaded to a destination.
*   **Applied Steps** record transformations in sequence; most steps can be modified by clicking the gear icon next to them.
*   Right-clicking a step allows renaming, reordering, or deleting.
*   Query folding can be inspected via the contextual menu of a step (when supported by the source).

---

## Data Destinations for Dataflows Gen2

### Explanation
Dataflows Gen2 allow you to land your transformed data into specific target systems. Within Microsoft Fabric, you can configure the data destination settings for each query inside the Query Settings pane.

### Why it matters
Specifying a data destination ensures that the cleansed and transformed output is saved in a structured, queryable format that downstream applications can access securely.

### Where it is used
Used to load data into final production tables for reporting, warehousing, or application integration.

### Key points or rules
Supported destinations inside the Fabric environment:
*   **Lakehouse**
*   **Warehouse**
*   **SQL database**

Supported destinations outside/related to the Azure ecosystem:
*   **Azure SQL database**
*   **Azure Data Explorer**
*   **Azure Synapse Analytics**

---

## Benefits and Limitations of Dataflows Gen2

### Explanation
While Dataflows Gen2 are powerful, they are designed for specific scenarios and have distinct boundaries compared to other Fabric workloads.

### Why it matters
As a Fabric Data Engineer, you must know when to choose Dataflows Gen2 over alternative tools like Notebooks, Pipelines, or T-SQL queries.

### Where it is used
Architecting data integration strategies and deciding on tool selection for Fabric implementations.

### Key points or rules
*   **Benefits:**
    *   **Consistency:** Extends data with consistent data models (e.g., standard date dimensions).
    *   **Self-Service Access:** Allows self-service business users to access subsets of a data warehouse independently.
    *   **Performance Optimization:** Extracts data once for reuse, reducing refresh times and load on slow source systems.
    *   **Simplified Complexity:** Hides complex source connections from larger analyst groups by exposing simple dataflows.
    *   **Quality Control:** Ensures data cleaning happens before loading into target tables.
    *   **Low-Code Integration:** Easy visual ingestion from a wide variety of sources.
*   **Limitations:**
    *   **Not a Warehouse Replacement:** They do not replace the function of a data warehouse.
    *   **No Row-Level Security (RLS):** RLS is not supported within the dataflow itself.
    *   **Licensing Constraint:** A **Fabric capacity workspace** is required to run Dataflows Gen2.

---

## Integrating Dataflows Gen2 and Pipelines

### Explanation
Data pipelines are orchestrators in Microsoft Fabric. They can run a sequence of diverse activities in a specific order. You can easily integrate a Dataflow Gen2 as a single activity within a larger data pipeline orchestration.

### Why it matters
Complex data operations usually involve more than just ingestion and transformation. By combining dataflows and pipelines, you can run a Dataflow Gen2, wait for it to finish, and then automatically trigger follow-up activities such as executing SQL stored procedures, running Spark Notebooks, or retrieving metadata.

### Where it is used
*   **Enterprise Automation:** Setting up schedules or triggers (event-based) to automatically refresh and transform data without manual intervention.
*   **Multi-step Workflows:** Ingesting and transforming data via Dataflow Gen2, then running a Spark Notebook to perform advanced machine learning or analytics on that same data.

### Key points or rules
*   Pipelines provide a visual interface to arrange activities sequentially or in parallel.
*   Common pipeline activities include: **Copy data**, **Incorporate Dataflow**, **Add Notebook**, **Get metadata**, and **Execute a script or stored procedure**.
*   Using pipelines to run dataflows enables scheduled and trigger-based automated refreshes.
