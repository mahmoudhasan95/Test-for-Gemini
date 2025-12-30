import { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BlogPost, Author, Category } from '../../utils/blogHelpers';

export interface EditorsPick {
  id: string;
  blog_post_id: string;
  display_order: number;
  selected_at: string;
  selected_by: string;
  scheduled_start: string;
  scheduled_end: string | null;
  created_at: string;
  updated_at: string;
}

interface ArticleBrowserPanelProps {
  selectedPostIds: string[];
  maxSlots: number;
  currentPicksCount: number;
  onAddPick: (postId: string) => void;
}

export function ArticleBrowserPanel({
  selectedPostIds,
  maxSlots,
  currentPicksCount,
  onAddPick,
}: ArticleBrowserPanelProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('published');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const postsPerPage = 15;

  useEffect(() => {
    loadCategories();
    loadAuthors();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadPosts();
  }, [categoryFilter, authorFilter, publishedFilter, currentPage, debouncedSearchQuery]);

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .neq('name_en', 'Editors\' Choice')
        .order('name_en');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function loadAuthors() {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name_en');

      if (error) throw error;
      setAuthors(data || []);
    } catch (error) {
      console.error('Error loading authors:', error);
    }
  }

  async function loadPosts() {
    try {
      setLoading(true);

      // Build base query with count
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          authors (*),
          blog_categories (*)
        `, { count: 'exact' })
        .order('published_date', { ascending: false });

      // Apply category filter
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      // Apply author filter
      if (authorFilter !== 'all') {
        query = query.eq('author_id', authorFilter);
      }

      // Apply published filter
      if (publishedFilter !== 'all') {
        query = query.eq('published', publishedFilter === 'published');
      }

      // Apply search filter
      if (debouncedSearchQuery) {
        // Search across title and excerpt in both languages
        query = query.or(`title_en.ilike.%${debouncedSearchQuery}%,title_ar.ilike.%${debouncedSearchQuery}%,excerpt_en.ilike.%${debouncedSearchQuery}%,excerpt_ar.ilike.%${debouncedSearchQuery}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * postsPerPage;
      const to = from + postsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setPosts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(totalCount / postsPerPage);

  const hasFilters = searchQuery || categoryFilter !== 'all' || authorFilter !== 'all' || publishedFilter !== 'published';

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Browse Articles</h3>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or excerpt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name_en}</option>
              ))}
            </select>

            <select
              value={authorFilter}
              onChange={(e) => {
                setAuthorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              <option value="all">All Authors</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>{author.name_en}</option>
              ))}
            </select>
          </div>

          <select
            value={publishedFilter}
            onChange={(e) => {
              setPublishedFilter(e.target.value as 'all' | 'published' | 'draft');
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          >
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="all">All Posts</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setAuthorFilter('all');
                setPublishedFilter('published');
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
          <span>
            {totalCount} {totalCount === 1 ? 'article' : 'articles'}
            {totalCount > postsPerPage && ` (showing ${((currentPage - 1) * postsPerPage) + 1}-${Math.min(currentPage * postsPerPage, totalCount)})`}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : posts.length > 0 ? (
          <>
            {posts.map(post => {
              const isSelected = selectedPostIds.includes(post.id);
              const canAdd = !isSelected && currentPicksCount < maxSlots;

              return (
                <div
                  key={post.id}
                  className={`border border-gray-200 rounded-lg p-3 ${
                    isSelected ? 'bg-gray-50 opacity-60' : 'hover:shadow-md'
                  } transition-all`}
                >
                  <div className="flex gap-3">
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt=""
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {post.title_en && (
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {post.title_en}
                        </div>
                      )}
                      {post.title_ar && (
                        <div className="text-sm text-gray-600 truncate lang-ar" dir="rtl">
                          {post.title_ar}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {post.blog_categories && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                            {post.blog_categories.name_en}
                          </span>
                        )}
                        {post.authors && (
                          <span className="text-xs text-gray-500">
                            {post.authors.name_en}
                          </span>
                        )}
                        {!post.published && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(post.published_date).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => onAddPick(post.id)}
                      disabled={!canAdd}
                      className={`flex-shrink-0 px-3 py-1 rounded text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : canAdd
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      title={isSelected ? 'Already selected' : !canAdd ? 'Maximum slots reached' : 'Add to Editors\' Choice'}
                    >
                      {isSelected ? 'Selected' : 'Add'}
                    </button>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            {hasFilters ? 'No articles match your filters' : 'No articles available'}
          </div>
        )}
      </div>
    </div>
  );
}
