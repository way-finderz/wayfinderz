import Link from "next/link";

export function EmailSentScreen() {
  return (
    <div className="text-center">
      <div className="text-6xl mb-6">📧</div>
      <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
      <p className="text-gray-600 mb-6">
        If an account with that email exists and is verified, we&apos;ve sent
        you a link to reset your password. The link will expire in 1 hour.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Don&apos;t see the email? Check your spam folder.
      </p>
      <Link href="/" className="text-primary hover:underline font-medium">
        Back to sign in
      </Link>
    </div>
  );
}
