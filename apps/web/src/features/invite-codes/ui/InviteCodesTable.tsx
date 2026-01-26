import { Skeleton } from "@/shared/ui";

import type { InviteCode } from "../model/types";

import { InviteCodeRow } from "./InviteCodeRow";

export interface InviteCodesTableProps {
  inviteCodes: InviteCode[];
  isLoading: boolean;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  onDeactivate: (id: string) => void;
}

function LoadingRow() {
  return (
    <tr>
      <td className="px-6 py-4">
        <Skeleton variant="text" width="80%" />
      </td>
      <td className="px-6 py-4">
        <Skeleton variant="text" width="60%" />
      </td>
      <td className="px-6 py-4">
        <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton variant="text" width="70%" />
      </td>
      <td className="px-6 py-4 text-right">
        <Skeleton variant="rectangular" width={80} height={32} className="ml-auto" />
      </td>
    </tr>
  );
}

export function InviteCodesTable({
  inviteCodes,
  isLoading,
  copiedCode,
  onCopyCode,
  onDeactivate,
}: InviteCodesTableProps) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full">
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
          {isLoading ? (
            <>
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </>
          ) : inviteCodes.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No invite codes yet. Create one above.
              </td>
            </tr>
          ) : (
            inviteCodes.map((invite) => (
              <InviteCodeRow
                key={invite.id}
                invite={invite}
                copiedCode={copiedCode}
                onCopyCode={onCopyCode}
                onDeactivate={onDeactivate}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
