import React from 'react';
import { cn } from './utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showPageNumbers = true,
  maxVisiblePages = 5
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-md border border-border",
          "hover:bg-accent hover:border-accent-foreground transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border",
          currentPage === 1 && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {/* Page numbers */}
      {showPageNumbers && (
        <>
          {/* First page */}
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-accent hover:border-accent-foreground transition-colors"
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="flex items-center justify-center w-8 h-4 text-muted-foreground">
                  ...
                </span>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md border transition-colors",
                page === currentPage
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-accent hover:border-accent-foreground"
              )}
            >
              {page}
            </button>
          ))}

          {/* Last page */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="flex items-center justify-center w-8 h-4 text-muted-foreground">
                  ...
                </span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-accent hover:border-accent-foreground transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </>
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-md border border-border",
          "hover:bg-accent hover:border-accent-foreground transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border",
          currentPage === totalPages && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
