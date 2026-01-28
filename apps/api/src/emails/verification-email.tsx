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

type VerificationEmailProps = {
  userName?: string;
  verifyUrl: string;
};

export const VerificationEmail = ({ userName, verifyUrl }: VerificationEmailProps) => {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";

  return (
    <Html>
      <Head />
      <Preview>Verify your email for Way Finderz</Preview>
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
                Verify Your Email
              </Text>
              <Text className="text-gray-700 mb-2">{greeting}</Text>
              <Text className="text-gray-700 mb-6">
                Thanks for signing up for Way Finderz! Please verify your email address to
                complete your registration and start your language learning journey.
              </Text>
              <Section className="text-center my-6">
                <Button
                  href={verifyUrl}
                  className="bg-[#F5C842] text-[#2D005D] px-8 py-3 rounded-lg font-semibold no-underline"
                >
                  Verify Email Address
                </Button>
              </Section>
              <Text className="text-xs text-gray-500 mt-6 mb-2">
                If the button doesn&apos;t work, copy and paste this link into your
                browser:
              </Text>
              <Text className="text-xs text-[#6F2AEC] break-all mb-6">
                {verifyUrl}
              </Text>
              <Text className="text-xs text-gray-500 bg-gray-100 p-4 rounded-lg m-0">
                This link expires in 5 days. If you didn&apos;t create an account with Way
                Finderz, you can safely ignore this email.
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

VerificationEmail.PreviewProps = {
  userName: "Michael",
  verifyUrl: "https://way-finderz.com/verify?token=abc123",
} satisfies VerificationEmailProps;

export default VerificationEmail;
