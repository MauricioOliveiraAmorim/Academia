import Card from './ui/Card';

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gotham-950 px-4 py-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-bat-yellow-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/bat.svg"
            alt=""
            className="mx-auto mb-3 h-14 w-14 rounded-2xl shadow-lg shadow-bat-yellow-500/20"
          />
          <h1 className="font-display text-4xl tracking-wide text-bat-yellow-500">Academia</h1>
          {subtitle && <p className="mt-1 text-sm text-gotham-300">{subtitle}</p>}
        </div>

        <Card className="p-8">
          {title && <h2 className="mb-6 font-display text-2xl tracking-wide text-gotham-100">{title}</h2>}
          {children}
        </Card>
      </div>
    </div>
  );
}

export default AuthLayout;
