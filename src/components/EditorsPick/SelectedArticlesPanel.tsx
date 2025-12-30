import { GripVertical, Calendar, X, CheckCircle, Clock, Archive } from 'lucide-react';
import { EditorsPickWithPost } from '../EditorsChoiceManager';
import {
  DndContext,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SelectedArticlesPanelProps {
  picks: EditorsPickWithPost[];
  maxSlots: number;
  sensors: any;
  onDragEnd: (event: DragEndEvent) => void;
  onEditSchedule: (pick: EditorsPickWithPost) => void;
  onRemove: (pickId: string) => void;
}

function SortablePickItem({
  pick,
  onEditSchedule,
  onRemove,
}: {
  pick: EditorsPickWithPost;
  onEditSchedule: (pick: EditorsPickWithPost) => void;
  onRemove: (pickId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pick.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const now = new Date();
  const start = new Date(pick.scheduled_start);
  const end = pick.scheduled_end ? new Date(pick.scheduled_end) : null;

  const isScheduled = start > now;
  const isActive = start <= now && (!end || end > now);
  const isExpired = end && end <= now;

  let statusIcon;
  let statusText;
  let statusColor;

  if (isExpired) {
    statusIcon = <Archive className="w-3 h-3" />;
    statusText = 'Expired';
    statusColor = 'text-gray-500';
  } else if (isScheduled) {
    statusIcon = <Clock className="w-3 h-3" />;
    statusText = 'Scheduled';
    statusColor = 'text-blue-600';
  } else {
    statusIcon = <CheckCircle className="w-3 h-3" />;
    statusText = 'Active';
    statusColor = 'text-green-600';
  }

  const post = pick.blog_posts;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 rounded-lg p-3 bg-white ${
        isExpired ? 'opacity-60' : ''
      }`}
    >
      <div className="flex gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {post?.featured_image_url && (
          <img
            src={post.featured_image_url}
            alt=""
            className="w-16 h-16 object-cover rounded flex-shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          {post?.title_en && (
            <div className="font-medium text-sm text-gray-900 truncate">
              {post.title_en}
            </div>
          )}
          {post?.title_ar && (
            <div className="text-sm text-gray-600 truncate lang-ar" dir="rtl">
              {post.title_ar}
            </div>
          )}
          {post?.blog_categories && (
            <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded mt-1">
              {post.blog_categories.name_en}
            </span>
          )}
          <div className={`flex items-center gap-1 mt-2 text-xs ${statusColor}`}>
            {statusIcon}
            <span>{statusText}</span>
            {isScheduled && (
              <span className="text-gray-500 ml-1">
                (starts {start.toLocaleDateString()})
              </span>
            )}
            {isExpired && (
              <span className="text-gray-500 ml-1">
                (ended {end?.toLocaleDateString()})
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => onEditSchedule(pick)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 rounded hover:bg-gray-50"
            title="Edit Schedule"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(pick.id)}
            className="p-2 text-red-600 hover:text-red-800 transition-colors border border-red-200 rounded hover:bg-red-50"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SelectedArticlesPanel({
  picks,
  maxSlots,
  sensors,
  onDragEnd,
  onEditSchedule,
  onRemove,
}: SelectedArticlesPanelProps) {
  const now = new Date();
  const activePicks = picks.filter(pick => {
    const start = new Date(pick.scheduled_start);
    const end = pick.scheduled_end ? new Date(pick.scheduled_end) : null;
    return start <= now && (!end || end > now);
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Selected Articles</h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-600">
            {picks.length} of {maxSlots} slots used
          </p>
          <div className="text-xs text-gray-500">
            {activePicks.length} currently active
          </div>
        </div>
        {picks.length > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all"
              style={{ width: `${(picks.length / maxSlots) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {picks.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={() => null}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={picks.map((pick) => pick.id)}
              strategy={verticalListSortingStrategy}
            >
              {picks.map((pick) => (
                <SortablePickItem
                  key={pick.id}
                  pick={pick}
                  onEditSchedule={onEditSchedule}
                  onRemove={onRemove}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p className="mb-2">No articles selected</p>
            <p className="text-sm">Add articles from the browser panel</p>
          </div>
        )}
      </div>
    </div>
  );
}
