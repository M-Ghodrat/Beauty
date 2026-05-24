import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingBag, Calendar } from 'lucide-react';
import { APP_NAME } from '../constants';
import { auth, signInWithGoogle } from '../firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Boutique', href: '#products' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md py-4 border-b border-black/5' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-accent rounded-full"></div>
          <a href="/" className="text-xl font-semibold tracking-tight">
            LUMINA <span className="font-light text-gray-400 uppercase text-xs ml-1">Vancouver</span>
          </a>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-sm font-medium text-gray-500 hover:text-brand-accent transition-colors">
              {link.name}
            </a>
          ))}
          <div className="flex items-center gap-8 border-l border-black/5 pl-8">
            {user ? (
               <button onClick={() => signOut(auth)} className="text-xs font-semibold text-gray-400 uppercase tracking-tighter hover:text-brand-accent transition-colors">
                 Account
               </button>
            ) : (
              <button onClick={signInWithGoogle} className="text-xs font-semibold text-gray-400 uppercase tracking-tighter hover:text-brand-accent transition-colors">
                Sign In
              </button>
            )}
            <a href="#booking" className="pill-button-primary">
              Book Treatment
            </a>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-brand-paper border-b border-brand-ink/5 p-6 md:hidden flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="font-serif text-2xl">
                {link.name}
              </a>
            ))}
            <a href="#booking" onClick={() => setIsMenuOpen(false)} className="bg-brand-ink text-brand-paper text-center py-4 uppercase tracking-[0.2em] font-medium text-xs">
              Book Appointment
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
