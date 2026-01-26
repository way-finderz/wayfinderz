"use client";

import {
  Background,
  Controls,
  type Edge,
  MarkerType,
  ReactFlow,
} from "@xyflow/react";
import { useMemo } from "react";

import { type City,useGameStore } from "@/features/game";

import { CityNode, type CityNodeType } from "./CityNode";

import "@xyflow/react/dist/style.css";

// Custom node types
const nodeTypes = {
  city: CityNode,
};

// Edge styling helpers
function getEdgeColor(isSelected: boolean, isAvailable: boolean): string {
  if (isSelected) return "#22C55E";
  if (isAvailable) return "#6F2AEC";

  return "#d1d5db";
}

function getEdgeWidth(isSelected: boolean, isAvailable: boolean): number {
  if (isSelected) return 4;
  if (isAvailable) return 3;

  return 2;
}

// Position cities in a vertical layout based on their position value
function calculateNodePosition(
  position: number,
  index: number
): { x: number; y: number } {
  // Base Y position spreads cities vertically (top to bottom)
  const baseY = position * 120;

  // X position alternates left/right for cities at the same position
  // Position 0 (Venice) and 5 (Rome) are centered
  // Other positions have 2 cities each
  const citiesAtPosition = [1, 2, 2, 2, 2, 1]; // Venice, P1, P2, P3, P4, Rome
  const isAlternating = citiesAtPosition[position] > 1;

  // Simple alternating pattern based on index within the position group
  const xOffset = isAlternating ? (index % 2 === 0 ? -100 : 100) : 0;

  return { x: 200 + xOffset, y: baseY + 50 };
}

interface GameGraphProps {
  selectedEdgeId?: string | null;
}

export function GameGraph({ selectedEdgeId }: GameGraphProps) {
  const {
    allCities,
    allEdges,
    availableEdges,
    currentCity,
    targetCity,
    visitedCities,
  } = useGameStore();

  // Build React Flow nodes from cities
  const nodes: CityNodeType[] = useMemo(() => {
    // Group cities by position to handle index calculation
    const citiesByPosition = new Map<number, City[]>();
    allCities.forEach((city) => {
      const existing = citiesByPosition.get(city.position) || [];
      citiesByPosition.set(city.position, [...existing, city]);
    });

    return allCities.map((city) => {
      const citiesAtPos = citiesByPosition.get(city.position) || [];
      const indexAtPos = citiesAtPos.findIndex((c) => c.id === city.id);
      const pos = calculateNodePosition(city.position, indexAtPos);

      return {
        id: city.id,
        type: "city" as const,
        position: pos,
        data: {
          label: city.displayName,
          position: city.position,
          isVisited: visitedCities.includes(city.id),
          isCurrent: city.id === currentCity?.id,
          isTarget: city.id === targetCity?.id,
        },
        draggable: false,
      };
    });
  }, [allCities, currentCity, targetCity, visitedCities]);

  // Build React Flow edges with numbered labels
  const edges: Edge[] = useMemo(() => {
    // Create a map of available edge IDs to their index (1-based)
    const availableEdgeIndex = new Map<string, number>();
    availableEdges.forEach((e, idx) => {
      availableEdgeIndex.set(e.edgeId, idx + 1);
    });

    return allEdges.map((edge) => {
      const edgeNumber = availableEdgeIndex.get(edge.id);
      const isAvailable = edgeNumber !== undefined;
      const isSelected = edge.id === selectedEdgeId;
      const availableEdge = availableEdges.find((e) => e.edgeId === edge.id);

      // Create numbered label for available edges
      const label = isAvailable && availableEdge
        ? `${edgeNumber}. ${availableEdge.translation.sourceWord}`
        : undefined;

      const color = getEdgeColor(isSelected, isAvailable);
      const strokeWidth = getEdgeWidth(isSelected, isAvailable);

      return {
        id: edge.id,
        source: edge.fromCityId,
        target: edge.toCityId,
        animated: isSelected,
        style: { stroke: color, strokeWidth },
        markerEnd: { type: MarkerType.ArrowClosed, color },
        label,
        labelStyle: {
          fill: isSelected ? "#22C55E" : "#6F2AEC",
          fontWeight: 700,
          fontSize: 14,
        },
        labelBgStyle: {
          fill: isSelected ? "#F0FDF4" : "#fff",
          fillOpacity: 0.95,
          stroke: isSelected ? "#22C55E" : "#6F2AEC",
          strokeWidth: isSelected ? 2 : 1,
        },
        labelBgPadding: [6, 6] as [number, number],
        labelBgBorderRadius: 6,
        data: { availableEdge, edgeNumber },
      };
    });
  }, [allEdges, availableEdges, selectedEdgeId]);

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        zoomOnScroll
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
