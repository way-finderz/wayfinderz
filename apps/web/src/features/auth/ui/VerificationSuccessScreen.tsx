import { Button } from "@/shared/ui";

export interface VerificationSuccessScreenProps {
  onGoToDashboard: () => void;
}

export function VerificationSuccessScreen({
  onGoToDashboard,
}: VerificationSuccessScreenProps) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold mb-4">Email Verified!</h1>
      <p className="text-gray-600 mb-6">
        Your email has been successfully verified. You now have full access to
        Way Finderz.
      </p>
      <Button onClick={onGoToDashboard}>Go to Dashboard</Button>
    </div>
  );
}
