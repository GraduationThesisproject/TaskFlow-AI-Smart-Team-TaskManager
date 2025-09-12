import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CATEGORY_OPTIONS, TYPE_OPTIONS } from '@/types/dash.types';
import type { TemplateType } from '@/types/dash.types';

interface TemplateFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: TemplateType | 'all';
  onTypeChange: (type: TemplateType | 'all') => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: 'newest' | 'popular' | 'name';
  onSortChange: (sort: 'newest' | 'popular' | 'name') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export default function TemplateFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  showFilters = true,
  onToggleFilters
}: TemplateFiltersProps) {
  const colors = useThemeColors();
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = () => {
    Alert.prompt(
      'Search Templates',
      'Enter search terms',
      (text) => onSearchChange(text || ''),
      'plain-text',
      searchQuery
    );
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onTypeChange('all');
    onCategoryChange('all');
    onSortChange('newest');
  };

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case 'newest': return 'clock-o';
      case 'popular': return 'heart';
      case 'name': return 'sort-alpha-asc';
      default: return 'sort';
    }
  };

  const getViewModeIcon = (mode: string) => {
    return mode === 'grid' ? 'th' : 'list';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={handleSearch}
        >
          <FontAwesome name="search" size={16} color={colors['muted-foreground']} />
          <Text style={[TextStyles.body.medium, { color: searchQuery ? colors.foreground : colors['muted-foreground'], marginLeft: 8 }]}>
            {searchQuery || 'Search templates...'}
          </Text>
        </TouchableOpacity>
        
        {searchQuery && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <FontAwesome name="times" size={16} color={colors['muted-foreground']} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Controls */}
      {showFilters && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {/* View Mode Toggle */}
          <View style={styles.filterGroup}>
            <TouchableOpacity 
              style={[styles.filterButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <FontAwesome 
                name={getViewModeIcon(viewMode)} 
                size={16} 
                color={colors.foreground} 
              />
            </TouchableOpacity>
          </View>

          {/* Type Filter */}
          <View style={styles.filterGroup}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 4 }]}>
              Type
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { backgroundColor: selectedType === 'all' ? colors.primary : colors.background, borderColor: colors.border }
                ]}
                onPress={() => onTypeChange('all')}
              >
                <Text style={[
                  TextStyles.caption.small,
                  { color: selectedType === 'all' ? colors['primary-foreground'] : colors.foreground }
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              
              {TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    { backgroundColor: selectedType === option.value ? colors.primary : colors.background, borderColor: colors.border }
                  ]}
                  onPress={() => onTypeChange(option.value)}
                >
                  <Text style={[
                    TextStyles.caption.small,
                    { color: selectedType === option.value ? colors['primary-foreground'] : colors.foreground }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category Filter */}
          <View style={styles.filterGroup}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 4 }]}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { backgroundColor: selectedCategory === 'all' ? colors.primary : colors.background, borderColor: colors.border }
                ]}
                onPress={() => onCategoryChange('all')}
              >
                <Text style={[
                  TextStyles.caption.small,
                  { color: selectedCategory === 'all' ? colors['primary-foreground'] : colors.foreground }
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              
              {CATEGORY_OPTIONS.slice(0, 6).map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    { backgroundColor: selectedCategory === option.value ? colors.primary : colors.background, borderColor: colors.border }
                  ]}
                  onPress={() => onCategoryChange(option.value)}
                >
                  <Text style={[
                    TextStyles.caption.small,
                    { color: selectedCategory === option.value ? colors['primary-foreground'] : colors.foreground }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sort Options */}
          <View style={styles.filterGroup}>
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginBottom: 4 }]}>
              Sort
            </Text>
            <TouchableOpacity 
              style={[styles.filterButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => {
                Alert.alert(
                  'Sort By',
                  'Choose sorting option',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Newest', onPress: () => onSortChange('newest') },
                    { text: 'Most Popular', onPress: () => onSortChange('popular') },
                    { text: 'Name A-Z', onPress: () => onSortChange('name') },
                  ]
                );
              }}
            >
              <FontAwesome name={getSortIcon(sortBy)} size={16} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Clear Filters */}
          <View style={styles.filterGroup}>
            <TouchableOpacity 
              style={[styles.clearFiltersButton, { backgroundColor: colors.destructive + '20', borderColor: colors.destructive }]}
              onPress={clearAllFilters}
            >
              <FontAwesome name="times-circle" size={16} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Active Filters Summary */}
      {(searchQuery || selectedType !== 'all' || selectedCategory !== 'all') && (
        <View style={styles.activeFiltersContainer}>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            Active filters:
          </Text>
          <View style={styles.activeFilters}>
            {searchQuery && (
              <View style={[styles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[TextStyles.caption.small, { color: colors.primary }]}>
                  Search: "{searchQuery}"
                </Text>
              </View>
            )}
            {selectedType !== 'all' && (
              <View style={[styles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[TextStyles.caption.small, { color: colors.primary }]}>
                  Type: {TYPE_OPTIONS.find(t => t.value === selectedType)?.label}
                </Text>
              </View>
            )}
            {selectedCategory !== 'all' && (
              <View style={[styles.activeFilterChip, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[TextStyles.caption.small, { color: colors.primary }]}>
                  Category: {CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.label}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filterGroup: {
    marginRight: 16,
    minWidth: 60,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  clearFiltersButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFiltersContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  activeFilterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
