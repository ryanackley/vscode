/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as React from 'react';
import { useMemo } from 'react';
import { useTabsContext } from './TabContext.js';
import './TabPanel.css';

/**
 * Props for the TabPanel component
 */
export interface TabPanelProps {
	/** ID of the tab this panel is associated with */
	tabId: string;
	/** Content to render when this panel is active */
	children: React.ReactNode;
	/** Additional CSS class */
	className?: string;
	/** Whether to keep the panel mounted when inactive (default: false) */
	forceMount?: boolean;
	/** Whether to render hidden content instead of unmounting (default: false) */
	keepMounted?: boolean;
	/** Custom render function for lazy loading */
	render?: () => React.ReactNode;
}

/**
 * TabPanel Component
 *
 * Renders content associated with a specific tab. The panel is only
 * visible when its associated tab is active.
 *
 * @example
 * ```tsx
 * <Tabs defaultActiveTabId="tab1">
 *   <TabList>
 *     <Tab id="tab1" name="First" />
 *     <Tab id="tab2" name="Second" />
 *   </TabList>
 *
 *   <TabPanel tabId="tab1">
 *     <p>Content for first tab</p>
 *   </TabPanel>
 *
 *   <TabPanel tabId="tab2">
 *     <p>Content for second tab</p>
 *   </TabPanel>
 * </Tabs>
 * ```
 *
 * @example
 * ```tsx
 * // Keep panel mounted but hidden (preserves state)
 * <TabPanel tabId="tab1" keepMounted>
 *   <ExpensiveComponent />
 * </TabPanel>
 *
 * // Force mount even when inactive (always in DOM)
 * <TabPanel tabId="tab2" forceMount>
 *   <VideoPlayer />
 * </TabPanel>
 *
 * // Lazy load content
 * <TabPanel tabId="tab3" render={() => <HeavyComponent />} />
 * ```
 */
export const TabPanel: React.FC<TabPanelProps> = ({
	tabId,
	children,
	className,
	forceMount = false,
	keepMounted = false,
	render,
}) => {
	const { activeTabId } = useTabsContext();
	const isActive = activeTabId === tabId;

	// Build class names
	const panelClassName = useMemo(() => {
		const classes = ['tab-panel'];
		if (isActive) classes.push('tab-panel-active');
		if (!isActive) classes.push('tab-panel-inactive');
		if (className) classes.push(className);
		return classes.join(' ');
	}, [isActive, className]);

	// Determine what to render
	const content = render ? render() : children;

	// If not active and not keeping mounted, don't render
	if (!isActive && !forceMount && !keepMounted) {
		return null;
	}

	// If keeping mounted but inactive, render hidden
	if (!isActive && keepMounted) {
		return (
			<div
				className={panelClassName}
				role="tabpanel"
				id={`tabpanel-${tabId}`}
				aria-labelledby={`tab-${tabId}`}
				hidden
				aria-hidden="true"
			>
				{content}
			</div>
		);
	}

	return (
		<div
			className={panelClassName}
			role="tabpanel"
			id={`tabpanel-${tabId}`}
			aria-labelledby={`tab-${tabId}`}
			tabIndex={0}
			aria-hidden={!isActive}
			style={!isActive && forceMount ? { display: 'none' } : undefined}
		>
			{content}
		</div>
	);
};

export default TabPanel;
