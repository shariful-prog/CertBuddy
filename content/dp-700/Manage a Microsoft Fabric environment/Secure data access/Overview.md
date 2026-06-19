# Study Guide: Secure Data Access in Microsoft Fabric

This study guide explains the multi-layered security model in Microsoft Fabric. It covers workspace roles, item permissions, granular T-SQL security, and OneLake security roles to implement the principle of least privilege.

---

## 1. The Architectural Security Pipeline

### Three Levels of Access Evaluation
When a user attempts to query data in Microsoft Fabric, access is evaluated sequentially across three levels:

```
[1. Entra ID Authentication] ──► [2. Fabric Platform Access] ──► [3. Data Security Evaluation]
```

1.  **Microsoft Entra ID Authentication:** Verifies the user's identity and checks if they can log in to the organization's tenant.
2.  **Fabric Platform Access:** Confirms the user has a valid Fabric license and permission to access the Fabric workspace portal.
3.  **Data Security:** Checks whether the user is authorized to perform the requested operation (read, write, delete) on a specific table, folder, or file.

### Data Security Layers
The third level (Data Security) is controlled by four cooperating layers, starting from broad access down to row-level granular rules:
*   **Workspace Roles:** Apply broad administrative or read/write access across all items in a workspace.
*   **Item Permissions:** Control sharing and capabilities for a single specific item (e.g., sharing one Lakehouse instead of the whole workspace).
*   **Compute Permissions:** Restrict access inside a specific query engine (such as the SQL analytics endpoint or semantic model).
*   **OneLake Security:** Controls data access *within* an item (e.g., restricting access to specific tables or folders across Spark, SQL, and APIs).

---

## 2. Coarse-Grained Workspace Roles

### The Four Roles & Permissions
Workspace roles are the starting point for team collaboration. They can be assigned to individual users, Entra ID security groups, Microsoft 365 groups, or distribution lists.

*   **Admin:** Full control. Can create, view, modify, share, delete, and manage all content, data, and permissions in the workspace.
*   **Member:** Can create, view, modify, and share all content and data. Cannot manage workspace permissions.
*   **Contributor:** Can create, view, and modify all content and data. Cannot share items or manage permissions.
*   **Viewer:** Can view the list of items in the workspace but cannot modify them.
    *   *The Viewer Limitation:* By default, the Viewer role grants access to view item metadata in the UI, but **no access to the underlying data stored in OneLake**. To grant a Viewer access to specific folders or tables, you must explicitly configure OneLake security roles.

### Operational Selection
Use **workspace roles** when team members need broad, ongoing collaboration access across all files and items in a project. For example, a data engineer building pipelines needs the **Contributor** role to create and edit multiple items without administrative privileges.

---

## 3. Sharing via Item-Level Permissions

### The Least Privilege Sharing Filter
When a user only needs access to one or two specific items rather than everything in a workspace, remove them from the workspace roles and share the target item directly.

### Lakehouse Sharing Permissions
When sharing a Lakehouse, the **Read** permission is granted automatically. You can optionally grant three additional permissions:
1.  **Read:** Allows the recipient to see the Lakehouse metadata in the portal and view associated reports. It does *not* grant direct access to underlying data files in OneLake or the SQL analytics endpoint.
2.  **Read all SQL endpoint data:** Grants permission to query all tables in the lakehouse using T-SQL via the SQL analytics endpoint.
3.  **Read all Apache Spark and subscribe to events:** Grants permission to read lakehouse data through Apache Spark and OneLake APIs.
    *   *System Action:* Selecting this option automatically adds the user to the Lakehouse's default `DefaultReader` OneLake security role.
4.  **Build reports on the default semantic model:** Grants permission to build custom Power BI reports on top of the default semantic model.

---

## 4. Granular Security: SQL Endpoint vs. OneLake Security Roles

Depending on how users connect to and query lakehouse data, security administrators must apply different granular restriction models:

```
                  ┌──────────────────────────────┐
                  │ How is data being accessed?  │
                  └──────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [SQL Analytics Endpoint]          [Spark / OneLake APIs]
                 │                               │
        (T-SQL Commands)               (OneLake Security Roles)
      GRANT / DENY / REVOKE              Data, Perms, Constraints
```

### Granular Compute Security (T-SQL)
When users access data via the SQL Analytics endpoint using T-SQL, security is enforced using standard T-SQL Data Control Language (DCL) commands:
*   **DCL Commands:** `GRANT`, `DENY`, and `REVOKE` can be applied to specific tables and views.
*   **Advanced Policies:** You can implement Row-Level Security (RLS) to restrict rows, Column-Level Security (CLS) to hide columns, and Dynamic Data Masking (DDM) to obfuscate sensitive fields.

### Universal Granular Security (OneLake Security Roles)
OneLake security uses a Role-Based Access Control (RBAC) model. Unlike compute-specific T-SQL security, OneLake security roles are enforced **consistently across all compute engines** (Spark, SQL, and OneLake APIs).
*   **Target Audience:** OneLake security roles only restrict users who have the **Viewer** workspace role or basic **Read** item permissions. Workspace Admins, Members, and Contributors bypass these roles and always have full read/write access to all OneLake data.
*   **Management:** Only users with workspace **Admin** or **Member** roles can create or modify OneLake security roles.

---

## 5. OneLake Security Roles: Components and Pitfalls

### The Four Components of a OneLake Role
Every OneLake security role consists of:
1.  **Data:** The specific tables or folders in OneLake that the role has access to.
2.  **Permission:** The level of access allowed (either **Read** to view files, or **ReadWrite** to view and edit data in specific tables/folders without having workspace-wide write roles).
3.  **Members:** The users, groups, or service principals assigned to the role.
4.  **Constraints:** Optional row-level or column-level filters to restrict data visibility further.

### How to Create a OneLake Security Role
1.  Open the lake view of the lakehouse and select **Manage OneLake security** from the ribbon.
2.  Select **New role**, enter a name, and choose the permission type (**Read** or **ReadWrite**).
3.  Select the specific tables or folders to grant access to, then save.
4.  Edit the role to add members and optional row/column constraints.

### The DefaultReader Pitfall
Every new Lakehouse includes a default OneLake security role named `DefaultReader` which grants read access to all data.
*   **Critical Rule:** When sharing a Lakehouse with the *Read all Apache Spark and subscribe to events* permission, the user is added to `DefaultReader`. If you subsequently want to restrict that user using a custom OneLake security role, you **must remove them from the DefaultReader role**. If you do not, their membership in `DefaultReader` will override the custom restrictions and grant them full read access to all data.
