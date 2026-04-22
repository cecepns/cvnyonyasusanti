/* eslint-disable react/prop-types */
export default function Footer({ settings }) {
  return (
    <footer className="mt-14 border-t bg-white">
      <div className="container-app grid gap-8 py-12 md:grid-cols-3">
        <div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">Info</h3>
          <p className="text-sm leading-relaxed text-slate-600">{settings?.footer_info || "-"}</p>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">Contact Us</h3>
          <p className="text-sm text-slate-600">{settings?.contact_address || "-"}</p>
          <p className="text-sm text-slate-600">{settings?.email || "-"}</p>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">Link</h3>
          <p className="text-sm text-slate-600">{settings?.footer_links || "-"}</p>
        </div>
      </div>
    </footer>
  );
}

