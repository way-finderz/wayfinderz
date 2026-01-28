import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type PasswordResetEmailProps = {
  userName?: string;
  resetUrl: string;
};

export const PasswordResetEmail = ({ userName, resetUrl }: PasswordResetEmailProps) => {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>Reset your password for Way Finderz</Preview>
      <Tailwind>
        <Body className="bg-[#FDF8F3] font-sans">
          <Container className="mx-auto py-10 px-5 max-w-[600px]">
            <Section className="bg-white rounded-xl p-10 shadow-sm">
              <Text className="text-[#6F2AEC] text-3xl font-bold text-center m-0">
                Way Finderz
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-2 mb-8">
                Learn the language, find your way
              </Text>
              <Text className="text-[#6F2AEC] text-2xl font-semibold mt-8 mb-4">
                Reset Your Password
              </Text>
              <Text className="text-gray-700 mb-2">{greeting}</Text>
              <Text className="text-gray-700 mb-6">
                We received a request to reset your password for your Way Finderz account.
                Click the button below to create a new password.
              </Text>
              <Section className="text-center my-6">
                <Button
                  href={resetUrl}
                  className="bg-[#F5C842] text-[#2D005D] px-8 py-3 rounded-lg font-semibold no-underline"
                >
                  Reset Password
                </Button>
              </Section>
              <Text className="text-xs text-gray-500 mt-6 mb-2">
                If the button doesn&apos;t work, copy and paste this link into your
                browser:
              </Text>
              <Text className="text-xs text-[#6F2AEC] break-all mb-6">
                {resetUrl}
              </Text>
              <Text className="text-xs text-gray-500 bg-gray-100 p-4 rounded-lg m-0">
                This link expires in 1 hour for security reasons. If you
                didn&apos;t request
                a password reset, you can safely ignore this email - your password will
                remain unchanged.
              </Text>
            </Section>
            <Text className="text-xs text-gray-400 text-center mt-6">
              &copy; {new Date().getFullYear()} Way Finderz. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

PasswordResetEmail.PreviewProps = {
  userName: "Michael",
  resetUrl: "https://way-finderz.com/reset-password?token=abc123",
} satisfies PasswordResetEmailProps;

export default PasswordResetEmail;
