'use client';

import { useState, useEffect } from 'react';

// 日历事件接口
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

// 从localStorage读取日历事件
function loadEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('calendar-events');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

// 保存日历事件到localStorage
function saveEvents(events: CalendarEvent[]) {
  try {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  } catch {}
}

export default function CalendarImport() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '10:00',
    description: ''
  });

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const handleAddEvent = () => {
    if (!newEvent.title) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title || '',
      date: newEvent.date || new Date().toISOString().slice(0, 10),
      startTime: newEvent.startTime || '09:00',
      endTime: newEvent.endTime || '10:00',
      description: newEvent.description || ''
    };

    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    setShowForm(false);
    setNewEvent({
      title: '',
      date: new Date().toISOString().slice(0, 10),
      startTime: '09:00',
      endTime: '10:00',
      description: ''
    });
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  };

  const getWeekEvents = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  };

  const weekEvents = getWeekEvents();

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">📅 日历事件</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          {showForm ? '取消' : '+ 添加事件'}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">事件标题</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="输入事件标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">日期</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">开始时间</label>
              <input
                type="time"
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">结束时间</label>
              <input
                type="time"
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="输入事件描述"
              rows={2}
            />
          </div>
          <button
            onClick={handleAddEvent}
            disabled={!newEvent.title}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            保存事件
          </button>
        </div>
      )}

      {weekEvents.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">本周事件</h4>
          {weekEvents.map(event => (
            <div key={event.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-500">
                  {event.date} {event.startTime}-{event.endTime}
                </div>
              </div>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="text-red-500 hover:text-red-700"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-4">暂无日历事件</p>
      )}
    </div>
  );
}
