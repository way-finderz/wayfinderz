import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { SignupFormFields } from "./SignupFormFields";

const meta: Meta<typeof SignupFormFields> = {
  title: "Features/Auth/SignupFormFields",
  component: SignupFormFields,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-96 space-y-4">
        <Story />
      </div>
    ),
  ],
  args: {
    onNameChange: fn(),
    onEmailChange: fn(),
    onPasswordChange: fn(),
    onConfirmPasswordChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
};

export const Filled: Story = {
  args: {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
  },
};

export const PasswordMismatch: Story = {
  args: {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "differentpassword",
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-12 w-96">
      <div className="space-y-4">
        <h3 className="font-semibold">Empty</h3>
        <SignupFormFields
          name=""
          onNameChange={() => {}}
          email=""
          onEmailChange={() => {}}
          password=""
          onPasswordChange={() => {}}
          confirmPassword=""
          onConfirmPasswordChange={() => {}}
        />
      </div>
      <hr />
      <div className="space-y-4">
        <h3 className="font-semibold">With Mismatch</h3>
        <SignupFormFields
          name="John Doe"
          onNameChange={() => {}}
          email="john@example.com"
          onEmailChange={() => {}}
          password="password123"
          onPasswordChange={() => {}}
          confirmPassword="different"
          onConfirmPasswordChange={() => {}}
        />
      </div>
    </div>
  ),
};
