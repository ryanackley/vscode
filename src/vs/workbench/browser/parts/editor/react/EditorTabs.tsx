/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
	EditorTabsProps,
	EditorTab,
	DragState,
	DropLocation,
	TabSizing,
	EditorTabsTheme,
} from './types.js';
import './EditorTabs.css';

// Constants following VS Code patterns
const TAB_WIDTH = {
	compact: 38,
	shrink: 80,
	fit: 120,
};

const SCROLLBAR_SIZES = {
	default: 3,
	large: 10,
};

const DRAG_OVER_OPEN_TAB_THRESHOLD = 1500;
const MOUSE_WHEEL_EVENT_THRESHOLD = 150;
const MOUSE_WHEEL_DISTANCE_THRESHOLD = 1.5;

/**
 * Close icon SVG component
 */
const CloseIcon: React.FC = () => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"
		/>
	</svg>
);

/**
 * Pin icon SVG component for sticky tabs
 */
const PinIcon: React.FC = () => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
		<path d="M10.5 2.5L11 3l-1.5 1.5 3 3L14 6l.5.5-4 4L10 11l-2-2-4.5 4.5-.5-.5L7.5 8l-.5-.5.5-.5L10.5 4 9 2.5l.5-.5.5.5z" />
	</svg>
);

/**
 * Determines drop location (left or right) based on mouse position relative to tab
 */
function getDropLocation(event: React.DragEvent, element: HTMLElement): DropLocation {
	const rect = element.getBoundingClientRect();
	const midpoint = rect.left + rect.width / 2;
	return event.clientX < midpoint ? 'left' : 'right';
}

/**
 * Generates CSS custom properties from theme
 */
function themeToStyles(theme?: EditorTabsTheme): React.CSSProperties {
	if (!theme) return {};

	const styleMap: Record<string, string | undefined> = {
		'--tab-active-background': theme.tabActiveBackground,
		'--tab-inactive-background': theme.tabInactiveBackground,
		'--tab-unfocused-active-background': theme.tabUnfocusedActiveBackground,
		'--tab-unfocused-inactive-background': theme.tabUnfocusedInactiveBackground,
		'--tab-active-foreground': theme.tabActiveForeground,
		'--tab-inactive-foreground': theme.tabInactiveForeground,
		'--tab-unfocused-active-foreground': theme.tabUnfocusedActiveForeground,
		'--tab-unfocused-inactive-foreground': theme.tabUnfocusedInactiveForeground,
		'--tab-border': theme.tabBorder,
		'--tab-active-border-top': theme.tabActiveBorderTop,
		'--tab-active-border': theme.tabActiveBorder,
		'--tab-active-modified-border': theme.tabActiveModifiedBorder,
		'--tab-inactive-modified-border': theme.tabInactiveModifiedBorder,
		'--tab-hover-background': theme.tabHoverBackground,
		'--tab-hover-border': theme.tabHoverBorder,
		'--tab-hover-foreground': theme.tabHoverForeground,
		'--tab-last-pinned-border': theme.tabLastPinnedBorder,
		'--tab-selected-background': theme.tabSelectedBackground,
		'--tab-selected-foreground': theme.tabSelectedForeground,
		'--tab-drag-and-drop-border': theme.tabDragAndDropBorder,
		'--editor-group-header-tabs-background': theme.editorGroupHeaderTabsBackground,
		'--editor-group-header-tabs-border': theme.editorGroupHeaderTabsBorder,
	};

	return Object.fromEntries(
		Object.entries(styleMap).filter(([, value]) => value !== undefined)
	) as React.CSSProperties;
}

/**
 * Individual Tab Component
 */
interface TabProps {
	tab: EditorTab;
	index: number;
	isActive: boolean;
	isSelected: boolean;
	isLastSticky: boolean;
	tabSizing: TabSizing;
	closeButtonPosition: 'left' | 'right' | 'off';
	isDragging: boolean;
	dropLocation: DropLocation | null;
	onSelect: (tabId: string, event: React.MouseEvent) => void;
	onClose: (tabId: string, event: React.MouseEvent) => void;
	onDoubleClick: (tabId: string) => void;
	onContextMenu: (tabId: string, event: React.MouseEvent) => void;
	onDragStart: (tabId: string, event: React.DragEvent) => void;
	onDragOver: (tabId: string, event: React.DragEvent, element: HTMLElement) => void;
	onDragLeave: (tabId: string) => void;
	onDrop: (tabId: string, event: React.DragEvent, element: HTMLElement) => void;
	onDragEnd: () => void;
}

const Tab: React.FC<TabProps> = ({
	tab,
	index,
	isActive,
	isSelected,
	isLastSticky,
	tabSizing,
	closeButtonPosition,
	isDragging,
	dropLocation,
	onSelect,
	onClose,
	onDoubleClick,
	onContextMenu,
	onDragStart,
	onDragOver,
	onDragLeave,
	onDrop,
	onDragEnd,
}) => {
	const tabRef = useRef<HTMLDivElement>(null);

	const classNames = useMemo(() => {
		const classes = ['editor-tab'];
		classes.push(`sizing-${tabSizing}`);

		if (isActive) classes.push('active');
		if (isSelected && !isActive) classes.push('selected');
		if (tab.isDirty) classes.push('dirty');
		if (tab.isPreview) classes.push('preview');

		if (tab.isSticky) {
			classes.push('sticky');
			if (tabSizing === 'fit' || tabSizing === 'fixed') {
				classes.push('sticky-compact');
			} else {
				classes.push('sticky-shrink');
			}
		}

		if (isLastSticky) classes.push('last-sticky');
		if (isDragging) classes.push('dragging');
		if (dropLocation === 'left') classes.push('drop-target-left');
		if (dropLocation === 'right') classes.push('drop-target-right');

		if (closeButtonPosition === 'left') classes.push('close-left');
		if (closeButtonPosition === 'off') classes.push('close-off');

		return classes.join(' ');
	}, [tab, isActive, isSelected, isLastSticky, tabSizing, closeButtonPosition, isDragging, dropLocation]);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (e.button === 0) {
				onSelect(tab.id, e);
			}
		},
		[tab.id, onSelect]
	);

	const handleAuxClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.button === 1) {
				// Middle click - close tab
				e.preventDefault();
				e.stopPropagation();
				onClose(tab.id, e);
			}
		},
		[tab.id, onClose]
	);

	const handleDoubleClick = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onDoubleClick(tab.id);
		},
		[tab.id, onDoubleClick]
	);

	const handleContextMenu = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			onContextMenu(tab.id, e);
		},
		[tab.id, onContextMenu]
	);

	const handleCloseClick = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onClose(tab.id, e);
		},
		[tab.id, onClose]
	);

	const handleDragStart = useCallback(
		(e: React.DragEvent) => {
			onDragStart(tab.id, e);
		},
		[tab.id, onDragStart]
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			if (tabRef.current) {
				onDragOver(tab.id, e, tabRef.current);
			}
		},
		[tab.id, onDragOver]
	);

	const handleDragLeave = useCallback(() => {
		onDragLeave(tab.id);
	}, [tab.id, onDragLeave]);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			if (tabRef.current) {
				onDrop(tab.id, e, tabRef.current);
			}
		},
		[tab.id, onDrop]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onSelect(tab.id, e as unknown as React.MouseEvent);
			}
		},
		[tab.id, onSelect]
	);

	// Show only icon for sticky-compact tabs
	const showOnlyIcon = tab.isSticky && (tabSizing === 'fit' || tabSizing === 'fixed');

	return (
		<div
			ref={tabRef}
			className={classNames}
			role="tab"
			tabIndex={isActive ? 0 : -1}
			aria-selected={isActive}
			aria-label={tab.title || tab.name}
			title={tab.title || tab.name}
			draggable
			onMouseDown={handleMouseDown}
			onAuxClick={handleAuxClick}
			onDoubleClick={handleDoubleClick}
			onContextMenu={handleContextMenu}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			onDragEnd={onDragEnd}
			onKeyDown={handleKeyDown}
		>
			{/* Border top container */}
			<div className="editor-tab-border-top" />

			{/* Tab icon */}
			{tab.icon && (
				<div className="editor-tab-icon">
					{tab.icon.startsWith('http') || tab.icon.startsWith('data:') ? (
						<img src={tab.icon} alt="" />
					) : (
						<span className={tab.icon} />
					)}
				</div>
			)}

			{/* Tab label (hidden for sticky-compact) */}
			{!showOnlyIcon && (
				<div className="editor-tab-label">
					<span className="editor-tab-name">{tab.name}</span>
					{tab.description && (
						<span className="editor-tab-description">{tab.description}</span>
					)}
				</div>
			)}

			{/* Tab actions (close button) */}
			<div className="editor-tab-actions">
				<button
					className="editor-tab-close-button"
					onClick={handleCloseClick}
					aria-label={tab.isSticky ? 'Unpin' : 'Close'}
					title={tab.isSticky ? 'Unpin' : 'Close'}
					tabIndex={-1}
				>
					{tab.isSticky ? <PinIcon /> : <CloseIcon />}
				</button>
			</div>

			{/* Border bottom container */}
			<div className="editor-tab-border-bottom" />
		</div>
	);
};

/**
 * EditorTabs Component
 *
 * A React component that replicates VS Code's editor tabs functionality.
 * Supports multiple tab sizing modes, drag and drop reordering, multi-selection,
 * keyboard navigation, and theming.
 */
export const EditorTabs: React.FC<EditorTabsProps> = ({
	tabs,
	activeTabId,
	selectedTabIds = [],
	isGroupFocused = true,
	options = {},
	theme,
	callbacks = {},
	className,
	ariaLabel = 'Editor tabs',
}) => {
	const {
		tabSizing = 'shrink',
		tabHeight = 'default',
		tabCloseButton = 'right',
		wrapTabs = false,
		scrollToSwitchTabs = false,
		showScrollbar = true,
		scrollbarSize = 'default',
		tabSizingFixedMinWidth = 50,
		tabSizingFixedMaxWidth = 160,
	} = options;

	const {
		onTabSelect,
		onTabClose,
		onTabReorder,
		onTabDoubleClick,
		onTabContextMenu,
		onTabMultiSelect,
		onEmptyAreaDoubleClick,
		onExternalDrop,
	} = callbacks;

	const containerRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const lastWheelEventTime = useRef(0);

	const [dragState, setDragState] = useState<DragState>({
		isDragging: false,
		draggedTabIds: [],
		dropTargetIndex: null,
		dropLocation: null,
	});

	// Separate sticky and non-sticky tabs
	const { stickyTabs, regularTabs, lastStickyIndex } = useMemo(() => {
		const sticky: EditorTab[] = [];
		const regular: EditorTab[] = [];

		tabs.forEach((tab) => {
			if (tab.isSticky) {
				sticky.push(tab);
			} else {
				regular.push(tab);
			}
		});

		return {
			stickyTabs: sticky,
			regularTabs: regular,
			lastStickyIndex: sticky.length - 1,
		};
	}, [tabs]);

	// Combined tabs for rendering (sticky first, then regular)
	const orderedTabs = useMemo(() => [...stickyTabs, ...regularTabs], [stickyTabs, regularTabs]);

	// Scroll to active tab when it changes
	useEffect(() => {
		if (activeTabId && scrollContainerRef.current) {
			const activeElement = scrollContainerRef.current.querySelector('.editor-tab.active');
			if (activeElement) {
				activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
			}
		}
	}, [activeTabId]);

	// Mouse wheel tab switching
	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			if (!scrollToSwitchTabs || tabs.length < 2 || !activeTabId) {
				return;
			}

			// Shift key modifier check
			if (scrollToSwitchTabs && e.shiftKey) {
				return;
			}

			// Throttle events
			const now = Date.now();
			const timeSinceLastEvent = now - lastWheelEventTime.current;
			const threshold = MOUSE_WHEEL_EVENT_THRESHOLD - 2 * (Math.abs(e.deltaX) + Math.abs(e.deltaY));

			if (timeSinceLastEvent < threshold) {
				return;
			}

			lastWheelEventTime.current = now;

			// Determine scroll direction
			const delta = e.deltaX + e.deltaY;
			if (Math.abs(delta) < MOUSE_WHEEL_DISTANCE_THRESHOLD) {
				return;
			}

			const direction = delta > 0 ? 1 : -1;
			const currentIndex = orderedTabs.findIndex((t) => t.id === activeTabId);
			const nextIndex = currentIndex + direction;

			if (nextIndex >= 0 && nextIndex < orderedTabs.length) {
				e.preventDefault();
				onTabSelect?.(orderedTabs[nextIndex].id);
			}
		},
		[scrollToSwitchTabs, tabs.length, activeTabId, orderedTabs, onTabSelect]
	);

	// Tab selection handler
	const handleTabSelect = useCallback(
		(tabId: string, event: React.MouseEvent) => {
			const isCtrlOrCmd = event.ctrlKey || event.metaKey;
			const isShift = event.shiftKey;

			if (isCtrlOrCmd && onTabMultiSelect) {
				// Multi-select with Ctrl/Cmd
				const newSelection = selectedTabIds.includes(tabId)
					? selectedTabIds.filter((id) => id !== tabId)
					: [...selectedTabIds, tabId];
				onTabMultiSelect(newSelection);
			} else if (isShift && onTabMultiSelect && activeTabId) {
				// Range select with Shift
				const startIndex = orderedTabs.findIndex((t) => t.id === activeTabId);
				const endIndex = orderedTabs.findIndex((t) => t.id === tabId);
				const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
				const rangeIds = orderedTabs.slice(from, to + 1).map((t) => t.id);
				onTabMultiSelect(rangeIds);
			} else {
				// Normal select
				onTabSelect?.(tabId);
			}
		},
		[selectedTabIds, activeTabId, orderedTabs, onTabSelect, onTabMultiSelect]
	);

	// Tab close handler
	const handleTabClose = useCallback(
		(tabId: string, _event: React.MouseEvent) => {
			onTabClose?.(tabId);
		},
		[onTabClose]
	);

	// Tab double click handler
	const handleTabDoubleClick = useCallback(
		(tabId: string) => {
			onTabDoubleClick?.(tabId);
		},
		[onTabDoubleClick]
	);

	// Tab context menu handler
	const handleTabContextMenu = useCallback(
		(tabId: string, event: React.MouseEvent) => {
			onTabContextMenu?.(tabId, event);
		},
		[onTabContextMenu]
	);

	// Empty area double click handler
	const handleEmptyAreaDoubleClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === scrollContainerRef.current) {
				onEmptyAreaDoubleClick?.();
			}
		},
		[onEmptyAreaDoubleClick]
	);

	// Drag and drop handlers
	const handleDragStart = useCallback(
		(tabId: string, event: React.DragEvent) => {
			const tabIds = selectedTabIds.includes(tabId) ? selectedTabIds : [tabId];

			setDragState({
				isDragging: true,
				draggedTabIds: tabIds,
				dropTargetIndex: null,
				dropLocation: null,
			});

			// Set drag data
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('application/vscode-editor-tab', JSON.stringify(tabIds));

			// Set drag image for multiple tabs
			if (tabIds.length > 1) {
				const label = `${tabs.find((t) => t.id === tabId)?.name || 'Tab'} + ${tabIds.length - 1}`;
				const dragImage = document.createElement('div');
				dragImage.textContent = label;
				dragImage.style.cssText =
					'position: absolute; top: -1000px; padding: 4px 8px; background: #333; color: #fff; border-radius: 4px;';
				document.body.appendChild(dragImage);
				event.dataTransfer.setDragImage(dragImage, 0, 0);
				setTimeout(() => document.body.removeChild(dragImage), 0);
			}
		},
		[selectedTabIds, tabs]
	);

	const handleDragOver = useCallback(
		(tabId: string, event: React.DragEvent, element: HTMLElement) => {
			if (!dragState.isDragging || dragState.draggedTabIds.includes(tabId)) {
				return;
			}

			const location = getDropLocation(event, element);
			const targetIndex = orderedTabs.findIndex((t) => t.id === tabId);

			setDragState((prev) => ({
				...prev,
				dropTargetIndex: targetIndex,
				dropLocation: location,
			}));
		},
		[dragState.isDragging, dragState.draggedTabIds, orderedTabs]
	);

	const handleDragLeave = useCallback((_tabId: string) => {
		setDragState((prev) => ({
			...prev,
			dropTargetIndex: null,
			dropLocation: null,
		}));
	}, []);

	const handleDrop = useCallback(
		(tabId: string, event: React.DragEvent, element: HTMLElement) => {
			if (!dragState.isDragging) {
				// Handle external drop
				const targetIndex = orderedTabs.findIndex((t) => t.id === tabId);
				const location = getDropLocation(event, element);
				const adjustedIndex = location === 'right' ? targetIndex + 1 : targetIndex;
				onExternalDrop?.(event, adjustedIndex);
				return;
			}

			const location = getDropLocation(event, element);
			const targetIndex = orderedTabs.findIndex((t) => t.id === tabId);
			const adjustedTargetIndex = location === 'right' ? targetIndex + 1 : targetIndex;

			// Reorder tabs
			dragState.draggedTabIds.forEach((draggedId, offset) => {
				const fromIndex = orderedTabs.findIndex((t) => t.id === draggedId);
				if (fromIndex !== -1 && fromIndex !== adjustedTargetIndex + offset) {
					onTabReorder?.(draggedId, fromIndex, adjustedTargetIndex + offset);
				}
			});

			setDragState({
				isDragging: false,
				draggedTabIds: [],
				dropTargetIndex: null,
				dropLocation: null,
			});
		},
		[dragState.isDragging, dragState.draggedTabIds, orderedTabs, onTabReorder, onExternalDrop]
	);

	const handleDragEnd = useCallback(() => {
		setDragState({
			isDragging: false,
			draggedTabIds: [],
			dropTargetIndex: null,
			dropLocation: null,
		});
	}, []);

	// Container drop handler for dropping at end
	const handleContainerDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
	}, []);

	const handleContainerDrop = useCallback(
		(e: React.DragEvent) => {
			if (e.target === scrollContainerRef.current) {
				e.preventDefault();

				if (dragState.isDragging) {
					// Move to end
					dragState.draggedTabIds.forEach((draggedId, offset) => {
						const fromIndex = orderedTabs.findIndex((t) => t.id === draggedId);
						const toIndex = orderedTabs.length - 1 + offset;
						if (fromIndex !== -1 && fromIndex !== toIndex) {
							onTabReorder?.(draggedId, fromIndex, toIndex);
						}
					});
				} else {
					onExternalDrop?.(e, orderedTabs.length);
				}

				setDragState({
					isDragging: false,
					draggedTabIds: [],
					dropTargetIndex: null,
					dropLocation: null,
				});
			}
		},
		[dragState.isDragging, dragState.draggedTabIds, orderedTabs, onTabReorder, onExternalDrop]
	);

	// Build class names
	const containerClassNames = useMemo(() => {
		const classes = ['editor-tabs'];
		if (isGroupFocused) classes.push('focused');
		if (tabHeight === 'compact') classes.push('compact');
		if (wrapTabs) classes.push('wrapping');
		if (className) classes.push(className);
		return classes.join(' ');
	}, [isGroupFocused, tabHeight, wrapTabs, className]);

	// Build inline styles from theme
	const containerStyles = useMemo(() => {
		const styles: React.CSSProperties = themeToStyles(theme);

		if (tabSizing === 'fixed') {
			styles['--tab-sizing-fixed-min-width' as string] = `${tabSizingFixedMinWidth}px`;
			styles['--tab-sizing-fixed-max-width' as string] = `${tabSizingFixedMaxWidth}px`;
		}

		return styles;
	}, [theme, tabSizing, tabSizingFixedMinWidth, tabSizingFixedMaxWidth]);

	return (
		<div
			ref={containerRef}
			className={containerClassNames}
			style={containerStyles}
			role="tablist"
			aria-label={ariaLabel}
			onWheel={handleWheel}
		>
			<div className="editor-tabs-scrollable">
				<div
					ref={scrollContainerRef}
					className={`editor-tabs-container ${wrapTabs ? 'wrapping' : ''}`}
					onDoubleClick={handleEmptyAreaDoubleClick}
					onDragOver={handleContainerDragOver}
					onDrop={handleContainerDrop}
				>
					{orderedTabs.map((tab, index) => {
						const isActive = tab.id === activeTabId;
						const isSelected = selectedTabIds.includes(tab.id);
						const isLastSticky = tab.isSticky && index === lastStickyIndex;
						const isDragging = dragState.draggedTabIds.includes(tab.id);
						const dropLocation =
							dragState.dropTargetIndex === index ? dragState.dropLocation : null;

						return (
							<Tab
								key={tab.id}
								tab={tab}
								index={index}
								isActive={isActive}
								isSelected={isSelected}
								isLastSticky={isLastSticky}
								tabSizing={tabSizing}
								closeButtonPosition={tabCloseButton}
								isDragging={isDragging}
								dropLocation={dropLocation}
								onSelect={handleTabSelect}
								onClose={handleTabClose}
								onDoubleClick={handleTabDoubleClick}
								onContextMenu={handleTabContextMenu}
								onDragStart={handleDragStart}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								onDragEnd={handleDragEnd}
							/>
						);
					})}
				</div>

				{/* Custom scrollbar */}
				{showScrollbar && !wrapTabs && (
					<div
						className={`editor-tabs-scrollbar ${scrollbarSize === 'large' ? 'large' : ''}`}
					>
						<div className="editor-tabs-scrollbar-thumb" />
					</div>
				)}
			</div>

			{/* Editor actions slot */}
			<div className="editor-tabs-actions">
				{/* Actions toolbar can be passed as children or configured separately */}
			</div>
		</div>
	);
};

export default EditorTabs;
