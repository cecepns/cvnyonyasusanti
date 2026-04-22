/* eslint-disable react/prop-types */
import PublicHeader from "./PublicHeader";

export default function PublicLayout({ children, settings, cart = [] }) {
  return (
    <div>
      <PublicHeader settings={settings} cart={cart} />
      {children}
    </div>
  );
}

