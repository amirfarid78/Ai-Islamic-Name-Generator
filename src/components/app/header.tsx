import { Logo } from "@/components/app/icons";

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-headline font-semibold text-primary">Ummah Name</h1>
      </div>
    </header>
  );
}
