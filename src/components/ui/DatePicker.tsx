import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({ label, value, onChange, error }: DatePickerProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'monthSelect'>('calendar');

  // Sync internal state with prop value
  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(parsed);
      }
    }
  }, [value]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to format date as YYYY-MM-DD
  const formatDateString = (y: number, m: number, d: number): string => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Generate calendar days
  const calendarCells: { day: number | null; isCurrent: boolean }[] = [];
  
  // Previous month padding
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ day: null, isCurrent: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ day: i, isCurrent: true });
  }

  // Next month padding to keep grid consistent (6 rows * 7 columns = 42 cells)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 0; i < remainingCells; i++) {
    calendarCells.push({ day: null, isCurrent: false });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dayNum: number) => {
    const dateStr = formatDateString(year, month, dayNum);
    onChange(dateStr);
    setModalVisible(false);
  };

  const handleSelectMonth = (monthIndex: number) => {
    setCurrentDate(new Date(year, monthIndex, 1));
    setViewMode('calendar');
  };

  const handleYearChange = (delta: number) => {
    setCurrentDate(new Date(year + delta, month, 1));
  };

  // Convert YYYY-MM-DD to readable date like "21 July 2026"
  const getReadableValue = (): string => {
    if (!value) return 'Select Date';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value;
    return `${parsed.getDate()} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>}
      
      <Pressable 
        style={({ pressed }) => [
          styles.pickerTrigger,
          { 
            backgroundColor: themeColors.surfaceHover,
            borderColor: error ? themeColors.expense : (pressed ? themeColors.primary : 'transparent'),
            borderWidth: 1.5,
          }
        ]}
        onPress={() => {
          setViewMode('calendar');
          setModalVisible(true);
        }}
      >
        <Text style={[styles.pickerValueText, { color: value ? themeColors.textPrimary : themeColors.textMuted }]}>
          {getReadableValue()}
        </Text>
        <MaterialCommunityIcons name="calendar-month-outline" size={20} color={themeColors.textSecondary} />
      </Pressable>
      
      {error && <Text style={[styles.error, { color: themeColors.expense }]}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalOutsidePress} onPress={() => setModalVisible(false)} />
          
          <View style={styles.modalContent}>
            {/* Header controls */}
            <View style={styles.calendarHeader}>
              {viewMode === 'calendar' ? (
                <>
                  <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={themeColors.textPrimary} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setViewMode('monthSelect')} style={styles.headerTitleWrap}>
                    <Text style={styles.headerTitle}>
                      {MONTHS[month]} {year}
                    </Text>
                    <MaterialCommunityIcons name="menu-down" size={20} color={themeColors.textPrimary} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={themeColors.textPrimary} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.monthSelectHeader}>
                  <TouchableOpacity onPress={() => handleYearChange(-1)} style={styles.navBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={themeColors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>{year}</Text>
                  <TouchableOpacity onPress={() => handleYearChange(1)} style={styles.navBtn}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={themeColors.textPrimary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* View Mode: Calendar */}
            {viewMode === 'calendar' && (
              <View>
                {/* Weekdays */}
                <View style={styles.weekdaysRow}>
                  {WEEKDAYS.map((day, idx) => (
                    <Text key={idx} style={styles.weekdayText}>{day}</Text>
                  ))}
                </View>

                {/* Day Grid */}
                <View style={styles.daysGrid}>
                  {calendarCells.map((cell, index) => {
                    if (!cell.day) {
                      return <View key={index} style={styles.dayCellEmpty} />;
                    }

                    const cellDateString = formatDateString(year, month, cell.day);
                    const isSelected = value === cellDateString;
                    const isTodayString = new Date().toDateString() === new Date(year, month, cell.day).toDateString();

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSelectDay(cell.day!)}
                        style={[
                          styles.dayCell,
                          isSelected && styles.dayCellSelected,
                          !isSelected && isTodayString && styles.dayCellToday
                        ]}
                      >
                        <Text 
                          style={[
                            styles.dayText,
                            isSelected && styles.dayTextSelected,
                            !isSelected && isTodayString && { color: themeColors.income, fontWeight: '700' }
                          ]}
                        >
                          {cell.day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* View Mode: Month Quick Select Grid */}
            {viewMode === 'monthSelect' && (
              <View style={styles.monthSelectGrid}>
                {SHORT_MONTHS.map((mName, mIdx) => {
                  const isCurrentSelection = month === mIdx;
                  return (
                    <TouchableOpacity
                      key={mIdx}
                      onPress={() => handleSelectMonth(mIdx)}
                      style={[
                        styles.monthChip,
                        isCurrentSelection && styles.monthChipSelected
                      ]}
                    >
                      <Text 
                        style={[
                          styles.monthChipText,
                          isCurrentSelection && styles.monthChipTextSelected
                        ]}
                      >
                        {mName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Cancel Button */}
            <View style={styles.footerRow}>
              {viewMode === 'monthSelect' && (
                <TouchableOpacity 
                  onPress={() => setViewMode('calendar')}
                  style={styles.cancelLink}
                >
                  <Text style={[styles.cancelText, { color: themeColors.primary }]}>Back to Calendar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={viewMode === 'monthSelect' ? styles.closeBtn : styles.cancelLink}
              >
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerTrigger: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValueText: {
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalOutsidePress: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 32,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: themeColors.surfaceHover,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: themeColors.surfaceHover,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  monthSelectHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: themeColors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '13%', // roughly 1/7th
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    marginBottom: 4,
  },
  dayCellEmpty: {
    width: '13%',
    aspectRatio: 1,
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: themeColors.textPrimary,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: themeColors.income,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: themeColors.textPrimary,
  },
  dayTextSelected: {
    color: themeColors.surface,
    fontWeight: '700',
  },
  monthSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  monthChip: {
    width: '31%',
    aspectRatio: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: 10,
    backgroundColor: themeColors.surfaceHover,
  },
  monthChipSelected: {
    backgroundColor: themeColors.textPrimary,
    borderColor: themeColors.textPrimary,
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.textPrimary,
  },
  monthChipTextSelected: {
    color: themeColors.surface,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  cancelLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: themeColors.textSecondary,
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: themeColors.surfaceHover,
    borderRadius: 12,
  },
});
