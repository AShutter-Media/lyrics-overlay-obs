export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Transparent root so OBS Browser Source shows the stream behind
    <div className="w-full h-full bg-transparent">{children}</div>
  );
}
