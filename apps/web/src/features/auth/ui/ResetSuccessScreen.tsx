import { Button } from "@/shared/ui";

export interface ResetSuccessScreenProps {
  onSignIn: () => void;
}

export function ResetSuccessScreen({ onSignIn }: ResetSuccessScreenProps) {
  return (
    <div className="text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold mb-4">Password Reset!</h1>
      <p className="text-gray-600 mb-6">
        Your password has been successfully reset. You can now sign in with your
        new password.
      </p>
      <Button onClick={onSignIn}>Sign In</Button>
    </div>
  );
}
