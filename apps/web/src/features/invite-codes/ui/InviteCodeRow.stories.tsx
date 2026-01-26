import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import type { InviteCode } from "./InviteCodeRow";
import { InviteCodeRow } from "./InviteCodeRow";

const sampleInvite: InviteCode = {
  id: "1",
  code: "ABC12345",
  isActive: true,
  expiresAt: null,
  createdAt: new Date().toISOString(),
  deletedAt: null,
};

const meta: Meta<typeof InviteCodeRow> = {
  title: "Features/InviteCodes/InviteCodeRow",
  component: InviteCodeRow,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <table className="w-full">
        <tbody>
          <Story />
        </tbody>
      </table>
    ),
  ],
  args: {
    onCopyCode: fn(),
    onDeactivate: fn(),
    copiedCode: null,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveAvailable: Story = {
  args: {
    invite: sampleInvite,
  },
};

export const ActiveUsed: Story = {
  args: {
    invite: {
      ...sampleInvite,
      deletedAt: new Date().toISOString(),
    },
  },
};

export const Inactive: Story = {
  args: {
    invite: {
      ...sampleInvite,
      isActive: false,
    },
  },
};

export const JustCopied: Story = {
  args: {
    invite: sampleInvite,
    copiedCode: "ABC12345",
  },
};

export const AllStates: Story = {
  render: () => (
    <table className="w-full bg-white border rounded-lg">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
            Code
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
            Usage
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
            Status
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
            Created
          </th>
          <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        <InviteCodeRow
          invite={sampleInvite}
          copiedCode={null}
          onCopyCode={() => {}}
          onDeactivate={() => {}}
        />
        <InviteCodeRow
          invite={{ ...sampleInvite, id: "2", code: "XYZ98765", deletedAt: new Date().toISOString() }}
          copiedCode={null}
          onCopyCode={() => {}}
          onDeactivate={() => {}}
        />
        <InviteCodeRow
          invite={{
            ...sampleInvite,
            id: "3",
            code: "DEF45678",
            isActive: false,
          }}
          copiedCode={null}
          onCopyCode={() => {}}
          onDeactivate={() => {}}
        />
      </tbody>
    </table>
  ),
};
