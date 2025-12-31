# Hospital Information System - UI/UX Plan

## 1. Design Philosophy
- **Framework**: Naive UI (Vue 3)
- **Style**: clean, minimal, clinical but friendly.
- **Typography**: Inter / System Sans-Serif.
- **Theme**: Light mode default, support for Dark mode.
- **Primary Color**: Naive UI Green (Medical feel).

## 2. Layout Structure
A standard Admin Dashboard layout using `n-layout`, `n-layout-sider`, and `n-layout-header`.

### Main Layout Wireframe
```text
+---------------------------------------------------------------+
| [Logo] HIS App             [Global Search]   [User Profile] v |  <-- n-layout-header
+------------------+--------------------------------------------+
|                  |                                            |
| [Sidebar Menu]   | [ Toolbar Component (Sticky)             ] |  <-- n-page-header / Toolbar
|                  | +----------------------------------------+ |
| - Dashboard      | |                                        | |
| - Doctors        | |  [ Main Content Area (Router View) ]   | |  <-- n-layout-content
| - Patients       | |                                        | |
|   - List         | |                                        | |
|   - Registration | |                                        | |
| - Settings       | |                                        | |
|                  | +----------------------------------------+ |
|                  |                                            |
|                  |                                            |
| [Collaspse <]    |                                            |
+------------------+--------------------------------------------+
```

## 3. Navigation & Stepper Strategy
For the **Patient Detail** view sections (History, Vitals, Exams, etc.), we will use a **Vertical Stepper** (`n-steps` with `vertical` prop) acting as a navigation menu. This visually guides the workflow from admission to discharge.

### Patient Workflow Steps:
1.  **Registration** (Patient Details)
2.  **Medical History**
3.  **Vital Signs**
4.  **Examination** (Physical & Diagnosis)
5.  **Recommendation** (Disposition/Transfer)
6.  **Treating Doctor** (Assignment)
7.  **Comments**

## 4. Screen Wireframes

### A. Patient List View
Using `n-data-table` for rich interactions.

```text
+------------------------------------------------------------------+
| Patients Registry                                     [+ New Pat]|
+------------------------------------------------------------------+
| [ Search patient... (CTRL+K) ]  [Filter v]  [Date Range v]       |
+------------------------------------------------------------------+
| Name            | MR Number | Sex | Age | Ward | Status | Action |
+-----------------+-----------+-----+-----+------+--------+--------+
| John Doe        | MR-00123  | M   | 45  | ICU  | Admitted | [Edit] |
| Jane Smith      | MR-00124  | F   | 32  | Gen  | Disch... | [Edit] |
| ...             | ...       | ... | ... | ...  | ...      | ...    |
+---------------------------------+-----+-----+------+--------+--------+
| <  1  2  3  ... 10  >  [10/page v]                    Total: 154 | -- n-pagination
+------------------------------------------------------------------+
```

### B. Patient Detail Workspace (The Stepper Layout)
This is the main workspace for doctors/nurses.
Uses `n-grid` or `n-layout` to separate the Navigation (Stepper) from the Form Area.

```text
+-----------------------------------------------------------------------+
| < Back  |  Patient: John Doe (MR-00123) - Male, 45y  |  [Save] [Print]|
+-----------------------------------------------------------------------+
|                  |                                                    |
|  [ STEPPER NAV ] |  [ FORM AREA - Dynamic Component ]                 |
|                  |                                                    |
|  (O) 1. Register |  ## 3. Vital Signs                                 |
|   |              |                                                    |
|  (O) 2. History  |  +---------------------------+  +----------------+ |
|   |              |  | Pulse Rate (/min)         |  | BP (mmHg)      | |
|  (●) 3. Vitals   |  | [ 82                    ] |  | [ 120/80     ] | |
|   |              |  +---------------------------+  +----------------+ |
|  ( ) 4. Exams    |                                                    |
|   |              |  +---------------------------+  +----------------+ |
|  ( ) 5. Recs     |  | Resp. Rate (/min)         |  | Temp (°C)      | |
|   |              |  | [ 18                    ] |  | [ 36.5       ] | |
|  ( ) 6. Doctors  |  +---------------------------+  +----------------+ |
|   |              |                                                    |
|  ( ) 7. Comments |  +---------------------------+  +----------------+ |
|                  |  | SpO2 (%)                  |  | GCS (3-15)     | |
|                  |  | [ 98                    ] |  | [ 15         ] | |
|                  |  +---------------------------+  +----------------+ |
|                  |                                                    |
|                  |  [ Historical Chart Button ]                       |
|                  |                                                    |
|                  |  (Previous Vitals History Table...)                |
|                  |  ...                                               |
|                  |                                                    |
|                  |      [ < Previous Step ]    [ Save & Next > ]      |
+------------------+----------------------------------------------------+
```

### C. Examination Form
Focus on large text areas for clinical notes.

```text
+-----------------------------------------------------------------------+
| ... (Stepper on Left) ...                                             |
|                  |  ## 4. Examination & Diagnosis                     |
|                  |                                                    |
|                  |  Physical Examination                              |
|                  |  +----------------------------------------------+  |
|                  |  | [Textarea - n-input type="textarea"]         |  |
|                  |  |                                              |  |
|                  |  +----------------------------------------------+  |
|                  |                                                    |
|                  |  Diagnosis                                         |
|                  |  +----------------------------------------------+  |
|                  |  | [Textarea]                                   |  |
|                  |  +----------------------------------------------+  |
|                  |                                                    |
|                  |  Treatment Plan                                    |
|                  |  +----------------------------------------------+  |
|                  |  | [Textarea]                                   |  |
|                  |  +----------------------------------------------+  |
|                  |                                                    |
+------------------+----------------------------------------------------+
```

### D. Doctor Recommendation (Radio & Toggles)
Using `n-radio-group` or `n-switch` for quick boolean decisions.

```text
+-----------------------------------------------------------------------+
| ... (Stepper on Left) ...                                             |
|                  |  ## 5. Doctor Recommendations                      |
|                  |                                                    |
|                  |  [?] Request Repatriation?    ( ) Yes  (●) No      |
|                  |                                                    |
|                  |  [?] Requires Evacuation?     ( ) Yes  (●) No      |
|                  |                                                    |
|                  |  [?] Fit to Fly?              (●) Yes  ( ) No      |
|                  |                                                    |
|                  |  Notes / Justification                             |
|                  |  +----------------------------------------------+  |
|                  |  |                                              |  |
|                  |  +----------------------------------------------+  |
+------------------+----------------------------------------------------+
```

## 5. Component Mapping (Naive UI)

| Logical Component | Naive UI Component | Notes |
|-------------------|-------------------|-------|
| Main Container | `n-config-provider`, `n-message-provider` | Wrapper for theme and popups |
| Sidebar | `n-layout-sider`, `n-menu` | Collapsible sidebar |
| Navigation Tabs | `n-steps` (vertical) | Used in Patient Detail |
| Data Tables | `n-data-table` | Pagination, Sorting included |
| Forms | `n-form`, `n-form-item`, `n-input` | With Zod validation |
| Date Inputs | `n-date-picker` | |
| Selects | `n-select` | For Enums (Sex, Ward) |
| Dialogs | `n-modal` | Confirms, Quick Actions |
| Notifications | `n-use-message` | Toasts for save success |
| Icons | `@vicons/ionicons5` | Standard icon set |

## 6. UX Interaction Plan
1.  **Tab Navigation**:
    *   Clicking a Step in the left stepper navigates to that section without reloading the page (client-side routing or dynamic component switching).
    *   Validation errors in a specific step show a visual error indicator on the step icon.
2.  **Autosave**:
    *   Debounced save on text inputs for "History" and "Examination" forms to prevent data loss.
    *   Manual "Save" button always available in Toolbar.
3.  **Keyboard Shortcuts**:
    *   `Ctrl+S`: Save current form.
    *   `Ctrl+K`: Focus global search.
    *   `Alt+N`: New Patient.
