/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Main EditorTabs component (low-level, requires manual state management)
export { EditorTabs } from './EditorTabs.js';

// High-level declarative components (react-tabs pattern)
export { Tabs } from './Tabs.js';
export { Tab } from './Tab.js';
export { TabList } from './TabList.js';
export { TabPanel } from './TabPanel.js';

// Context and hooks
export {
	TabsContext,
	useTabsContext,
	useIsActiveTab,
	useIsSelectedTab,
} from './TabContext.js';

// Types
export type {
	// EditorTabs types
	EditorTab,
	EditorTabsProps,
	EditorTabsOptions,
	EditorTabsCallbacks,
	EditorTabsTheme,
	TabSizing,
	TabHeight,
	TabCloseButtonPosition,
	DropLocation,
	DragState,
} from './types.js';

export type { TabsProps } from './Tabs.js';
export type { TabProps } from './Tab.js';
export type { TabListProps } from './TabList.js';
export type { TabPanelProps } from './TabPanel.js';
export type { TabData, TabsContextValue } from './TabContext.js';

// Default export is the high-level Tabs component
export { Tabs as default } from './Tabs.js';
