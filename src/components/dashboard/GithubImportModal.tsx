import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { 
  Search, 
  Star, 
  Lock, 
  Globe, 
  Calendar, 
  AlertTriangle, 
  X, 
  FolderGit 
} from 'lucide-react';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);


interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  private: boolean;
  stargazers_count: number;
  updated_at: string;
  html_url: string;
}

interface GithubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (repo: GithubRepo) => Promise<void>;
}

export const GithubImportModal: React.FC<GithubImportModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { providerToken, signInWithProvider } = useAuth();
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !providerToken) return;

    const fetchRepos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
          headers: {
            'Authorization': `Bearer ${providerToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Your GitHub session has expired. Please re-authenticate.');
          }
          throw new Error('Failed to fetch repositories from GitHub.');
        }

        const data = await response.json();
        setRepos(data as GithubRepo[]);
      } catch (err: any) {
        console.error('GitHub API error:', err);
        setError(err.message || 'An error occurred while fetching repositories.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, [isOpen, providerToken]);

  if (!isOpen) return null;

  // Filter repositories based on search query
  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const handleSelectRepo = async (repo: GithubRepo) => {
    setIsSubmitting(true);
    try {
      await onSelect(repo);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import repository.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />

      {/* Modal Container */}
      <GlassCard className="relative z-10 w-full max-w-2xl max-h-[85vh] border-white/[0.08] p-6 flex flex-col gap-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-lg bg-accent/5 border border-accent/15 flex items-center justify-center text-accent">
              <FolderGit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-high">Import GitHub Repository</h2>
              <p className="text-xs text-neutral-low/55 mt-0.5">Select a repository to import metadata and configure README.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-low hover:text-neutral-high hover:bg-white/[0.04] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-start gap-2.5 text-left">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span>{error}</span>
              {!providerToken && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signInWithProvider('github')}
                  className="mt-1.5 self-start"
                >
                  Reconnect GitHub
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Body content */}
        {!providerToken ? (
          /* Connect Account prompt if provider token not found */
          <div className="py-12 flex flex-col items-center justify-center text-center gap-6 max-w-md mx-auto">
            <div className="h-14 w-14 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-neutral-low">
              <GithubIcon className="h-7 w-7 text-neutral-low/70" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-neutral-high">GitHub Account Not Linked</h3>
              <p className="text-xs text-neutral-low/50 leading-relaxed">
                To import repositories directly, you must be logged in using GitHub. Link your developer profile now.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<GithubIcon className="h-4 w-4" />}
              onClick={() => signInWithProvider('github')}
            >
              Sign In with GitHub
            </Button>
          </div>
        ) : (
          /* Repository List Panel */
          <>
            {/* Search and Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-low/40" />
              <input
                type="text"
                placeholder="Search your repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-accent/40 rounded-lg py-2 pl-10 pr-4 text-sm text-neutral-high placeholder-neutral-low/30 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[45vh] pr-1 flex flex-col gap-3">
              {isLoading ? (
                /* Skeleton Loader */
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-3 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-1/3 bg-white/[0.04] rounded" />
                      <div className="h-4 w-12 bg-white/[0.04] rounded" />
                    </div>
                    <div className="h-3 w-3/4 bg-white/[0.04] rounded" />
                    <div className="flex gap-4">
                      <div className="h-3 w-16 bg-white/[0.04] rounded" />
                      <div className="h-3 w-12 bg-white/[0.04] rounded" />
                    </div>
                  </div>
                ))
              ) : filteredRepos.length === 0 ? (
                /* Empty state */
                <div className="py-16 text-center flex flex-col items-center justify-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-neutral-low">
                    <Search className="h-5 w-5 text-neutral-low/40" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-neutral-high">No repositories found</h4>
                    <p className="text-[10px] text-neutral-low/45">
                      {searchQuery ? 'Try adjusting your search criteria.' : 'You do not seem to have any repositories on this GitHub account.'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Repositories Cards List */
                filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-4 border border-white/[0.06] bg-white/[0.01] hover:border-accent/40 hover:bg-white/[0.02] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 group text-left"
                  >
                    <div className="space-y-2 overflow-hidden flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-neutral-high group-hover:text-accent transition-colors truncate">
                          {repo.name}
                        </span>
                        
                        {/* Visibility Badge */}
                        <div className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-neutral-low/60 font-semibold uppercase tracking-wider">
                          {repo.private ? (
                            <>
                              <Lock className="h-2.5 w-2.5" />
                              <span>Private</span>
                            </>
                          ) : (
                            <>
                              <Globe className="h-2.5 w-2.5" />
                              <span>Public</span>
                            </>
                          )}
                        </div>
                      </div>

                      {repo.description && (
                        <p className="text-xs text-neutral-low/60 line-clamp-1 leading-relaxed">
                          {repo.description}
                        </p>
                      )}

                      {/* Info Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-neutral-low/45">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-accent" />
                            <span className="font-semibold text-neutral-low/65">{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>{repo.stargazers_count} stars</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Updated {formatDate(repo.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSelectRepo(repo)}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      className="shrink-0 self-start sm:self-center"
                    >
                      Import Repo
                    </Button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

      </GlassCard>
    </div>
  );
};
