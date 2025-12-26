/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as React from 'react';
import { createContext, useContext } from 'react';
import type { EditorTabsOptions, EditorTabsTheme } from './types.js';

/**
 * Internal tab data collected from Tab components
 */
export interface TabData {
	id: string;
	name: string;
	description?: string;
	title?: string;
	icon?: string;
	isDirty?: boolean;
	isPinned?: boolean;
	isSticky?: boolean;
	isPreview?: boolean;
	disabled?: boolean;
}

/**
 * Context value shared between Tabs components
 */
export interface TabsContextValue {
	/** Currently active tab ID */
	activeTabId: string | undefined;
	/** Selected tab IDs for multi-select */
	selectedTabIds: string[];
	/** Whether the tab group is focused */
	isGroupFocused: boolean;
	/** Register a tab with the context */
	registerTab: (tab: TabData) => void;
	/** Unregister a tab from the context */
	unregisterTab: (tabId: string) => void;
	/** Select a tab */
	selectTab: (tabId: string) => void;
	/** Close a tab */
	closeTab: (tabId: string) => void;
	/** Update multi-selection */
	setSelectedTabs: (tabIds: string[]) => void;
	/** Mark a tab as dirty */
	setTabDirty: (tabId: string, isDirty: boolean) => void;
	/** Pin/unpin a tab */
	setTabPinned: (tabId: string, isPinned: boolean) => void;
	/** Configuration options */
	options: EditorTabsOptions;
	/** Theme colors */
	theme?: EditorTabsTheme;
	/** Force re-render of tab list */
	forceUpdate: () => void;
}

/**
 * Context for sharing state between Tabs, TabList, Tab, and TabPanel components
 */
export const TabsContext = createContext<TabsContextValue | null>(null);

/**
 * Hook to access tabs context
 * @throws Error if used outside of Tabs component
 */
export function useTabsContext(): TabsContextValue {
	const context = useContext(TabsContext);
	if (!context) {
		throw new Error(
			'useTabsContext must be used within a <Tabs> component. ' +
			'Make sure your Tab, TabList, and TabPanel components are descendants of Tabs.'
		);
	}
	return context;
}

/**
 * Hook to check if a specific tab is active
 */
export function useIsActiveTab(tabId: string): boolean {
	const { activeTabId } = useTabsContext();
	return activeTabId === tabId;
}

/**
 * Hook to check if a specific tab is selected (multi-select)
 */
export function useIsSelectedTab(tabId: string): boolean {
	const { selectedTabIds } = useTabsContext();
	return selectedTabIds.includes(tabId);
}
