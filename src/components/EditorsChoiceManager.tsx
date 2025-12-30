import { useState, useEffect } from 'react';
import { Search, Calendar, X, Clock, CheckCircle, Archive, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { normalizeArabicAlef } from '../utils/arabicNormalization';
import { BlogPost, Author, Category } from '../utils/blogHelpers';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { EditorsPick, ArticleBrowserPanel } from './EditorsPick/ArticleBrowserPanel';
import { SelectedArticlesPanel } from './EditorsPick/SelectedArticlesPanel';
import { ScheduleModal } from './EditorsPick/ScheduleModal';

export interface EditorsPickWithPost extends EditorsPick {
  blog_posts?: BlogPost;
}

export function EditorsChoiceManager() {
  const [picks, setPicks] = useState<EditorsPickWithPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxSlots, setMaxSlots] = useState(6);
  const [showSettings, setShowSettings] = useState(false);
  const [scheduleModalPick, setScheduleModalPick] = useState<EditorsPickWithPost | null>(null);
  const [scheduleModalPostId, setScheduleModalPostId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadPicks();
  }, []);

  async function loadPicks() {
    try {
      const { data, error } = await supabase
        .from('editors_picks')
        .select(`
          *,
          blog_posts (
            *,
            authors (*),
            blog_categories (*)
          )
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPicks(data || []);
    } catch (error) {
      console.error('Error loading editors picks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPick(postId: string) {
    if (picks.length >= maxSlots) {
      alert(`Maximum ${maxSlots} articles can be selected`);
      return;
    }

    setScheduleModalPostId(postId);
  }

  async function handleSaveSchedule(
    postId: string,
    scheduledStart: string,
    scheduledEnd: string | null
  ) {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('No session');

      const { error } = await supabase
        .from('editors_picks')
        .insert({
          blog_post_id: postId,
          display_order: picks.length,
          selected_by: data.session.user.id,
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
        });

      if (error) throw error;
      loadPicks();
      setScheduleModalPostId(null);
    } catch (error: any) {
      console.error('Error adding pick:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      if (error.code === '23505') {
        alert('This article is already in Editors\' Choice');
      } else {
        alert(`Failed to add article: ${error.message || 'Unknown error'}`);
      }
    }
  }

  async function handleUpdateSchedule(
    pickId: string,
    scheduledStart: string,
    scheduledEnd: string | null
  ) {
    try {
      const { error } = await supabase
        .from('editors_picks')
        .update({
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
        })
        .eq('id', pickId);

      if (error) throw error;
      loadPicks();
      setScheduleModalPick(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule');
    }
  }

  async function handleRemovePick(pickId: string) {
    if (!confirm('Remove this article from Editors\' Choice?')) return;

    try {
      const { error } = await supabase
        .from('editors_picks')
        .delete()
        .eq('id', pickId);

      if (error) throw error;
      loadPicks();
    } catch (error) {
      console.error('Error removing pick:', error);
      alert('Failed to remove article');
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = picks.findIndex((pick) => pick.id === active.id);
    const newIndex = picks.findIndex((pick) => pick.id === over.id);

    const newOrder = arrayMove(picks, oldIndex, newIndex);
    setPicks(newOrder);

    try {
      const updates = newOrder.map((pick, index) => ({
        id: pick.id,
        display_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('editors_picks')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating display order:', error);
      alert('Failed to update order');
      loadPicks();
    }
  }

  const selectedPostIds = picks.map(p => p.blog_post_id);
  const activePicks = picks.filter(pick => {
    const now = new Date();
    const start = new Date(pick.scheduled_start);
    const end = pick.scheduled_end ? new Date(pick.scheduled_end) : null;
    return start <= now && (!end || end > now);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Editors' Choice</h2>
          <p className="text-sm text-gray-600 mt-1">
            Select {maxSlots} articles to feature and schedule when they appear
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {showSettings && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Articles (2-6)
          </label>
          <input
            type="number"
            min="2"
            max="6"
            value={maxSlots}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val >= 2 && val <= 6) {
                setMaxSlots(val);
              }
            }}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            Current: {picks.length} selected, {activePicks.length} active
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ArticleBrowserPanel
          selectedPostIds={selectedPostIds}
          maxSlots={maxSlots}
          currentPicksCount={picks.length}
          onAddPick={handleAddPick}
        />

        <SelectedArticlesPanel
          picks={picks}
          maxSlots={maxSlots}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onEditSchedule={setScheduleModalPick}
          onRemove={handleRemovePick}
        />
      </div>

      {scheduleModalPostId && (
        <ScheduleModal
          postId={scheduleModalPostId}
          onClose={() => setScheduleModalPostId(null)}
          onSave={handleSaveSchedule}
        />
      )}

      {scheduleModalPick && (
        <ScheduleModal
          postId={scheduleModalPick.blog_post_id}
          existingPick={scheduleModalPick}
          onClose={() => setScheduleModalPick(null)}
          onSave={(postId, start, end) => handleUpdateSchedule(scheduleModalPick.id, start, end)}
        />
      )}
    </div>
  );
}
