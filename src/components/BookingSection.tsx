import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db, signInWithGoogle, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { SERVICES } from '../constants';
import { Calendar as CalendarIcon, Clock, CheckCircle2, User, Sparkles } from 'lucide-react';

export default function BookingSection() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [userDetails, setUserDetails] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState(SERVICES);

  const timeSlots = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserDetails({ name: user.displayName || '', email: user.email || '' });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchServices() {
      try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        if (!querySnapshot.empty) {
          const fetchedServices = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as typeof SERVICES;
          setServices(fetchedServices);
        }
      } catch (error) {
        console.error("Error fetching services in BookingSection: ", error);
      }
    }
    fetchServices();
  }, []);

  const handleBooking = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'appointments'), {
        serviceId: selectedService,
        date: selectedDate,
        time: selectedTime,
        customerName: userDetails.name,
        customerEmail: userDetails.email,
        status: 'pending',
        userId: auth.currentUser?.uid || null,
        createdAt: serverTimestamp()
      });
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setError('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceName = (id: string) => services.find(s => s.name === id)?.name || id;

  return (
    <section id="booking" className="py-32 bg-brand-paper">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h4 className="text-[10px] uppercase tracking-widest text-brand-accent font-bold mb-4">Gastown Studio</h4>
          <h2 className="text-5xl md:text-7xl font-light mb-6">Online <span className="italic font-serif text-brand-accent">Rituals</span></h2>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${step >= i ? 'w-16 bg-brand-accent' : 'w-4 bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <h3 className="text-2xl font-light text-center mb-8">Select a Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(s => (
                  <button
                    key={s.name}
                    onClick={() => { setSelectedService(s.name); setStep(2); }}
                    className={`p-6 rounded-[2rem] border transition-all text-left flex items-center gap-4 ${selectedService === s.name ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-100 hover:border-brand-accent/30 hover:bg-gray-50'}`}
                  >
                    <div className="w-12 h-12 bg-brand-mute rounded-2xl flex-shrink-0 flex items-center justify-center">
                      <Sparkles size={20} className="text-brand-accent" />
                    </div>
                    <div className="flex-grow">
                      <span className="font-medium block">{s.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-tighter">${s.price} • {s.duration} MIN</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-3">Preferred Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field text-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-3">Preferred Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-3 text-xs rounded-xl border transition-all ${selectedTime === t ? 'border-brand-accent bg-brand-accent text-white' : 'border-gray-100 hover:border-brand-accent/30'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedDate && selectedTime && (
                 <button 
                  onClick={() => setStep(3)} 
                  className="pill-button-accent w-full py-5"
                >
                  Confirm Details
                </button>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="max-w-md mx-auto text-center">
                <h4 className="text-2xl font-light mb-8">Your Information</h4>
                <div className="space-y-4">
                  <div className="text-left">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2 px-1">Full Name</label>
                    <input 
                      type="text" 
                      value={userDetails.name}
                      onChange={e => setUserDetails({...userDetails, name: e.target.value})}
                      placeholder="Jane Doe"
                      className="input-field"
                    />
                  </div>
                  <div className="text-left">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2 px-1">Email Address</label>
                    <input 
                      type="email" 
                      value={userDetails.email}
                      onChange={e => setUserDetails({...userDetails, email: e.target.value})}
                      placeholder="jane@example.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleBooking}
                  disabled={isSubmitting || !userDetails.name || !userDetails.email}
                  className="pill-button-accent w-full py-5 mt-10 disabled:opacity-30"
                >
                  {isSubmitting ? 'Reserving...' : 'Finalize Appointment'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-brand-accent/20 flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={40} className="text-brand-accent" />
              </div>
              <h3 className="text-3xl font-serif mb-4">Confirmed!</h3>
              <p className="font-serif text-lg opacity-60 mb-8 max-w-sm mx-auto">
                Your ritual for {selectedDate} at {selectedTime} has been reserved. A confirmation email has been sent.
              </p>
              <button 
                onClick={() => setStep(1)} 
                className="micro-label hover:text-brand-accent transition-colors"
              >
                Go Back
              </button>
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}
