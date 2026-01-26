import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";

import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Shared/UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number"],
    },
    disabled: {
      control: "boolean",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    type: "password",
    error: "Password must be at least 8 characters",
    placeholder: "Enter password",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    disabled: true,
    value: "Cannot edit this",
  },
};

export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter password",
  },
};

// All Variants Gallery
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <Input placeholder="Default input" />
      <Input label="With Label" placeholder="Enter value..." />
      <Input
        label="With Error"
        error="This field is required"
        placeholder="Invalid input"
      />
      <Input label="Disabled" disabled value="Cannot edit" />
      <Input label="Password" type="password" placeholder="Enter password" />
    </div>
  ),
};

// Interaction Tests
export const TypeInteraction: Story = {
  args: {
    label: "Username",
    placeholder: "Enter username",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    // Input should be empty initially
    await expect(input).toHaveValue("");

    // Type in the input
    await userEvent.type(input, "john.doe");

    // Verify the value was entered
    await expect(input).toHaveValue("john.doe");
  },
};

export const ClearAndRetype: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    // Type initial value
    await userEvent.type(input, "test@example.com");
    await expect(input).toHaveValue("test@example.com");

    // Clear and retype
    await userEvent.clear(input);
    await expect(input).toHaveValue("");

    await userEvent.type(input, "new@example.com");
    await expect(input).toHaveValue("new@example.com");
  },
};

export const LabelAssociation: Story = {
  args: {
    label: "Full Name",
    name: "fullName",
    placeholder: "Enter your full name",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find label and input
    const label = canvas.getByText("Full Name");
    const input = canvas.getByRole("textbox");

    // Verify label is associated with input (clicking label focuses input)
    await expect(label).toBeInTheDocument();
    await expect(input).toBeInTheDocument();

    // Label should have htmlFor attribute matching input id
    const inputId = input.getAttribute("id");
    await expect(label).toHaveAttribute("for", inputId);
  },
};

export const ErrorDisplay: Story = {
  args: {
    label: "Required Field",
    error: "This field is required",
    placeholder: "Enter value",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Error message should be visible
    const errorMessage = canvas.getByText("This field is required");
    await expect(errorMessage).toBeInTheDocument();
    await expect(errorMessage).toHaveClass("text-red-500");
  },
};
