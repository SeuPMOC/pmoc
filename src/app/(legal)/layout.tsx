import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/login" className="text-sm text-blue-600 hover:underline">
        ← SeuPMOC
      </Link>
      <article className="prose prose-neutral mt-6 max-w-none text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1">
        {children}
      </article>
    </div>
  );
}
