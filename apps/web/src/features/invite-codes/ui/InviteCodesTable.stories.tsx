import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import type { InviteCode } from "./InviteCodeRow";
import { InviteCodesTable } from "./InviteCodesTable";

const sampleInvites: InviteCode[] = [
  {
    id: "1",
    code: "ABC12345",
    isActive: true,
    expiresAt: null,
    createdAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: "2",
    code: "XYZ98765",
    isActive: true,
    expiresAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    deletedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "3",
    code: "DEF45678",
    isActive: false,
    expiresAt: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    deletedAt: null,
  },
];

const meta: Meta<typeof InviteCodesTable> = {
  title: "Features/InviteCodes/InviteCodesTable",
  component: InviteCodesTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    onCopyCode: fn(),
    onDeactivate: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCodes: Story = {
  args: {
    inviteCodes: sampleInvites,
    isLoading: false,
    copiedCode: null,
  },
};

export const Loading: Story = {
  args: {
    inviteCodes: [],
    isLoading: true,
    copiedCode: null,
  },
};

export const Empty: Story = {
  args: {
    inviteCodes: [],
    isLoading: false,
    copiedCode: null,
  },
};

export const WithCopied: Story = {
  args: {
    inviteCodes: sampleInvites,
    isLoading: false,
    copiedCode: "ABC12345",
  },
};
