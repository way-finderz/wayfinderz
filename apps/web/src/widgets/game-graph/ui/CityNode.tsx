"use client";

import { Handle, type Node, type NodeProps,Position } from "@xyflow/react";
import { motion } from "framer-motion";
import { memo } from "react";

import { cn } from "@/shared/lib";

export interface CityNodeData extends Record<string, unknown> {
  label: string;
  position: number;
  isVisited: boolean;
  isCurrent: boolean;
  isTarget: boolean;
}

export type CityNodeType = Node<CityNodeData, "city">;

function CityNodeComponent({ data }: NodeProps<CityNodeType>) {
  const { label, isVisited, isCurrent, isTarget } = data;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "px-4 py-2 rounded-lg border-2 shadow-md min-w-[80px] text-center font-medium",
        "transition-colors duration-300",
        {
          // Current city - pulsing primary color
          "bg-[#6F2AEC] border-[#6F2AEC] text-white": isCurrent,
          // Target city (Rome) - golden
          "bg-amber-100 border-amber-400 text-amber-900": isTarget && !isCurrent,
          // Visited city - green
          "bg-green-100 border-green-400 text-green-800":
            isVisited && !isCurrent && !isTarget,
          // Unvisited city - gray
          "bg-gray-100 border-gray-300 text-gray-600":
            !isVisited && !isCurrent && !isTarget,
        }
      )}
    >
      {/* Incoming handle (left side) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400 !w-2 !h-2"
      />

      {/* City name */}
      <span className="text-sm">{label}</span>

      {/* Pulsing indicator for current city */}
      {isCurrent && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Target indicator */}
      {isTarget && !isCurrent && (
        <motion.div
          className="absolute -top-1 -right-1 text-xs"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🏛️
        </motion.div>
      )}

      {/* Outgoing handle (right side) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400 !w-2 !h-2"
      />
    </motion.div>
  );
}

export const CityNode = memo(CityNodeComponent);
