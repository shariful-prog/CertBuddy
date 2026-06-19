# DP-700 Study Guide: Use Activator in Microsoft Fabric

A complete revision guide for the **Use Activator** module. A student should be able to revise the entire module from this single file.

---

## 1. Introduction to Activator

### Explanation

**Activator** is Microsoft Fabric's event detection and rules engine within the Real-Time Intelligence workload. Its purpose is to **automatically watch your streaming data**, evaluate conditions you define, and **trigger actions** when those conditions are met — all without human intervention.

The workflow for using Activator is:
1. **Connect** to real-time data sources (e.g., an Eventstream)
2. **Create rules** that define the conditions to detect (e.g., "temperature exceeds 86°F")
3. **Configure actions** that execute when the rule fires (e.g., send an email alert, start a workflow)

### Why it Matters

In any operation involving real-time data, the value of information is time-sensitive. Knowing that a truck's temperature exceeded a safe threshold is only useful if you know it *immediately* — not hours later when the medicines are already spoiled. Activator closes this gap by acting as an always-on monitor that responds the moment conditions change.

### Real-World Scenario

Consider a company delivering **temperature-sensitive medicines**. Trucks carry sensors that continuously send temperature readings to a data stream. Activator can:
- Monitor every temperature reading as it arrives
- Detect when a reading (or sustained average) exceeds the safe range (e.g., 68°F)
- Instantly alert the dispatch team via email or Teams
- Automatically trigger a workflow to initiate a delivery route change

Without Activator, a human would need to manually watch dashboards or run queries — an unreliable and slow approach for time-critical situations.

### Key Real-World Use Cases

| Industry / Role | What Activator Does |
|---|---|
| **Manufacturing operations** | Alert maintenance teams when equipment temperature exceeds safe operating ranges |
| **Supply chain managers** | Notify when shipments deviate from planned routes or experience unexpected delays |
| **Retail managers** | Trigger inventory reorders when stock levels fall below critical thresholds |
| **IT operations teams** | Automatically restart services when performance metrics indicate system degradation |
| **Financial institutions** | Flag unusual transaction patterns for immediate review |
| **Healthcare facilities** | Alert staff when patient monitoring devices detect critical changes |

### Key Points or Rules

- Activator is Fabric's **event detection and rules engine** — it is not a query tool or a visualization tool.
- It operates within the **Real-Time Intelligence** workload.
- The three steps to use Activator are: **Connect data → Create rules → Configure actions**.
- It enables **automated, near-instant responses** to data conditions without human involvement.

---

## 2. Configure Activator for Your Data

### Explanation

Before Activator can evaluate conditions, you must tell it **how to interpret your incoming data**. This involves defining what "things" you want to monitor and what attributes of those things matter. Activator uses the concept of **business objects** to organize this.

### Understanding Business Objects

A **business object** represents a real-world entity you want to monitor. Think of it as a way to give structure to the raw data flowing through your stream.

For a package delivery company, each **package** becomes a business object in Activator. Here is how the three concepts map to real data:

| Concept | Definition | Example |
|---|---|---|
| **Objects** | Individual instances of the thing being monitored | `Package001`, `Package002`, `Package003` |
| **Properties** | Specific data attributes of each instance that you want to monitor | `Temperature`, `City`, `DeliveryState`, `HoursInTransit` |
| **Events** | The actual data values flowing in from your data source | Each sensor reading sent from a truck |

Your data sources continuously send **events** (individual records) that contain values for multiple packages at once. Activator reads these events and automatically:
- **Updates** the property values for existing objects
- **Creates new objects** automatically when a new unique identifier appears in the stream

This means your rules always evaluate against the **most current** data.

### Creating Objects from Eventstreams

The primary way to configure Activator is by connecting it as a **destination in an Eventstream**. The setup steps are:

1. **Configure Activator as a destination** — In your Eventstream, add Activator as an output destination.
2. **Open the Activator** — Navigate to the Activator item that was created.
3. **Choose your unique identifier** — Select the field that uniquely identifies each object (e.g., `PackageId` or `DeviceID`). This is how Activator knows which object each incoming event belongs to.
4. **Select properties** — Choose which data fields from the stream you want to monitor as trackable properties.

**Example setup** for a package delivery Eventstream with fields `PackageId`, `Temperature`, `City`, `DeliveryState`, `HoursInTransit`:
- Use **`PackageId`** as the unique identifier → Activator creates a separate object for each package
- Select **`Temperature`** and **`HoursInTransit`** as the properties to monitor
- `City` and `DeliveryState` can be used for filtering in rules even if not formally monitored as properties

Once configured, the stream continuously feeds data into Activator. Rules can start evaluating conditions as soon as new data arrives.

### Alternative Alerting Approaches

Not all Activator use cases require the full business objects model. The Activator engine also supports three simpler alerting patterns:

| Alerting Approach | How it Works |
|---|---|
| **Dashboard alerts** | Create alerts directly from Real-Time Dashboard visualizations |
| **System event alerts** | Monitor Fabric workspace activities and OneLake file operations |
| **Query alerts** | Create alerts from KQL Queryset results and visualizations |

All three approaches use the **same underlying Activator engine** but interpret data differently than the business objects model — they are simpler to set up but less flexible for complex object-level monitoring.

### Key Points or Rules

- Activator uses **business objects** to organize who/what is being monitored.
- The **unique identifier** field (e.g., `PackageId`) is critical — it tells Activator which object each incoming event belongs to.
- **New unique identifiers** in the stream automatically create **new objects** — no manual setup needed per object.
- Property values always reflect the **most recent event** for that object.
- In addition to the full business objects model, Activator supports **dashboard alerts**, **system event alerts**, and **query alerts** — all using the same engine.

---

## 3. Create Rules in Activator

### Explanation

**Rules** are the heart of Activator. A rule defines:
1. **What to watch** — which property on which object
2. **When to act** — the condition that must be true
3. **What to focus on** — optional filters to narrow which events trigger evaluation

When you create a rule in Activator, a **Definition pane** opens with multiple sections to configure. The three main sections for the rule logic are: **Monitor**, **Condition**, and **Property filter**.

---

### Section 1: Monitor — Choose What to Watch

The **Monitor** section tells Activator which specific data property to observe.

**Step 1 — Select an Attribute:** Choose the property from your event data you want to monitor. For the medicine delivery scenario, you would select **Temperature**.

**Step 2 — Apply Summarization (optional but recommended):** Raw sensor readings can be "noisy" — a single brief temperature spike when a package is moved doesn't necessarily mean a problem. Summarization smooths the data so you act on meaningful trends, not momentary fluctuations.

Available summarization methods:

| Summarization | What it Does | Example Use Case |
|---|---|---|
| **Average** | Smooth out noise by averaging readings over time | Monitor sustained high temperature |
| **Minimum** | Catch the lowest value recorded | Detect dangerous cold drops |
| **Maximum** | Catch the highest value recorded | Detect dangerous heat spikes |
| **Count** | Count how many readings are received | Detect sensor failures (low count = sensor down) |
| **Total** | Sum values when counting events | Count number of delivery exceptions |

**Step 3 — Configure Timing (when using summarization):** Two timing settings control how the summarization window works:

- **Window size** — How much historical data to include in each calculation (e.g., the last 10 minutes of temperature readings)
- **Step size** — How often to recalculate (e.g., every 5 minutes)

**Example:** Instead of reacting to every individual temperature reading, monitor the **average temperature over a 10-minute window**, recalculated every 5 minutes. This catches sustained problems while ignoring brief, harmless fluctuations.

---

### Section 2: Condition — Define When to Act

The **Condition** section sets the exact trigger point — the specific moment when Activator should fire. You select a detection approach that matches the nature of the problem you want to catch:

| Detection Approach | What it Detects | Example |
|---|---|---|
| **Threshold monitoring** | When a value crosses a defined limit | `Temperature is greater than 68°F` |
| **Change detection** | When a value trends in a direction | `Temperature increases above baseline` |
| **Range monitoring** | When a value enters or exits a safe zone | `Temperature goes outside 32°F–68°F` |
| **Missing data** | When no new events arrive for a defined period | `No new events for more than 30 minutes` (indicates sensor failure) |

You also configure two additional condition settings:

- **Value** — The threshold number (e.g., `68` for 68°F)
- **Occurrence behavior** — Controls how often the action fires:
  - **"Every time"** — fires an alert immediately every time the condition is true (good for critical, every-occurrence alerts)
  - **"When it has been true for"** — fires only after the condition has persisted for a defined duration (e.g., "only alert if temperature stays above 68°F for 15 minutes") — reduces noise from brief spikes

---

### Section 3: Property Filter — Focus Your Scope

By default, a rule applies to **every event** flowing through the stream. The **Property filter** section lets you narrow which events trigger evaluation — so you only alert on the events you actually care about.

You can add **up to three filters** combined to create precise targeting.

**Examples of property filters:**
- `ColdChainType equals "medicine"` — only monitor medicine packages, not general cargo
- `City equals "Seattle"` — only monitor packages on Seattle routes
- `Temperature is greater than 68°F` — only evaluate events that already have elevated temperatures

Filters are applied *before* the condition is evaluated, so they reduce unnecessary computation and eliminate irrelevant alerts.

### Key Points or Rules

- A rule has three configuration sections: **Monitor** (what to watch), **Condition** (when to act), **Property filter** (which events to include).
- **Summarization** prevents false alarms from noisy, momentary data spikes.
- **Window size** = how much history is included; **Step size** = how often it recalculates.
- **"Every time"** occurrence fires on every matching event; **"When it has been true for"** requires the condition to persist, reducing false positives.
- **Property filters** narrow rule evaluation to specific subsets of events — up to three filters can be combined.
- The **"Missing data"** condition type is especially useful for detecting sensor failures or data pipeline outages.

---

## 4. Configure Actions in Activator

### Explanation

**Actions** are what Activator executes when a rule's conditions are met. They are the output of the system — turning a detected condition into a real-world response. Without actions, a rule is just a detector; actions are what make Activator a true event-driven automation engine.

Activator offers **four types of actions**, each suited to different response needs:

---

### Action Type 1: Email

**Email actions** send a detailed message to one or more recipients when the rule fires.

- **Best for:** Situations where the recipient needs comprehensive context and can review and respond within hours or days.
- **When to use:** When the issue is important but not critically time-sensitive — for example, a daily summary of delivery delays, or a report of packages that exceeded temperature thresholds overnight.
- **Key characteristic:** Provides rich detail but is not suited for situations requiring an *immediate* response.

---

### Action Type 2: Teams

**Teams actions** send an instant message to a Microsoft Teams channel or a specific individual.

- **Best for:** Situations requiring **quick response and team coordination**.
- **When to use:** When a team needs to immediately discuss and respond to a condition together — for example, alerting a dispatch team the moment a truck's temperature exceeds the safe limit.
- **Key characteristic:** Notifications appear **immediately** in Teams, enabling real-time discussion and coordinated response.

---

### Action Type 3: Power Automate

**Power Automate actions** trigger a flow in Microsoft's workflow automation service, which can connect to and automate actions across many different apps and services.

- **Best for:** **Multi-step business processes** that span multiple systems and would normally require manual work across multiple applications.
- **When to use:** When detecting a condition should set off a chain of automated steps — for example, when a temperature breach is detected: (1) log the event to SharePoint, (2) create a ticket in a CRM system, (3) notify the customer by SMS, (4) reassign the delivery route.
- **Key characteristic:** Power Automate can connect to hundreds of services (Dynamics 365, ServiceNow, Salesforce, etc.) making it ideal for cross-system orchestration.

---

### Action Type 4: Fabric Item Actions

**Fabric item actions** execute a Fabric **data pipeline** or a **notebook** in response to the rule firing.

- **Best for:** Situations where the response to a condition requires **additional data processing or advanced analysis**.
- **When to use:** When a detected condition should trigger a data engineering or data science workload — for example, when a quality threshold is breached, run a notebook to re-analyze the affected batch data and generate a quality report.
- **Key characteristic:** Bridges real-time event detection with batch or analytical processing capabilities in the rest of Fabric.

---

### Choosing the Right Action

| Action Type | Response Speed | Best For |
|---|---|---|
| **Email** | Hours / days | Detailed review, non-urgent issues |
| **Teams** | Immediate | Quick alerts, team coordination |
| **Power Automate** | Immediate → multi-step | Cross-system automation workflows |
| **Fabric item** | Triggered immediately, runs as needed | Additional data processing or analysis |

### Key Points or Rules

- Actions **complete the Activator loop**: data in → rule evaluated → condition met → action triggered.
- **Four action types**: Email, Teams, Power Automate, Fabric item (pipeline or notebook).
- **Email** = detailed, async; **Teams** = immediate, collaborative; **Power Automate** = cross-system multi-step; **Fabric item** = trigger further data processing.
- Once data sources are connected, rules are defined, and actions are configured, Activator runs **fully automatically** — no manual intervention needed.

---

## Summary — The Complete Activator Workflow

```
[Streaming Data Source]
        ↓
[Eventstream] → Configure Activator as a destination
        ↓
[Activator: Configure Data]
  • Define business objects (unique identifier field)
  • Select properties to monitor
        ↓
[Activator: Create Rules]
  • Monitor section: Which property? With what summarization + window?
  • Condition section: Threshold / Change / Range / Missing data?
  • Property filter: Narrow to specific event subsets (up to 3 filters)
        ↓
[Activator: Configure Actions]
  • Email — detailed notification
  • Teams — immediate team alert
  • Power Automate — multi-step cross-system workflow
  • Fabric item — run a pipeline or notebook
        ↓
[Automated Response — No human needed!]
```

### Quick-Reference Summary Table

| Concept | What it Is | Key Detail |
|---|---|---|
| **Activator** | Event detection and rules engine | Part of Real-Time Intelligence in Microsoft Fabric |
| **Business Objects** | Real-world entities being monitored | e.g., packages, devices, customers |
| **Properties** | Data attributes of each object | e.g., Temperature, HoursInTransit |
| **Events** | Incoming data records from the stream | Update object property values in real time |
| **Unique identifier** | Field that distinguishes one object from another | e.g., PackageId, DeviceID |
| **Monitor section** | Defines which property to watch + summarization | Window size + Step size control timing |
| **Summarization** | Aggregates raw readings to reduce noise | Average, Min, Max, Count, Total |
| **Condition section** | Defines when to fire the rule | Threshold / Change / Range / Missing data |
| **Occurrence behavior** | Controls how often the rule fires | "Every time" vs "When it has been true for" |
| **Property filter** | Narrows which events are evaluated | Up to 3 combined filters |
| **Email action** | Sends detailed email to recipients | Use for non-urgent, context-rich notifications |
| **Teams action** | Sends instant Teams message | Use for immediate team response and coordination |
| **Power Automate action** | Triggers multi-step cross-system workflow | Use for complex, multi-application automation |
| **Fabric item action** | Runs a pipeline or notebook | Use to trigger further data processing or analysis |
