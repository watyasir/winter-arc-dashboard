"use client";

import { overviewTiles } from "@/modules/registry";

/** Lays out the registered tiles row by row. */
export function OverviewView() {
  const rows = [...new Set(overviewTiles.map((t) => t.row))].sort((a, b) => a - b);
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => {
        const tiles = overviewTiles.filter((t) => t.row === row);
        if (tiles.length === 1) {
          const { id, Component } = tiles[0];
          return <Component key={id} />;
        }
        return (
          <div key={row} className="flex flex-wrap items-stretch gap-2.5">
            {tiles.map(({ id, Component }) => (
              <Component key={id} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
