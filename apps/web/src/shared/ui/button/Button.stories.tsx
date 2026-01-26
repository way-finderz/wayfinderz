import type { StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { fn } from "storybook/test";

import { Button } from "./Button";

const meta = {
  title: "Shared/UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    isLoading: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost Button",
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Button",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    children: "Medium Button",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Button",
  },
};

// States
export const Loading: Story = {
  args: {
    isLoading: true,
    children: "Loading...",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
  },
};

// All Variants Gallery
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex gap-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex gap-4">
        <Button isLoading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  ),
};

// // Interaction Tests
// export const ClickInteraction: Story = {
//   args: {
//     children: "Click Me",
//   },
//   play: async ({ canvasElement, args }) => {
//     const canvas = within(canvasElement);
//     const button = canvas.getByRole("button", { name: "Click Me" });

//     // Button should be enabled
//     await expect(button).not.toBeDisabled();

//     // Click the button
//     await userEvent.click(button);

//     // Verify onClick was called
//     await expect(args.onClick).toHaveBeenCalledTimes(1);
//   },
// };

// export const DisabledInteraction: Story = {
//   args: {
//     children: "Disabled Button",
//     disabled: true,
//   },
//   play: async ({ canvasElement, args }) => {
//     const canvas = within(canvasElement);
//     const button = canvas.getByRole("button", { name: "Disabled Button" });

//     // Button should be disabled
//     await expect(button).toBeDisabled();

//     // Try to click - should not trigger onClick
//     await userEvent.click(button);
//     await expect(args.onClick).not.toHaveBeenCalled();
//   },
// };

// export const LoadingInteraction: Story = {
//   args: {
//     children: "Loading Button",
//     isLoading: true,
//   },
//   play: async ({ canvasElement, args }) => {
//     const canvas = within(canvasElement);
//     const button = canvas.getByRole("button");

//     // Button should be disabled when loading
//     await expect(button).toBeDisabled();

//     // Should show loading spinner (check for spinner element)
//     const spinner = button.querySelector(".animate-spin");
//     await expect(spinner).toBeTruthy();

//     // Click should not trigger onClick when loading
//     await userEvent.click(button);
//     await expect(args.onClick).not.toHaveBeenCalled();
//   },
// };
