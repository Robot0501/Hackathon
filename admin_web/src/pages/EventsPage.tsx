import React, { useEffect, useState } from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RichfieldEvent } from '../types';
import { createEvent, deleteEvent } from '../lib/dataService';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<RichfieldEvent[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<RichfieldEvent['type']>('career_fair');
  const [date, setDate] = useState('24 October 2026');
  const [time, setTime] = useState('10:00 - 15:00');
  const [location, setLocation] = useState('Braamfontein Auditorium & Virtual');
  const [description, setDescription] = useState('');

  const load = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      date: r.date_label || r.date,
      time: r.time_label || r.time,
      location: r.location,
      campus: r.campus,
      description: r.description,
      organizer: r.organizer,
      rsvpCount: r.rsvp_count || 0,
      hasRsvp: false,
    } as RichfieldEvent));
    setEvents(mapped);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ev: RichfieldEvent = {
      id: `ev-${Date.now()}`,
      title: title.trim(),
      type,
      date,
      time,
      location,
      campus: location.includes('Pretoria') ? 'Pretoria Campus' : 'Braamfontein Campus',
      organizer: 'Richfield Academic Administration',
      description: description || 'Official institutional event.',
      rsvpCount: 0,
      hasRsvp: false,
    };
    await createEvent('00000000-0000-0000-0000-000000000000', ev); // created_by will be set via RLS? Use auth user
    // Workaround: dataService.createEvent expects userId, but we pass auth user
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (uid) {
      await supabase.from('events').insert({
        title: ev.title,
        type: ev.type,
        date_label: ev.date,
        time_label: ev.time,
        location: ev.location,
        campus: ev.campus,
        description: ev.description,
        organizer: ev.organizer,
        created_by: uid,
      });
    }
    setTitle('');
    setDescription('');
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await deleteEvent(id);
    await load();
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">Publish Official Event</h3>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Graduate Recruitment Gala 2026" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-400" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
              <div className="flex flex-wrap gap-1.5">
                {(['career_fair', 'hackathon', 'industry_talk', 'alumni_mixer'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setType(t)} className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border ${type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                <input value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Venue</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Details, speakers, requirements…" className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl">
              Publish Event to Community
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-sm text-slate-900 mb-4">Active Institutional Events ({events.length})</h3>
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="p-4 rounded-xl border bg-slate-50 flex justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-900 truncate">{ev.title}</div>
                  <div className="text-xs text-slate-500">
                    {ev.date} • {ev.time} • {ev.location}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ev.description}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{ev.rsvpCount} RSVPs • {ev.campus}</div>
                </div>
                <button onClick={() => handleDelete(ev.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl self-start">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {events.length === 0 && <div className="p-8 text-center text-sm text-slate-400">No events yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
