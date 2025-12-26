# EditorTabs React Component

A React component that replicates VS Code's editor tabs functionality, extracted from the VS Code codebase. This component provides a fully-featured tab bar with support for multiple sizing modes, drag-and-drop reordering, multi-selection, keyboard navigation, and theming.

## Features

- **Multiple tab sizing modes**: `fit`, `shrink`, and `fixed`
- **Drag and drop**: Reorder tabs with visual feedback
- **Multi-selection**: Ctrl/Cmd+click and Shift+click range selection
- **Sticky/Pinned tabs**: Tabs that stay at the beginning with compact view
- **Keyboard navigation**: Full arrow key, Home/End, Enter/Space support
- **Theming**: Customizable via CSS custom properties
- **Dirty state indicators**: Visual feedback for unsaved changes
- **Mouse wheel switching**: Optional scroll-to-switch-tabs behavior
- **Accessible**: ARIA attributes and keyboard support

## Installation

### Prerequisites

- React 17+ or 18+
- TypeScript (recommended)

### Integration Steps

1. **Copy the component files** to your project:

   ```
   src/components/EditorTabs/
   ├── EditorTabs.tsx
   ├── EditorTabs.css
   ├── types.ts
   └── index.ts
   ```

2. **Install peer dependencies** (if not already present):

   ```bash
   npm install react react-dom
   # or
   yarn add react react-dom
   ```

3. **Import and use** the component:

   ```tsx
   import { EditorTabs } from './components/EditorTabs';
   import type { EditorTab } from './components/EditorTabs';
   ```

## Basic Usage

```tsx
import React, { useState } from 'react';
import { EditorTabs } from './components/EditorTabs';
import type { EditorTab } from './components/EditorTabs';

function App() {
  const [tabs, setTabs] = useState<EditorTab[]>([
    { id: '1', name: 'index.ts', title: 'src/index.ts' },
    { id: '2', name: 'App.tsx', title: 'src/App.tsx', isDirty: true },
    { id: '3', name: 'styles.css', title: 'src/styles.css' },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');

  const handleTabClose = (tabId: string) => {
    setTabs(tabs.filter(t => t.id !== tabId));
    if (activeTabId === tabId) {
      setActiveTabId(tabs[0]?.id || '');
    }
  };

  return (
    <EditorTabs
      tabs={tabs}
      activeTabId={activeTabId}
      isGroupFocused={true}
      callbacks={{
        onTabSelect: setActiveTabId,
        onTabClose: handleTabClose,
      }}
    />
  );
}
```

## API Reference

### EditorTabsProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `EditorTab[]` | required | Array of tabs to display |
| `activeTabId` | `string` | `undefined` | ID of the currently active tab |
| `selectedTabIds` | `string[]` | `[]` | IDs of selected tabs (for multi-select) |
| `isGroupFocused` | `boolean` | `true` | Whether this tab group has focus |
| `options` | `EditorTabsOptions` | `{}` | Configuration options |
| `theme` | `EditorTabsTheme` | `undefined` | Theme color overrides |
| `callbacks` | `EditorTabsCallbacks` | `{}` | Event handlers |
| `className` | `string` | `undefined` | Additional CSS class |
| `ariaLabel` | `string` | `'Editor tabs'` | Accessible label for the tab list |

### EditorTab

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the tab |
| `name` | `string` | Yes | Display name of the tab |
| `description` | `string` | No | Secondary text (e.g., file path) |
| `title` | `string` | No | Full title for tooltip |
| `icon` | `string` | No | Icon class name or URL |
| `isDirty` | `boolean` | No | Whether the tab has unsaved changes |
| `isPinned` | `boolean` | No | Whether the tab is pinned |
| `isSticky` | `boolean` | No | Whether the tab is sticky (stays at beginning) |
| `isPreview` | `boolean` | No | Whether the tab is in preview mode |
| `resource` | `string` | No | Associated resource URI |

### EditorTabsOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tabSizing` | `'fit' \| 'shrink' \| 'fixed'` | `'shrink'` | How tabs should be sized |
| `tabHeight` | `'default' \| 'compact'` | `'default'` | Tab height mode |
| `tabCloseButton` | `'left' \| 'right' \| 'off'` | `'right'` | Position of close button |
| `wrapTabs` | `boolean` | `false` | Enable tab wrapping to multiple rows |
| `pinnedTabsOnSeparateRow` | `boolean` | `false` | Show pinned tabs on separate row |
| `scrollToSwitchTabs` | `boolean` | `false` | Enable mouse wheel to switch tabs |
| `showScrollbar` | `boolean` | `true` | Show scrollbar in tab bar |
| `scrollbarSize` | `'default' \| 'large'` | `'default'` | Scrollbar size (3px or 10px) |
| `tabSizingFixedMinWidth` | `number` | `50` | Min width for fixed sizing (px) |
| `tabSizingFixedMaxWidth` | `number` | `160` | Max width for fixed sizing (px) |
| `enableDragToNewWindow` | `boolean` | `false` | Allow dragging tabs to create new windows |
| `showPinnedTabIcon` | `boolean` | `false` | Show icon for pinned tabs |

### EditorTabsCallbacks

| Callback | Signature | Description |
|----------|-----------|-------------|
| `onTabSelect` | `(tabId: string, options?: { preserveFocus?: boolean }) => void` | Called when a tab is selected |
| `onTabClose` | `(tabId: string) => void` | Called when a tab close button is clicked |
| `onTabReorder` | `(tabId: string, fromIndex: number, toIndex: number) => void` | Called when tabs are reordered |
| `onTabDoubleClick` | `(tabId: string) => void` | Called when a tab is double-clicked |
| `onTabContextMenu` | `(tabId: string, event: React.MouseEvent) => void` | Called for context menu |
| `onTabMultiSelect` | `(tabIds: string[]) => void` | Called when multiple tabs are selected |
| `onEmptyAreaDoubleClick` | `() => void` | Called when empty area is double-clicked |
| `onTabDragOut` | `(tabIds: string[], position: { x: number; y: number }) => void` | Called when dragged outside |
| `onExternalDrop` | `(event: React.DragEvent, targetIndex: number) => void` | Called for external drops |
| `onTabPin` | `(tabId: string, isPinned: boolean) => void` | Called when tab is pinned/unpinned |

## Tab Sizing Modes

### `fit` (Fixed Width)
Each tab has a fixed width of 120px and won't shrink below content width.

```tsx
<EditorTabs
  tabs={tabs}
  options={{ tabSizing: 'fit' }}
/>
```

### `shrink` (Default)
Tabs share available space equally with a minimum width of 80px.

```tsx
<EditorTabs
  tabs={tabs}
  options={{ tabSizing: 'shrink' }}
/>
```

### `fixed` (Configurable)
Tabs have configurable min/max widths and share space equally.

```tsx
<EditorTabs
  tabs={tabs}
  options={{
    tabSizing: 'fixed',
    tabSizingFixedMinWidth: 80,
    tabSizingFixedMaxWidth: 200,
  }}
/>
```

## Theming

### Using CSS Custom Properties

Override theme colors by setting CSS custom properties:

```css
.editor-tabs {
  --tab-active-background: #1e1e1e;
  --tab-inactive-background: #2d2d2d;
  --tab-active-foreground: #ffffff;
  --tab-inactive-foreground: #969696;
  --tab-border: #252526;
  --tab-active-border-top: #007acc;
  --tab-drag-and-drop-border: #007acc;
}
```

### Using the Theme Prop

Pass theme colors directly via the `theme` prop:

```tsx
<EditorTabs
  tabs={tabs}
  theme={{
    tabActiveBackground: '#1e1e1e',
    tabInactiveBackground: '#2d2d2d',
    tabActiveForeground: '#ffffff',
    tabInactiveForeground: '#969696',
    tabBorder: '#252526',
    tabActiveBorderTop: '#007acc',
    tabDragAndDropBorder: '#007acc',
  }}
/>
```

### Available Theme Properties

| Property | CSS Variable | Description |
|----------|--------------|-------------|
| `tabActiveBackground` | `--tab-active-background` | Active tab background |
| `tabInactiveBackground` | `--tab-inactive-background` | Inactive tab background |
| `tabUnfocusedActiveBackground` | `--tab-unfocused-active-background` | Active tab in unfocused group |
| `tabUnfocusedInactiveBackground` | `--tab-unfocused-inactive-background` | Inactive tab in unfocused group |
| `tabActiveForeground` | `--tab-active-foreground` | Active tab text color |
| `tabInactiveForeground` | `--tab-inactive-foreground` | Inactive tab text color |
| `tabBorder` | `--tab-border` | Border between tabs |
| `tabActiveBorderTop` | `--tab-active-border-top` | Top border of active tab |
| `tabActiveBorder` | `--tab-active-border` | Bottom border of active tab |
| `tabActiveModifiedBorder` | `--tab-active-modified-border` | Border for dirty active tab |
| `tabInactiveModifiedBorder` | `--tab-inactive-modified-border` | Border for dirty inactive tab |
| `tabHoverBackground` | `--tab-hover-background` | Tab background on hover |
| `tabHoverForeground` | `--tab-hover-foreground` | Tab text color on hover |
| `tabLastPinnedBorder` | `--tab-last-pinned-border` | Border after last pinned tab |
| `tabSelectedBackground` | `--tab-selected-background` | Multi-selected tab background |
| `tabSelectedForeground` | `--tab-selected-foreground` | Multi-selected tab text |
| `tabDragAndDropBorder` | `--tab-drag-and-drop-border` | Drop indicator color |
| `editorGroupHeaderTabsBackground` | `--editor-group-header-tabs-background` | Tab bar background |

## Examples

### With Icons

```tsx
const tabs: EditorTab[] = [
  {
    id: '1',
    name: 'index.ts',
    icon: 'typescript-icon', // CSS class
  },
  {
    id: '2',
    name: 'logo.png',
    icon: 'https://example.com/image-icon.svg', // URL
  },
];

<EditorTabs tabs={tabs} />
```

### With Sticky/Pinned Tabs

```tsx
const tabs: EditorTab[] = [
  { id: '1', name: 'config.json', isSticky: true },
  { id: '2', name: 'README.md', isSticky: true },
  { id: '3', name: 'index.ts' },
];

<EditorTabs tabs={tabs} />
```

### With Multi-Selection

```tsx
const [selectedTabIds, setSelectedTabIds] = useState<string[]>([]);

<EditorTabs
  tabs={tabs}
  activeTabId={activeTabId}
  selectedTabIds={selectedTabIds}
  callbacks={{
    onTabSelect: setActiveTabId,
    onTabMultiSelect: setSelectedTabIds,
  }}
/>
```

### With Drag and Drop Reordering

```tsx
const handleReorder = (tabId: string, fromIndex: number, toIndex: number) => {
  setTabs(prev => {
    const newTabs = [...prev];
    const [removed] = newTabs.splice(fromIndex, 1);
    newTabs.splice(toIndex, 0, removed);
    return newTabs;
  });
};

<EditorTabs
  tabs={tabs}
  callbacks={{
    onTabReorder: handleReorder,
  }}
/>
```

### With Context Menu

```tsx
const handleContextMenu = (tabId: string, event: React.MouseEvent) => {
  event.preventDefault();
  // Show your context menu at event.clientX, event.clientY
  showContextMenu({
    x: event.clientX,
    y: event.clientY,
    items: [
      { label: 'Close', onClick: () => closeTab(tabId) },
      { label: 'Close Others', onClick: () => closeOtherTabs(tabId) },
      { label: 'Close All', onClick: () => closeAllTabs() },
    ],
  });
};

<EditorTabs
  tabs={tabs}
  callbacks={{
    onTabContextMenu: handleContextMenu,
  }}
/>
```

### Compact Mode

```tsx
<EditorTabs
  tabs={tabs}
  options={{
    tabHeight: 'compact',
    tabCloseButton: 'off',
  }}
/>
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `←` / `↑` | Focus previous tab |
| `→` / `↓` | Focus next tab |
| `Home` | Focus first tab |
| `End` | Focus last tab |
| `Enter` / `Space` | Select focused tab |
| `Shift + F10` | Open context menu |

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Accessibility

The component implements WAI-ARIA tab pattern:
- `role="tablist"` on container
- `role="tab"` on each tab
- `aria-selected` for active state
- `tabIndex` management for keyboard navigation
- High contrast mode support via `@media (forced-colors: active)`

## License

MIT License - See LICENSE file for details.
