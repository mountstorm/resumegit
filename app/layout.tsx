import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'resumeGit',
  description: 'Git version control for your resume'
};

const NAV = [
  { href: '/', label: 'Timeline' },
  { href: '/branches', label: 'Branches' },
  { href: '/merge', label: 'Merge' },
  { href: '/resume', label: 'Resume' }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">
            <b>resume</b><span>Git</span> / resume.yaml
          </Link>
          <nav>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="page">{children}</main>
      </body>
    </html>
  );
}