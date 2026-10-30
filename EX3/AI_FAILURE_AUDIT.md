# EX3 - AI Failure Audit

## Project Information

**Project:** KRAFTON PUBG Vietnam Series Live Telemetry  
**Framework:** React 19 + Vite  
**Exercise:** EX3 - Lab03

## 1. Overview

This document records issues encountered during the development of the PUBG Vietnam Live Telemetry application, including AI-assisted code problems, their causes, and the corrections applied.

## 2. Issue 1: React ESLint Error

**Error:** `react-hooks/set-state-in-effect`

**Description:**

The initial AI-generated implementation called `setView()` synchronously inside `useEffect()` to change the application state to `LOADING`.

ESLint reported that updating React state directly inside an effect could cause unnecessary cascading renders.

**Cause:**

The implementation used `useEffect()` both to initialize the loading state and to perform asynchronous telemetry requests.

**Correction:**

The loading state was moved into the initial `useState()` value. The direct `setView()` call was removed from the effect.

The retry handler was also updated to set the state to `LOADING` before triggering another request.

**Verification:**

The ESLint command completed without reporting errors.

## 3. Issue 2: Loading State Management

**Description:**

After removing the synchronous state update from `useEffect()`, the application still needed to display the loading skeleton when a new squad was selected or a failed request was retried.

**Correction:**

The application uses `key={selectedSquadId}` to remount the telemetry component when the selected squad changes.

The retry button explicitly resets the view to `LOADING` before starting another request.

**Verification:**

The application displays a loading skeleton while simulated telemetry data is being requested.

## 4. Asynchronous Request Handling

The application uses `AbortController` to cancel pending requests when the selected squad changes or the telemetry component unmounts.

Aborted requests are ignored instead of being displayed as network failures.

The simulated service uses a 35% failure probability to exercise the error and retry states.

## 5. Build Verification

The project was checked using:

- `npm.cmd run lint`
- `npm.cmd run build`

The production build completed successfully.

## 6. Lessons Learned

1. React effects should primarily synchronize components with external systems.
2. Loading state transitions should be designed carefully to avoid unnecessary renders.
3. Asynchronous requests require cleanup to prevent outdated responses.
4. AI-generated code must be verified using ESLint, build tools, and manual testing.
5. Development errors and their corrections should be documented accurately.

## 7. Conclusion

The identified ESLint issue was corrected, and the project successfully passed the production build and lint checks.

The development process demonstrates the importance of reviewing AI-generated React code, especially when working with asynchronous operations and component lifecycle management.