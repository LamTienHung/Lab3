# EX2 – AI Failure Audit

## 1. Project Information

**Exercise:** EX2 – Interactive Scientist & Pioneer Directory

**Technology:** React, Vite, JavaScript, CSS

**Purpose:** Document development issues, their causes, corrective actions, and lessons learned during the implementation of EX2.

## 2. Development Issue 1: PowerShell Execution Policy

**Problem:**

Running `npm install` failed because Windows PowerShell blocked the execution of `npm.ps1`.

**Error Message:**

`npm.ps1 cannot be loaded because running scripts is disabled on this system.`

**Root Cause:**

The PowerShell execution policy prevented the npm PowerShell script from running.

**Resolution:**

Used `npm.cmd install` instead of `npm install` to execute npm without modifying the system execution policy.

**Lesson Learned:**

Development environment restrictions should be checked before modifying project configuration.

## 3. Development Issue 2: Missing package.json

**Problem:**

The dependency installation failed because npm could not locate `package.json` inside the EX2 directory.

**Error Message:**

`ENOENT: no such file or directory, open 'EX2/package.json'`

**Root Cause:**

The EX2 directory existed, but the Vite project had not been initialized successfully.

**Resolution:**

Initialized Vite directly inside the existing EX2 directory using:

`npm.cmd create vite@latest . -- --template react`

Then installed the dependencies.

**Lesson Learned:**

A project directory must contain a valid `package.json` before npm can install its dependencies.

## 4. Development Issue 3: Missing SVG Imports

**Problem:**

After removing the default Vite assets, the application failed to compile.

**Error Message:**

`Failed to resolve import "./assets/react.svg" from "src/App.jsx".`

**Root Cause:**

The default SVG files were deleted while `App.jsx` still referenced them.

**Resolution:**

Replaced the default Vite component with the EX2 application component and removed unused asset imports.

**Lesson Learned:**

Before deleting an asset, verify whether it is still referenced by the application.

## 5. Development Issue 4: Scientist Card Styling

**Problem:**

Scientist records initially appeared without the intended card styling and information alignment.

**Root Cause:**

The rendered markup and CSS selectors were not fully aligned during development.

**Resolution:**

Verified the `scientist-card` and `scientist-grid` class names, then improved the responsive CSS layout.

**Lesson Learned:**

CSS selectors must match the component markup, and visual changes should be tested at multiple viewport sizes.

## 6. AI Assistance and Verification

AI assistance was used to suggest React components, state management logic, CSS styling, and troubleshooting steps.

All suggested changes were reviewed and tested in the local development environment.

The issues documented above were encountered during AI-assisted development. They are not automatically attributed to incorrect AI-generated code.

## 7. Conclusion

The development issues were resolved through debugging, code review, and local testing.

The exercise demonstrates the importance of verifying AI-assisted suggestions, maintaining consistency between React components and CSS, and testing application behavior before submission.