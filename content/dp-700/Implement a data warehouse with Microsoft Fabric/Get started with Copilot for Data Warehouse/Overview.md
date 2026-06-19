## 1. Introduction to Copilot in Fabric Data Warehouse

### Explanation

Copilot in Microsoft Fabric applies advanced artificial intelligence to data warehousing tasks. It acts as an AI assistant integrated directly into the Data Warehouse workload, capable of generating T-SQL queries, providing inline code completions, explaining existing code, fixing query errors, and retrieving information based on your data warehouse's specific schema and metadata.

### Why it Matters

Interacting with data warehouses traditionally requires writing complex SQL queries from scratch. Copilot simplifies these tasks by enabling a natural language interface, which:

- Boosts developer productivity by automating routine code writing.
- Lowers the barrier to entry for beginners learning T-SQL.
- Helps experienced professionals focus on query design, performance optimization, and architectural decisions rather than repetitive typing.

### Where it is Used

Copilot is used within the Microsoft Fabric **Data Warehouse** workload, primarily inside the SQL query editor and the Copilot chat pane.

### Key Points or Rules

- **Schema-Awareness:** Copilot uses the schema (tables, views, columns, relationships) and metadata of the active warehouse to tailor its responses and query generation.
- **T-SQL Focus:** It is specifically optimized to output and work with Transact-SQL (T-SQL) code.

---

## 2. Prerequisites for Using Copilot

### Explanation

Before you can use Copilot in Microsoft Fabric, specific tenant settings, region restrictions, and licensing configurations must be met.

### Why it Matters

Without meeting these prerequisites, the Copilot features will not appear or function in the Fabric workspace, leading to unexpected errors or missing UI elements.

### Key Points or Rules

- **Tenant Switch:** The Fabric Administrator must enable the Copilot tenant switch in the Admin portal.
- **Supported Capacity/Licensing:**
  - Requires a paid capacity of **F2 or higher** (Fabric capacity) or a **P SKU** (Premium capacity).
  - **Trial SKUs are NOT supported** for Copilot.
- **Geographic/Region Limits:** The Fabric capacity must reside in a supported region. If tenant settings restrict data processing to specific geographic regions, permissions to process data across regions/cross-geography must be explicitly enabled.
- **Workspace Assets:** You must have an active warehouse created inside your Fabric workspace. (For practice, Microsoft provides a **sample warehouse**).

---

## 3. Copilot Code Completion (Inline Suggestions)

### Explanation

Code completion provides real-time, context-based T-SQL suggestions directly inside the SQL query editor. As you type, Copilot analyzes the characters written and the surrounding query context to suggest the next word, line, or block of code.

### Why it Matters

Writing boilerplate SQL and long table/column names is time-consuming and prone to typos. Inline completions speed up the coding process, reduce repetitive keystrokes, and help maintain syntax accuracy.

### Where it is Used

Directly inside the **SQL Query Editor** of your Fabric Data Warehouse.

### Key Points or Rules

- **Enabling Code Completion:**
  1. Open your warehouse **Settings**.
  2. Select the **Copilot** pane.
  3. Ensure the option **Show Copilot completions** is turned on.
  4. Alternatively, you can verify if completions are active by checking the status bar at the bottom of the query editor.
- **Accepting Suggestions:** Suggestions appear as dimmed "ghost text".
  - Press **Tab** to accept the entire suggested code block.
  - Continue typing to ignore/dismiss the suggestion.
  - Press **Ctrl + Right Arrow** (**Cmd + Right Arrow** on macOS) to accept only the next word of the suggestion.
- **Alternative Suggestions:** Copilot may have multiple solutions for the same input. Hover over the ghost text suggestion to preview and select alternative options.
- **Comment-Driven Completion:** You can explicitly prompt Copilot to write a query by leaving a comment using `--`.
  - _Example:_ Writing `-- What is the distribution of trips by hour on working days?` prompts Copilot to write the matching T-SQL query on the next line.

---

## 4. Copilot Chat Pane

### Explanation

The Copilot Chat Pane is a side panel in the Fabric user interface that provides a conversational interface. Users can interact with Copilot using natural language to ask general data warehousing questions, ask about the current warehouse schema, write queries, explain code, or fix errors.

### Why it Matters

Instead of looking up documentation or manually debugging syntax errors, developers can converse with Copilot in a multi-turn dialogue. The conversational memory allows users to refine and build queries iteratively.

### Where it is Used

Accessed by clicking the **Copilot** button on the ribbon inside the Data Warehouse workload.

### Key Points or Rules

- **How to Start:**
  1. Open a Fabric warehouse.
  2. Open a new SQL query tab.
  3. Click the **Copilot** button on the ribbon to toggle the side chat pane.
  4. Select a starter prompt or type your own question.
- **Conversation History & Context:** The chat pane retains context across messages in a single session. You can refer back to previous answers or queries in follow-up prompts (e.g., "now rewrite that query to use a CTE") without re-explaining the entire task.
- **Advanced Slash (/) Commands:** To perform specific tasks efficiently, prefix your prompt with a slash command:

| Command         | Description                                                                                   | Example Usage                                                        |
| :-------------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| `/generate-sql` | Generates a T-SQL query based on the prompt description.                                      | `/generate-sql select numbers 1 through 10`                          |
| `/explain`      | Analyzes and explains the query currently open in the active query tab.                       | `/explain`                                                           |
| `/fix`          | Identifies and fixes errors in the active query tab. You can optionally supply extra context. | `/fix using CTAS instead of ALTER TABLE`                             |
| `/question`     | Answers general conceptual or technical questions with a natural language response.           | `/question what types of security are supported for this warehouse?` |
| `/help`         | Displays help, documentation, and guidance for using Copilot.                                 | `/help`                                                              |

---

## 5. Copilot Quick Actions

### Explanation

Quick actions are one-click, AI-powered buttons located directly in the SQL query editor. Instead of opening the chat pane and typing a manual prompt, you can use these shortcuts to immediately explain or fix queries.

### Why it Matters

Quick actions streamline common developer workflows. They minimize mouse clicks and typing, allowing developers to quickly debug errors and understand unfamiliar legacy code.

### Where it is Used

Located at the top of the **SQL Query Editor**, near the **Run** button.

### Key Actions

1. **Explain:** Generates a high-level summary at the top of the query and inserts inline comments throughout the code explaining each line's logic.
   - _Rule:_ You must highlight the specific portion of the query you want explained (or highlight the entire query) before clicking the **Explain** button.
2. **Fix:** Automatically resolves syntax or logic errors in the query.
   - _Rule:_ The **Fix** button is disabled until you run a query and it returns an execution error. Once it fails, the button becomes active, and clicking it sends the query along with the SQL error message to Copilot to generate a corrected version.

### Walkthrough Example

Consider a SQL query generated from a view called `vw_PaymentAnalysis`:

```sql
CREATE VIEW [dbo].[vw_PaymentAnalysis] AS
SELECT PaymentType, COUNT(T.PaymentType) AS PaymentsCount, SUM(TotalAmount) AS TotalAmountProcessed
FROM dbo.Trip AS T
JOIN dbo.[Date] AS D ON T.[DateID] = D.[DateID]
WHERE YEAR(D.[Date]) = 2013
GROUP BY PaymentType
```

Highlighting this query and selecting the **Explain** quick action updates the editor with inline explanations generated by Copilot:

- Identifies that it creates a view named `vw_PaymentAnalysis` to analyze payment data.
- Explains the SELECT clause (selecting the payment type, counting payments, summing processed amounts).
- Explains the JOIN operation (joining `Trip` and `Date` tables on `DateID`).
- Explains the WHERE filter (filtering records to the year 2013).
- Explains the GROUP BY clause (aggregating counts and sums by `PaymentType`).

---

## 6. Best Practices for Using Copilot

### Explanation

To get the most accurate, contextually relevant, and functional code from Copilot, you must structure your database schema and write prompts in a way that aligns with how large language models interpret context.

### Why it Matters

Writing vague prompts, using cryptic table/column names, or having a poorly defined schema makes it difficult for Copilot to infer relationships, often leading to incorrect joins, syntax errors, or hallucinated column names.

### Key Points or Rules

- **Be Clear and Concise:** Avoid overly complex or ambiguous natural language. Break down complicated requests into simpler, sequential questions.
- **Use Meaningful Object Names:** Use expressive and descriptive names for tables, views, and columns in your data warehouse schema. This helps Copilot understand what data resides in which columns.
- **Provide Explicit Context:** Tell Copilot exactly which columns to select, which aggregations to perform (e.g., SUM vs. AVG), and what filters to apply. Align your prompt terminology with actual database names.
- **Establish Model Relationships:** Define primary key-foreign key relationships in the **Model View** of your warehouse. This allows Copilot to write accurate `JOIN` statements automatically.
- **Utilize Inline Comments (`--`):** For complex logic, write comments in your SQL editor before asking Copilot to generate code. This guides the AI on your step-by-step query design.
- **Language Support:** Currently, natural language-to-SQL translation is optimized and supported for **English to T-SQL**. Write all prompts in English for best results.
- **Validate Results:** Copilot is an assistant. Always run, review, and test the generated T-SQL queries to ensure technical accuracy and performance.
