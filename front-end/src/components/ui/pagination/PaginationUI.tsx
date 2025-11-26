import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationUI({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages < 1) return null;

  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const isPrevDisabled = safeCurrentPage === 1;
  const isNextDisabled = safeCurrentPage === totalPages;

  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          safeCurrentPage - 1,
          safeCurrentPage,
          safeCurrentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const pages = getPages();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={
              isPrevDisabled
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            disabled={isPrevDisabled}
            onClick={() => {
              if (isPrevDisabled) return;
              onPageChange(Math.max(safeCurrentPage - 1, 1));
            }}
          />
        </PaginationItem>
        {pages.map((page, idx) =>
          page === "..." ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <span className="px-2 text-gray-400 select-none">...</span>
            </PaginationItem>
          ) : (
            <PaginationItem key={`page-${page}`}>
              <PaginationLink
                isActive={safeCurrentPage === page}
                onClick={() => onPageChange(Number(page))}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            className={
              isNextDisabled
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            disabled={isNextDisabled}
            onClick={() => {
              if (isNextDisabled) return;
              onPageChange(Math.min(safeCurrentPage + 1, totalPages));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
