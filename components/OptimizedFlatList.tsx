import React, { memo, useCallback, useMemo } from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Stone } from '../data/stones';
import { UI_CONSTANTS } from '../constants';

const { width } = Dimensions.get('window');

interface OptimizedFlatListProps extends Omit<FlatListProps<Stone>, 'renderItem' | 'data'> {
  data: Stone[];
  renderItem: ListRenderItem<Stone>;
  viewMode?: 'list' | 'grid';
  itemHeight?: number;
  numColumns?: number;
}

const ITEM_HEIGHTS = {
  list: 120, // Approximate height for list items
  grid: 200, // Approximate height for grid items
};

const GRID_COLUMNS = 2;

export const OptimizedFlatList = memo<OptimizedFlatListProps>((
  {
    data,
    renderItem,
    viewMode = 'list',
    itemHeight,
    numColumns,
    style,
    contentContainerStyle,
    ...props
  }
) => {
  // Calculate item layout for performance optimization
  const getItemLayout = useCallback(
    (data: ArrayLike<Stone> | null | undefined, index: number) => {
      const height = itemHeight || ITEM_HEIGHTS[viewMode];
      return {
        length: height,
        offset: height * index,
        index,
      };
    },
    [itemHeight, viewMode]
  );

  // Key extractor for better performance
  const keyExtractor = useCallback((item: Stone) => item.id, []);

  // Memoized style calculations
  const flatListStyle = useMemo(() => {
    const baseStyle: ViewStyle = {
      flex: 1,
    };

    if (Array.isArray(style)) {
      return [baseStyle, ...style];
    }

    return [baseStyle, style];
  }, [style]);

  const contentStyle = useMemo(() => {
    const baseStyle = {
      paddingHorizontal: UI_CONSTANTS.SPACING.MD,
      paddingBottom: UI_CONSTANTS.SPACING.XL,
    };

    if (Array.isArray(contentContainerStyle)) {
      return [baseStyle, ...contentContainerStyle];
    }

    return [baseStyle, contentContainerStyle];
  }, [contentContainerStyle]);

  return (
    <FlatList
      {...props}
      data={data}
      renderItem={renderItem}
      style={flatListStyle}
      contentContainerStyle={contentStyle}
      numColumns={numColumns || (viewMode === 'grid' ? GRID_COLUMNS : 1)}
      getItemLayout={getItemLayout}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={20}
      updateCellsBatchingPeriod={100}
      initialNumToRender={10}
      windowSize={10}
      scrollEventThrottle={16}
    />
  );
});

OptimizedFlatList.displayName = 'OptimizedFlatList';