import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface TableCell {
  text: string;
  columnIndex: number;
}

interface TableRow {
  cells: TableCell[];
  isHeader: boolean;
}

interface TableData {
  type: 'table';
  id: string;
  rows: TableRow[];
  columns: number;
}

interface TableViewerProps {
  /** Table data extracted from Google Docs */
  tableData: TableData;
  /** Custom style for the table container */
  style?: any;
  /** Custom style for header cells */
  headerStyle?: any;
  /** Custom style for regular cells */
  cellStyle?: any;
  /** Custom style for header text */
  headerTextStyle?: any;
  /** Custom style for cell text */
  cellTextStyle?: any;
}

/**
 * Component that renders tables extracted from Google Docs
 */
export function TableViewer({
  tableData,
  style,
  headerStyle,
  cellStyle,
  headerTextStyle,
  cellTextStyle,
}: TableViewerProps) {
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return (
      <ThemedView style={[styles.container, style]}>
        <ThemedText style={styles.emptyText}>No table data available</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, style]}>
      <View style={styles.table}>
        {tableData.rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.cells.map((cell, cellIndex) => (
              <View
                key={cellIndex}
                style={[
                  styles.cell,
                  row.isHeader ? [styles.headerCell, headerStyle] : cellStyle,
                  // Make cells equal width
                  { flex: 1 }
                ]}
              >
                <ThemedText
                  style={[
                    styles.cellText,
                    row.isHeader 
                      ? [styles.headerText, headerTextStyle] 
                      : cellTextStyle
                  ]}
                >
                  {cell.text || ''}
                </ThemedText>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    backgroundColor: 'transparent',
  },
  table: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  cell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
    justifyContent: 'center',
    minHeight: 44,
  },
  headerCell: {
    backgroundColor: '#f8f9fa',
  },
  cellText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    textAlign: 'left',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#495057',
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});
