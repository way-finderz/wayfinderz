import { Button } from "@/shared/ui";

export interface CreateInviteCardProps {
  isCreating: boolean;
  onCreateCode: () => void;
}

export function CreateInviteCard({
  isCreating,
  onCreateCode,
}: CreateInviteCardProps) {
  return (
    <div className="bg-white border rounded-lg p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">Create New Invite Code</h2>
      <p className="text-sm text-gray-600 mb-4">
        Each invite code can only be used once.
      </p>
      <Button onClick={onCreateCode} isLoading={isCreating}>
        Create Code
      </Button>
    </div>
  );
}
