# EX3 - Project Development Rules

## 1. Project Information

- Project: KRAFTON PUBG Vietnam Series Live Telemetry
- Framework: React 19
- Build Tool: Vite
- Language: JavaScript (ES2024)
- Styling: CSS
- Version Control: Git and GitHub

## 2. Component Architecture

- Use functional React components.
- Keep components reusable and focused on a single responsibility.
- Use props to pass data between components.
- Use semantic HTML elements such as main, section, article, header, and output.
- Do not use legacy class components or ReactDOM.render().
- Use stable keys when rendering lists.

## 3. State Management

- Use React useState to manage application state.
- Implement four UI states: IDLE, LOADING, SUCCESS, and ERROR.
- Avoid unnecessary or duplicated state variables.
- Never mutate React state directly.
- Keep state transitions predictable.

## 4. Telemetry Data

- Provide three PUBG Vietnam squads: Cerberus Esports (CES), The Expendables (TE), and Genius Esports (GE).
- Display map, match phase, alive players, kills, WWCD probability, and status.
- Treat simulated telemetry as demonstration data rather than official live match statistics.

## 5. Asynchronous Operations

- Use useEffect to synchronize telemetry requests.
- Use AbortController to cancel requests when the selected squad changes or the component unmounts.
- Prevent outdated responses from overwriting current telemetry.
- Simulate a 35% network failure probability.
- Provide a retry mechanism when requests fail.
- Do not treat intentional request cancellation as an application error.

## 6. UI and Accessibility

- Provide a responsive layout for desktop and mobile screens.
- Verify usability at a viewport width of 375px.
- Display a 220px skeleton placeholder during loading.
- Use role="alert" for error messages.
- Use accessible labels for interactive controls.
- Avoid blocking window.alert() messages.
- Ensure buttons are keyboard-accessible.

## 7. Code Quality

- Keep code readable and maintainable.
- Use descriptive variable and function names.
- Avoid unnecessary dependencies.
- Do not use deprecated React APIs.
- Run ESLint and the production build before submission.

## 8. Git Workflow

- Make meaningful atomic commits after completing and verifying individual features.
- Use clear commit messages with prefixes such as chore, feat, fix, style, and docs.
- Keep EX3 changes separate from other exercises.
- Push completed work to the main branch on GitHub.

## 9. AI Usage and Verification

- Break the exercise into smaller tasks before implementation.
- Verify generated code instead of accepting it without testing.
- Record actual development issues and corrections in AI_FAILURE_AUDIT.md.
- Test all four UI states and the request cancellation behavior.
- Confirm that the final implementation satisfies the lab requirements.