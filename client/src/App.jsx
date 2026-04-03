import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am HealthHub AI. How can I help?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Doctors state
  const [doctors, setDoctors] = useState([]);
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({ name: '', date: '', dept: '' });
  const [bookingStatus, setBookingStatus] = useState('');

  // Body Map Details
  const [deptDetails, setDeptDetails] = useState(null);

  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Fetch Authors
    axios.get('http://localhost:5000/api/doctors')
      .then(res => setDoctors(res.data))
      .catch(err => console.error("Error fetching doctors", err));

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((totalScroll / windowHeight) * 100);
      setScrolled(window.scrollY > 50);

      // Simple Reveal logic
      document.querySelectorAll('.reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          el.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger once on load
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    try {
      const res = await axios.post('http://localhost:5000/api/chat', { message: userMsg.text });
      setChatMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to server.' }]);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/bookings', bookingForm);
      setBookingStatus('Booking confirmed! We will contact you shortly.');
      setBookingForm({ name: '', date: '', dept: '' });
    } catch (e) {
      setBookingStatus('Failed to submit booking.');
    }
  };

  const handleBodySpotClick = (dept) => {
    const infoList = {
      'Neurology': 'Expert care for brain, spine, and nervous system disorders.',
      'Cardiology': 'Comprehensive heart care and advanced cardiac surgery.',
      'Gastroenterology': 'Specialized treatment for digestive system issues.'
    };
    setDeptDetails({ name: dept, desc: infoList[dept] });
  };

  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>
      <button className="sos-btn" onClick={() => alert('SOS Triggered! Dialing 112!')}>🚨</button>

      {/* Chat Widget */}
      <div className="chat-widget">
        <div className={`chat-panel glass-panel ${chatOpen ? 'active' : ''}`}>
          <div className="chat-header">
            <span>🤖 HealthHub AI</span>
            <button className="chat-close" onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`msg ${msg.sender === 'bot' ? 'msg-bot' : 'msg-user'}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
              placeholder="Ask me anything..." 
            />
            <button onClick={sendChatMessage}>➤</button>
          </div>
        </div>
        <div className="chat-bubble" onClick={() => setChatOpen(true)}>💬</div>
      </div>

      {/* Navigation */}
      <nav className={scrolled ? 'scrolled' : ''}>
        <div className="container nav-container">
          <a href="#" className="navbar-brand">❤️ HealthHub</a>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#doctors">Doctors</a>
            <a href="#booking">Book</a>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content reveal">
            <h1 className="hero-title">Your Health, <br/><span>Our Priority</span></h1>
            <p className="hero-subtitle">Modern 24/7 care with leading Indian Specialists.</p>
            <div className="hero-actions">
              <a href="#booking" className="btn btn-primary">Book Appointment</a>
            </div>
          </div>
        </div>
      </section>

      {/* Body Map & Emergency Wait Times */}
      <section className="container py-5">
        <div className="glass-panel reveal" style={{ padding: '3rem', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--emergency)' }}>Live ER Wait Times</h2>
          <div className="wait-times">
            <div className="wait-card glass-panel"><h4>General</h4><div style={{color: 'var(--success)', fontSize: '2rem'}}>8 min</div></div>
            <div className="wait-card glass-panel warning"><h4>Cardiology</h4><div style={{color: 'var(--warning)', fontSize: '2rem'}}>15 min</div></div>
            <div className="wait-card glass-panel danger"><h4>Trauma</h4><div style={{color: 'var(--emergency)', fontSize: '2rem'}}>32 min</div></div>
          </div>
        </div>

        <div className="body-map-section glass-panel reveal" style={{ padding: '3rem' }}>
          <div className="body-map-container">
            <div className="body-spot spot-head" onClick={() => handleBodySpotClick('Neurology')}></div>
            <div className="body-spot spot-chest" onClick={() => handleBodySpotClick('Cardiology')}></div>
            <div className="body-spot spot-stomach" onClick={() => handleBodySpotClick('Gastroenterology')}></div>
          </div>
          <div className="body-info">
            <h2>Interactive Symptom Finder</h2>
            <p className="text-secondary mt-4 mb-4">Click a point on the body map to find the right department instantly.</p>
            {deptDetails && (
              <div className="glass-panel" style={{ padding: '1.5rem', animation: 'fadeUp 0.3s ease' }}>
                <h3 style={{ color: 'var(--primary)' }}>{deptDetails.name}</h3>
                <p className="mt-4 mb-4">{deptDetails.desc}</p>
                <a href="#booking" className="btn btn-primary" style={{ width: '100%' }}>Book Specialist</a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* React Booking Component connecting to Node.js */}
      <section id="booking" className="container py-5 reveal">
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="text-center mb-4">Book an Appointment</h2>
          <form onSubmit={handleBooking}>
            <input required type="text" placeholder="Full Name" value={bookingForm.name} onChange={e => setBookingForm({...bookingForm, name: e.target.value})} />
            <input required type="date" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} />
            <select required value={bookingForm.dept} onChange={e => setBookingForm({...bookingForm, dept: e.target.value})}>
              <option value="">Select Department...</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="General">General Physician</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Confirm Booking</button>
            {bookingStatus && <p className="mt-4 text-center text-success" style={{color: 'var(--success)'}}>{bookingStatus}</p>}
          </form>
        </div>
      </section>

      {/* Dynamic Doctors Grid from Backend */}
      <section id="doctors" className="container py-5">
        <h2 className="text-center reveal">Famous Indian Specialists</h2>
        <div className="doctors-grid mt-4">
          {doctors.map((doc, idx) => (
            <div key={doc.id} className="doctor-card reveal" style={{ transitionDelay: `${idx * 0.1}s` }}>
              <div className="doctor-front glass-panel">
                {/* Dynamically fallback to existing assets we pulled over, simulating profiles for these famous doctors */}
                <img src={`/Assets/gallery-${(idx % 8) + 1}.jpg`} alt={doc.name} style={{filter: 'grayscale(30%)'}} />
                <div className="doctor-info">
                  <h3>{doc.name}</h3>
                  <p className="text-primary mt-4">{doc.specialty} · {doc.hospital}</p>
                  <p className="text-warning mt-4">⭐ {doc.rating}</p>
                </div>
              </div>
              <div className="doctor-back glass-panel">
                <h3>{doc.name}</h3>
                <p className="mt-4 text-secondary">{doc.bio}</p>
                <a href="#booking" className="btn btn-primary mt-4" style={{ width: '100%' }}>Book Now</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container footer-grid">
          <div className="footer-col">
            <h4>HealthHub FullStack</h4>
            <p className="text-secondary">Running on React + Node.js (Express)</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
