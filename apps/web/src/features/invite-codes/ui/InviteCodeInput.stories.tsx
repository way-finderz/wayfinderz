import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { InviteCodeInput } from "./InviteCodeInput";

const meta: Meta<typeof InviteCodeInput> = {
  title: "Features/InviteCodes/InviteCodeInput",
  component: InviteCodeInput,
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
  args: {
    onCodeChange: fn(),
    onValidate: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    code: "",
    isValidated: false,
    isLoading: false,
  },
};

export const WithCode: Story = {
  args: {
    code: "ABC12345",
    isValidated: false,
    isLoading: false,
  },
};

export const Validating: Story = {
  args: {
    code: "ABC12345",
    isValidated: false,
    isLoading: true,
  },
};

export const Validated: Story = {
  args: {
    code: "ABC12345",
    isValidated: true,
    isLoading: false,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-96">
      <InviteCodeInput
        code=""
        onCodeChange={() => {}}
        isValidated={false}
        isLoading={false}
        onValidate={() => {}}
      />
      <InviteCodeInput
        code="ABC12345"
        onCodeChange={() => {}}
        isValidated={false}
        isLoading={false}
        onValidate={() => {}}
      />
      <InviteCodeInput
        code="ABC12345"
        onCodeChange={() => {}}
        isValidated={false}
        isLoading
        onValidate={() => {}}
      />
      <InviteCodeInput
        code="ABC12345"
        onCodeChange={() => {}}
        isValidated
        isLoading={false}
        onValidate={() => {}}
      />
    </div>
  ),
};
