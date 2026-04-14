import { auth0 } from "@/lib/auth0";
import Button from '@/app/components/elements/Button';

export default async function Document() {
    return (
      <main>
      <section className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center px-6 py-16">
        <main className="w-full max-w-xl text-center space-y-12">
          <div>
            <h1 >
              これは書類管理画面です。
            </h1>
          </div>
        </main>
        <footer className="mt-16 text-sm text-[#9a948c]">
          © 2026 昭和産業株式会社
        </footer>
      </section>
      </main>
    );
  }

