import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── CSS ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  .sd-root {
    font-family: 'Outfit', sans-serif;
    color: #1a1d2e;
  }
  .sd-root * { box-sizing: border-box; margin: 0; padding: 0; }

  /* Slider Container */
  .sd-container {
    position: relative; width: 100%; overflow: hidden;
    border-radius: 20px; background: #f0f4ff;
    box-shadow: 0 12px 32px rgba(99,102,241,0.12);
  }

  .sd-wrapper {
    display: flex; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sd-slide {
    flex: 0 0 100%; display: flex; align-items: center;
    min-height: 550px; padding: 48px 40px;
    background: linear-gradient(135deg, #f0f4ff 0%, #ede9ff 100%);
  }

  .sd-slide-content {
    display: flex; align-items: center; justify-content: space-between;
    gap: 40px; max-width: 1200px; margin: 0 auto; width: 100%;
  }

  .sd-slide-text { flex: 1; }
  .sd-slide-image { flex: 1; display: flex; align-items: center; justify-content: center; }

  .sd-slide-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 4vw, 48px); font-weight: 800;
    line-height: 1.1; margin-bottom: 16px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sd-slide-desc {
    font-size: 20px; color: #7b82a0; line-height: 1.6;
    margin-bottom: 20px;
  }

  .sd-slide-cta {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff; font: 600 14px 'Outfit', sans-serif;
    cursor: pointer; box-shadow: 0 4px 14px rgba(99,102,241,0.3);
    transition: opacity 0.15s, transform 0.15s;
  }
  .sd-slide-cta:hover { opacity: 0.9; transform: translateY(-2px); }

  .sd-slide-image img {
    width: 100%; max-width: 500px; height: 360px;
    border-radius: 16px; object-fit: cover;
  }

  .sd-slide-placeholder {
    width: 100%; max-width: 500px; height: 360px;
    background: linear-gradient(135deg, #dbeafe, #c7d2fe);
    border-radius: 16px; display: flex; align-items: center;
    justify-content: center; font-size: 56px; color: #6366f1;
  }

  /* Controls */
  .sd-controls {
    position: absolute; bottom: 24px; right: 40px;
    display: flex; align-items: center; gap: 12px;
  }

  .sd-btn-nav {
    width: 40px; height: 40px; border-radius: 50%;
    border: none; background: #fff;
    color: #6366f1; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .sd-btn-nav:hover { background: #6366f1; color: #fff; transform: scale(1.05); }
  .sd-btn-nav:disabled { opacity: 0.4; cursor: not-allowed; }

  .sd-dots {
    display: flex; gap: 8px;
  }

  .sd-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: rgba(255,255,255,0.5); border: none;
    cursor: pointer; transition: all 0.3s;
  }
  .sd-dot.active {
    background: #fff; width: 32px; border-radius: 4px;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .sd-slide {
      min-height: 420px; padding: 32px 20px;
    }
    
    .sd-slide-content {
      flex-direction: column; gap: 24px;
    }

    .sd-slide-title {
      font-size: clamp(20px, 3vw, 32px);
    }

    .sd-slide-desc {
      font-size: 17px;
    }

    .sd-slide-image { width: 100%; }
    .sd-slide-image img, .sd-slide-placeholder {
      max-width: 100%; width: 100%;
    }

    .sd-controls {
      bottom: 12px; right: 12px;
    }
  }

  /* Skeleton */
  .skeleton {
    background: linear-gradient(90deg,#e8ecf8 25%,#f4f6fd 50%,#e8ecf8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
  }

  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

/* ── Helpers ── */
const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

const getImageUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  if (filename.startsWith('/')) return `${BASE_URL}${filename}`;
  if (filename.startsWith('uploads/')) return `${BASE_URL}/${filename}`;
  // keep legacy folder for sliders
  return `${BASE_URL}/uploads/sliders/${filename}`;
};

/* ── Main Component ── */
const SliderDisplay = () => {
  const [sliders, setSliders] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* Fetch sliders */
  useEffect(() => {
    const fetchSliders = async () => {
      setLoading(true);
      try {
        console.log('Fetching from:', `${BASE_URL}/api/sliders`);
        const res = await fetch(`${BASE_URL}/api/sliders`);
        console.log('Fetch response status:', res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const json = await res.json();
        console.log('API Response:', json);
        
        // Handle different response formats
        let dataArray = [];
        if (Array.isArray(json)) {
          dataArray = json;
        } else if (Array.isArray(json.data)) {
          dataArray = json.data;
        } else if (Array.isArray(json.sliders)) {
          dataArray = json.sliders;
        }
        
        console.log('Parsed sliders:', dataArray);
        
        const activeSliders = dataArray
          .filter(s => s && (s.active == 1 || s.active === true))
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        
        console.log('Active sliders:', activeSliders);
        setSliders(activeSliders);
      } catch (e) {
        console.error('Failed to load sliders:', e);
        setSliders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  /* Auto advance slides */
  useEffect(() => {
    if (sliders.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + sliders.length) % sliders.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % sliders.length);
  };

  if (loading) {
    return (
      <div className="sd-root">
        <style>{css}</style>
        <div className="sd-container">
          <div className="sd-wrapper">
            <div className="sd-slide" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #ede9ff 100%)' }}>
              <div className="sd-slide-content">
                <div className="sd-slide-text">
                  <div className="skeleton" style={{ height: 48, borderRadius: 8, marginBottom: 16, width: '70%' }} />
                  <div className="skeleton" style={{ height: 20, borderRadius: 8, marginBottom: 8, width: '100%' }} />
                  <div className="skeleton" style={{ height: 20, borderRadius: 8, marginBottom: 24, width: '80%' }} />
                  <div className="skeleton" style={{ height: 40, borderRadius: 8, width: '150px' }} />
                </div>
                <div className="sd-slide-image">
                  <div className="skeleton" style={{ width: '100%', maxWidth: 400, aspectRatio: '4/3', borderRadius: 16 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sliders.length === 0) {
    return (
      <div className="sd-root">
        <style>{css}</style>
        <div className="sd-container">
          <div className="sd-slide" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #ede9ff 100%)', textAlign: 'center' }}>
            <div style={{ padding: '80px 20px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📺</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1d2e', marginBottom: 8 }}>No Sliders Available</h3>
              <p style={{ fontSize: 14, color: '#7b82a0' }}>Check back soon for announcements and promotions</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = sliders[currentIndex];

  return (
    <div className="sd-root">
      <style>{css}</style>

      <div className="sd-container">
        <div className="sd-wrapper" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {sliders.map((slider, idx) => (
            <div className="sd-slide" key={slider.id}>
              <div className="sd-slide-content">
                <div className="sd-slide-text">
                  <h2 className="sd-slide-title">{slider.title}</h2>
                  {slider.description && (
                    <p className="sd-slide-desc">{slider.description}</p>
                  )}
                  {slider.link && (
                    <a href={slider.link} target="_blank" rel="noreferrer" className="sd-slide-cta">
                      Learn More →
                    </a>
                  )}
                </div>
                <div className="sd-slide-image">
                  {slider.image ? (
                    <img src={getImageUrl(slider.image)} alt={slider.title} />
                  ) : (
                    <div className="sd-slide-placeholder">🖼️</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="sd-controls">
          <div className="sd-dots">
            {sliders.map((_, idx) => (
              <button
                key={idx}
                className={`sd-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
          <button className="sd-btn-nav" onClick={handlePrev} disabled={sliders.length <= 1}>❮</button>
          <button className="sd-btn-nav" onClick={handleNext} disabled={sliders.length <= 1}>❯</button>
        </div>
      </div>
    </div>
  );
};

export default SliderDisplay;
