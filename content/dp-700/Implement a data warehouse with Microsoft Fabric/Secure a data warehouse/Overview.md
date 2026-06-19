# DP-700 Study Guide: Secure a data warehouse

This study guide explains the security layers, data protection mechanisms (DDM, RLS, CLS), granular SQL permissions, and access patterns used to secure a Microsoft Fabric Data Warehouse.

---

## 1. Security Layers in a Fabric Warehouse

### Explanation
Securing a data warehouse requires a defense-in-depth approach. Microsoft Fabric implements security across multiple layers, starting from workspace access down to individual table rows and data cells.

### Why it Matters
A single access control is insufficient for protecting enterprise environments. Multiple security layers ensure that users can only access the specific assets and data rows required for their job functions, preventing data leaks.

### Key Security Layers
* **Workspace Roles:** Admin, Member, Contributor, and Viewer. These control who can manage, edit, or view items within the Fabric workspace itself and act as the first line of defense.
* **Item Permissions:** Warehouse-level permissions that allow sharing individual data warehouses for downstream reporting without granting broad workspace access.
* **Data Protection (Focus of this guide):** Fine-grained controls configured using T-SQL commands at the object, column, and row levels.
* **Audit Logs:** SQL audit logs capture all logins, queries, and permission changes. Accessible through Microsoft Purview and PowerShell.
* **Encryption:** Data in the warehouse is encrypted at rest by default using Microsoft-managed keys. Customers can optionally configure Customer-Managed Keys (CMK) via Azure Key Vault for greater control.

---

## 2. Dynamic Data Masking (DDM)

### Explanation
Dynamic Data Masking (DDM) obscures column values in query results without modifying the underlying stored data. Masking is applied in real-time as queries execute, replacing sensitive values with dummy formats for nonprivileged users.

### Why it Matters
DDM protects sensitive fields (e.g., credit cards, email addresses, salaries) from unauthorized exposure in query results, while allowing applications and analysts to query tables normally without altering database schemas.

### Key Points or Rules
* **Privileged Users:** Users with the `CONTROL` permission (Workspace Admins, Members, and Contributors) always see the unmasked values.

#### Masking Types

| Masking Type | Function Syntax | Result Example |
| :--- | :--- | :--- |
| **Default** | `default()` | Replaces values based on data type (numbers become `0`, strings become `XXXX`, dates become `1900-01-01`). |
| **Email** | `email()` | Exposes the first character of the email and appends a fixed `.com` suffix (e.g., `j*****@contoso.com`). |
| **Custom Text** | `partial(prefix, padding, suffix)` | Exposes a specified number of characters at the start and end, with custom padding (e.g., `partial(0,"XXX-XXX-",4)` for phone numbers). |
| **Random** | `random(low, high)` | Replaces numeric or binary values with a random number within a defined boundary. |

#### T-SQL Configuration Examples
* **Applying a Mask:**
  ```sql
  ALTER TABLE Customers ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()');
  ALTER TABLE Customers ALTER COLUMN CreditCardNumber ADD MASKED WITH (FUNCTION = 'partial(0,"XXXX-XXXX-XXXX-",4)');
  ```
* **Removing a Mask:**
  ```sql
  ALTER TABLE Customers ALTER COLUMN Email DROP MASKED;
  ```

#### Permissions and Security Warnings
* **GRANT UNMASK:** Gives non-admin users permission to view the real, unmasked data:
  ```sql
  GRANT UNMASK ON dbo.Customers TO [user@contoso.com];
  ```
* **ALTER ANY MASK:** Gives a user (e.g., a data engineer) permission to add or remove column masks without granting them admin status.
* **REVOKE UNMASK:** Revokes access to unmasked data:
  ```sql
  REVOKE UNMASK ON dbo.Customers FROM [user@contoso.com];
  ```
* **Caution (Side-Channel Vulnerability):** DDM hides the output value but does not prevent queries on the column. An unprivileged user could guess values using filtered queries (e.g., writing a query that divides by `Salary` only when `Salary = 50000`, causing a divide-by-zero error if correct).

---

## 3. Row-Level Security (RLS)

### Explanation
Row-Level Security (RLS) restricts access to table rows based on the executing user's identity. Instead of writing separate views or filtering data in application layers, RLS enforces query-time row filtering natively inside the database engine.

### Why it Matters
Ensures multiple users can query the exact same table (e.g., a shared `Sales` table) but only see rows that belong to their department, region, or login identity.

### Key Points or Rules
RLS relies on two primary components:
1. **Filter Predicates:** An inline table-valued function (iTVF) that evaluates each row and returns `true` or `false`.
   * *Rule:* Rows returning `false` are filtered out and invisible for `SELECT`, `UPDATE`, and `DELETE` operations. **`INSERT` operations are not affected by filter predicates.**
2. **Security Policies:** A policy object that binds the filter predicate to the target database table.

#### T-SQL Configuration Example
1. **Define the Predicate Function:**
   ```sql
   CREATE SCHEMA [Sec];
   GO

   CREATE FUNCTION sec.tvf_SecurityPredicateBySalesPerson(@SalesPerson AS NVARCHAR(50))
   RETURNS TABLE
   WITH SCHEMABINDING
   AS
   RETURN
       SELECT 1 AS result
       WHERE @SalesPerson = USER_NAME() 
          OR USER_NAME() = 'salesadmin@contoso.com';
   GO
   ```
2. **Create and Activate the Security Policy:**
   ```sql
   CREATE SECURITY POLICY sec.SalesPolicy
   ADD FILTER PREDICATE sec.tvf_SecurityPredicateBySalesPerson(SalesPerson)
   ON [dbo].[Sales]
   WITH (STATE = ON);
   GO
   ```
3. **Disabling a Policy:** Set `STATE = OFF` within the security policy definition.

#### Security Considerations
* **Admin Enforcement:** RLS applies to all users—**including workspace Admins, Members, and Contributors**. If your TVF predicate doesn't explicitly exempt admin accounts, those administrators will also have their rows filtered.
* **Vulnerability:** RLS can be vulnerable to side-channel query attacks. Combine RLS with CLS and DDM to mitigate this risk, and restrict the `ALTER ANY SECURITY POLICY` permission to trusted engineers.

---

## 4. Column-Level Security (CLS)

### Explanation
Column-Level Security (CLS) restricts access to specific columns in a table. If a user attempts to select a restricted column, the database engine returns a permission error.

### Why it Matters
Allows databases to host sensitive attributes (e.g., patient medical history or employee SSNs) in shared tables. Normal users can query the table for other columns, while sensitive fields remain protected.

### Key Points or Rules
* **Configuration Approach:**
  1. Create database roles.
  2. Grant `SELECT` permissions on the table to those roles.
  3. Explicitly `DENY` access to specific columns for the restricted roles.

#### T-SQL Configuration Example
```sql
-- Create role
CREATE ROLE Receptionist AUTHORIZATION dbo;
GO

-- Grant broad SELECT access
GRANT SELECT ON dbo.Patients TO Receptionist;
GO

-- Explicitly deny access to the sensitive MedicalHistory column
DENY SELECT ON dbo.Patients (MedicalHistory) TO Receptionist;
GO
```

* **Direct Lake Fallback in Power BI (CRITICAL):**
  * When Power BI accesses a Fabric warehouse in **Direct Lake** mode, if a table has column-level security (CLS) applied, queries automatically fall back to **Direct Query** mode. Security is still enforced, but the dataset will lose the high-performance benefits of Direct Lake.

---

## 5. Granular SQL Permissions

### Explanation
Granular permissions provide control over specific database objects, columns, and execution procedures using standard SQL commands (`GRANT`, `DENY`, `REVOKE`).

### Why it Matters
Ensures the database adheres to the **principle of least privilege**, minimizing security risks from compromised credentials or accidental modifications.

### Key Points or Rules
* **Table and View Permissions:** `SELECT` (read), `INSERT` (add), `UPDATE` (modify), and `DELETE` (remove).
* **Function and Stored Procedure Permissions:**
  * `EXECUTE`: Allows users to run the procedure or function.
  * `ALTER`: Allows users to modify the object's definition.
  * `CONTROL`: Provides full ownership rights over the object.
* **Conflict Resolution:** If a user is mapped to multiple roles where one grants a permission and another denies it, **`DENY` always overrides `GRANT`**.
* **Access Patterns:** For robust security, restrict direct table access and instead grant `EXECUTE` permissions on stored procedures that control how data is read or written.

#### SQL Granular Permission Examples
```sql
-- Grant read access on a specific report table
GRANT SELECT ON dbo.SalesReport TO [alice@contoso.com];

-- Deny access to the payroll table
DENY SELECT ON dbo.Payroll TO [alice@contoso.com];

-- Grant execution rights on a stored procedure
GRANT EXECUTE ON dbo.usp_GetSalesData TO [bob@contoso.com];
```
