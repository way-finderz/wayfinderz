import type { StoryObj } from "@storybook/nextjs-vite";
import React from "react";

import { Skeleton, SkeletonText } from "./Skeleton";

const meta = {
  title: "Shared/UI/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "circular", "rectangular"],
    },
    animation: {
      control: "select",
      options: ["pulse", "wave", "none"],
    },
    width: {
      control: "text",
    },
    height: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    variant: "text",
    width: "200px",
  },
};

export const Circular: Story = {
  args: {
    variant: "circular",
    width: 48,
    height: 48,
  },
};

export const Rectangular: Story = {
  args: {
    variant: "rectangular",
    width: 200,
    height: 100,
  },
};

export const WaveAnimation: Story = {
  args: {
    variant: "rectangular",
    width: 200,
    height: 100,
    animation: "wave",
  },
};

export const NoAnimation: Story = {
  args: {
    variant: "rectangular",
    width: 200,
    height: 100,
    animation: "none",
  },
};

export const TextLines: Story = {
  render: () => (
    <div className="w-64">
      <SkeletonText lines={4} />
    </div>
  ),
};

export const CardExample: Story = {
  render: () => (
    <div className="w-80 p-4 border rounded-lg space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={120} />
      <SkeletonText lines={2} />
    </div>
  ),
};

export const TableRowExample: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <table className="w-full">
        <tbody>
          <tr>
            <td className="px-6 py-4">
              <Skeleton variant="text" width="80%" />
            </td>
            <td className="px-6 py-4">
              <Skeleton variant="text" width="60%" />
            </td>
            <td className="px-6 py-4">
              <Skeleton variant="text" width="40%" />
            </td>
            <td className="px-6 py-4">
              <Skeleton variant="rectangular" width={80} height={32} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};
