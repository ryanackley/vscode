/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Represents a single editor tab
 */
export interface EditorTab {
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
	/** Whether the tab is pinned (won't close on preview) */
	isPinned?: boolean;
	/** Whether the tab is sticky (stays at the beginning) */
	isSticky?: boolean;
	/** Whether the tab is in preview mode */
	isPreview?: boolean;
	/** Resource URI associated with the tab */
	resource?: string;
}

/**
 * Tab sizing mode following VS Code patterns
 */
export type TabSizing = 'fit' | 'shrink' | 'fixed';

/**
 * Tab height mode
 */
export type TabHeight = 'default' | 'compact';

/**
 * Position of close action button
 */
export type TabCloseButtonPosition = 'left' | 'right' | 'off';

/**
 * Drag and drop location relative to a tab
 */
export type DropLocation = 'left' | 'right';

/**
 * Theme colors for tabs following VS Code theme system
 */
export interface EditorTabsTheme {
	/** Background color of active tab */
	tabActiveBackground?: string;
	/** Background color of inactive tabs */
	tabInactiveBackground?: string;
	/** Background color of active tab in unfocused group */
	tabUnfocusedActiveBackground?: string;
	/** Background color of inactive tabs in unfocused group */
	tabUnfocusedInactiveBackground?: string;
	/** Foreground color of active tab */
	tabActiveForeground?: string;
	/** Foreground color of inactive tabs */
	tabInactiveForeground?: string;
	/** Foreground color of active tab in unfocused group */
	tabUnfocusedActiveForeground?: string;
	/** Foreground color of inactive tabs in unfocused group */
	tabUnfocusedInactiveForeground?: string;
	/** Border color between tabs */
	tabBorder?: string;
	/** Top border color of active tab */
	tabActiveBorderTop?: string;
	/** Bottom border color of active tab */
	tabActiveBorder?: string;
	/** Border color indicating modified (dirty) tab */
	tabActiveModifiedBorder?: string;
	/** Border color indicating modified (dirty) inactive tab */
	tabInactiveModifiedBorder?: string;
	/** Background color on tab hover */
	tabHoverBackground?: string;
	/** Border color on tab hover */
	tabHoverBorder?: string;
	/** Foreground color on tab hover */
	tabHoverForeground?: string;
	/** Border color of last pinned tab */
	tabLastPinnedBorder?: string;
	/** Background color for selected (multi-select) tabs */
	tabSelectedBackground?: string;
	/** Foreground color for selected (multi-select) tabs */
	tabSelectedForeground?: string;
	/** Border color for drag and drop indicator */
	tabDragAndDropBorder?: string;
	/** Background color for editor group header */
	editorGroupHeaderTabsBackground?: string;
	/** Border color for editor group header */
	editorGroupHeaderTabsBorder?: string;
}

/**
 * Event handlers for tab interactions
 */
export interface EditorTabsCallbacks {
	/** Called when a tab is selected/clicked */
	onTabSelect?: (tabId: string, options?: { preserveFocus?: boolean }) => void;
	/** Called when a tab close button is clicked */
	onTabClose?: (tabId: string) => void;
	/** Called when tabs are reordered via drag and drop */
	onTabReorder?: (tabId: string, fromIndex: number, toIndex: number) => void;
	/** Called when a tab is double-clicked (typically to pin) */
	onTabDoubleClick?: (tabId: string) => void;
	/** Called when tab context menu is requested */
	onTabContextMenu?: (tabId: string, event: React.MouseEvent) => void;
	/** Called when multiple tabs are selected (Ctrl/Cmd+click) */
	onTabMultiSelect?: (tabIds: string[]) => void;
	/** Called when empty area is double-clicked (typically to create new tab) */
	onEmptyAreaDoubleClick?: () => void;
	/** Called when a tab is dragged outside to create a new window */
	onTabDragOut?: (tabIds: string[], position: { x: number; y: number }) => void;
	/** Called when external items are dropped onto the tab bar */
	onExternalDrop?: (event: React.DragEvent, targetIndex: number) => void;
	/** Called when tab is pinned/unpinned */
	onTabPin?: (tabId: string, isPinned: boolean) => void;
}

/**
 * Configuration options for EditorTabs component
 */
export interface EditorTabsOptions {
	/** How tabs should be sized: 'fit' (fixed width), 'shrink' (shrink to fit), 'fixed' (configurable min/max) */
	tabSizing?: TabSizing;
	/** Tab height mode */
	tabHeight?: TabHeight;
	/** Position of close button on tabs */
	tabCloseButton?: TabCloseButtonPosition;
	/** Enable tab wrapping to multiple rows */
	wrapTabs?: boolean;
	/** Show pinned tabs on separate row */
	pinnedTabsOnSeparateRow?: boolean;
	/** Enable mouse wheel to switch between tabs */
	scrollToSwitchTabs?: boolean;
	/** Show scrollbar in tab bar */
	showScrollbar?: boolean;
	/** Scrollbar size: 'default' (3px) or 'large' (10px) */
	scrollbarSize?: 'default' | 'large';
	/** Fixed tab sizing constraints (when tabSizing is 'fixed') */
	tabSizingFixedMinWidth?: number;
	/** Fixed tab sizing constraints (when tabSizing is 'fixed') */
	tabSizingFixedMaxWidth?: number;
	/** Allow dragging tabs to create new windows */
	enableDragToNewWindow?: boolean;
	/** Show icon for pinned tabs */
	showPinnedTabIcon?: boolean;
}

/**
 * Props for the EditorTabs component
 */
export interface EditorTabsProps {
	/** Array of tabs to display */
	tabs: EditorTab[];
	/** ID of the currently active tab */
	activeTabId?: string;
	/** IDs of currently selected tabs (for multi-select) */
	selectedTabIds?: string[];
	/** Whether this tab group is focused */
	isGroupFocused?: boolean;
	/** Configuration options */
	options?: EditorTabsOptions;
	/** Theme colors */
	theme?: EditorTabsTheme;
	/** Event callbacks */
	callbacks?: EditorTabsCallbacks;
	/** Additional CSS class name */
	className?: string;
	/** Accessible label for the tab list */
	ariaLabel?: string;
}

/**
 * Internal state for drag and drop operations
 */
export interface DragState {
	isDragging: boolean;
	draggedTabIds: string[];
	dropTargetIndex: number | null;
	dropLocation: DropLocation | null;
}
