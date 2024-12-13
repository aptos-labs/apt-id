import Link from 'next/link';
import { TopBar } from '../components/TopBar';

export default function NotFound() {
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-gradient-to-b from-[#D8B4FE] to-[#818CF8] flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
          <p className="text-white/80 mb-8">Could not find the requested profile.</p>
          <Link 
            href="/"
            className="px-6 py-3 bg-white/90 hover:bg-white rounded-lg transition-all
                     text-[#000000] font-semibold shadow-md hover:scale-[1.02]"
          >
            Return Home
          </Link>
        </div>
      </main>
    </>
  );
} 