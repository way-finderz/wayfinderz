import { Button } from "@/shared/ui";

export interface InviteCodeInputProps {
  code: string;
  onCodeChange: (code: string) => void;
  isValidated: boolean;
  isLoading: boolean;
  onValidate: () => void;
}

export function InviteCodeInput({
  code,
  onCodeChange,
  isValidated,
  isLoading,
  onValidate,
}: InviteCodeInputProps) {
  return (
    <div>
      <label
        htmlFor="inviteCode"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Invite Code
      </label>
      <div className="flex gap-2">
        <input
          id="inviteCode"
          data-testid="invite-code-input"
          type="text"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
          required
          disabled={isValidated}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100"
          placeholder="XXXXXXXX"
        />
        {!isValidated && (
          <Button
            data-testid="invite-code-validate"
            type="button"
            variant="ghost"
            onClick={onValidate}
            disabled={isLoading || !code}
          >
            Validate
          </Button>
        )}
        {isValidated && (
          <span data-testid="invite-code-valid-badge" className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
            Valid
          </span>
        )}
      </div>
    </div>
  );
}
