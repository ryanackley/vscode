/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as React from 'react';
import { useEffect } from 'react';
import { useTabsContext } from './TabContext.js';

/**
 * Props for the Tab component
 */
export interface TabProps {
	/** Unique identifier for the tab */
	id: string;
	/** Display name of the tab */
	name: string;
	/** Optional description (e.g., file path) */
	description?: string;
	/** Full title for tooltip */
	title?: string;
	/** Icon class name or URL */
	icon?: string;
	/** Whether the tab has unsaved changes */
	isDirty?: boolean;
	/** Whether the tab is pinned */
	isPinned?: boolean;
	/** Whether the tab is sticky (stays at beginning) */
	isSticky?: boolean;
	/** Whether the tab is in preview mode */
	isPreview?: boolean;
	/** Whether the tab is disabled */
	disabled?: boolean;
	/** Children are not rendered - Tab is just for declaration */
	children?: never;
}

/**
 * Tab Component
 *
 * A declarative component used within TabList to define a tab.
 * This component doesn't render anything itself - it registers
 * the tab data with the parent Tabs context.
 *
 * @example
 * ```tsx
 * <TabList>
 *   <Tab id="file1" name="index.ts" icon="ts-icon" />
 *   <Tab id="file2" name="App.tsx" isDirty />
 *   <Tab id="file3" name="README.md" isPinned />
 * </TabList>
 * ```
 */
export const Tab: React.FC<TabProps> = ({
	id,
	name,
	description,
	title,
	icon,
	isDirty = false,
	isPinned = false,
	isSticky = false,
	isPreview = false,
	disabled = false,
}) => {
	const { registerTab, unregisterTab } = useTabsContext();

	// Register/update this tab when props change
	useEffect(() => {
		registerTab({
			id,
			name,
			description,
			title,
			icon,
			isDirty,
			isPinned,
			isSticky: isSticky || isPinned, // Pinned tabs are always sticky
			isPreview,
			disabled,
		});

		return () => {
			unregisterTab(id);
		};
	}, [
		id,
		name,
		description,
		title,
		icon,
		isDirty,
		isPinned,
		isSticky,
		isPreview,
		disabled,
		registerTab,
		unregisterTab,
	]);

	// Tab doesn't render anything - it's purely declarative
	return null;
};

export default Tab;
