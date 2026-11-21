# Using `@keshavsoft/json-to-dom` via CDN: Integration & Rendering Guide

A complete guide to adding `@keshavsoft/json-to-dom` into web applications via CDN, understanding how it registers onto the browser window, and rendering declarative JSON UI specifications directly into live DOM elements.

---

## 1. Overview & Architecture

`@keshavsoft/json-to-dom` is a **zero-dependency native DOM orchestrator**. It transforms declarative JSON element specifications into live browser DOM trees by coordinating two subordinate engines:

```
    JSON UI Specification (from instructions / renderers)
                           │
                           ▼
     ┌───────────────────────────────────────────────┐
     │           @keshavsoft/json-to-dom             │
     │                                               │
     │  1. jsonToTag(jsonSpec)                       │
     │     └──► @keshavsoft/json-to-tag              │
     │          (W3C Node Synthesis & Validation)    │
     │                                               │
     │  2. specToDom({ buildSpec, targetHtmlId, ...})│
     │     └──► spec-to-dom                          │
     │          (Container Resolution & Mounting)    │
     └───────────────────────────────────────────────┘
                           │
                           ▼
          Native Browser DOM Element Mounted
               (Zero Virtual DOM Overhead)
```

---

## 2. Adding via CDN

You can include `json-to-dom` in any HTML page using either **KeshavSoft GitHub Pages CDN** or **jsDelivr npm CDN**.

### Option A: GitHub Pages CDN (Recommended for KeshavSoft Ecosystem)

```html
<!-- Load latest v42 standalone bundle as an ES Module -->
<script type="module" src="https://keshavsoft.github.io/json-to-dom/dist/v42/min.js"></script>
```

> **Tip:** You can also link to the generic latest alias:
> `https://keshavsoft.github.io/json-to-dom/dist/min.js`

### Option B: jsDelivr npm CDN

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@keshavsoft/json-to-dom/docs/dist/v42/min.js"></script>
```

---

## 3. How It Works in the Browser

When the module script executes, it automatically runs global registration:

```javascript
// Internal src/v42/register/index.js:
globalThis.ks ??= {};
globalThis.ks.jsonToDom = {
    meta: { version: "42.1.4", name: "json-to-dom" },
    appendToDom: startFunc
};
```

This gives you two primary ways to consume the engine in client-side code:

### Method 1: Global Registration (`window.ks.jsonToDom.appendToDom`)

Ideal when loading modular script dependencies in `<head>` or before your script:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>JSON-to-DOM via Global CDN</title>
    <!-- 1. CDN Script Tag -->
    <script type="module" src="https://keshavsoft.github.io/json-to-dom/dist/v42/min.js"></script>
</head>
<body>
    <div id="app"></div>

    <script type="module">
        // 2. Invoke directly from window.ks without import statements
        window.ks.jsonToDom.appendToDom({
            jsonSpec: {
                tagName: "div",
                classList: "alert alert-success",
                textContent: "Rendered dynamically via CDN!"
            },
            targetHtmlId: "app",
            appendPosition: "replace"
        });
    </script>
</body>
</html>
```

---

### Method 2: Direct ESM Import

Ideal when using ES Module scripts and preferring explicit imports:

```html
<div id="app"></div>

<script type="module">
    import jsonToDom from "https://keshavsoft.github.io/json-to-dom/dist/v42/min.js";

    jsonToDom({
        jsonSpec: {
            tagName: "h2",
            textContent: "Rendered via direct ESM import"
        },
        targetHtmlId: "app"
    });
</script>
```

---

## 4. API Reference

### Function Signature

```javascript
window.ks.jsonToDom.appendToDom({
    jsonSpec,        // [Required] Object | Array - Declarative element spec(s)
    targetHtmlId,    // [Required] String - HTML id of the mount container
    appendPosition,  // [Optional] "replace" | "append" (default) | "prepend"
    showLog          // [Optional] Boolean - Enable console debug logs (default: false)
});
```

### Parameter Details

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `jsonSpec` | `Object \| Array` | *required* | The declarative DOM specification or array of specifications. |
| `targetHtmlId` | `String` | *required* | Target DOM container element ID (`document.getElementById(targetHtmlId)`). |
| `appendPosition` | `String` | `"append"` | `"replace"` clears container before mounting; `"append"` appends to container; `"prepend"` adds to the top. |
| `showLog` | `Boolean` | `false` | When `true`, outputs internal resolution and mounting steps to the browser console. |

---

## 5. End-to-End Pipeline Example (Declarative Instructions ➔ DOM)

This matches the real-world flow from `samples/v4/table`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Declarative Table Pipeline</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4 bg-light">
    <!-- Container where the rendered component will appear -->
    <div id="dom-render-container"></div>

    <!-- 1. Pipeline CDN dependencies -->
    <script type="module" src="https://keshavsoft.github.io/declarative-instructions/dist/v2/min.js"></script>
    <script type="module" src="https://keshavsoft.github.io/declarative-definitions/dist/v2/min.js"></script>
    <script type="module" src="https://keshavsoft.github.io/declarative-spec/dist/v2/min.js"></script>
    <script type="module" src="https://keshavsoft.github.io/json-renderers-run-instructions-steps/dist/v4/min.js"></script>
    <!-- 2. Master DOM Orchestrator CDN -->
    <script type="module" src="https://keshavsoft.github.io/json-to-dom/dist/v42/min.js"></script>

    <!-- 3. Application Logic -->
    <script type="module">
        import columns from "./columns.json" with { type: "json" };
        import data from "./data.json" with { type: "json" };

        const targetHtmlId = "dom-render-container";

        // Step A: Grab instruction specs from declarative definitions
        const localInstructions = window.ks.declarative.definitions.data.table.simple.instructions;
        const localBaseFromSpec = window.ks.declarative.definitions.data.table.simple.baseFromSpec;

        // Step B: Run sequential instruction steps to transform raw data into a declarative spec
        const resultSpec = window.ks.jsonRenderers.runInstructions.steps.runInstructions({
            instructions: localInstructions,
            baseKey: localBaseFromSpec,
            data: { columns, data },
            showLog: false
        });

        // Step C: Hand over the compiled spec to jsonToDom for native browser mounting
        window.ks.jsonToDom.appendToDom({
            jsonSpec: resultSpec,
            targetHtmlId,
            appendPosition: "replace",
            showLog: false
        });
    </script>
</body>
</html>
```

---

## 6. Comparison: What Was Already in `json-to-dom` vs. What Was Missing

| Topic | In `json-to-dom` Existing Docs | What Was Added / Clarified |
| :--- | :--- | :--- |
| **CDN URL** | Only mentions jsDelivr (`cdn.jsdelivr.net/npm/@keshavsoft/json-to-dom/...`) | Added the native GitHub Pages CDN URL: `https://keshavsoft.github.io/json-to-dom/dist/v42/min.js` |
| **Script Tag Pattern** | Only showed `import jsonToDom from "https://..."` | Added plain `<script type="module" src="..."></script>` which registers `window.ks.jsonToDom.appendToDom` globally |
| **`appendPosition`** | Only mentioned `"append"` and `"prepend"` in README signature | Added `"replace"` option, which cleanly empties the target container before mounting |
| **Pipeline Integration** | Only showed static hardcoded JSON specs in isolation | Connected the dots between `declarative-instructions` / `json-renderers-run-instructions-steps` and `json-to-dom` |
