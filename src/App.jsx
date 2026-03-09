import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Github, Linkedin, Code, Database, 
  Server, Terminal, Cloud, Mail, Phone, Download,
  ExternalLink, Code2, MonitorPlay, Loader
} from 'lucide-react';

const ACCENT_COLOR = '#fd6f00';

// Custom Hook for Scroll Animations
function useInView(options = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return [ref, isInView];
}

// Reusable ScrollReveal Wrapper
const ScrollReveal = ({ children, className = '', animation = 'reveal', delay = 0 }) => {
  const [ref, isVisible] = useInView();
  
  return (
    <div 
      ref={ref} 
      className={`${animation} ${isVisible ? 'active' : ''} ${className}`} 
      style={{ transitionDelay: `${delay}ms` }}
    >
      {typeof children === 'function' ? children(isVisible) : children}
    </div>
  );
};

// Typewriter Hook
const useTypewriter = (words, typingSpeed = 100, deletingSpeed = 50, pauseTime = 1500) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    const currentWord = words[loopNum % words.length];
    const timeout = setTimeout(() => {
      if (isDeleting) {
        setText(currentWord.substring(0, text.length - 1));
        if (text === '') {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
        }
      } else {
        setText(currentWord.substring(0, text.length + 1));
        if (text === currentWord) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      }
    }, isDeleting ? deletingSpeed : text === currentWord ? pauseTime : typingSpeed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, loopNum, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Client Project Modal State
  const [clientModal, setClientModal] = useState({ isOpen: false, status: 'idle', link: '' });
  const timerRef = useRef(null);

  const typedText = useTypewriter(['Backend Engineer', 'Python Developer', 'API Architect', 'Problem Solver'], 80, 40, 2000);

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    workType: '',
    service: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  // Scroll Progress and Window listener
  useEffect(() => {
    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setScrollProgress(Number((currentScrollY / scrollHeight).toFixed(2)) * 100);
      }
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  // Smooth scroll handler
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // Client Project Handlers
  const handleProjectClick = (e, project) => {
    if (project.category === 'Clients') {
      e.preventDefault();
      setClientModal({ isOpen: true, status: 'waiting', link: project.link });

      // Wait 10 seconds before showing the prompt
      timerRef.current = setTimeout(() => {
        setClientModal(prev => ({ ...prev, status: 'prompt' }));
      });
    }
  };

  const handleCancelModal = () => {
    clearTimeout(timerRef.current);
    setClientModal({ isOpen: false, status: 'idle', link: '' });
  };

  const handleProceedModal = () => {
    window.open(clientModal.link, '_blank');
    setClientModal({ isOpen: false, status: 'idle', link: '' });
  };

  // Form Handlers
  const validateField = (name, value) => {
    let error = '';
    if (name === 'name' && !value.trim()) error = 'Name is required';
    if (name === 'email') {
      if (!value.trim()) error = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address';
    }
    if (name === 'phone') {
      if (!value.trim()) error = 'Phone number is required';
      else if (value.length !== 10) error = 'Phone number must be exactly 10 digits';
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    // Strict phone number formatting (only digits, max 10)
    if (name === 'phone') {
      value = value.replace(/\D/g, ''); // Remove non-numeric characters
      if (value.length > 10) value = value.slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // If there is an active error, validate on change to clear it dynamically
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = () => {
    const isNameValid = validateField('name', formData.name);
    const isEmailValid = validateField('email', formData.email);
    const isPhoneValid = validateField('phone', formData.phone);
    return isNameValid && isEmailValid && isPhoneValid;
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Build WhatsApp message template
      const workTypeText = formData.workType ? `Work Type: ${formData.workType}\n` : '';
      const serviceText = formData.service ? `Service of Interest: ${formData.service}\n` : '';
      const messageText = formData.message ? `\nMessage:\n${formData.message}` : '';
      
      const text = `Hi Prahalad,\n\nI am ${formData.name}. I'm reaching out from your portfolio website.\n\nContact Details:\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\n${workTypeText}${serviceText}${messageText}`;
      
      // WhatsApp API URL
      const whatsappUrl = `https://wa.me/917255926881?text=${encodeURIComponent(text)}`;
      
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-[#fd6f00] selection:text-white overflow-hidden relative">
      <style>{`
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #121212; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; border: 1px solid #121212; }
        ::-webkit-scrollbar-thumb:hover { background: #fd6f00; }

        /* Hero Load Animations */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }

        /* Scroll Reveal Animations */
        .reveal { opacity: 0; transform: translateY(40px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }
        .reveal.active { opacity: 1; transform: translateY(0); }
        
        .reveal-left { opacity: 0; transform: translateX(-50px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }
        .reveal-left.active { opacity: 1; transform: translateX(0); }
        
        .reveal-right { opacity: 0; transform: translateX(50px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }
        .reveal-right.active { opacity: 1; transform: translateX(0); }
        
        .reveal-scale { opacity: 0; transform: scale(0.8); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }
        .reveal-scale.active { opacity: 1; transform: scale(1); }

        /* Cursor blinking for typewriter */
        .typing-cursor::after {
          content: '|';
          animation: blink 1s step-start infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }

        /* Hover Enhancements */
        .btn-hover { transition: all 0.3s ease; }
        .btn-hover:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(253,111,0,0.4); }
        .glass-card { background: #1e1e1e; border: 1px solid #2a2a2a; }
      `}</style>
      
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[#fd6f00] to-yellow-500 z-[100] transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => scrollTo('home')}>
              <span className="text-xl md:text-2xl font-bold tracking-wider relative group">
                PRAHALAD <span className="text-[#fd6f00]">KUMAR</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#fd6f00] transition-all group-hover:w-full"></span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {['Home', 'Services', 'About Me', 'Portfolio', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                  className="text-gray-300 hover:text-[#fd6f00] transition-colors text-sm font-medium relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#fd6f00] transition-all group-hover:w-full opacity-50"></span>
                </button>
              ))}
              <button 
                onClick={() => scrollTo('contact')}
                className="btn-hover bg-[#fd6f00] hover:bg-[#e06200] text-white px-6 py-2.5 rounded-full font-medium transition-colors relative overflow-hidden group"
              >
                <span className="relative z-10">Hire Me</span>
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
              </button>
            </div>

            {/* Mobile Actions: Hire Me + Hamburger */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={() => scrollTo('contact')}
                className="bg-[#fd6f00] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md shadow-[#fd6f00]/20 active:scale-95 transition-transform"
              >
                Hire Me
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none transition-transform active:scale-95"
              >
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#1a1a1a]/95 backdrop-blur-lg border-b border-gray-800 absolute w-full left-0 shadow-2xl origin-top animate-slide-up" style={{ animationDuration: '0.3s' }}>
            <div className="px-4 pt-2 pb-6 space-y-2">
              {['Home', 'Services', 'About Me', 'Portfolio', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                  className="block w-full text-center px-3 py-4 text-base font-medium text-gray-300 hover:text-[#fd6f00] hover:bg-gray-800/50 rounded-md transition-colors border-b border-gray-800/50 last:border-0"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section id="home" className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between min-h-screen">
          
          {/* Left Content (Text, Buttons, Stats) */}
          <div className="w-full md:w-1/2 flex flex-col items-center text-center md:items-start md:text-left space-y-6 order-1 md:order-none z-10">
            <div className="space-y-2 opacity-0 animate-slide-up">
              <p className="text-gray-400 text-lg md:text-xl font-medium tracking-wide">Hi I am</p>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-[#fd6f00] tracking-tight drop-shadow-md">
                Prahalad Kumar
              </h1>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 h-10 md:h-16 flex items-center justify-center md:justify-start">
                <span className="typing-cursor text-gray-200">{typedText}</span>
              </h2>
            </div>
            
            {/* Social Icons */}
            <div className="flex space-x-4 pt-2 justify-center md:justify-start w-full opacity-0 animate-slide-up delay-100">
              <a href="https://www.linkedin.com/in/prahalad-kumar-86a81a327/" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn Profile" className="p-3 bg-[#1e1e1e]/80 backdrop-blur-sm rounded-full hover:bg-[#fd6f00] hover:-translate-y-2 hover:shadow-[0_0_15px_rgba(253,111,0,0.5)] hover:text-white transition-all duration-300 text-gray-400 border border-gray-800/50">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com/Prahalad-kumar" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub Profile" className="p-3 bg-[#1e1e1e]/80 backdrop-blur-sm rounded-full hover:bg-[#fd6f00] hover:-translate-y-2 hover:shadow-[0_0_15px_rgba(253,111,0,0.5)] hover:text-white transition-all duration-300 text-gray-400 border border-gray-800/50">
                <Github size={20} />
              </a>
              <a href="https://leetcode.com/u/prahaladkr1/" target="_blank" rel="noopener noreferrer" title="LeetCode" aria-label="LeetCode Profile" className="p-3 bg-[#1e1e1e]/80 backdrop-blur-sm rounded-full hover:bg-[#fd6f00] hover:-translate-y-2 hover:shadow-[0_0_15px_rgba(253,111,0,0.5)] hover:text-white transition-all duration-300 text-gray-400 border border-gray-800/50">
                <Code size={20} />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 justify-center md:justify-start w-full opacity-0 animate-slide-up delay-200">
              <button 
                onClick={() => scrollTo('contact')}
                className="btn-hover bg-gradient-to-r from-[#fd6f00] to-[#e06200] text-white px-8 py-3.5 rounded-md font-bold transition-all shadow-lg shadow-[#fd6f00]/30 hover:shadow-[#fd6f00]/50"
              >
                Hire Me
              </button>
              <a 
                href="prahalad_kumar (2).pdf" 
                download="Prahalad_Kumar_Resume.pdf"
                className="btn-hover glass-card text-white px-8 py-3.5 rounded-md font-medium transition-all flex justify-center items-center gap-2 hover:bg-white/5"
              >
                Download CV <Download size={18} className="animate-bounce" style={{ animationDuration: '2s' }}/>
              </a>
            </div>

            {/* Stats Area */}
            <div className="flex glass-card rounded-lg p-4 sm:p-6 mt-8 w-full divide-x divide-gray-700/50 opacity-0 animate-slide-up delay-300 hover:border-gray-500/50 transition-colors duration-300">
              <div className="flex-1 px-2 sm:px-4 text-center first:pl-0 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#fd6f00] drop-shadow-sm">1+</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Years Exp.</p>
              </div>
              <div className="flex-1 px-2 sm:px-4 text-center transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#fd6f00] drop-shadow-sm">10+</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Projects</p>
              </div>
              <div className="flex-1 px-2 sm:px-4 text-center last:pr-0 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#fd6f00] drop-shadow-sm">450+</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">LeetCode</p>
              </div>
            </div>
          </div>

          {/* Right Image (Appears below text on Mobile) */}
          <div className="w-full md:w-5/12 relative flex justify-center mt-12 md:mt-0 opacity-0 animate-slide-up delay-400 order-2 md:order-none z-0">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 animate-float">
              {/* Background Decorative Circle */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1e1e1e] to-[#2a2a2a] rounded-full border-4 border-[#1e1e1e] transition-transform duration-700 hover:scale-105 shadow-2xl"></div>
              {/* Top Decorative element */}
              <div className="absolute top-4 right-8 w-16 h-4 bg-[#fd6f00] rounded-full blur-[10px] animate-pulse opacity-80"></div>
              <div className="absolute bottom-8 left-4 w-12 h-12 bg-purple-600/50 rounded-full blur-xl animate-pulse delay-700"></div>
              
              {/* Image Container */}
              <div className="absolute inset-2 rounded-full overflow-hidden bg-gray-900 z-10 border border-gray-700/50 shadow-inner">
                <img 
                  src="pic2.png" 
                  alt="Prahalad Kumar" 
                  className="w-full h-full object-cover object-top grayscale hover:grayscale-0 hover:scale-110 transition-all duration-700 ease-in-out"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="py-16 md:py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Services</h2>
              <div className="w-16 md:w-24 h-1 bg-[#fd6f00] mx-auto rounded-full mb-6"></div>
              <p className="text-gray-400 max-w-2xl mx-auto mb-10 md:mb-16 text-xs md:text-base leading-relaxed px-2">
                Specialized in building robust, scalable backend systems and optimizing database architecture for high-performance applications.
              </p>
            </ScrollReveal>

            {/* Mobile 2-Column Grid Matching Figma */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: 'API Dev.', icon: <Server className="w-8 h-8 md:w-9 md:h-9" />, desc: 'Building secure and fast RESTful APIs using Python.' },
                { title: 'DB Optimize', icon: <Database className="w-8 h-8 md:w-9 md:h-9" />, desc: 'Designing schemas & reducing query latency in DBs.' },
                { title: 'Backend Dev', icon: <Code2 className="w-8 h-8 md:w-9 md:h-9" />, desc: 'Creating scalable production backend systems.' },
                { title: 'Full Stack', icon: <MonitorPlay className="w-8 h-8 md:w-9 md:h-9" />, desc: 'Building full stack apps with seamless integration.' }
              ].map((service, index) => (
                <ScrollReveal key={index} delay={index * 150} animation="reveal-scale">
                  <div className="h-full glass-card p-4 md:p-8 rounded-xl md:rounded-2xl hover:border-[#fd6f00]/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#fd6f00]/10 transition-all duration-300 group flex flex-col items-center text-center cursor-default relative overflow-hidden">
                    {/* Hover Glow Effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-24 h-16 md:h-24 bg-[#fd6f00]/20 rounded-full blur-xl md:blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    
                    <div className="text-[#fd6f00] mb-3 md:mb-6 p-3 md:p-4 bg-black/30 rounded-full group-hover:scale-110 group-hover:bg-[#fd6f00]/10 transition-all duration-300 relative z-10">
                      {service.icon}
                    </div>
                    <h3 className="text-sm md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-[#fd6f00] transition-colors relative z-10">{service.title}</h3>
                    <p className="text-gray-400 text-[10px] md:text-sm leading-snug md:leading-relaxed relative z-10 hidden sm:block">
                      {service.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT ME SECTION */}
        <section id="about-me" className="py-16 md:py-20 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 text-center tracking-tight">About Me</h2>
              <div className="w-16 md:w-24 h-1 bg-[#fd6f00] mx-auto rounded-full mb-6"></div>
              <p className="text-gray-400 max-w-2xl mx-auto mb-12 md:mb-16 text-center text-xs md:text-base px-2">
                A deep dive into my professional journey and expertise.
              </p>
            </ScrollReveal>

            <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-20">
              {/* Image (Appears top on Mobile) */}
              <ScrollReveal className="w-full md:w-2/5 flex justify-center" animation="reveal-left">
                <div className="relative w-56 h-72 md:w-80 md:h-[450px] rounded-2xl md:rounded-tl-full md:rounded-tr-full bg-[#1e1e1e] overflow-hidden border border-gray-700/50 shadow-2xl group">
                   <img 
                    src="pic1.png" 
                    alt="About Prahalad" 
                    className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90 group-hover:opacity-40 transition-opacity duration-500"></div>
                </div>
              </ScrollReveal>

              {/* Text Content */}
              <ScrollReveal className="w-full md:w-3/5 space-y-5 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-left" animation="reveal-right">
                <p className="text-gray-300 text-sm md:text-lg leading-relaxed">
                  I am a passionate <strong className="text-white font-semibold">Backend Engineer</strong> specializing in building scalable backend systems using Python, Django, and FastAPI. I have a strong focus on API performance optimization, database architecture, and writing clean, production-grade code.
                </p>
                <p className="text-gray-300 text-sm md:text-lg leading-relaxed">
                  My experience spans designing secure authentication workflows, optimizing SQL queries (reducing latency by up to 40%), and deploying cloud-ready backend services. In addition to system design, I have honed my problem-solving skills by tackling over <strong className="text-[#fd6f00]">450+ LeetCode problems</strong>, demonstrating solid DSA fundamentals.
                </p>
                <div className="pt-4 flex justify-center md:justify-start w-full">
                  <a 
                    href="prahalad_kumar (2).pdf" 
                    download="Prahalad_Kumar_Resume.pdf"
                    className="btn-hover bg-gradient-to-r from-[#fd6f00] to-[#e06200] text-white px-8 py-3.5 rounded-md font-bold transition-all shadow-lg shadow-[#fd6f00]/30 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    Download CV <Download size={18} />
                  </a>
                </div>
              </ScrollReveal>
            </div>

            {/* SKILLS RINGS */}
            <div className="mt-20 md:mt-32">
              <ScrollReveal>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-10 text-center flex items-center justify-center gap-4">
                  <span className="h-px bg-gray-700 w-8 md:w-24"></span>
                  Backend & Databases
                  <span className="h-px bg-gray-700 w-8 md:w-24"></span>
                </h3>
              </ScrollReveal>
              <div className="grid grid-cols-2 md:flex flex-wrap justify-center gap-8 lg:gap-14">
                {[
                  { name: 'Python', percent: 90, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
                  { name: 'Django', percent: 85, icon: 'https://cdn.simpleicons.org/django/white' },
                  { name: 'FastAPI', percent: 80, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg' },
                  { name: 'PostgreSQL', percent: 85, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
                  { name: 'SQLAlchemy', percent: 80, icon: 'https://cdn.simpleicons.org/sqlalchemy/white' },
                ].map((skill, index) => (
                  <ScrollReveal key={`backend-${index}`} delay={index * 100} animation="reveal-scale">
                    {(isVisible) => (
                      <div className="flex flex-col items-center group cursor-pointer">
                        <div className="relative w-24 h-24 md:w-32 md:h-32 transform group-hover:-translate-y-3 transition-transform duration-300">
                          <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="rgba(30,30,30,0.5)" stroke="rgba(255,255,255,0.05)" strokeWidth="8" className="backdrop-blur-sm"/>
                            <circle 
                              cx="60" cy="60" r="50" fill="none" 
                              stroke="#fd6f00" strokeWidth="8" strokeLinecap="round"
                              strokeDasharray="314.159"
                              strokeDashoffset={isVisible ? 314.159 - (skill.percent / 100) * 314.159 : 314.159}
                              className="transition-all duration-[2000ms] ease-out group-hover:drop-shadow-[0_0_12px_rgba(253,111,0,0.8)]"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <img 
                              src={skill.icon} 
                              alt={skill.name} 
                              className={`absolute w-10 h-10 md:w-16 md:h-16 object-contain transition-all duration-1000 group-hover:scale-125 group-hover:blur-[2px] ${isVisible ? 'scale-100 opacity-15' : 'scale-0 opacity-0'}`} 
                            />
                            <span className={`z-10 font-extrabold text-lg md:text-2xl text-white drop-shadow-lg transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                              {skill.percent}%
                            </span>
                          </div>
                        </div>
                        <span className="mt-4 md:mt-5 text-sm md:text-base text-gray-400 font-semibold tracking-wide group-hover:text-[#fd6f00] transition-colors">{skill.name}</span>
                      </div>
                    )}
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal>
                <h3 className="text-xl md:text-2xl font-bold text-white mt-16 md:mt-20 mb-10 text-center flex items-center justify-center gap-4">
                  <span className="h-px bg-gray-700 w-8 md:w-24"></span>
                  Frontend Basics
                  <span className="h-px bg-gray-700 w-8 md:w-24"></span>
                </h3>
              </ScrollReveal>
              <div className="grid grid-cols-2 md:flex flex-wrap justify-center gap-8 lg:gap-14">
                {[
                  { name: 'HTML', percent: 75, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
                  { name: 'CSS', percent: 70, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
                  { name: 'JavaScript', percent: 70, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
                  { name: 'React', percent: 65, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
                ].map((skill, index) => (
                  <ScrollReveal key={`frontend-${index}`} delay={index * 100} animation="reveal-scale">
                    {(isVisible) => (
                      <div className="flex flex-col items-center group cursor-pointer">
                        <div className="relative w-24 h-24 md:w-32 md:h-32 transform group-hover:-translate-y-3 transition-transform duration-300">
                          <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="rgba(30,30,30,0.5)" stroke="rgba(255,255,255,0.05)" strokeWidth="8" className="backdrop-blur-sm"/>
                            <circle 
                              cx="60" cy="60" r="50" fill="none" 
                              stroke="#fd6f00" strokeWidth="8" strokeLinecap="round"
                              strokeDasharray="314.159"
                              strokeDashoffset={isVisible ? 314.159 - (skill.percent / 100) * 314.159 : 314.159}
                              className="transition-all duration-[2000ms] ease-out group-hover:drop-shadow-[0_0_12px_rgba(253,111,0,0.8)]"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <img 
                              src={skill.icon} 
                              alt={skill.name} 
                              className={`absolute w-10 h-10 md:w-16 md:h-16 object-contain transition-all duration-1000 group-hover:scale-125 group-hover:blur-[2px] ${isVisible ? 'scale-100 opacity-15' : 'scale-0 opacity-0'}`} 
                            />
                            <span className={`z-10 font-extrabold text-lg md:text-2xl text-white drop-shadow-lg transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                              {skill.percent}%
                            </span>
                          </div>
                        </div>
                        <span className="mt-4 md:mt-5 text-sm md:text-base text-gray-400 font-semibold tracking-wide group-hover:text-[#fd6f00] transition-colors">{skill.name}</span>
                      </div>
                    )}
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PORTFOLIO SECTION */}
        <section id="portfolio" className="py-16 md:py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 text-center tracking-tight">Portfolio</h2>
              <div className="w-16 md:w-24 h-1 bg-[#fd6f00] mx-auto rounded-full mb-8 md:mb-10"></div>
              
              {/* Filters */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-14">
                {['All', 'Clients', 'Personal'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${
                      activeFilter === filter 
                        ? 'bg-[#fd6f00] text-white shadow-[0_0_20px_rgba(253,111,0,0.5)] scale-105' 
                        : 'glass-card text-gray-300 hover:text-white hover:bg-white/10 hover:border-gray-500'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: 'Leave Management System',
                  category: 'Clients',
                  desc: 'REST endpoints for HR workflows, role-based access control, and query optimization for large employee datasets.',
                  img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                  link: '#'
                },
                {
                  title: 'ATS Platform',
                  category: 'Clients',
                  desc: 'Candidate lifecycle management APIs, resume document storage, and scalable recruitment workflows.',
                  img: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80',
                  link: '#'
                },
                {
                  title: 'HealthBook Doctor Portal',
                  category: 'Personal',
                  desc: 'Appointment booking system deployed on Railway. Real-time scheduling with secure authentication workflows.',
                  img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
                  link: 'https://github.com/Prahalad-kumar/Doctor_patient_consultancy'
                },
                {
                  title: 'Python CLI Projects',
                  category: 'Personal',
                  desc: 'A collection of command-line interface tools and automation scripts built purely in Python.',
                  img: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
                  link: 'https://github.com/Prahalad-kumar/Python_projects'
                }
              ]
              .filter(project => activeFilter === 'All' || project.category === activeFilter)
              .map((project, index) => (
                <ScrollReveal key={`${project.title}-${index}`} delay={index * 150} animation="reveal-scale">
                  <div className="glass-card rounded-2xl overflow-hidden group hover:border-[#fd6f00]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#fd6f00]/20 hover:-translate-y-2 md:hover:-translate-y-3 flex flex-col h-full">
                    <div className="relative h-48 md:h-60 overflow-hidden">
                      <img 
                        src={project.img} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                         <a 
                           href={project.link} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           onClick={(e) => handleProjectClick(e, project)}
                           className="bg-[#fd6f00] p-3 md:p-4 rounded-full text-white transform translate-y-8 group-hover:translate-y-0 hover:scale-110 hover:shadow-[0_0_15px_rgba(253,111,0,0.8)] transition-all duration-300 delay-75 cursor-pointer"
                         >
                            <ExternalLink size={20} className="md:w-6 md:h-6" />
                         </a>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 bg-[#fd6f00]/10 text-[#fd6f00] text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full mb-3 md:mb-4 border border-[#fd6f00]/20">{project.category}</span>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 group-hover:text-[#fd6f00] transition-colors">{project.title}</h3>
                        <p className="text-gray-400 text-xs md:text-sm leading-relaxed line-clamp-3">
                          {project.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-16 md:py-20 overflow-hidden relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 text-center tracking-tight">Contact Me</h2>
              <div className="w-16 md:w-24 h-1 bg-[#fd6f00] mx-auto rounded-full mb-6"></div>
              <p className="text-gray-400 mb-10 md:mb-12 text-center text-xs md:text-base max-w-2xl mx-auto px-2">
                Let's discuss how my backend engineering skills can bring value to your project. Drop a message to connect instantly via WhatsApp!
              </p>
            </ScrollReveal>

            <div className="glass-card p-6 md:p-10 rounded-2xl shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#fd6f00]/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <form className="space-y-4 md:space-y-6 relative z-10" onSubmit={handleContactSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <ScrollReveal animation="reveal-left" delay={100}>
                    <div>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Your Name" 
                        required
                        className={`w-full bg-black/40 border ${errors.name ? 'border-red-500' : 'border-gray-700/50 hover:border-gray-500'} rounded-xl px-4 md:px-5 py-3.5 md:py-4 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#fd6f00] focus:ring-1 focus:ring-[#fd6f00] transition-all shadow-inner`}
                      />
                      {errors.name && <p className="text-red-500 text-[10px] md:text-xs mt-1 ml-1 font-medium">{errors.name}</p>}
                    </div>
                  </ScrollReveal>
                  <ScrollReveal animation="reveal-right" delay={200}>
                    <div>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Your Email Address" 
                        required
                        className={`w-full bg-black/40 border ${errors.email ? 'border-red-500' : 'border-gray-700/50 hover:border-gray-500'} rounded-xl px-4 md:px-5 py-3.5 md:py-4 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#fd6f00] focus:ring-1 focus:ring-[#fd6f00] transition-all shadow-inner`}
                      />
                      {errors.email && <p className="text-red-500 text-[10px] md:text-xs mt-1 ml-1 font-medium">{errors.email}</p>}
                    </div>
                  </ScrollReveal>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <ScrollReveal animation="reveal-left" delay={300}>
                    <div>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        maxLength="10"
                        placeholder="Your Phone Number" 
                        required
                        className={`w-full bg-black/40 border ${errors.phone ? 'border-red-500' : 'border-gray-700/50 hover:border-gray-500'} rounded-xl px-4 md:px-5 py-3.5 md:py-4 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#fd6f00] focus:ring-1 focus:ring-[#fd6f00] transition-all shadow-inner`}
                      />
                      {errors.phone && <p className="text-red-500 text-[10px] md:text-xs mt-1 ml-1 font-medium">{errors.phone}</p>}
                    </div>
                  </ScrollReveal>
                  <ScrollReveal animation="reveal-right" delay={400}>
                    <div className="relative h-full">
                      <select 
                        name="workType"
                        value={formData.workType}
                        onChange={handleInputChange}
                        required
                        className={`w-full bg-black/40 border border-gray-700/50 rounded-xl px-4 md:px-5 py-3.5 md:py-4 text-sm md:text-base focus:outline-none focus:border-[#fd6f00] focus:ring-1 focus:ring-[#fd6f00] transition-all appearance-none hover:border-gray-500 cursor-pointer md:h-[58px] shadow-inner ${formData.workType ? 'text-white' : 'text-gray-500'}`}
                      >
                        <option value="" disabled hidden className="bg-[#1e1e1e] text-gray-500">Preferred Work Type</option>
                        <option value="Full-time" className="bg-[#1e1e1e] text-white">Full-time</option>
                        <option value="Contract Base" className="bg-[#1e1e1e] text-white">Contract Base</option>
                        <option value="Freelance" className="bg-[#1e1e1e] text-white">Freelance</option>
                        <option value="Part-time" className="bg-[#1e1e1e] text-white">Part-time</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 md:px-5 text-[#fd6f00]">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                <ScrollReveal animation="reveal" delay={450}>
                  <div className="relative h-full">
                    <select 
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      required
                      className={`w-full bg-black/40 border border-gray-700/50 rounded-xl px-4 md:px-5 py-3.5 md:py-4 text-sm md:text-base focus:outline-none focus:border-[#fd6f00] focus:ring-1 focus:ring-[#fd6f00] transition-all appearance-none hover:border-gray-500 cursor-pointer md:h-[58px] shadow-inner ${formData.service ? 'text-white' : 'text-gray-500'}`}
                    >
                      <option value="" disabled hidden className="bg-[#1e1e1e] text-gray-500">Service of Interest</option>
                      <option value="API Development" className="bg-[#1e1e1e] text-white">API Development</option>
                      <option value="Database Architecture" className="bg-[#1e1e1e] text-white">Database Architecture</option>
                      <option value="Backend Consultation" className="bg-[#1e1e1e] text-white">Backend Consultation</option>
                      <option value="Full Stack Project" className="bg-[#1e1e1e] text-white">Full Stack Project</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 md:px-5 text-[#fd6f00]">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="reveal" delay={500}>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell me about your project details..." 
                    rows="4"
                    className="w-full bg-black/40 border border-gray-700/50 rounded-xl px-4 md:px-5 py-3.5 md:py-4 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#fd6f00] focus:ring-1 focus:ring-[#fd6f00] transition-all resize-none hover:border-gray-500 shadow-inner"
                  ></textarea>
                </ScrollReveal>

                <ScrollReveal animation="reveal" delay={600}>
                  <div className="text-center md:text-left pt-2">
                    <button 
                      type="submit"
                      className="btn-hover w-full md:w-auto bg-gradient-to-r from-[#fd6f00] to-[#e06200] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#fd6f00]/30 flex justify-center items-center gap-3 hover:shadow-[#fd6f00]/50"
                    >
                      Send Message to WhatsApp
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    </button>
                  </div>
                </ScrollReveal>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-black/80 pt-12 md:pt-16 pb-8 border-t border-gray-800/50 relative z-10 backdrop-blur-md">
        <ScrollReveal animation="reveal" delay={100}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            
            <div className="mb-6 md:mb-8 hover:scale-105 transition-transform cursor-pointer group" onClick={() => scrollTo('home')}>
              <span className="text-2xl md:text-3xl font-extrabold tracking-wider">
                PRAHALAD <span className="text-[#fd6f00] group-hover:text-white transition-colors">KUMAR</span>
              </span>
            </div>

            <div className="flex space-x-4 md:space-x-6 mb-8 md:mb-10 mt-2 md:mt-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn Profile" className="p-2.5 md:p-3 bg-gray-900 rounded-full hover:bg-[#fd6f00] hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(253,111,0,0.5)] hover:text-white transition-all duration-300 text-gray-400 border border-gray-800">
                <Linkedin size={20} className="md:w-[22px] md:h-[22px]" />
              </a>
              <a href="https://github.com/Prahalad-kumar" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub Profile" className="p-2.5 md:p-3 bg-gray-900 rounded-full hover:bg-[#fd6f00] hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(253,111,0,0.5)] hover:text-white transition-all duration-300 text-gray-400 border border-gray-800">
                <Github size={20} className="md:w-[22px] md:h-[22px]" />
              </a>
              <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer" title="LeetCode" aria-label="LeetCode Profile" className="p-2.5 md:p-3 bg-gray-900 rounded-full hover:bg-[#fd6f00] hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(253,111,0,0.5)] hover:text-white transition-all duration-300 text-gray-400 border border-gray-800">
                <Code size={20} className="md:w-[22px] md:h-[22px]" />
              </a>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-12 text-gray-400 mb-8 md:mb-10 text-xs md:text-sm font-medium w-full md:w-auto">
              <div className="flex items-center justify-center gap-3 hover:text-[#fd6f00] transition-colors cursor-pointer bg-gray-900/50 px-4 md:px-6 py-2 rounded-full border border-gray-800/50">
                <Mail size={16} className="text-[#fd6f00] md:w-[18px] md:h-[18px]" />
                <span>Prahaladkr1@gmail.com</span>
              </div>
              <div className="flex items-center justify-center gap-3 hover:text-[#fd6f00] transition-colors cursor-pointer bg-gray-900/50 px-4 md:px-6 py-2 rounded-full border border-gray-800/50">
                <Phone size={16} className="text-[#fd6f00] md:w-[18px] md:h-[18px]" />
                <span>+91-7255926881</span>
              </div>
            </div>

            <div className="w-full border-t border-gray-800/50 pt-6 md:pt-8 mt-2 md:mt-4">
               <p className="text-gray-500 text-[10px] md:text-sm font-medium tracking-wide">
                &copy; {new Date().getFullYear()} Prahalad Kumar. All Rights Reserved.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </footer>

      {/* CUSTOM CLIENT PROJECT MODAL */}
      {clientModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={handleCancelModal}
          ></div>
          <div className="bg-[#1a1a1a] border border-gray-700/50 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10 max-w-md w-full text-center animate-slide-up glass-card">
            
            {clientModal.status === 'waiting' ? (
              <div className="flex flex-col items-center gap-5 py-4">
                <div className="relative">
                  <Loader className="w-14 h-14 text-[#fd6f00] animate-spin-slow" />
                  <div className="absolute inset-0 border-4 border-[#fd6f00]/20 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-wide">Secure Connection</h3>
                  <p className="text-gray-400 text-sm leading-relaxed px-4">
                    Fetching secure access to client assets... Please wait for 3 seconds.
                  </p>
                </div>
                <button 
                  onClick={handleCancelModal} 
                  className="mt-4 px-6 py-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 text-sm font-medium"
                >
                  Cancel Request
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5 py-2">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-2 shadow-inner shadow-red-500/20">
                  <X size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">Access Restricted</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Sorry, I can't show you the source code and Information of client projects due to confidentiality agreements.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
                  <button 
                    onClick={handleCancelModal} 
                    className="flex-1 py-3.5 rounded-xl font-bold border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCancelModal} 
                    className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#fd6f00] to-[#e06200] text-white transition-colors shadow-lg shadow-[#fd6f00]/20 hover:shadow-[#fd6f00]/40"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}