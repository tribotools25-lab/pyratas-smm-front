import { Suspense } from "react";
import SetPasswordClient from "./SetPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Carregando...</div>}>
      <SetPasswordClient />
    </Suspense>
  );
}
