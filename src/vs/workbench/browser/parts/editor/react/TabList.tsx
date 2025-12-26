/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as React from 'react';
import { useCallback, useMemo, useEffect, useRef, Children, isValidElement } from 'react';
import { useTabsContext, TabData } from './TabContext.js';
import { EditorTabs } from './EditorTabs.js';
import type { EditorTab, EditorTabsCallbacks } from './types.js';
import type { TabProps } from './Tab.js';

/**
 * Props for the TabList component
 */
export interface TabListProps {
	/** Tab components to render */
	children: React.ReactNode;
	/** Additional CSS class */
	className?: string;
	/** Accessible label for the tab list */
	ariaLabel?: string;
	/** Called when a tab is double-clicked */
	onTabDoubleClick?: (tabId: string) => void;
	/** Called when tab context menu is requested */
	onTabContextMenu?: (tabId: string, event: React.MouseEvent) => void;
	/** Called when empty area is double-clicked */
	onEmptyAreaDoubleClick?: () => void;
	/** Called when tabs are reordered */
	onTabReorder?: (tabId: string, fromIndex: number, toIndex: number) => void;
	/** Called when external items are dropped */
	onExternalDrop?: (event: React.DragEvent, targetIndex: number) => void;
}

/**
 * TabList Component
 *
 * Container for Tab components. Renders the visual tab bar using the
 * EditorTabs component internally. Tab components are used declaratively
 * to define the tabs.
 *
 * @example
 * ```tsx
 * <Tabs defaultActiveTabId="tab1">
 *   <TabList>
 *     <Tab id="tab1" name="First Tab" />
 *     <Tab id="tab2" name="Second Tab" isDirty />
 *     <Tab id="tab3" name="Pinned" isPinned />
 *   </TabList>
 *   <TabPanel tabId="tab1">First content</TabPanel>
 *   <TabPanel tabId="tab2">Second content</TabPanel>
 *   <TabPanel tabId="tab3">Pinned content</TabPanel>
 * </Tabs>
 * ```
 */
export const TabList: React.FC<TabListProps> = ({
	children,
	className,
	ariaLabel = 'Editor tabs',
	onTabDoubleClick,
	onTabContextMenu,
	onEmptyAreaDoubleClick,
	onTabReorder,
	onExternalDrop,
}) => {
	const {
		activeTabId,
		selectedTabIds,
		isGroupFocused,
		registerTab,
		selectTab,
		closeTab,
		setSelectedTabs,
		setTabPinned,
		options,
		theme,
	} = useTabsContext();

	// Ref to track registered tabs from children
	const registeredTabsRef = useRef<Map<string, TabData>>(new Map());

	// Extract tab data from children and register them
	useEffect(() => {
		const tabsFromChildren: TabData[] = [];

		Children.forEach(children, (child) => {
			if (isValidElement(child) && child.props && 'id' in child.props && 'name' in child.props) {
				const props = child.props as TabProps;
				tabsFromChildren.push({
					id: props.id,
					name: props.name,
					description: props.description,
					title: props.title,
					icon: props.icon,
					isDirty: props.isDirty ?? false,
					isPinned: props.isPinned ?? false,
					isSticky: props.isSticky ?? props.isPinned ?? false,
					isPreview: props.isPreview ?? false,
					disabled: props.disabled ?? false,
				});
			}
		});

		// Register all tabs
		tabsFromChildren.forEach((tab) => {
			registeredTabsRef.current.set(tab.id, tab);
			registerTab(tab);
		});
	}, [children, registerTab]);

	// Convert TabData to EditorTab format
	const tabs: EditorTab[] = useMemo(() => {
		const result: EditorTab[] = [];

		Children.forEach(children, (child) => {
			if (isValidElement(child) && child.props && 'id' in child.props && 'name' in child.props) {
				const props = child.props as TabProps;
				result.push({
					id: props.id,
					name: props.name,
					description: props.description,
					title: props.title,
					icon: props.icon,
					isDirty: props.isDirty,
					isPinned: props.isPinned,
					isSticky: props.isSticky ?? props.isPinned,
					isPreview: props.isPreview,
				});
			}
		});

		return result;
	}, [children]);

	// Handle tab selection
	const handleTabSelect = useCallback((tabId: string) => {
		selectTab(tabId);
	}, [selectTab]);

	// Handle tab close
	const handleTabClose = useCallback((tabId: string) => {
		closeTab(tabId);
	}, [closeTab]);

	// Handle multi-select
	const handleTabMultiSelect = useCallback((tabIds: string[]) => {
		setSelectedTabs(tabIds);
	}, [setSelectedTabs]);

	// Handle double click (pin/unpin)
	const handleTabDoubleClick = useCallback((tabId: string) => {
		if (onTabDoubleClick) {
			onTabDoubleClick(tabId);
		} else {
			// Default behavior: toggle pin
			const tab = tabs.find(t => t.id === tabId);
			if (tab) {
				setTabPinned(tabId, !tab.isPinned);
			}
		}
	}, [tabs, onTabDoubleClick, setTabPinned]);

	// Build callbacks object
	const callbacks: EditorTabsCallbacks = useMemo(() => ({
		onTabSelect: handleTabSelect,
		onTabClose: handleTabClose,
		onTabMultiSelect: handleTabMultiSelect,
		onTabDoubleClick: handleTabDoubleClick,
		onTabContextMenu,
		onEmptyAreaDoubleClick,
		onTabReorder,
		onExternalDrop,
	}), [
		handleTabSelect,
		handleTabClose,
		handleTabMultiSelect,
		handleTabDoubleClick,
		onTabContextMenu,
		onEmptyAreaDoubleClick,
		onTabReorder,
		onExternalDrop,
	]);

	return (
		<>
			{/* Render Tab children to trigger their registration effects */}
			{children}

			{/* Render the actual tab bar */}
			<EditorTabs
				tabs={tabs}
				activeTabId={activeTabId}
				selectedTabIds={selectedTabIds}
				isGroupFocused={isGroupFocused}
				options={options}
				theme={theme}
				callbacks={callbacks}
				className={className}
				ariaLabel={ariaLabel}
			/>
		</>
	);
};

export default TabList;
