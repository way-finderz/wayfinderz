import type { InviteCode } from "../model/types";

export interface InviteCodeRowProps {
  invite: InviteCode;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  onDeactivate: (id: string) => void;
}

export function InviteCodeRow({
  invite,
  copiedCode,
  onCopyCode,
  onDeactivate,
}: InviteCodeRowProps) {
  return (
    <tr>
      <td className="px-6 py-4">
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
          {invite.code}
        </code>
      </td>
      <td className="px-6 py-4 text-sm">
        {invite.deletedAt ? (
          <span className="text-gray-500">Used</span>
        ) : (
          <span className="text-green-600">Available</span>
        )}
      </td>
      <td className="px-6 py-4">
        {invite.isActive ? (
          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
            Active
          </span>
        ) : (
          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
            Inactive
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(invite.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onCopyCode(invite.code)}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 transition"
          >
            {copiedCode === invite.code ? "Copied!" : "Copy"}
          </button>
          {invite.isActive && (
            <button
              onClick={() => onDeactivate(invite.id)}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
            >
              Deactivate
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
