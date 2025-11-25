'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import { Resort } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Snowflake, ChevronRight, Mountain, Thermometer } from 'lucide-react';
import { SortOption } from './DirectoryFilters';
import { StatusBadge } from './StatusBadge';
import { PassBadge } from './PassBadge';

interface DirectoryTableProps {
  resorts: Resort[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

type ColumnKey = 'name' | 'status' | 'snow' | 'base' | 'terrain' | 'acres' | 'vertical' | 'pass';

interface Column {
  key: ColumnKey;
  label: string;
  sortAsc?: SortOption;
  sortDesc?: SortOption;
  align?: 'left' | 'center' | 'right';
  width?: string;
  ariaLabel?: string;
}

const columns: Column[] = [
  { key: 'name', label: 'Resort', sortAsc: 'name', sortDesc: 'name-desc', align: 'left', ariaLabel: 'Sort by resort name' },
  { key: 'status', label: 'Status', align: 'center', width: 'w-24' },
  { key: 'snow', label: '24h Snow', sortAsc: 'snow', sortDesc: 'snow', align: 'right', width: 'w-24', ariaLabel: 'Sort by 24-hour snowfall' },
  { key: 'base', label: 'Base', sortAsc: 'base', sortDesc: 'base', align: 'right', width: 'w-20', ariaLabel: 'Sort by base depth' },
  { key: 'terrain', label: 'Open', sortAsc: 'terrain', sortDesc: 'terrain', align: 'center', width: 'w-28', ariaLabel: 'Sort by terrain open percentage' },
  { key: 'acres', label: 'Acres', sortAsc: 'acres', sortDesc: 'acres', align: 'right', width: 'w-24', ariaLabel: 'Sort by skiable acres' },
  { key: 'vertical', label: 'Vertical', sortAsc: 'vertical', sortDesc: 'vertical', align: 'right', width: 'w-24', ariaLabel: 'Sort by vertical drop' },
  { key: 'pass', label: 'Pass', align: 'center', width: 'w-28' },
];

export function DirectoryTable({ resorts, sortBy, onSortChange }: DirectoryTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getSortDirection = (column: Column): 'ascending' | 'descending' | 'none' => {
    if (!column.sortAsc) return 'none';
    if (sortBy === column.sortAsc) {
      return column.key === 'name' ? 'ascending' : 'descending';
    }
    if (sortBy === column.sortDesc) return 'descending';
    return 'none';
  };

  const getSortIndicator = (column: Column) => {
    if (!column.sortAsc) return null;

    const isActive = sortBy === column.sortAsc || sortBy === column.sortDesc;

    if (!isActive) {
      return (
        <span className="ml-1 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
          <ChevronUp className="w-3 h-3 inline -mb-0.5" />
        </span>
      );
    }

    if (sortBy === 'name') {
      return (
        <span className="ml-1 text-ski-blue" aria-hidden="true">
          <ChevronUp className="w-3 h-3 inline -mb-0.5" />
        </span>
      );
    } else if (sortBy === 'name-desc') {
      return (
        <span className="ml-1 text-ski-blue" aria-hidden="true">
          <ChevronDown className="w-3 h-3 inline -mb-0.5" />
        </span>
      );
    } else {
      return (
        <span className="ml-1 text-ski-blue" aria-hidden="true">
          <ChevronDown className="w-3 h-3 inline -mb-0.5" />
        </span>
      );
    }
  };

  const handleColumnClick = (column: Column) => {
    if (!column.sortAsc) return;

    if (column.key === 'name') {
      if (sortBy === 'name') {
        onSortChange('name-desc');
      } else {
        onSortChange('name');
      }
    } else if (column.sortAsc) {
      onSortChange(column.sortAsc);
    }
  };

  const toggleRowExpand = (resortId: string) => {
    setExpandedRow(expandedRow === resortId ? null : resortId);
  };

  const getTerrainBarColor = (percent: number) => {
    if (percent >= 90) return 'bg-success-green';
    if (percent >= 70) return 'bg-ski-blue';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200" role="region" aria-label="Resort directory table">
      <table className="w-full" role="grid" aria-label="Colorado ski resorts sorted by name">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200" role="row">
            <th className="w-8 px-2" role="columnheader" scope="col">
              <span className="sr-only">Expand row</span>
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.align === 'left' && 'text-left',
                  column.width,
                  column.sortAsc && 'cursor-pointer select-none group hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ski-blue focus:ring-inset'
                )}
                onClick={() => handleColumnClick(column)}
                role="columnheader"
                scope="col"
                aria-sort={getSortDirection(column)}
                aria-label={column.ariaLabel}
                tabIndex={column.sortAsc ? 0 : -1}
                onKeyDown={(e) => {
                  if (column.sortAsc && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleColumnClick(column);
                  }
                }}
              >
                {column.label}
                {getSortIndicator(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {resorts.map((resort) => {
            const hasSignificantSnow = resort.conditions.snowfall24h >= 6;
            const isExpanded = expandedRow === resort.id;

            return (
              <Fragment key={resort.id}>
                <tr
                  role="row"
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    hasSignificantSnow && 'bg-powder-blue/5',
                    isExpanded && 'bg-gray-50'
                  )}
                >
                  {/* Expand Button */}
                  <td className="px-2 py-4" role="gridcell">
                    <button
                      onClick={() => toggleRowExpand(resort.id)}
                      className={cn(
                        'p-1 rounded hover:bg-gray-200 transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-ski-blue'
                      )}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${resort.name}`}
                    >
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 text-gray-400 transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                      />
                    </button>
                  </td>

                  {/* Resort Name */}
                  <td className="px-4 py-4" role="gridcell">
                    <Link
                      href={`/colorado/${resort.slug}`}
                      className="font-semibold text-gray-900 hover:text-ski-blue transition-colors focus:outline-none focus:ring-2 focus:ring-ski-blue focus:ring-offset-2 rounded"
                    >
                      {resort.name}
                    </Link>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {resort.distanceFromDenver} mi from Denver
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center" role="gridcell">
                    <StatusBadge status={resort.conditions.status} />
                  </td>

                  {/* 24h Snow */}
                  <td className="px-4 py-4 text-right tabular-nums" role="gridcell">
                    <div className="flex items-center justify-end gap-1">
                      {resort.conditions.snowfall24h > 0 && (
                        <Snowflake
                          className={cn(
                            'w-3.5 h-3.5',
                            hasSignificantSnow ? 'text-ski-blue' : 'text-gray-400'
                          )}
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={cn(
                          'font-medium',
                          hasSignificantSnow ? 'text-ski-blue' : 'text-gray-700'
                        )}
                        aria-label={`${resort.conditions.snowfall24h} inches of new snow in 24 hours`}
                      >
                        {resort.conditions.snowfall24h > 0
                          ? `${resort.conditions.snowfall24h}"`
                          : '—'}
                      </span>
                    </div>
                  </td>

                  {/* Base Depth */}
                  <td className="px-4 py-4 text-right tabular-nums" role="gridcell">
                    <span className="text-gray-700" aria-label={`${resort.conditions.baseDepth} inch base depth`}>
                      {resort.conditions.baseDepth}&quot;
                    </span>
                  </td>

                  {/* Terrain Open */}
                  <td className="px-4 py-4" role="gridcell">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={resort.conditions.terrainOpen}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${resort.conditions.terrainOpen}% terrain open`}
                      >
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            getTerrainBarColor(resort.conditions.terrainOpen)
                          )}
                          style={{ width: `${resort.conditions.terrainOpen}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 tabular-nums w-10 text-right">
                        {resort.conditions.terrainOpen}%
                      </span>
                    </div>
                  </td>

                  {/* Skiable Acres */}
                  <td className="px-4 py-4 text-right tabular-nums" role="gridcell">
                    <span className="text-gray-700" aria-label={`${resort.stats.skiableAcres.toLocaleString()} skiable acres`}>
                      {resort.stats.skiableAcres.toLocaleString()}
                    </span>
                  </td>

                  {/* Vertical Drop */}
                  <td className="px-4 py-4 text-right tabular-nums" role="gridcell">
                    <span className="text-gray-700" aria-label={`${resort.stats.verticalDrop.toLocaleString()} feet vertical drop`}>
                      {resort.stats.verticalDrop.toLocaleString()}&apos;
                    </span>
                  </td>

                  {/* Pass */}
                  <td className="px-4 py-4" role="gridcell">
                    <div className="flex flex-wrap justify-center gap-1">
                      {resort.passAffiliations.map((pass) => (
                        <PassBadge key={pass} pass={pass} size="sm" />
                      ))}
                    </div>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {isExpanded && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={9} className="px-4 py-4">
                      <div className="pl-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* 72h Snowfall */}
                        <div className="flex items-center gap-2">
                          <Snowflake className="w-4 h-4 text-gray-400" aria-hidden="true" />
                          <div>
                            <div className="text-xs text-gray-500">72h Snowfall</div>
                            <div className="font-medium text-gray-900">{resort.conditions.snowfall72h}&quot;</div>
                          </div>
                        </div>

                        {/* Lifts Open */}
                        <div className="flex items-center gap-2">
                          <Mountain className="w-4 h-4 text-gray-400" aria-hidden="true" />
                          <div>
                            <div className="text-xs text-gray-500">Lifts Open</div>
                            <div className="font-medium text-gray-900">
                              {resort.conditions.liftsOpen} / {resort.stats.liftsCount}
                            </div>
                          </div>
                        </div>

                        {/* Runs */}
                        <div className="flex items-center gap-2">
                          <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
                          <div>
                            <div className="text-xs text-gray-500">Total Runs</div>
                            <div className="font-medium text-gray-900">{resort.stats.runsCount}</div>
                          </div>
                        </div>

                        {/* Elevation */}
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-gray-400" aria-hidden="true" />
                          <div>
                            <div className="text-xs text-gray-500">Summit / Base</div>
                            <div className="font-medium text-gray-900">
                              {resort.stats.summitElevation.toLocaleString()}&apos; / {resort.stats.baseElevation.toLocaleString()}&apos;
                            </div>
                          </div>
                        </div>

                        {/* Annual Snowfall */}
                        <div className="flex items-center gap-2">
                          <Snowflake className="w-4 h-4 text-gray-400" aria-hidden="true" />
                          <div>
                            <div className="text-xs text-gray-500">Avg Annual Snow</div>
                            <div className="font-medium text-gray-900">{resort.stats.avgAnnualSnowfall}&quot;</div>
                          </div>
                        </div>

                        {/* Terrain Breakdown */}
                        <div className="col-span-2 md:col-span-3">
                          <div className="text-xs text-gray-500 mb-1">Terrain Breakdown</div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                              <span className="text-gray-600">{resort.terrain.beginner}% Beginner</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
                              <span className="text-gray-600">{resort.terrain.intermediate}% Intermediate</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-orange-500" aria-hidden="true" />
                              <span className="text-gray-600">{resort.terrain.advanced}% Advanced</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-600" aria-hidden="true" />
                              <span className="text-gray-600">{resort.terrain.expert}% Expert</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* View Resort Link */}
                      <div className="pl-8 mt-4">
                        <Link
                          href={`/colorado/${resort.slug}`}
                          className="inline-flex items-center gap-1 text-ski-blue hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-ski-blue focus:ring-offset-2 rounded"
                        >
                          View full resort details
                          <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
