import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut, Star, Users, Music, Search, GripVertical, BookOpen, UserCircle, Eye, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, AudioEntry } from '../lib/supabase';
import { AudioEntryForm } from '../components/AudioEntryForm';
import { formatDate } from '../utils/translations';
import { normalizeArabicAlef } from '../utils/arabicNormalization';
import { BlogPost, Author, Category } from '../utils/blogHelpers';
import { BlogPostForm } from '../components/BlogPostForm';
import { AuthorForm } from '../components/AuthorForm';
import { BlogPreviewModal } from '../components/BlogPreviewModal';
import { EditorsChoiceManager } from '../components/EditorsChoiceManager';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata?: {
    name?: string;
  };
  app_metadata?: {
    role?: string;
  };
}

function SortableItem({ entry }: { entry: AudioEntry }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{entry.title}</div>
        <div className="text-sm text-gray-600 lang-ar truncate" dir="rtl">
          {entry.title_ar}
        </div>
        {entry.description && (
          <div className="text-sm text-gray-500 truncate mt-1">{entry.description}</div>
        )}
      </div>
      <div className="text-sm text-gray-500">
        {formatDate(entry.date_precision, entry.date, entry.year, 'en')}
      </div>
    </div>
  );
}

function SortableCategoryItem({ category, postCount }: { category: Category; postCount: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isEditorsChoice = category.name_en === 'Editors\' Choice';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow ${
        isEditorsChoice
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
          : 'bg-white border-gray-200'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      {isEditorsChoice && (
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className={`font-medium ${isEditorsChoice ? 'text-amber-900' : 'text-gray-900'}`}>
          {category.name_en}
        </div>
        <div className={`lang-ar ${isEditorsChoice ? 'text-amber-900' : 'text-gray-900'}`} dir="rtl">
          {category.name_ar}
        </div>
        <div className="text-sm text-gray-500">
          {isEditorsChoice ? 'Special section' : `${postCount} ${postCount === 1 ? 'post' : 'posts'}`}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [entries, setEntries] = useState<AudioEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AudioEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'entries' | 'users' | 'reorder' | 'blog' | 'authors' | 'categories' | 'reorder-categories' | 'editors-choice'>('entries');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name_en: '', name_ar: '' });
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [previewPost, setPreviewPost] = useState<Partial<BlogPost> | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [featuredEntries, setFeaturedEntries] = useState<AudioEntry[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin' | 'super_admin'>('user');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserRole, setEditUserRole] = useState<'user' | 'admin' | 'super_admin'>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'normal'>('all');

  const [entriesPage, setEntriesPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalEntries, setTotalEntries] = useState(0);

  const [blogPage, setBlogPage] = useState(1);
  const [blogPerPage, setBlogPerPage] = useState(20);
  const [totalBlogPosts, setTotalBlogPosts] = useState(0);

  const { signOut, user, userRole } = useAuth();

  useEffect(() => {
    document.title = 'Admin Dashboard | Masmaa';
  }, []);

  useEffect(() => {
    loadEntries();
  }, [entriesPage, entriesPerPage, searchQuery, featuredFilter]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'reorder') {
      loadFeaturedEntries();
    } else if (activeTab === 'blog') {
      loadBlogPosts();
    } else if (activeTab === 'authors') {
      loadAuthors();
    } else if (activeTab === 'categories' || activeTab === 'reorder-categories') {
      loadCategories();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'blog') {
      loadBlogPosts();
    }
  }, [blogPage, blogPerPage, blogSearchQuery]);

  async function loadEntries() {
    try {
      setLoading(true);

      let query = supabase
        .from('audio_entries2')
        .select('*', { count: 'exact' });

      if (featuredFilter === 'featured') {
        query = query.eq('featured', true);
      } else if (featuredFilter === 'normal') {
        query = query.eq('featured', false);
      }

      if (searchQuery) {
        const normalizedQuery = normalizeArabicAlef(searchQuery.toLowerCase());
        query = query.or(`title.ilike.%${searchQuery}%,title_ar.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,description_ar.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,category_ar.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,location_ar.ilike.%${searchQuery}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((entriesPage - 1) * entriesPerPage, entriesPage * entriesPerPage - 1);

      if (error) throw error;
      setEntries(data || []);
      setTotalEntries(count || 0);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFeaturedEntries() {
    try {
      const { data, error } = await supabase
        .from('audio_entries2')
        .select('*')
        .eq('featured', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeaturedEntries(data || []);
    } catch (error) {
      console.error('Error loading featured entries:', error);
    }
  }

  async function loadBlogPosts() {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*, authors(*), blog_categories(*)', { count: 'exact' });

      if (blogSearchQuery) {
        query = query.or(`title_en.ilike.%${blogSearchQuery}%,title_ar.ilike.%${blogSearchQuery}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((blogPage - 1) * blogPerPage, blogPage * blogPerPage - 1);

      if (error) throw error;
      setBlogPosts(data || []);
      setTotalBlogPosts(count || 0);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  }

  async function loadAuthors() {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuthors(data || []);
    } catch (error) {
      console.error('Error loading authors:', error);
    }
  }

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('name_en');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function handleSaveCategory() {
    if (!categoryFormData.name_en || !categoryFormData.name_ar) {
      alert('Both English and Arabic names are required');
      return;
    }

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('blog_categories')
          .update({
            name_en: categoryFormData.name_en,
            name_ar: categoryFormData.name_ar,
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_categories')
          .insert({
            name_en: categoryFormData.name_en,
            name_ar: categoryFormData.name_ar,
          });

        if (error) throw error;
      }

      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryFormData({ name_en: '', name_ar: '' });
      loadCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      if (error.code === '23505') {
        alert('A category with this name already exists');
      } else {
        alert('Failed to save category');
      }
    }
  }

  async function handleDeleteCategory(id: string) {
    const postCount = blogPosts.filter(p => p.category_id === id).length;

    if (postCount > 0) {
      alert(`Cannot delete this category. It is used by ${postCount} blog post(s). Please reassign these posts to another category first.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  }

  function handleEditCategory(category: Category) {
    setEditingCategory(category);
    setCategoryFormData({
      name_en: category.name_en,
      name_ar: category.name_ar,
    });
    setShowCategoryForm(true);
  }

  async function handleDeleteBlogPost(id: string) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const post = blogPosts.find(p => p.id === id);
      if (post?.featured_image_url) {
        await deleteBlogImageFromR2(post.featured_image_url);
      }

      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      loadBlogPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Failed to delete blog post');
    }
  }

  async function handleDeleteAuthor(id: string) {
    const author = authors.find(a => a.id === id);
    const postCount = blogPosts.filter(p => p.author_id === id).length;

    const confirmMessage = postCount > 0
      ? `This author has ${postCount} post(s). Are you sure you want to delete this author? Posts will remain but show no author.`
      : 'Are you sure you want to delete this author?';

    if (!confirm(confirmMessage)) return;

    try {
      if (author?.profile_image_url) {
        await deleteBlogImageFromR2(author.profile_image_url);
      }

      const { error } = await supabase.from('authors').delete().eq('id', id);
      if (error) throw error;
      loadAuthors();
      loadBlogPosts();
    } catch (error) {
      console.error('Error deleting author:', error);
      alert('Failed to delete author');
    }
  }

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      setShowAddUser(false);
      loadUsers();
      alert('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error instanceof Error ? error.message : 'Failed to create user');
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      loadUsers();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete user');
    }
  }

  function handleEditUser(userItem: User) {
    setEditingUser(userItem);
    setEditUserName(userItem.user_metadata?.name || '');
    setEditUserEmail(userItem.email);
    setEditUserPassword('');
    setEditUserRole((userItem as any).app_metadata?.role || 'user');
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !editingUser) throw new Error('No session or user');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`;
      const body: any = {
        userId: editingUser.id,
        name: editUserName,
        email: editUserEmail,
        role: editUserRole,
      };

      if (editUserPassword) {
        body.password = editUserPassword;
      }

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      setEditingUser(null);
      setEditUserName('');
      setEditUserEmail('');
      setEditUserPassword('');
      setEditUserRole('user');
      loadUsers();
      alert('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error instanceof Error ? error.message : 'Failed to update user');
    }
  }

  async function deleteFileFromR2(fileUrl: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-upload`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileUrl }),
        }
      );

      if (!response.ok) {
        console.error('Failed to delete file from R2');
      }
    } catch (error) {
      console.error('Error deleting file from R2:', error);
    }
  }

  async function deleteBlogImageFromR2(fileUrl: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-blog-upload`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileUrl }),
        }
      );

      if (!response.ok) {
        console.error('Failed to delete blog image from R2');
      }
    } catch (error) {
      console.error('Error deleting blog image from R2:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const entry = entries.find((e) => e.id === id);
      if (entry?.audio_url) {
        await deleteFileFromR2(entry.audio_url);
      }

      const { error } = await supabase.from('audio_entries2').delete().eq('id', id);

      if (error) throw error;
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  }

  async function handleToggleFeatured(entry: AudioEntry) {
    try {
      const { error } = await supabase
        .from('audio_entries2')
        .update({ featured: !entry.featured })
        .eq('id', entry.id);

      if (error) throw error;
      loadEntries();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  }

  function handleEdit(entry: AudioEntry) {
    setEditingEntry(entry);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingEntry(null);
  }

  function handleSave() {
    loadEntries();
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = featuredEntries.findIndex((entry) => entry.id === active.id);
    const newIndex = featuredEntries.findIndex((entry) => entry.id === over.id);

    const newOrder = arrayMove(featuredEntries, oldIndex, newIndex);
    setFeaturedEntries(newOrder);

    try {
      const updates = newOrder.map((entry, index) => ({
        id: entry.id,
        display_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('audio_entries2')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating display order:', error);
      alert('Failed to update order');
      loadFeaturedEntries();
    }
  }

  async function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    const newOrder = arrayMove(categories, oldIndex, newIndex);
    setCategories(newOrder);

    try {
      const updates = newOrder.map((category, index) => ({
        id: category.id,
        display_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('blog_categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating category order:', error);
      alert('Failed to update category order');
      loadCategories();
    }
  }

  const totalEntriesPages = Math.ceil(totalEntries / entriesPerPage);
  const totalBlogPages = Math.ceil(totalBlogPosts / blogPerPage);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setEntriesPage(1);
  }

  function handleFeaturedFilterChange(value: 'all' | 'featured' | 'normal') {
    setFeaturedFilter(value);
    setEntriesPage(1);
  }

  function handleBlogSearchChange(value: string) {
    setBlogSearchQuery(value);
    setBlogPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Admin Dashboard</h1>
            {user?.user_metadata?.name && (
              <p className="text-sm text-gray-600 mt-1">Welcome, {user.user_metadata.name}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('entries')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'entries'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Music className="w-4 h-4" />
            Audio Entries
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reorder'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <GripVertical className="w-4 h-4" />
            Reorder Featured
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'blog'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Blog
          </button>
          <button
            onClick={() => setActiveTab('authors')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'authors'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserCircle className="w-4 h-4" />
            Authors
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('reorder-categories')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reorder-categories'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <GripVertical className="w-4 h-4" />
            Reorder Categories
          </button>
          <button
            onClick={() => setActiveTab('editors-choice')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'editors-choice'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Editors' Choice
          </button>
          {(userRole === 'super_admin' || userRole === 'admin') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Users
            </button>
          )}
        </div>

        {activeTab === 'entries' && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
                <div className="flex-1 w-full sm:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search entries..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-auto">
                  <select
                    value={featuredFilter}
                    onChange={(e) => handleFeaturedFilterChange(e.target.value as 'all' | 'featured' | 'normal')}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none bg-white"
                  >
                    <option value="all">All Entries</option>
                    <option value="featured">Featured Only</option>
                    <option value="normal">Normal Only</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <div className="text-sm text-gray-600">
                  {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
                  {totalEntries > 0 && ` (page ${entriesPage} of ${totalEntriesPages})`}
                </div>
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Entry
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-500 py-12">Loading...</div>
            ) : entries.length > 0 ? (
              <>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Added
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{entry.title}</div>
                          <div className="text-sm text-gray-600 mt-1 lang-ar" dir="rtl">{entry.title_ar}</div>
                          {entry.description && (
                            <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                              {entry.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{entry.category || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{entry.location || '-'}</div>
                          {entry.location_ar && (
                            <div className="text-sm text-gray-600 mt-1 lang-ar" dir="rtl">{entry.location_ar}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(entry.date_precision, entry.date, entry.year, 'en')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(entry.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(entry.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleFeatured(entry)}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                              entry.featured
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } transition-colors`}
                          >
                            <Star className="w-3 h-3" />
                            {entry.featured ? 'Featured' : 'Normal'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalEntriesPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Items per page:</span>
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setEntriesPage(1);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEntriesPage(Math.max(1, entriesPage - 1))}
                      disabled={entriesPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalEntriesPages) }, (_, i) => {
                        let pageNum;
                        if (totalEntriesPages <= 5) {
                          pageNum = i + 1;
                        } else if (entriesPage <= 3) {
                          pageNum = i + 1;
                        } else if (entriesPage >= totalEntriesPages - 2) {
                          pageNum = totalEntriesPages - 4 + i;
                        } else {
                          pageNum = entriesPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setEntriesPage(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              entriesPage === pageNum
                                ? 'bg-gray-900 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setEntriesPage(Math.min(totalEntriesPages, entriesPage + 1))}
                      disabled={entriesPage === totalEntriesPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                {searchQuery || featuredFilter !== 'all' ? (
                  <div>
                    <p className="mb-2">No entries found{searchQuery && ` matching "${searchQuery}"`}</p>
                    <div className="flex gap-2 justify-center">
                      {searchQuery && (
                        <button
                          onClick={() => handleSearchChange('')}
                          className="text-sm text-gray-900 hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                      {featuredFilter !== 'all' && (
                        <button
                          onClick={() => handleFeaturedFilterChange('all')}
                          className="text-sm text-gray-900 hover:underline"
                        >
                          Show all entries
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  'No entries yet. Click "Add Entry" to create your first audio entry.'
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'reorder' && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Reorder Featured Entries
              </h2>
              <p className="text-sm text-gray-600">
                Drag and drop to reorder how featured entries appear on the home page.
                Changes are saved automatically.
              </p>
            </div>

            {featuredEntries.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={featuredEntries.map((entry) => entry.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {featuredEntries.map((entry) => (
                      <SortableItem key={entry.id} entry={entry} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No featured entries yet. Mark entries as featured in the Audio Entries tab.
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {users.length} {users.length === 1 ? 'user' : 'users'}
              </div>
              {userRole === 'super_admin' && (
                <button
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              )}
            </div>

            {usersLoading ? (
              <div className="text-center text-gray-500 py-12">Loading...</div>
            ) : users.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Sign In
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.user_metadata?.name || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{userItem.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(userItem.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {userItem.last_sign_in_at
                              ? new Date(userItem.last_sign_in_at).toLocaleDateString()
                              : 'Never'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {userRole === 'super_admin' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditUser(userItem)}
                                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(userItem.id)}
                                className="p-2 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                                disabled={userItem.id === user?.id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No users found.
              </div>
            )}
          </>
        )}

        {activeTab === 'blog' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search blog posts..."
                    value={blogSearchQuery}
                    onChange={(e) => handleBlogSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setShowBlogForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Post
              </button>
            </div>

            {blogPosts.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {totalBlogPosts} {totalBlogPosts === 1 ? 'post' : 'posts'}
                  {totalBlogPosts > 0 && ` (page ${blogPage} of ${totalBlogPages})`}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {blogPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {post.title_en && (
                            <div className="text-sm font-medium text-gray-900">
                              {post.title_en}
                              {post.title_ar && <span className="ml-2 text-green-600">✓</span>}
                            </div>
                          )}
                          {post.title_ar && (
                            <div className="text-sm text-gray-600 mt-1 lang-ar" dir="rtl">
                              {post.title_ar}
                              {post.title_en && <span className="mr-2 text-green-600">✓</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{post.category_en}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {post.authors?.name_en || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(post.published_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            post.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setPreviewPost(post)}
                              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingPost(post);
                                setShowBlogForm(true);
                              }}
                              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlogPost(post.id)}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalBlogPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Items per page:</span>
                      <select
                        value={blogPerPage}
                        onChange={(e) => {
                          setBlogPerPage(Number(e.target.value));
                          setBlogPage(1);
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBlogPage(Math.max(1, blogPage - 1))}
                        disabled={blogPage === 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalBlogPages) }, (_, i) => {
                          let pageNum;
                          if (totalBlogPages <= 5) {
                            pageNum = i + 1;
                          } else if (blogPage <= 3) {
                            pageNum = i + 1;
                          } else if (blogPage >= totalBlogPages - 2) {
                            pageNum = totalBlogPages - 4 + i;
                          } else {
                            pageNum = blogPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setBlogPage(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                blogPage === pageNum
                                  ? 'bg-gray-900 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setBlogPage(Math.min(totalBlogPages, blogPage + 1))}
                        disabled={blogPage === totalBlogPages}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No blog posts yet. Click "New Post" to create your first blog post.
              </div>
            )}
          </>
        )}

        {activeTab === 'authors' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {authors.length} {authors.length === 1 ? 'author' : 'authors'}
              </div>
              <button
                onClick={() => {
                  setEditingAuthor(null);
                  setShowAuthorForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Author
              </button>
            </div>

            {authors.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Photo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posts
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {authors.map((author) => {
                      const postCount = blogPosts.filter(p => p.author_id === author.id).length;
                      return (
                        <tr key={author.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            {author.profile_image_url ? (
                              <img
                                src={author.profile_image_url}
                                alt={author.name_en}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {author.name_en.charAt(0)}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {author.name_en}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 lang-ar" dir="rtl">
                              {author.name_ar}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{author.email || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{postCount}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingAuthor(author);
                                  setShowAuthorForm(true);
                                }}
                                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAuthor(author.id)}
                                className="p-2 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No authors yet. Click "Add Author" to create your first author profile.
              </div>
            )}
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryFormData({ name_en: '', name_ar: '' });
                  setShowCategoryForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {categories.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        English Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Arabic Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posts
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.map((category) => {
                      const postCount = blogPosts.filter(p => p.category_id === category.id).length;
                      return (
                        <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name_en}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 lang-ar" dir="rtl">
                              {category.name_ar}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{postCount}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-2 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No categories yet. Click "Add Category" to create your first category.
              </div>
            )}

            {showCategoryForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        English Name *
                      </label>
                      <input
                        type="text"
                        value={categoryFormData.name_en}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, name_en: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                        placeholder="e.g., Anthropology"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arabic Name *
                      </label>
                      <input
                        type="text"
                        value={categoryFormData.name_ar}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent text-right lang-ar"
                        dir="rtl"
                        placeholder="مثال: أنثروبولوجيا"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                        setCategoryFormData({ name_en: '', name_ar: '' });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCategory}
                      className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'reorder-categories' && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Reorder Categories
              </h2>
              <p className="text-sm text-gray-600">
                Drag and drop to reorder how categories appear on the home page.
                Changes are saved automatically.
              </p>
            </div>

            {categories.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleCategoryDragEnd}
              >
                <SortableContext
                  items={categories.map((cat) => cat.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {categories.map((category) => {
                      const postCount = blogPosts.filter(p => p.category_id === category.id).length;
                      return (
                        <SortableCategoryItem
                          key={category.id}
                          category={category}
                          postCount={postCount}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No categories yet. Create categories in the Categories tab first.
              </div>
            )}
          </>
        )}

        {activeTab === 'editors-choice' && (
          <EditorsChoiceManager />
        )}
      </div>

      {showForm && (
        <AudioEntryForm entry={editingEntry} onClose={handleCloseForm} onSave={handleSave} />
      )}

      {showBlogForm && (
        <BlogPostForm
          post={editingPost}
          onClose={() => {
            setShowBlogForm(false);
            setEditingPost(null);
          }}
          onSave={() => {
            loadBlogPosts();
          }}
          onPreview={(post) => {
            setPreviewPost(post);
          }}
        />
      )}

      {showAuthorForm && (
        <AuthorForm
          author={editingAuthor}
          onClose={() => {
            setShowAuthorForm(false);
            setEditingAuthor(null);
          }}
          onSave={() => {
            loadAuthors();
          }}
        />
      )}

      {previewPost && (
        <BlogPreviewModal
          post={previewPost}
          onClose={() => setPreviewPost(null)}
        />
      )}

      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin' | 'super_admin')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUser(false);
                    setNewUserName('');
                    setNewUserEmail('');
                    setNewUserPassword('');
                    setNewUserRole('user');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="edit-password"
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Leave blank to keep current password"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                </div>
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="edit-role"
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as 'user' | 'admin' | 'super_admin')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setEditUserName('');
                    setEditUserEmail('');
                    setEditUserPassword('');
                    setEditUserRole('user');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
