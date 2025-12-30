import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { EditorsPick } from './ArticleBrowserPanel';

interface ScheduleModalProps {
  postId: string;
  existingPick?: EditorsPick;
  onClose: () => void;
  onSave: (postId: string, scheduledStart: string, scheduledEnd: string | null) => void;
}

export function ScheduleModal({ postId, existingPick, onClose, onSave }: ScheduleModalProps) {
  const [publishImmediately, setPublishImmediately] = useState(!existingPick);
  const [noEndDate, setNoEndDate] = useState(!existingPick?.scheduled_end);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (existingPick) {
      const start = new Date(existingPick.scheduled_start);
      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));

      if (existingPick.scheduled_end) {
        const end = new Date(existingPick.scheduled_end);
        setEndDate(end.toISOString().split('T')[0]);
        setEndTime(end.toTimeString().slice(0, 5));
        setNoEndDate(false);
      } else {
        setNoEndDate(true);
      }
      setPublishImmediately(false);
    } else {
      const now = new Date();
      setStartDate(now.toISOString().split('T')[0]);
      setStartTime(now.toTimeString().slice(0, 5));

      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setEndDate(weekLater.toISOString().split('T')[0]);
      setEndTime(weekLater.toTimeString().slice(0, 5));
    }
  }, [existingPick]);

  function handleSave() {
    let scheduledStart: string;
    let scheduledEnd: string | null = null;

    if (publishImmediately) {
      scheduledStart = new Date().toISOString();
    } else {
      if (!startDate || !startTime) {
        alert('Please set a start date and time');
        return;
      }
      scheduledStart = new Date(`${startDate}T${startTime}`).toISOString();
    }

    if (!noEndDate) {
      if (!endDate || !endTime) {
        alert('Please set an end date and time, or check "No end date"');
        return;
      }
      scheduledEnd = new Date(`${endDate}T${endTime}`).toISOString();

      if (new Date(scheduledEnd) <= new Date(scheduledStart)) {
        alert('End date must be after start date');
        return;
      }
    }

    onSave(postId, scheduledStart, scheduledEnd);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {existingPick ? 'Edit Schedule' : 'Schedule Article'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="rounded border-gray-300"
              />
              Publish immediately
            </label>
          </div>

          {!publishImmediately && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                  required
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={noEndDate}
                onChange={(e) => setNoEndDate(e.target.checked)}
                className="rounded border-gray-300"
              />
              No end date
            </label>
          </div>

          {!noEndDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                  required
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
            <div className="font-medium text-gray-700 mb-1">Preview</div>
            <div className="text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Appears:</span>{' '}
                {publishImmediately ? 'Now' : startDate && startTime ? new Date(`${startDate}T${startTime}`).toLocaleString() : '-'}
              </div>
              {!noEndDate && (
                <div>
                  <span className="font-medium">Disappears:</span>{' '}
                  {endDate && endTime ? new Date(`${endDate}T${endTime}`).toLocaleString() : '-'}
                </div>
              )}
              {noEndDate && (
                <div>
                  <span className="font-medium">Duration:</span> Indefinite
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              All times are in your local timezone
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {existingPick ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
