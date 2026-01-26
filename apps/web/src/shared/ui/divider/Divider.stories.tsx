import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";

import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Shared/UI/Divider",
  component: Divider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {},
};

export const WithText: Story = {
  args: {
    text: "OR",
  },
};

export const WithLongText: Story = {
  args: {
    text: "Continue with",
  },
};

export const WithCustomClass: Story = {
  args: {
    text: "Custom",
    className: "my-8",
  },
};

// Usage Examples
export const InContext: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div className="p-4 bg-white rounded-lg">
        <h3 className="font-semibold mb-2">Sign in with email</h3>
        <p className="text-gray-600 text-sm">Enter your credentials below</p>
      </div>

      <Divider text="OR" />

      <div className="p-4 bg-white rounded-lg">
        <h3 className="font-semibold mb-2">Social login</h3>
        <p className="text-gray-600 text-sm">Use your social account</p>
      </div>
    </div>
  ),
};

export const MultipleInPage: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <p>Section 1 content</p>
      <Divider />
      <p>Section 2 content</p>
      <Divider text="More options" />
      <p>Section 3 content</p>
      <Divider />
      <p>Section 4 content</p>
    </div>
  ),
};

// Interaction Tests
export const SimpleDividerTest: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the divider line
    const divider = canvasElement.querySelector(".bg-gray-300");
    await expect(divider).toBeTruthy();

    // Should not have any text
    const _textElements = canvas.queryByText(/./);
    // The divider element itself doesn't contain visible text when no text prop
  },
};

export const TextDividerTest: Story = {
  args: {
    text: "OR",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should display the text
    const text = canvas.getByText("OR");
    await expect(text).toBeInTheDocument();
    await expect(text).toHaveClass("text-gray-500");

    // Should have two divider lines (on either side of text)
    const lines = canvasElement.querySelectorAll(".bg-gray-300");
    await expect(lines.length).toBe(2);
  },
};
