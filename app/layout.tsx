import type { ReactNode } from 'react';

export const metadata = {
  title: 'Japanese Kana Sprint',
  description: 'Adaptive Japanese kana, vocabulary, number, and guided lesson practice.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
