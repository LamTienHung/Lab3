# EX2 – Project Rules

## 1. Project Overview

**Project Name:** Interactive Scientist & Pioneer Directory

**Technology Stack:**
- React
- Vite
- JavaScript (JSX)
- CSS
- ESLint

**Project Objective:**

Build an interactive scientist directory that allows users to search, filter, sort, delete, and reset scientist records using React components and state management.

## 2. Project Structure

```text
EX2/
├── public/
├── src/
│   ├── components/
│   │   └── ScientistCard.jsx
│   ├── data/
│   │   └── scientists.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── TASK_DECOMPOSITION.md
├── project-rules.md
├── AI_FAILURE_AUDIT.md
├── package.json
└── vite.config.js
```

## 3. Component Rules

- Use functional React components.
- Keep components reusable and focused on a single responsibility.
- Use `ScientistCard` to display individual scientist records.
- Pass scientist information through props.
- Use unique and stable IDs as React keys.
- Avoid directly modifying props.

## 4. State Management Rules

- Use React `useState` to manage interactive data.
- Keep the scientist list in `App.jsx`.
- Manage search text, minimum IQ, and sorting options through separate state variables.
- Update state using React state setter functions.
- Do not mutate the original scientist dataset.
- Derive filtered and sorted results from the current state.

## 5. Functional Requirements

### Search

- Allow users to search scientists by name.
- Make searching case-insensitive.
- Update results immediately when the input changes.

### IQ Filtering

- Allow users to specify a minimum IQ.
- Display scientists whose IQ is greater than or equal to the selected value.
- Combine IQ filtering with name searching.

### Sorting

- Support sorting by name in ascending and descending order.
- Support sorting by IQ in ascending and descending order.
- Apply sorting to the filtered scientist list.

### Delete

- Allow users to remove individual scientists.
- Identify scientists using their unique IDs.
- Update the displayed list immediately after deletion.

### Reset

- Restore the original scientist dataset.
- Clear the search input.
- Clear the minimum IQ filter.
- Restore the default sorting order.

## 6. UI and Accessibility Rules

- Use semantic HTML elements such as `main`, `section`, and `article`.
- Associate form labels with their corresponding inputs.
- Provide accessible names for action buttons.
- Use responsive CSS layouts.
- Ensure the interface works at a viewport width of 375px.
- Avoid horizontal overflow on mobile screens.
- Provide a clear message when no scientists match the filters.

## 7. Code Quality Rules

- Keep source code readable and consistently formatted.
- Use meaningful variable and function names.
- Avoid unnecessary dependencies.
- Remove unused imports and variables.
- Ensure ESLint passes without errors.
- Ensure the application builds successfully.

## 8. Git Rules

- Make atomic commits for meaningful development milestones.
- Use descriptive commit messages.
- Do not commit `node_modules` or generated build files.
- Verify the working tree before final submission.
- Push the completed exercise to the GitHub repository.

## 9. AI Usage and Verification Rules

- Review AI-generated code before using it.
- Test suggested changes in the local development environment.
- Verify that code satisfies the exercise requirements.
- Record actual AI-related mistakes and corrections in `AI_FAILURE_AUDIT.md`.
- Do not invent errors or claim unverified AI failures.
- Treat AI suggestions as assistance rather than automatically correct solutions.