import type { Meta, StoryObj } from "@storybook/react";

import { PageContainer } from "./PageContainer";

const meta: Meta<typeof PageContainer> = {
  title: "Shared/UI/PageContainer",
  component: PageContainer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    maxWidth: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="bg-white border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Page Title</h1>
        <p className="text-gray-600">
          This is the content inside the page container.
        </p>
      </div>
    ),
  },
};

export const Small: Story = {
  args: {
    maxWidth: "sm",
    children: (
      <div className="bg-white border rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Small Container</h1>
        <p className="text-gray-600">Max width: sm (384px)</p>
      </div>
    ),
  },
};

export const Medium: Story = {
  args: {
    maxWidth: "md",
    children: (
      <div className="bg-white border rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Medium Container</h1>
        <p className="text-gray-600">Max width: md (448px)</p>
      </div>
    ),
  },
};

export const Large: Story = {
  args: {
    maxWidth: "lg",
    children: (
      <div className="bg-white border rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Large Container</h1>
        <p className="text-gray-600">Max width: lg (512px)</p>
      </div>
    ),
  },
};

export const ExtraLarge: Story = {
  args: {
    maxWidth: "xl",
    children: (
      <div className="bg-white border rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Extra Large Container</h1>
        <p className="text-gray-600">Max width: xl (576px)</p>
      </div>
    ),
  },
};

export const WithForm: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <button className="w-full py-2 bg-purple-600 text-white rounded-lg">
            Sign In
          </button>
        </form>
      </div>
    ),
  },
};
