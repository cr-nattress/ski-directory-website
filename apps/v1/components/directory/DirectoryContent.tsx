'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Resort } from '@/lib/types';
import { DirectoryFilters, SortOption, PassFilter, StatusFilter } from './DirectoryFilters';
import { DirectoryTable } from './DirectoryTable';
import { DirectoryList } from './DirectoryList';
import { DirectoryHero } from './DirectoryHero';
import { getStateName, getCountryName } from '@/lib/data/geo-mappings';

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
  const initialState = searchParams.get('state') || '';
  const initialCountry = searchParams.get('country') || '';

  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [passFilter, setPassFilter] = useState<PassFilter>(initialPass);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [stateFilter, setStateFilter] = useState<string>(initialState);
  const [countryFilter, setCountryFilter] = useState<string>(initialCountry);

  // Update URL when filters change
  const updateURL = (
    sort: SortOption,
    pass: PassFilter,
    status: StatusFilter,
    state: string = stateFilter,
    country: string = countryFilter
  ) => {
    const params = new URLSearchParams();
    if (sort !== 'name') params.set('sort', sort);
    if (pass !== 'all') params.set('pass', pass);
    if (status !== 'all') params.set('status', status);
    if (state) params.set('state', state);
    if (country) params.set('country', country);

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

  const handleStateFilterChange = (state: string) => {
    setStateFilter(state);
    // Clear country filter when state is selected (state is more specific)
    if (state) {
      setCountryFilter('');
      updateURL(sortBy, passFilter, statusFilter, state, '');
    } else {
      updateURL(sortBy, passFilter, statusFilter, state, countryFilter);
    }
  };

  const handleCountryFilterChange = (country: string) => {
    setCountryFilter(country);
    // Clear state filter when country is selected (unless state is within that country)
    updateURL(sortBy, passFilter, statusFilter, stateFilter, country);
  };

  // Get unique states and countries from resorts for dropdown options
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    resorts.forEach((resort) => {
      if (resort.stateCode) {
        states.add(resort.stateCode);
      }
    });
    return Array.from(states)
      .map((code) => ({ code, name: getStateName(code) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [resorts]);

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    resorts.forEach((resort) => {
      if (resort.countryCode) {
        countries.add(resort.countryCode);
      }
    });
    return Array.from(countries)
      .map((code) => ({ code, name: getCountryName(code) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [resorts]);

  // Filter and sort resorts
  const filteredAndSortedResorts = useMemo(() => {
    let result = [...resorts];

    // Apply state filter
    if (stateFilter) {
      result = result.filter(
        (resort) => resort.stateCode?.toLowerCase() === stateFilter.toLowerCase()
      );
    }

    // Apply country filter (only if no state filter, or if filtering within country)
    if (countryFilter && !stateFilter) {
      result = result.filter(
        (resort) => resort.countryCode?.toLowerCase() === countryFilter.toLowerCase()
      );
    }

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
  }, [resorts, sortBy, passFilter, statusFilter, stateFilter, countryFilter]);

  // Get display names for current filters
  const stateDisplayName = stateFilter ? getStateName(stateFilter) : null;

  // When filtering by state, determine the country from the filtered resorts
  // This ensures the breadcrumb shows: Directory / US / Washington
  const inferredCountryCode = useMemo(() => {
    if (countryFilter) return countryFilter;
    if (stateFilter && filteredAndSortedResorts.length > 0) {
      // Get the country from the first filtered resort
      return filteredAndSortedResorts[0]?.countryCode || null;
    }
    return null;
  }, [countryFilter, stateFilter, filteredAndSortedResorts]);

  const countryDisplayName = inferredCountryCode ? getCountryName(inferredCountryCode) : null;

  return (
    <>
      <DirectoryHero
        resortCount={filteredAndSortedResorts.length}
        totalResorts={resorts.length}
        stateName={stateDisplayName}
        countryName={countryDisplayName}
        stateCode={stateFilter}
        countryCode={inferredCountryCode || undefined}
      />

      <div className="container-custom py-8">
        <div className="space-y-6">
          <DirectoryFilters
            sortBy={sortBy}
            passFilter={passFilter}
            statusFilter={statusFilter}
            stateFilter={stateFilter}
            countryFilter={countryFilter}
            onSortChange={handleSortChange}
            onPassFilterChange={handlePassFilterChange}
            onStatusFilterChange={handleStatusFilterChange}
            onStateFilterChange={handleStateFilterChange}
            onCountryFilterChange={handleCountryFilterChange}
            totalResorts={resorts.length}
            filteredCount={filteredAndSortedResorts.length}
            availableStates={availableStates}
            availableCountries={availableCountries}
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
                  setStateFilter('');
                  setCountryFilter('');
                  updateURL(sortBy, 'all', 'all', '', '');
                }}
                className="mt-4 text-ski-blue hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
