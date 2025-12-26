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
- **Declarative API**: React-tabs style `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanel>` components

## Installation

### Prerequisites

- React 17+ or 18+
- TypeScript (recommended)

### Integration Steps

1. **Copy the component files** to your project:

   ```
   src/components/EditorTabs/
   ├── EditorTabs.tsx      # Low-level component
   ├── EditorTabs.css
   ├── Tabs.tsx            # High-level container
   ├── Tabs.css
   ├── Tab.tsx             # Declarative tab definition
   ├── TabList.tsx         # Tab bar wrapper
   ├── TabPanel.tsx        # Content panel
   ├── TabPanel.css
   ├── TabContext.tsx      # Shared context
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
   // Declarative API (recommended)
   import { Tabs, TabList, Tab, TabPanel } from './components/EditorTabs';

   // Or low-level API
   import { EditorTabs } from './components/EditorTabs';
   ```

---

## Declarative API (Recommended)

The declarative API follows the [react-tabs](https://github.com/reactjs/react-tabs) pattern, where tabs manage their own panels automatically.

### Quick Start

```tsx
import { Tabs, TabList, Tab, TabPanel } from './components/EditorTabs';

function App() {
  return (
    <Tabs defaultActiveTabId="tab1">
      <TabList>
        <Tab id="tab1" name="index.ts" />
        <Tab id="tab2" name="App.tsx" isDirty />
        <Tab id="tab3" name="config.json" isPinned />
      </TabList>

      <TabPanel tabId="tab1">
        <p>Content for index.ts</p>
      </TabPanel>
      <TabPanel tabId="tab2">
        <p>Content for App.tsx</p>
      </TabPanel>
      <TabPanel tabId="tab3">
        <p>Content for config.json</p>
      </TabPanel>
    </Tabs>
  );
}
```

### Controlled vs Uncontrolled

#### Uncontrolled (Component Manages State)

```tsx
<Tabs defaultActiveTabId="tab1">
  <TabList>
    <Tab id="tab1" name="First" />
    <Tab id="tab2" name="Second" />
  </TabList>
  <TabPanel tabId="tab1">First content</TabPanel>
  <TabPanel tabId="tab2">Second content</TabPanel>
</Tabs>
```

#### Controlled (You Manage State)

```tsx
const [activeTab, setActiveTab] = useState('tab1');

<Tabs activeTabId={activeTab} onTabChange={setActiveTab}>
  <TabList>
    <Tab id="tab1" name="First" />
    <Tab id="tab2" name="Second" />
  </TabList>
  <TabPanel tabId="tab1">First content</TabPanel>
  <TabPanel tabId="tab2">Second content</TabPanel>
</Tabs>
```

### Component Reference

#### `<Tabs>`

The main container component that provides context for all child components.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultActiveTabId` | `string` | - | Initial active tab (uncontrolled) |
| `activeTabId` | `string` | - | Active tab ID (controlled) |
| `defaultSelectedTabIds` | `string[]` | `[]` | Initial selected tabs (uncontrolled) |
| `selectedTabIds` | `string[]` | - | Selected tab IDs (controlled) |
| `isGroupFocused` | `boolean` | `true` | Whether the tab group has focus |
| `options` | `EditorTabsOptions` | `{}` | Tab bar configuration |
| `theme` | `EditorTabsTheme` | - | Theme colors |
| `onTabChange` | `(tabId: string) => void` | - | Called when active tab changes |
| `onTabClose` | `(tabId: string) => void` | - | Called when a tab is closed |
| `onSelectionChange` | `(tabIds: string[]) => void` | - | Called when selection changes |
| `onTabDirtyChange` | `(tabId: string, isDirty: boolean) => void` | - | Called when dirty state changes |
| `onTabPinChange` | `(tabId: string, isPinned: boolean) => void` | - | Called when pin state changes |
| `activateAdjacentOnClose` | `boolean` | `true` | Activate next tab when closing active |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Tab orientation |
| `className` | `string` | - | Additional CSS class |

#### `<TabList>`

Container for `<Tab>` components. Renders the visual tab bar.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | `<Tab>` components |
| `className` | `string` | - | Additional CSS class |
| `ariaLabel` | `string` | `'Editor tabs'` | Accessible label |
| `onTabDoubleClick` | `(tabId: string) => void` | - | Tab double-click handler |
| `onTabContextMenu` | `(tabId: string, event: MouseEvent) => void` | - | Context menu handler |
| `onEmptyAreaDoubleClick` | `() => void` | - | Empty area double-click |
| `onTabReorder` | `(tabId: string, from: number, to: number) => void` | - | Reorder handler |
| `onExternalDrop` | `(event: DragEvent, index: number) => void` | - | External drop handler |

#### `<Tab>`

Declarative tab definition. Does not render visible content.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | required | Unique tab identifier |
| `name` | `string` | required | Display name |
| `description` | `string` | - | Secondary text |
| `title` | `string` | - | Tooltip text |
| `icon` | `string` | - | Icon class or URL |
| `isDirty` | `boolean` | `false` | Has unsaved changes |
| `isPinned` | `boolean` | `false` | Is pinned |
| `isSticky` | `boolean` | `false` | Stays at beginning |
| `isPreview` | `boolean` | `false` | Preview mode (italic) |
| `disabled` | `boolean` | `false` | Cannot be selected |

#### `<TabPanel>`

Content panel associated with a tab.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabId` | `string` | required | Associated tab ID |
| `children` | `ReactNode` | required | Panel content |
| `className` | `string` | - | Additional CSS class |
| `forceMount` | `boolean` | `false` | Always keep in DOM (hidden when inactive) |
| `keepMounted` | `boolean` | `false` | Keep mounted after first render |
| `render` | `() => ReactNode` | - | Lazy render function |

### Hooks

Access tab state from any component inside `<Tabs>`:

```tsx
import { useTabsContext, useIsActiveTab, useIsSelectedTab } from './components/EditorTabs';

function MyComponent() {
  const { activeTabId, selectTab, closeTab, setTabDirty } = useTabsContext();
  const isActive = useIsActiveTab('tab1');
  const isSelected = useIsSelectedTab('tab1');

  return (
    <button onClick={() => setTabDirty('tab1', true)}>
      Mark as dirty
    </button>
  );
}
```

#### `useTabsContext()`

Returns the full context value:

| Property | Type | Description |
|----------|------|-------------|
| `activeTabId` | `string \| undefined` | Currently active tab |
| `selectedTabIds` | `string[]` | Selected tab IDs |
| `isGroupFocused` | `boolean` | Whether group is focused |
| `selectTab` | `(tabId: string) => void` | Select a tab |
| `closeTab` | `(tabId: string) => void` | Close a tab |
| `setSelectedTabs` | `(tabIds: string[]) => void` | Update selection |
| `setTabDirty` | `(tabId: string, isDirty: boolean) => void` | Set dirty state |
| `setTabPinned` | `(tabId: string, isPinned: boolean) => void` | Set pinned state |
| `options` | `EditorTabsOptions` | Configuration options |
| `theme` | `EditorTabsTheme \| undefined` | Theme colors |

#### `useIsActiveTab(tabId: string)`

Returns `true` if the specified tab is active.

#### `useIsSelectedTab(tabId: string)`

Returns `true` if the specified tab is selected.

### Examples

#### Dynamic Tabs

```tsx
function DynamicTabs() {
  const [tabs, setTabs] = useState([
    { id: '1', name: 'Tab 1', content: 'Content 1' },
  ]);
  const [counter, setCounter] = useState(2);

  const addTab = () => {
    const id = String(counter);
    setTabs([...tabs, { id, name: `Tab ${id}`, content: `Content ${id}` }]);
    setCounter(counter + 1);
  };

  const removeTab = (tabId: string) => {
    setTabs(tabs.filter(t => t.id !== tabId));
  };

  return (
    <Tabs defaultActiveTabId="1" onTabClose={removeTab}>
      <TabList onEmptyAreaDoubleClick={addTab}>
        {tabs.map(tab => (
          <Tab key={tab.id} id={tab.id} name={tab.name} />
        ))}
      </TabList>

      {tabs.map(tab => (
        <TabPanel key={tab.id} tabId={tab.id}>
          {tab.content}
        </TabPanel>
      ))}
    </Tabs>
  );
}
```

#### Lazy Loading Panels

```tsx
<Tabs defaultActiveTabId="tab1">
  <TabList>
    <Tab id="tab1" name="Light" />
    <Tab id="tab2" name="Heavy" />
  </TabList>

  <TabPanel tabId="tab1">
    <p>This loads immediately</p>
  </TabPanel>

  <TabPanel tabId="tab2" render={() => <HeavyComponent />}>
    {/* Only rendered when tab2 is active */}
  </TabPanel>
</Tabs>
```

#### Preserving Panel State

```tsx
<Tabs defaultActiveTabId="tab1">
  <TabList>
    <Tab id="tab1" name="Form" />
    <Tab id="tab2" name="Preview" />
  </TabList>

  {/* Form state is preserved when switching tabs */}
  <TabPanel tabId="tab1" keepMounted>
    <FormWithState />
  </TabPanel>

  <TabPanel tabId="tab2">
    <Preview />
  </TabPanel>
</Tabs>
```

#### With Theming

```tsx
<Tabs
  defaultActiveTabId="tab1"
  theme={{
    tabActiveBackground: '#0d1117',
    tabInactiveBackground: '#161b22',
    tabActiveForeground: '#c9d1d9',
    tabActiveBorderTop: '#58a6ff',
  }}
  options={{
    tabSizing: 'shrink',
    tabHeight: 'compact',
  }}
>
  <TabList>
    <Tab id="tab1" name="main.rs" icon="rust-icon" />
    <Tab id="tab2" name="Cargo.toml" icon="toml-icon" isDirty />
  </TabList>

  <TabPanel tabId="tab1">Rust code here</TabPanel>
  <TabPanel tabId="tab2">TOML config here</TabPanel>
</Tabs>
```

---

## Low-Level API

For more control, use the `EditorTabs` component directly. This requires you to manage state manually.

### Basic Usage

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

---

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

---

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

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `←` / `↑` | Focus previous tab |
| `→` / `↓` | Focus next tab |
| `Home` | Focus first tab |
| `End` | Focus last tab |
| `Enter` / `Space` | Select focused tab |
| `Shift + F10` | Open context menu |

---

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

## Accessibility

The component implements WAI-ARIA tab pattern:
- `role="tablist"` on container
- `role="tab"` on each tab
- `role="tabpanel"` on each panel
- `aria-selected` for active state
- `aria-labelledby` linking panels to tabs
- `tabIndex` management for keyboard navigation
- High contrast mode support via `@media (forced-colors: active)`

---

## License

MIT License - See LICENSE file for details.
