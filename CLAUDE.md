> **Maintenance note:** This file should be kept up to date. If you add, remove, or significantly refactor files/directories, update the relevant sections here before finishing your task.

## Project Overview

**SIPacker** is an online editor for SIGame (Своя Игра / "Own Game") question packs. It allows users to create, edit, import, and export `.siq` pack files for the SIGame engine by Vladimir Khil.

- **Stack:** React 18, Redux Toolkit, MUI v7, Formik, Dexie, JSZip, react-router-dom v6, @dnd-kit
- **Build tool:** Vite 7 + vite-plugin-pwa + vite-plugin-node-polyfills
- **Styling:** SCSS Modules + MUI Emotion
- **Language:** Russian UI, JavaScript (no TypeScript)

## Data Model

Pack state (stored in Redux + persisted to IndexedDB via `localPacks.js`):

```
pack {
  uuid, name, version, over18, date, publisher, difficulty,
  logo (fileURI), language, tags[], authors[], comment,
  rounds: [
    {
      name,
      themes: [
        {
          name,
          questions: [
            {
              price, type ('simple'|'auction'|'cat'|'bagcat'|'sponsored'),
              scenario: [ { type, duration, data: { text|imageField|audioField|videoField|say } } ],
              correctAnswers[], incorrectAnswers[],
              // type-specific: realtheme, realprice, realpriceFrom, realpriceTo, realpriceStep,
              //                questionPriceType, transferToSelf, detailsDisclosure
            }
          ]
        }
      ]
    }
  ]
}
```

Files are stored separately in IndexedDB (`files` table), keyed by `fileURI` (a UUID), with fields: `type`, `hash`, `packUUID`, `addedAt`, `filename`, `blob`.

---

## Key Utilities (`src/utils.js`)

| Export | Purpose |
|---|---|
| `questionTypes` | Map of type key → Russian display name |
| `initValues(schema, obj)` | Initialize Formik values from Yup schema |
| `hasQuestionInEachTheme(pack)` | Validation helper |
| `hasThemeInEachRound(pack)` | Validation helper |
| `has5ThemesInEachRound(pack)` | Checklist helper |
| `hasAtLeast25Questions(pack)` | Checklist helper |
| `hasScenarioInEachQuestion(pack)` | Validation helper |
| `filesize(size)` | Format bytes with Russian unit symbols (uses filesize v10) |
| `formatDate(dateTime)` | Format timestamp in Russian locale |
| `useEventListener(event, handler, el)` | Safe event listener hook |
| `extensionsMimeTypes` | Extension → MIME type map |
| `generateWaveform(w, h, url)` | Render audio waveform to Blob via canvas |
| `blockedByCors(url)` | Check if URL is blocked by CORS |

---

## Redux Store (`src/store/`)

The store uses **Redux Toolkit** (`configureStore`). All components use `useSelector` / `useDispatch` hooks — `connect()` is no longer used anywhere.

| Slice file | Actions exported |
|---|---|
| `packSlice.js` | `loadPack(pack)` |
| `dashboardSlice.js` | `setUploading(uploadingArray)` |
| `fileRenderingSlice.js` | `fileRenderingStarted({ fileURI, callback })`, `fileRenderingStopped({ fileURI })`, `fileUnlinked({ fileURI })`, `setFileUnlinkCallback({ fileURI, callback })` |
| `menuSlice.js` | `setPosition([x, y] \| null)` |

> **Note:** `fileRenderingSlice` uses `createAction` + `createReducer` (not `createSlice`) because the state stores function callbacks, which Immer cannot proxy. `serializableCheck` is disabled in `configureStore` for the same reason.

### Store shape

```
store {
  pack:           null | pack object | 'notFound'
  dashboard:      null | { uploading: [{ id, name }] }
  fileRendering:  { [fileURI]: callbackFn | undefined }
  menu:           null | { position: [x, y] | null }
}
```

---

## Pack Generation & Parsing

- **`localStorage/packGenerator/index.js`** — `generate(pack)` serializes Redux pack state into a `.siq` ZIP (JSZip), validates it via `check(pack)`, and resolves all file references. `check(pack)` returns an array of human-readable error strings.
- **`localStorage/packGenerator/parser.js`** — `parse(blob)` reads a `.siq` ZIP and returns a pack state object compatible with Redux.
- **`localStorage/packGenerator/fileResolver.js`** — Maps `fileURI` references to paths inside the ZIP (`Images/`, `Audio/`, `Video/`), using transliteration for filenames.

---

## Routing

```
/                        → Dashboard
/create                  → NewPack
/pack/:packUUID          → Pack (Rounds view)
/pack/:packUUID/settings → Pack Settings
/pack/:packUUID/rounds/:roundIndex         → RoundThemes
/pack/:packUUID/rounds/:roundIndex/themes/:themeIndex/questions/:questionPrice → Question
*                        → NotFound404
```

Uses React Router v6 with `BrowserRouter`. Base path configured via `vite.config.js` using `VITE_BASE_PATH` environment variable.
Nested routes in Pack use relative paths with `<Routes>` and `<Route>` components.

---

## Styling Conventions

- Component-scoped styles use **CSS Modules** (`styles.module.scss`)
- Global variables and mixins live in `src/consts.scss`; consumed via `@use '...consts' as *` (not `@import`)
- Files needing `color.scale()` add `@use 'sass:color'` at the top
- MUI components use **Emotion**; the app-wide dark theme is defined in `src/App.js` (`darkTheme`), primary color `#4248fb`
- `classnames` library is used for conditional class joining

---

## Important Notes

### Build & Tooling
- **Node.js Polyfills:** `buffer` and `stream` polyfilled via `vite-plugin-node-polyfills`
- **JSX in .js files:** Configured to process JSX in `.js` files (not just `.jsx`)
- **Import Aliases:** `components/`, `routes/`, `localStorage/`, `reducers/`, `store/`, `assets/`, `utils`, `consts`
- **PWA:** Managed by `vite-plugin-pwa` with Workbox

### Code Quality
- **Prettier:** `.prettierrc` — single quotes, no semicolons, 100-char line width, LF line endings
- **ESLint:** `.eslintrc.js` — `eslint:recommended` + `plugin:react/recommended` + `react-hooks` + `jsx-a11y`
- **Husky + lint-staged:** Pre-commit hook runs Prettier + ESLint `--fix` on staged `src/**/*.{js,jsx,scss,css}` files
- **Scripts:** `npm run format` (format all src), `npm run lint` (lint + autofix all src)

### React & Routing
- **React 18:** Uses `createRoot` API from `react-dom/client`
- **React Router v6:** Uses `BrowserRouter`, `useNavigate`, `useParams` (no history package)
- **MUI v7:** Latest Material-UI with @mui/lab beta

### Drag & Drop
- **@dnd-kit:** Modern DnD library with React 18 support
- Y-axis only dragging in `ItemsList` component
- Backward-compatible API with old `provided` object pattern

### Custom Hooks
- **useBeforeUnload:** Native `beforeunload` event wrapper for unsaved changes warning
- **useBottomScrollListener:** Scroll detection with debouncing for infinite scroll

### Storage
- **IndexedDB:** Default 250 MB limit (browser-dependent, Safari: 30 MB hard limit)
- **Dexie v4:** IndexedDB wrapper with modern API
- **File Storage:** Files stored by UUID with hash-based deduplication

### Pack Format
- `.siq` files are ZIP archives containing:
  - `content.xml` - Pack structure and questions
  - `[Content_Types].xml` - MIME type definitions
  - `Images/`, `Audio/`, `Video/` - Media files
  - `Texts/` - Additional text resources
