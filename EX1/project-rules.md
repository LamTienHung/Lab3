# Lab 03 - Exercise 1
## Project Rules

### 1. Technology Stack
- Use React 19 and Vite.
- Use JavaScript and JSX.
- Use React Functional Components.
- Use CSS Modules for component styling.

### 2. React Component Rules
- Use functional components only.
- Do not use React Class Components.
- Use React 19 createRoot().
- Do not use ReactDOM.render().
- Do not use defaultProps.
- Use ES6 default parameters.
- Use stable and unique keys when rendering lists.
- Do not use array indexes as React keys.

### 3. Semantic HTML Rules
- Do not use div elements inside DeveloperCard.jsx.
- Use semantic HTML elements:
  - article
  - header
  - section
  - dl
  - dt
  - dd
  - ul
  - li
- Maintain a logical heading hierarchy.
- Use meaningful alternative text for images.

### 4. CSS Rules
- Use DeveloperCard.module.css for component styling.
- Use CSS custom properties.
- Implement responsive layouts.
- Support mobile screens with a minimum width of 375px.
- Prevent horizontal overflow.

### 5. Image Rules
- Use HTTPS image URLs.
- Define explicit image width and height.
- Provide fallback initials when the avatar cannot load.
- Do not allow insecure HTTP image URLs.

### 6. Security and Accessibility
- Avoid unsafe HTML injection.
- Do not use dangerouslySetInnerHTML.
- Use semantic HTML for accessibility.
- Verify images have appropriate alternative text.
- Test the application using Chrome DevTools.

### 7. Testing Rules
- Verify that DeveloperCard contains no div elements.
- Verify that skill lists use stable IDs.
- Test the responsive layout at 375px.
- Test avatar fallback behavior.
- Check the browser Console for JavaScript errors.

### 8. AI Failure Audit
- Record actual defects encountered during development.
- Describe how each defect was detected.
- Explain the solution applied.
- Include verification results.
- Do not report hypothetical defects as confirmed AI failures.

### 9. Git Rules
- Use meaningful atomic commits.
- Create at least two commits for Exercise 1.
- Do not exceed ten commits for Exercise 1.
- Do not commit node_modules or dist.
- Update TASK_DECOMPOSITION.md before submission.
- Complete AI_FAILURE_AUDIT.md before submission.