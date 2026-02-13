'use client';

import React, { useState, useEffect } from 'react';
import { RAMADAN_START_DATE, RAMADAN_DAYS } from '@/lib/goalCalculations';

interface NotesModalProps {
  onClose: () => void;
}

// Get the date string for a specific Ramadan day
function getDateForDay(startDate: string, dayNumber: number): string {
  const start = new Date(startDate + 'T00:00:00');
  const target = new Date(start);
  target.setDate(start.getDate() + dayNumber - 1);
  return target.toISOString().split('T')[0];
}

// Format date as "Feb 17"
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

// Format date for calendar (YYYYMMDD)
function formatCalendarDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

// Generate Google Calendar URL for an event
function generateGoogleCalendarUrl(title: string, description: string, dateStr: string): string {
  const date = formatCalendarDate(dateStr);
  // For all-day event, end date should be the next day
  const startDate = new Date(dateStr + 'T00:00:00');
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  const endDateStr = formatCalendarDate(endDate.toISOString().split('T')[0]);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    dates: `${date}/${endDateStr}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate ICS file content for download
function generateICSContent(title: string, description: string, dates: string[]): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ramadan Journal//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  dates.forEach((dateStr, index) => {
    const date = formatCalendarDate(dateStr);
    const startDate = new Date(dateStr + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = formatCalendarDate(endDate.toISOString().split('T')[0]);

    icsContent += `BEGIN:VEVENT
DTSTART;VALUE=DATE:${date}
DTEND;VALUE=DATE:${endDateStr}
DTSTAMP:${timestamp}
UID:ramadan-note-${date}-${index}@ramadanjournal.app
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
STATUS:CONFIRMED
END:VEVENT
`;
  });

  icsContent += 'END:VCALENDAR';
  return icsContent;
}

// Download ICS file
function downloadICSFile(title: string, description: string, dates: string[]): void {
  const icsContent = generateICSContent(title, description, dates);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ramadan-reminder.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Get the day of week (0=Sun, 6=Sat) for the start date
function getStartDayOfWeek(): number {
  return new Date(RAMADAN_START_DATE + 'T00:00:00').getDay();
}

// Get day note from localStorage
function getDayNote(dayNumber: number): string {
  if (typeof window === 'undefined') return '';
  const key = `day-note-${dayNumber}`;
  return localStorage.getItem(key) || '';
}

// Save day note to localStorage
function saveDayNote(dayNumber: number, note: string): void {
  if (typeof window === 'undefined') return;
  const key = `day-note-${dayNumber}`;
  if (note.trim()) {
    localStorage.setItem(key, note);
  } else {
    localStorage.removeItem(key);
  }
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function NotesModal({ onClose }: NotesModalProps) {
  const [note, setNote] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Get selected dates for calendar
  const getSelectedDates = (): string[] => {
    return selectedDays.map(day => getDateForDay(RAMADAN_START_DATE, day));
  };

  // Handle adding to Google Calendar
  const handleAddToGoogleCalendar = () => {
    const dates = getSelectedDates();
    const title = `Ramadan Reminder: ${note.slice(0, 50)}${note.length > 50 ? '...' : ''}`;

    // Open each date in a new tab (for multiple days, we open the first one)
    // For multiple events, recommend using ICS download
    if (dates.length === 1) {
      window.open(generateGoogleCalendarUrl(title, note, dates[0]), '_blank');
    } else {
      // For multiple dates, open first one and show message
      window.open(generateGoogleCalendarUrl(title, note, dates[0]), '_blank');
    }
    setCalendarAdded(true);
    setShowCalendarOptions(false);
  };

  // Handle downloading ICS file
  const handleDownloadICS = () => {
    const dates = getSelectedDates();
    const title = `Ramadan Reminder: ${note.slice(0, 50)}${note.length > 50 ? '...' : ''}`;
    downloadICSFile(title, note, dates);
    setCalendarAdded(true);
    setShowCalendarOptions(false);
  };

  const toggleDay = (dayNumber: number) => {
    setSelectedDays(prev =>
      prev.includes(dayNumber)
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber].sort((a, b) => a - b)
    );
  };

  const selectAllDays = () => {
    setSelectedDays(Array.from({ length: RAMADAN_DAYS }, (_, i) => i + 1));
  };

  const clearSelection = () => {
    setSelectedDays([]);
  };

  const handleSave = () => {
    if (selectedDays.length === 0 || !note.trim()) return;

    // Save note to all selected days
    selectedDays.forEach(day => {
      saveDayNote(day, note);
    });

    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Modal - Journal Style */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl animate-scale-in journal-card">
        {/* Header */}
        <div className="flex-shrink-0 relative bg-gradient-to-b from-white to-[var(--cream)]/30 px-6 py-5 border-b border-[var(--cream-dark)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h3 className="journal-header text-xl font-bold">Add a Note</h3>
                <p className="text-[var(--text-muted)] text-sm">Write a note and select days</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white hover:bg-[var(--cream)] border border-[var(--cream-dark)] flex items-center justify-center transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 text-[var(--green-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Decorative divider */}
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-auto p-6">
          {saved ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--green-dark)]/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--green-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xl font-bold text-[var(--green-dark)]">Note Saved!</p>
              <p className="text-[var(--text-secondary)] mt-2">
                Your note has been added to {selectedDays.length} day{selectedDays.length > 1 ? 's' : ''}.
              </p>
            </div>
          ) : (
            <>
              {/* Step 1: Write your note */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--green-dark)] mb-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--green-dark)] text-white flex items-center justify-center text-xs font-bold">1</span>
                  Write your note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write your note here... e.g., 'Visit family after Iftar', 'Reflect on Surah Al-Mulk', 'Remember to call grandparents'"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[var(--cream-dark)] bg-[var(--cream)]/30 text-[var(--green-dark)] placeholder-[var(--text-muted)] focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/10 transition-all outline-none resize-none text-base"
                  rows={3}
                  autoFocus
                />
              </div>

              {/* Step 2: Pick days */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--green-dark)]">
                    <span className="w-6 h-6 rounded-full bg-[var(--green-dark)] text-white flex items-center justify-center text-xs font-bold">2</span>
                    Select days for this note
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllDays}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[var(--green-dark)]/10 text-[var(--green-dark)] hover:bg-[var(--green-dark)]/20 transition-colors font-medium"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[var(--cream)] text-[var(--text-secondary)] hover:bg-[var(--cream-dark)] transition-colors font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Calendar picker */}
                <div className="rounded-xl bg-gradient-to-b from-[var(--cream)]/50 to-[var(--cream)] p-4 border border-[var(--cream-dark)]">
                  {/* Week header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map((name) => (
                      <div
                        key={name}
                        className="h-6 flex items-center justify-center text-[10px] font-bold text-[var(--green-dark)]/50 uppercase"
                      >
                        {name}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells before Day 1 */}
                    {Array.from({ length: getStartDayOfWeek() }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-10" />
                    ))}

                    {/* All Ramadan days */}
                    {Array.from({ length: RAMADAN_DAYS }).map((_, i) => {
                      const dayNumber = i + 1;
                      const isSelected = selectedDays.includes(dayNumber);
                      const dateStr = getDateForDay(RAMADAN_START_DATE, dayNumber);
                      const shortDate = formatShortDate(dateStr);
                      const hasExistingNote = getDayNote(dayNumber);

                      return (
                        <button
                          key={dayNumber}
                          type="button"
                          onClick={() => toggleDay(dayNumber)}
                          className={`h-10 rounded-lg flex flex-col items-center justify-center transition-all duration-200 relative ${
                            isSelected
                              ? 'bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] text-white shadow-md scale-[1.02]'
                              : 'bg-white border border-[var(--cream-dark)] text-[var(--text-secondary)] hover:border-[var(--green-light)] hover:shadow-md'
                          }`}
                        >
                          <span className={`text-[6px] font-medium leading-none mb-0.5 ${
                            isSelected ? 'text-white/70' : 'text-[var(--text-muted)]'
                          }`}>
                            {shortDate}
                          </span>
                          <span className="text-[11px] font-bold leading-none">
                            {dayNumber}
                          </span>
                          {/* Existing note indicator */}
                          {hasExistingNote && !isSelected && (
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--gold)] rounded-full" />
                          )}
                          {/* Selected checkmark */}
                          {isSelected && (
                            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--gold)] rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selection info */}
                  <div className="mt-3 pt-2 border-t border-[var(--cream-dark)]">
                    <p className="text-xs text-[var(--text-secondary)]">
                      <span className="font-bold text-[var(--green-dark)]">{selectedDays.length}</span> day{selectedDays.length !== 1 ? 's' : ''} selected
                      {selectedDays.length > 0 && (
                        <span className="text-[var(--text-muted)]">
                          {' '}• Days: {selectedDays.slice(0, 5).join(', ')}{selectedDays.length > 5 ? ` +${selectedDays.length - 5} more` : ''}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-[var(--text-muted)] mt-2 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-[var(--gold)] rounded-full"></span>
                  Gold dot = existing note (will be replaced)
                </p>
              </div>
            </>
          )}
        </div>

        {/* Sticky Footer with Action Buttons */}
        {!saved && (
          <div className="flex-shrink-0 border-t border-[var(--cream-dark)] bg-white p-4">
            {/* Calendar success message */}
            {calendarAdded && (
              <div className="mb-3 p-2 bg-[var(--gold)]/10 border border-[var(--gold)]/20 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-[var(--green-dark)]">
                  Calendar event{selectedDays.length > 1 ? 's' : ''} created!
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={selectedDays.length === 0 || !note.trim()}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold rounded-xl transition-all ${
                  selectedDays.length > 0 && note.trim()
                    ? 'bg-gradient-to-r from-[var(--green-dark)] to-[var(--green-medium)] text-white shadow-lg hover:shadow-xl'
                    : 'bg-[var(--cream-dark)] text-[var(--text-muted)] cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Note
              </button>

              {/* Add to Calendar button */}
              <div className="relative">
                <button
                  onClick={() => setShowCalendarOptions(!showCalendarOptions)}
                  disabled={selectedDays.length === 0 || !note.trim()}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 font-bold rounded-xl transition-all ${
                    selectedDays.length > 0 && note.trim()
                      ? calendarAdded
                        ? 'bg-[var(--gold)]/20 text-[var(--gold)] border-2 border-[var(--gold)]'
                        : 'bg-white text-[var(--green-dark)] border-2 border-[var(--green-dark)] hover:bg-[var(--cream)]'
                      : 'bg-[var(--cream)] text-[var(--text-muted)] border-2 border-[var(--cream-dark)] cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {calendarAdded ? 'Added!' : 'Add to Calendar'}
                </button>

                {/* Calendar options dropdown */}
                {showCalendarOptions && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-64 bg-white rounded-xl shadow-2xl border border-[var(--cream-dark)] overflow-hidden z-20 animate-fade-in">
                    <div className="p-2">
                      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide px-3 py-2">
                        Choose Calendar
                      </p>

                      {/* Google Calendar */}
                      <button
                        onClick={handleAddToGoogleCalendar}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--cream)] transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white border border-[var(--cream-dark)] flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--green-dark)]">Google Calendar</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {selectedDays.length === 1 ? 'Opens in new tab' : 'Opens first date'}
                          </p>
                        </div>
                      </button>

                      {/* Download ICS */}
                      <button
                        onClick={handleDownloadICS}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--cream)] transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--green-dark)]">Download .ics File</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            Apple Calendar, Outlook, etc.
                          </p>
                        </div>
                      </button>

                      {selectedDays.length > 1 && (
                        <p className="text-xs text-[var(--text-muted)] px-3 py-2 border-t border-[var(--cream-dark)] mt-2">
                          Creates {selectedDays.length} events for all selected days
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 px-4 py-2 text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--green-dark)] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Export helper to get note for use in other components
export function getDayNoteForDisplay(dayNumber: number): string {
  return getDayNote(dayNumber);
}
