# Adobe XD Specifications Extractor

-   **Text Element/Node:** Extract the text properties in specific format.

    JSON Format:

    ```json
    {
        "nodeType": "TEXT",
        "nodeValue": "Hello World",
        "properties": {
            "fontFamily": "Stevie Sans",
            "fontWeight": "bold",
            "fontSize": 16,
            "color": "#000000",
            "lineHeight": 1.5,
            "letterSpacing": 1,
            "textAlign": "left",
            "textDecoration": "none", // underline, line-through, none
            "textTransform": "none", // uppercase, lowercase, capitalize, none
        }
        "children": null // always null for text nodes, as text nodes don't have children
    }
    ```

    SCSS Format:

    ```scss
    font-family: <variable-name>;
    font-weight: <variable-name>;
    font-size: <variable-name>;
    color: <variable-name>;
    line-height: 18px;
    letter-spacing: 0.66px;
    text-decoration: underline / line-through;
    text-transform: uppercase / lowercase / capitalize;
    ```

-   Group
-   Rectangle

-   Ellipse
-   Line
-   Path
-   RepeatGrid
-   BooleanGroup

## Installation guide

**Install XD plugin in development mode:**

```bash
# Step 1. Install plugin using XD CLI
npm run plugin:install

# Step 2. Restart the XD app

# If you want live reload (HMR) then use this command:
npm run plugin:watch
```

**Official way to install XD plugin:**

```bash
# Step 0. Validate the plugin:
npm run plugin:validate

# Step 1. Package the plugin:
npm run plugin:package

# Step 2: Double click the .xdx file & it will install the plugin.
```

---

### References

-   https://developer.adobe.com/xd/uxp/
