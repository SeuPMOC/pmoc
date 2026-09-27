import Link from "next/link";

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
  as,
  options,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  step?: string;
  as?: "textarea" | "select";
  options?: { value: string; label: string; group?: string }[];
  placeholder?: string;
}) {
  const grupos = options?.some((o) => o.group)
    ? [...new Set(options.map((o) => o.group ?? ""))]
    : null;
  const cls = "mt-1 w-full px-3 py-2.5 text-sm";
  return (
    <label className="block text-sm">
      <span className="font-medium text-neutral-700">{label}</span>
      {as === "textarea" ? (
        <textarea
          name={name}
          required={required}
          defaultValue={defaultValue ?? undefined}
          placeholder={placeholder}
          rows={3}
          className={cls}
        />
      ) : as === "select" ? (
        <select
          name={name}
          required={required}
          defaultValue={defaultValue ?? undefined}
          className={cls}
        >
          {grupos
            ? grupos.map((g) => (
                <optgroup key={g} label={g}>
                  {options!
                    .filter((o) => (o.group ?? "") === g)
                    .map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                </optgroup>
              ))
            : (options ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          step={step}
          required={required}
          defaultValue={defaultValue ?? undefined}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </label>
  );
}

export function Submit({ children = "Salvar" }: { children?: React.ReactNode }) {
  return (
    <button className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white">
      {children}
    </button>
  );
}

export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-extrabold tracking-tight text-brand-dark">{title}</h1>
      {action}
    </div>
  );
}

export function Panel({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-brand/10 bg-white shadow-sm">
      {title && <h2 className="border-b border-brand/10 px-5 py-3.5 font-bold text-brand-dark">{title}</h2>}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Crumb({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-blue-600 hover:underline">
      {children}
    </Link>
  );
}
