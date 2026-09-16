# Umbra Custom Themes Guide

Welcome to the advanced theming guide for Umbra! 
If the built-in color presets aren't enough for you, you can completely overhaul the app's appearance by creating custom themes.

## Getting Started

1. Open Umbra settings and click the **Folder Icon** next to the theme selector to open the `themes` directory.
2. Create a new file with a `.css` extension (for example, `my_cyberpunk_theme.css`).
3. Re-open the settings menu. Your new theme will appear in the presets list.

## How it works

Umbra relies heavily on CSS variables (custom properties) defined in the `:root` pseudo-class. By redefining these variables in your custom CSS file, you can instantly change the entire color palette without having to manually style every element.

Here is the base template containing all the primary variables you can override:

```css
:root {
  /* The background color of the search bar and result cards */
  --card-bg: #1E1E1E;
  
  /* The background color of a card when hovered or selected */
  --card-hover: #2c2c2c;
  --card-selected: #2c2c2c;
  --card-deep: #161616;
  
  /* The color of separating lines */
  --card-line: #383838;
  
  /* The primary text color */
  --text: #E3E3E3;
  
  /* Secondary, dimmed text color (used for paths and small details) */
  --text-dim: #737373;
  
  /* Color of icons (settings, search icon) */
  --icon: #b5b5b5;
  
  /* The border color of cards */
  --card-border: rgba(255, 255, 255, 0.08);
  
  /* The accent color (used for glowing effects and active states) */
  --accent: #507090;
  
  /* Colors for specific file type icons */
  --tile-exe: #5E5C64;
  --tile-folder: #DA702C;
  --tile-media: #8B7EC8;

  /* Sizing and Spacing */
  --card-radius: 12px;
  --card-border-w: 1px;
}
```

## Example: Cyberpunk Theme

Here's an example of how you can create a high-contrast, neon theme. Paste this into your `.css` file:

```css
:root {
  --card-bg: #0d0f1e;
  --card-hover: #161a38;
  --card-selected: #161a38;
  --card-deep: #050510;
  --card-line: #ff0055;
  --text: #00ffcc;
  --text-dim: #009977;
  --icon: #ff0055;
  --card-border: #ff0055;
  --accent: #ff0055;
  --tile-exe: #ff0055;
  --tile-folder: #00ffcc;
  --card-radius: 0px;
}
```

## Advanced Theming

Because your CSS is injected directly into the application, you aren't limited to just changing variables. You can write traditional CSS selectors to target specific UI elements and completely change their layout, hide them, or add animations.

Have fun creating!
