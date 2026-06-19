# Study Guide: Continuous Integration and Continuous Delivery (CI/CD) in Microsoft Fabric

This study guide explains how to establish lifecycle management in Microsoft Fabric using version control, deployment pipelines, and API-driven automation for the DP-700 exam.

---

## 1. Fundamentals of CI/CD in Microsoft Fabric

### Conceptual Definitions
*   **Continuous Integration (CI):** The practice of frequently merging code updates into a shared central repository. New contributions are validated by a build process and automated testing, allowing conflicts and bugs to be identified and resolved early in the cycle.
*   **Continuous Delivery (CD):** Following successful CI, code is automatically deployed to a pre-production/staging environment for further verification before final release.
*   **Continuous Deployment:** A fully automated process where verified updates are automatically released into production environments once they pass automated checks.

### Architectural Pillars of Fabric Lifecycle Management
Fabric implements lifecycle management across three distinct tools:
1.  **Git Integration:** Handles version control, branching, and team collaboration.
2.  **Deployment Pipelines:** Coordinates the promotion of items across environment stages (Development $\rightarrow$ Test $\rightarrow$ Production).
3.  **Fabric REST APIs:** Provides the programmatic interface to automate integration and deployment workflows.

### Operational Strategy
Developing directly in a shared, live workspace risks disrupting other team members or overwriting active code. Utilizing isolated development environments ensures developers can work on separate features in parallel without stepping on each other's toes.

---

## 2. Git Integration and Workspace Synchronization

### Version Control Core Configurations
Git integration in Fabric is established at the **workspace level**. 
*   **Supported Repositories:** Fabric natively connects to **GitHub** and **Azure DevOps**.
*   **Synchronization Mechanism:** Connecting a workspace to a Git repository requires selecting a specific branch. Fabric then syncs content between the workspace and the remote branch to ensure alignment.

### Managing Sync States
Once connected, the workspace interface displays a **Git status column** and a source control icon showing the number of differences between the workspace and the repository:
*   **Committing Workspace Changes:** When changes are made directly in the Fabric UI, developers use the **Changes** tab in the Source Control panel to write code updates back to the Git branch.
*   **Updating the Workspace:** When other team members merge commits into the remote Git branch, developers pull those updates into their workspace using the **Updates** tab.

### The "Branch Out" Workflow
To achieve true developer isolation in the Fabric web portal:
1.  Connect a shared development workspace to the repository's `main` branch.
2.  A developer can select **Branch out to new workspace** in the Source Control panel.
3.  Fabric automatically creates a new Git branch and spins up a dedicated, isolated workspace synced to that branch.
4.  The developer works in their private workspace and commits changes to their isolated branch.
5.  In the Git provider (GitHub/DevOps), the developer submits a **Pull Request (PR)** to merge their branch back into `main`.
6.  Once approved and merged, other developers synchronize the shared development workspace to pull in the new code from the main branch.

*Alternative Client Tool Flow:* Developers can develop locally (e.g., using VS Code for Notebooks or Power BI Desktop for reports), clone the repository locally, push changes to their remote Git branch to test in a dedicated workspace, and submit a PR to merge into the main branch.

---

## 3. Implementing Deployment Pipelines

### Workflow Stages
Deployment pipelines automate the transition of Fabric items through three standard stages:
$$\text{Development} \xrightarrow{\text{Deploy}} \text{Test} \xrightarrow{\text{Deploy}} \text{Production}$$
This allows teams to test reports, verify semantic models, and run pipelines in a safe environment before exposing them to business users.

### Configuration Methods
Deployment pipelines can be created by:
*   Selecting the **Workspaces** icon on the left navigation pane and clicking **Deployment pipelines**.
*   Clicking the **Create deployment pipeline** icon at the top of a workspace.

Once created, you assign a specific Fabric workspace to each pipeline stage.

### Content Promotion
Deploying content copies all items from the source workspace to the target workspace (e.g., Development $\rightarrow$ Test). This process clones configurations automatically. A green checkmark in the pipeline stage indicates that the item versions match and the stages are fully synchronized.

---

## 4. Architectural Patterns: Combining Git and Deployment Pipelines

### The Hybrid Pipeline Strategy
To avoid Git synchronization conflicts across multiple environments, a common best practice is to restrict Git connections:
*   **Design Pattern:** Connect **only the Development workspace** to Git.
*   **Execution Flow:** Use Git integration (branches, commits, PRs) to manage and version changes in the Development stage. Once the Development workspace is updated and stable, use the **Deploy** buttons in the Fabric Deployment Pipeline to promote the code to the Test and Production workspaces.
*   **Result:** This keeps Git operations simple and prevents merge or sync conflicts in target staging and production environments.

---

## 5. API-Driven CI/CD Automation

### Purpose of REST APIs
Fabric REST APIs enable teams to integrate Fabric deployments into external orchestration tools (like Azure Pipelines or GitHub Actions), establishing hands-free deployment pipelines.

### Automated Operations
The available Git and Deployment Pipeline REST APIs allow developers to:
*   **Commit Changes:** Automatically push workspace updates to the connected remote branch.
*   **Update Workspace:** Programmatically pull new commits from Git into a workspace.
*   **Check Sync Status:** Use the Git status API to determine which items have incoming changes or uncommitted local edits.
*   **Query Stages:** List all supported items in a workspace assigned to a specific pipeline stage.
*   **Trigger Deployment:** Programmatically execute stage deployments (e.g., deploying from Test to Production after external automated tests pass).
