'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Resort } from '@/lib/types';
import { DirectoryFilters, SortOption, PassFilter, StatusFilter } from './DirectoryFilters';
import { DirectoryTable } from './DirectoryTable';
import { DirectoryList } from './DirectoryList';

interface DirectoryContentProps {
  resorts: Resort[];
}

export function DirectoryContent({ resorts }: DirectoryContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state from URL params
  const initialSort = (searchParams.get('sort') as SortOption) || 'name';
  const initialPass = (searchParams.get('pass') as PassFilter) || 'all';
  const initialStatus = (searchParams.get('status') as StatusFilter) || 'all';

  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [passFilter, setPassFilter] = useState<PassFilter>(initialPass);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);

  // Update URL when filters change
  const updateURL = (sort: SortOption, pass: PassFilter, status: StatusFilter) => {
    const params = new URLSearchParams();
    if (sort !== 'name') params.set('sort', sort);
    if (pass !== 'all') params.set('pass', pass);
    if (status !== 'all') params.set('status', status);

    const queryString = params.toString();
    router.push(queryString ? `/directory?${queryString}` : '/directory', { scroll: false });
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    updateURL(sort, passFilter, statusFilter);
  };

  const handlePassFilterChange = (pass: PassFilter) => {
    setPassFilter(pass);
    updateURL(sortBy, pass, statusFilter);
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    updateURL(sortBy, passFilter, status);
  };

  // Filter and sort resorts
  const filteredAndSortedResorts = useMemo(() => {
    let result = [...resorts];

    // Apply pass filter
    if (passFilter !== 'all') {
      result = result.filter((resort) =>
        resort.passAffiliations.includes(passFilter as any)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((resort) => resort.conditions.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'snow':
        result.sort((a, b) => b.conditions.snowfall24h - a.conditions.snowfall24h);
        break;
      case 'base':
        result.sort((a, b) => b.conditions.baseDepth - a.conditions.baseDepth);
        break;
      case 'terrain':
        result.sort((a, b) => b.conditions.terrainOpen - a.conditions.terrainOpen);
        break;
      case 'acres':
        result.sort((a, b) => b.stats.skiableAcres - a.stats.skiableAcres);
        break;
      case 'vertical':
        result.sort((a, b) => b.stats.verticalDrop - a.stats.verticalDrop);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        result.sort((a, b) => a.distanceFromMajorCity - b.distanceFromMajorCity);
        break;
    }

    return result;
  }, [resorts, sortBy, passFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <DirectoryFilters
        sortBy={sortBy}
        passFilter={passFilter}
        statusFilter={statusFilter}
        onSortChange={handleSortChange}
        onPassFilterChange={handlePassFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
        totalResorts={resorts.length}
        filteredCount={filteredAndSortedResorts.length}
      />

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <DirectoryTable
          resorts={filteredAndSortedResorts}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Mobile List View */}
      <div className="lg:hidden">
        <DirectoryList resorts={filteredAndSortedResorts} />
      </div>

      {filteredAndSortedResorts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No resorts match your filters.</p>
          <button
            onClick={() => {
              setPassFilter('all');
              setStatusFilter('all');
              updateURL(sortBy, 'all', 'all');
            }}
            className="mt-4 text-ski-blue hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
