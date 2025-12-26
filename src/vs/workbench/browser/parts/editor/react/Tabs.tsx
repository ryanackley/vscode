/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as React from 'react';
import { useCallback, useMemo, useRef, useState, useReducer } from 'react';
import { TabsContext, TabData, TabsContextValue } from './TabContext.js';
import type { EditorTabsOptions, EditorTabsTheme } from './types.js';
import './Tabs.css';

/**
 * Props for the Tabs container component
 */
export interface TabsProps {
	/** Content including TabList, Tab, and TabPanel components */
	children: React.ReactNode;
	/** Default active tab ID (uncontrolled mode) */
	defaultActiveTabId?: string;
	/** Active tab ID (controlled mode) */
	activeTabId?: string;
	/** Default selected tab IDs for multi-select (uncontrolled mode) */
	defaultSelectedTabIds?: string[];
	/** Selected tab IDs for multi-select (controlled mode) */
	selectedTabIds?: string[];
	/** Whether the tab group is focused */
	isGroupFocused?: boolean;
	/** Configuration options passed to TabList */
	options?: EditorTabsOptions;
	/** Theme colors passed to TabList */
	theme?: EditorTabsTheme;
	/** Called when active tab changes */
	onTabChange?: (tabId: string) => void;
	/** Called when a tab is closed */
	onTabClose?: (tabId: string) => void;
	/** Called when selection changes */
	onSelectionChange?: (tabIds: string[]) => void;
	/** Called when a tab's dirty state changes */
	onTabDirtyChange?: (tabId: string, isDirty: boolean) => void;
	/** Called when a tab is pinned/unpinned */
	onTabPinChange?: (tabId: string, isPinned: boolean) => void;
	/** Additional CSS class */
	className?: string;
	/** Whether to persist the active tab in order (activate next tab on close) */
	activateAdjacentOnClose?: boolean;
	/** Orientation of the tabs */
	orientation?: 'horizontal' | 'vertical';
}

/**
 * Tabs Container Component
 *
 * The main wrapper component that provides context for Tab, TabList, and TabPanel
 * components. Manages the active tab state and provides callbacks for tab interactions.
 *
 * Supports both controlled and uncontrolled modes:
 * - Uncontrolled: Use `defaultActiveTabId` and let the component manage state
 * - Controlled: Use `activeTabId` and `onTabChange` to manage state externally
 *
 * @example
 * ```tsx
 * // Uncontrolled usage
 * <Tabs defaultActiveTabId="tab1">
 *   <TabList>
 *     <Tab id="tab1" name="First" />
 *     <Tab id="tab2" name="Second" />
 *   </TabList>
 *   <TabPanel tabId="tab1">First panel content</TabPanel>
 *   <TabPanel tabId="tab2">Second panel content</TabPanel>
 * </Tabs>
 *
 * // Controlled usage
 * <Tabs activeTabId={activeTab} onTabChange={setActiveTab}>
 *   ...
 * </Tabs>
 * ```
 */
export const Tabs: React.FC<TabsProps> = ({
	children,
	defaultActiveTabId,
	activeTabId: controlledActiveTabId,
	defaultSelectedTabIds = [],
	selectedTabIds: controlledSelectedTabIds,
	isGroupFocused = true,
	options = {},
	theme,
	onTabChange,
	onTabClose,
	onSelectionChange,
	onTabDirtyChange,
	onTabPinChange,
	className,
	activateAdjacentOnClose = true,
	orientation = 'horizontal',
}) => {
	// Determine if we're in controlled mode
	const isControlled = controlledActiveTabId !== undefined;
	const isSelectionControlled = controlledSelectedTabIds !== undefined;

	// Internal state for uncontrolled mode
	const [internalActiveTabId, setInternalActiveTabId] = useState<string | undefined>(defaultActiveTabId);
	const [internalSelectedTabIds, setInternalSelectedTabIds] = useState<string[]>(defaultSelectedTabIds);

	// Use controlled or internal state
	const activeTabId = isControlled ? controlledActiveTabId : internalActiveTabId;
	const selectedTabIds = isSelectionControlled ? controlledSelectedTabIds : internalSelectedTabIds;

	// Registry of tabs
	const tabsRef = useRef<Map<string, TabData>>(new Map());
	const tabOrderRef = useRef<string[]>([]);

	// Force update mechanism
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	// Register a tab
	const registerTab = useCallback((tab: TabData) => {
		const existing = tabsRef.current.get(tab.id);
		if (!existing) {
			tabOrderRef.current.push(tab.id);
		}
		tabsRef.current.set(tab.id, tab);
		forceUpdate();
	}, []);

	// Unregister a tab
	const unregisterTab = useCallback((tabId: string) => {
		tabsRef.current.delete(tabId);
		tabOrderRef.current = tabOrderRef.current.filter(id => id !== tabId);
		forceUpdate();
	}, []);

	// Select a tab
	const selectTab = useCallback((tabId: string) => {
		const tab = tabsRef.current.get(tabId);
		if (tab?.disabled) {
			return;
		}

		if (!isControlled) {
			setInternalActiveTabId(tabId);
		}
		onTabChange?.(tabId);

		// Clear multi-selection on single select
		if (!isSelectionControlled) {
			setInternalSelectedTabIds([]);
		}
		onSelectionChange?.([]);
	}, [isControlled, isSelectionControlled, onTabChange, onSelectionChange]);

	// Close a tab
	const closeTab = useCallback((tabId: string) => {
		onTabClose?.(tabId);

		// If closing the active tab, activate adjacent
		if (activeTabId === tabId && activateAdjacentOnClose) {
			const order = tabOrderRef.current;
			const currentIndex = order.indexOf(tabId);

			if (currentIndex !== -1) {
				// Try next tab, then previous
				const nextId = order[currentIndex + 1] || order[currentIndex - 1];
				if (nextId) {
					selectTab(nextId);
				}
			}
		}
	}, [activeTabId, activateAdjacentOnClose, onTabClose, selectTab]);

	// Update multi-selection
	const setSelectedTabs = useCallback((tabIds: string[]) => {
		if (!isSelectionControlled) {
			setInternalSelectedTabIds(tabIds);
		}
		onSelectionChange?.(tabIds);
	}, [isSelectionControlled, onSelectionChange]);

	// Set tab dirty state
	const setTabDirty = useCallback((tabId: string, isDirty: boolean) => {
		const tab = tabsRef.current.get(tabId);
		if (tab) {
			tab.isDirty = isDirty;
			forceUpdate();
		}
		onTabDirtyChange?.(tabId, isDirty);
	}, [onTabDirtyChange]);

	// Set tab pinned state
	const setTabPinned = useCallback((tabId: string, isPinned: boolean) => {
		const tab = tabsRef.current.get(tabId);
		if (tab) {
			tab.isPinned = isPinned;
			tab.isSticky = isPinned; // Sticky follows pinned
			forceUpdate();
		}
		onTabPinChange?.(tabId, isPinned);
	}, [onTabPinChange]);

	// Create context value
	const contextValue: TabsContextValue = useMemo(() => ({
		activeTabId,
		selectedTabIds,
		isGroupFocused,
		registerTab,
		unregisterTab,
		selectTab,
		closeTab,
		setSelectedTabs,
		setTabDirty,
		setTabPinned,
		options,
		theme,
		forceUpdate,
	}), [
		activeTabId,
		selectedTabIds,
		isGroupFocused,
		registerTab,
		unregisterTab,
		selectTab,
		closeTab,
		setSelectedTabs,
		setTabDirty,
		setTabPinned,
		options,
		theme,
	]);

	const containerClassName = useMemo(() => {
		const classes = ['tabs-container'];
		if (orientation === 'vertical') classes.push('tabs-vertical');
		if (className) classes.push(className);
		return classes.join(' ');
	}, [orientation, className]);

	return (
		<TabsContext.Provider value={contextValue}>
			<div className={containerClassName} data-orientation={orientation}>
				{children}
			</div>
		</TabsContext.Provider>
	);
};

export default Tabs;
