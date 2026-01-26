import { GamePage } from "@/views/game";

// Required for static export - tells Next.js which paths to pre-render
export function generateStaticParams() {
  return [
    { journeySlug: "road-to-rome" },
    { journeySlug: "camino-de-santiago" },
    { journeySlug: "from-the-sea-to-the-sky" },
  ];
}

interface PageProps {
  params: Promise<{ journeySlug: string }>;
}

export default async function GameRoute({ params }: PageProps) {
  const { journeySlug } = await params;

  return <GamePage journeySlug={journeySlug} />;
}
