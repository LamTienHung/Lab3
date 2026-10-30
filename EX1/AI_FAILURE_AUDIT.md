# Lab 03 - Exercise 1
## AI Failure Audit

### 1. Project Information

- **Project:** Semantic Engineer & Pro-Gamer Profile Card
- **Technology:** React 19, Vite, JavaScript, JSX, CSS Modules
- **Main Components:** DeveloperCard, SkillBadge
- **Purpose:** Document development issues, debugging methods, fixes, and verification results.

### 2. Issue 1: Invalid package.json

**Problem:**

During project setup, the development environment could not install dependencies because `package.json` was empty or contained invalid JSON.

**Error:**

`npm ERR! code EJSONPARSE`

**Detection:**

The error appeared in the terminal when running `npm install`.

**Root Cause:**

The `package.json` file did not contain a valid JSON configuration.

**Solution:**

Updated `package.json` with valid project metadata, scripts, and dependencies for React and Vite.

**Verification:**

Successfully executed `npm install` without the previous JSON parsing error.

**Status:** Resolved.

### 3. Issue 2: Invalid Vite Configuration

**Problem:**

The Vite development server failed to start because the configuration file did not export a valid configuration object.

**Error:**

`config must export or return an object`

**Detection:**

The error appeared in the terminal when starting the development server.

**Root Cause:**

The `vite.config.js` file was missing a valid configuration export.

**Solution:**

Updated the configuration to use `defineConfig()` and the React plugin.

**Verification:**

The Vite development server started successfully and displayed its local development address.

**Status:** Resolved.

### 4. Issue 3: Blank React Application

**Problem:**

The browser initially displayed a blank page instead of the developer profile card.

**Detection:**

Opened the application in the browser and observed that no React interface was rendered.

**Root Cause:**

The initial application setup was incomplete, including the HTML entry point and React rendering configuration.

**Solution:**

Updated `index.html` to provide the root element and load `src/main.jsx`.

Configured `src/main.jsx` to render the React application using `createRoot()`.

**Verification:**

The developer profile card appeared successfully in the browser.

**Status:** Resolved.

### 5. Potential AI Failure Modes

The following risks were considered during implementation. They are not recorded as confirmed failures unless testing demonstrates that they occurred.

#### 5.1. Semantic HTML Violation

**Risk:** AI-generated JSX may introduce unnecessary `div` elements.

**Prevention:** Use semantic elements such as `article`, `header`, `section`, `dl`, `dt`, `dd`, `ul`, and `li`.

**Verification Required:** Inspect `DeveloperCard.jsx` and confirm that it contains no `div` elements.

#### 5.2. Unstable React Keys

**Risk:** AI-generated code may use array indexes as keys when rendering skills.

**Prevention:** Assign a stable and unique ID to each skill.

**Implementation:** Use `key={skill.id}`.

**Verification Required:** Confirm that skill IDs are unique and that React does not report key-related warnings.

#### 5.3. Avatar Loading Failure

**Risk:** The avatar image may fail to load or use an unsupported URL.

**Prevention:** Validate the image source, define explicit dimensions, and provide fallback initials.

**Verification Required:** Test the component using an invalid image URL and confirm that initials appear.

### 6. Lessons Learned

1. Validate project configuration files before starting the development server.
2. Use React 19's `createRoot()` API to render the application.
3. Verify the HTML entry point when the browser displays a blank page.
4. Follow semantic HTML requirements when creating React components.
5. Use stable keys when rendering lists.
6. Test responsive layouts and image fallback behavior before submission.
7. Distinguish confirmed development issues from potential AI-generated defects.

### 7. Audit Summary

Three development issues were encountered and resolved:

1. Invalid `package.json`.
2. Invalid `vite.config.js`.
3. Blank React application.

The application subsequently rendered successfully.

These issues are documented as development and configuration problems. Their direct attribution to AI-generated code has not been independently established.

Additional checks for semantic HTML, responsive behavior, accessibility, and avatar fallback will be completed during final testing.