"use client";

import { useState } from "react";

import { ChangePasswordDialog } from "./ChangePasswordDialog";

export interface ProfileCardProps {
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string | Date;
  onSignOut: () => void;
}

interface ProfileCardRowProps {
  label: string;
  value?: string;
  dataTestId: string;
}

function ProfileCardRow({
  label,
  value,
  dataTestId,
}: ProfileCardRowProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      <p className="text-lg" data-testid={dataTestId}>{value}</p>
    </div>
  );
}

export function ProfileCard({
  name,
  email,
  role = "user",
  createdAt,
  onSignOut,
}: ProfileCardProps) {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      <ProfileCardRow label="Name" value={name} dataTestId="profile-name" />
      <ProfileCardRow label="Email" value={email} dataTestId="profile-email" />
      <ProfileCardRow label="Role" value={role} dataTestId="profile-role" />
      <ProfileCardRow
        label="Member Since"
        value={createdAt ? new Date(createdAt).toLocaleDateString() : undefined}
        dataTestId="profile-member-since"
      />

      <hr />

      <button
        onClick={() => setShowChangePassword(true)}
        className="w-full py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
      >
        Change Password
      </button>

      <button
        data-testid="profile-sign-out"
        onClick={onSignOut}
        className="w-full py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
      >
        Sign Out
      </button>

      <ChangePasswordDialog
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
}
