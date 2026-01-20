import React, { useState } from 'react';
import { API_CONFIG } from '../../config/apiConfig';
import './SignIn.css';

// Import API keys from API_CONFIG
const API_KEY = API_CONFIG.API_KEY;
const API_SECRET = API_CONFIG.API_SECRET;

// SignIn component - Modern authentication with phone number and OTP verification
const SignIn = ({ setUser, navigateTo }) => {
  // State management for authentication flow
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'name', or 'profile'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [userName, setUserName] = useState('');
  const [leadId, setLeadId] = useState('');
  const [profileData, setProfileData] = useState({
    first_name: '',
    email_id: '',
    country: '',
    state: '',
    district: '',
    tahshil: '',
    marketplace: '',
    pincode: '',
    address_line_1: '',
    address_line_2: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tahsils, setTahsils] = useState([]);
  const [marketplaces, setMarketplaces] = useState([]);

  // Fetch countries from API
  const fetchCountries = async () => {
    console.log('Fetching countries...');
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_countries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'SHOPTION_XYZ_9834SDJKS',
          'X-API-SECRET': 'SHOPTION_SECRET_99ASD9A8S9D'
        }
      });
      const data = await response.json();
      console.log('Countries API response:', data);
      if (response.ok && data.message && data.message.data && Array.isArray(data.message.data)) {
        console.log('Countries data:', data.message.data);
        // Sort countries to put India at the top
        const sortedCountries = data.message.data.sort((a, b) => {
          if (a.name === 'India') return -1;
          if (b.name === 'India') return 1;
          return a.name.localeCompare(b.name);
        });
        console.log('Setting countries:', sortedCountries);
        setCountries(sortedCountries);
      } else {
        console.log('Countries API failed or no data');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  // Fetch states from API
  const fetchStates = async (country) => {
    console.log('Fetching states for country:', country);
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_states`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'SHOPTION_XYZ_9834SDJKS',
          'X-API-SECRET': 'SHOPTION_SECRET_99ASD9A8S9D'
        },
        body: JSON.stringify({ name: country })
      });
      const data = await response.json();
      console.log('States API response:', data);
      if (response.ok && data.message && data.message.data && Array.isArray(data.message.data)) {
        console.log('Setting states:', data.message.data);
        setStates(data.message.data);
      } else {
        console.log('States API failed or no data');
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  // Fetch districts from API
  const fetchDistricts = async (state) => {
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_districts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'SHOPTION_XYZ_9834SDJKS',
          'X-API-SECRET': 'SHOPTION_SECRET_99ASD9A8S9D'
        },
        body: JSON.stringify({ state_id: state })
      });
      const data = await response.json();
      if (response.ok && data.message && data.message.data && Array.isArray(data.message.data)) {
        setDistricts(data.message.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  // Fetch tahsils from API
  const fetchTahsils = async (district) => {
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_tahsils`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'SHOPTION_XYZ_9834SDJKS',
          'X-API-SECRET': 'SHOPTION_SECRET_99ASD9A8S9D'
        },
        body: JSON.stringify({ district_id: district })
      });
      const data = await response.json();
      if (response.ok && data.message && data.message.data && Array.isArray(data.message.data)) {
        setTahsils(data.message.data);
      }
    } catch (error) {
      console.error('Error fetching tahsils:', error);
    }
  };

  // Fetch marketplaces from API
  const fetchMarketplaces = async (tahsil) => {
    console.log('Fetching marketplaces for tahsil:', tahsil);
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.area.api.get_marketplaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'SHOPTION_XYZ_9834SDJKS',
          'X-API-SECRET': 'SHOPTION_SECRET_99ASD9A8S9D'
        },
        body: JSON.stringify({ tehsil_id: tahsil })
      });
      const data = await response.json();
      console.log('Marketplaces API response:', data);
      if (response.ok && data.message && data.message.data && Array.isArray(data.message.data)) {
        console.log('Setting marketplaces:', data.message.data);
        setMarketplaces(data.message.data);
      } else {
        console.log('Marketplaces API failed or no data');
      }
    } catch (error) {
      console.error('Error fetching marketplaces:', error);
    }
  };

  // Fetch countries on component mount
  React.useEffect(() => {
    fetchCountries();
  }, []);

  // Handle sending OTP to phone number
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setLoading(true);
    setError('');
    
    // Debug logging
    console.log('Phone Number:', phoneNumber);

    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.otp.api.send_otp`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        },
        body: JSON.stringify({ mobile_no: phoneNumber })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Full API Response:', data);
      console.log('OTP from response:', data.message?.dev_otp || 'OTP not found in response');
      
      if (response.ok && data.message) {
        console.log('OTP sent successfully. OTP:', data.message.dev_otp || 'OTP not in response');
        setStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('API Error:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification and user login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.otp.api.verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        },
        body: JSON.stringify({ mobile_no: phoneNumber, otp: otp })
      });
      
      const data = await response.json();
      console.log('OTP Verify Response:', data);
      
      if (response.ok && data.message) {
        console.log('OTP verification successful');
        
        // Check if user exists
        if (data.message.exists) {
          // User exists - direct login
          const user = {
            name: data.message.user_id || 'User',
            phone: phoneNumber,
            customer_id: data.message.customer_id,
            role: data.message.role
          };
          setUser(user);
          navigateTo('home');
        } else {
          // User doesn't exist - show name field
          setStep('name');
          // Store lead ID if provided
          if (data.message.lead_id) {
            setLeadId(data.message.lead_id);
          }
        }
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle name submission and show profile form
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!userName) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Create lead with user's name
      const leadResponse = await createLead(userName);
      if (leadResponse && leadResponse.lead_id) {
        setLeadId(leadResponse.lead_id);
      }
      
      // Move to profile completion step
      setProfileData(prev => ({ ...prev, first_name: userName }));
      setStep('profile');
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile completion
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Debug: Log the profile data being sent
    console.log('Profile data being sent:', profileData);
    
    try {
      const response = await fetch(`${API_CONFIG.Prabhat_URL}/api/method/shoption_api.farmer_registration.create_farmer_registration.create_farmer_registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        },
        body: JSON.stringify({
          from_document: leadId,
          ...profileData
        })
      });
      
      const data = await response.json();
      console.log('Registration API response:', data);
      
      if (response.ok) {
        // Create user object and login
        const user = {
          name: profileData.first_name,
          phone: phoneNumber,
          email: profileData.email_id
        };
        setUser(user);
        navigateTo('home');
      } else {
        setError(data.message || 'Profile creation failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create lead after successful authentication
  const createLead = async (name = 'User') => {
    try {
      const response = await fetch(`https://uaterp.gbru.in/api/method/shoption_api.otp.api.lead_create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
          'X-API-SECRET': API_SECRET
        },
        body: JSON.stringify({ 
          mobile_no: phoneNumber, 
          name: name, 
          role: 'Farmer' 
        })
      });
      
      const data = await response.json();
      console.log('Lead creation success:', data);
      return { lead_id: data.message.lead };
    } catch (error) {
      console.error('Lead creation failed:', error);
      throw error;
    }
  };

  return (
    <div className="auth-page">
      {/* Main Authentication Container */}
      <div className="auth-container">
        <div className="auth-card">
          {/* Header Section - Brand logo and instructions */}
          <div className="auth-header">
            <button className="close-btn" onClick={() => navigateTo('home')}>×</button>
            {step !== 'profile' && (
              <div className="brand">
                <img src="/Image/Logo.png" alt="Gbru Logo" className="brand-logo" />
              </div>
            )}
            <h1>{step === 'phone' ? 'Welcome Back!' : step === 'otp' ? 'Verify OTP' : step === 'name' ? 'Enter Your Name' : 'Complete Profile'}</h1>
            <p>{step === 'phone' ? 'Enter your mobile number to continue' : step === 'otp' ? `We've sent a 6-digit code to ${phoneNumber}` : step === 'name' ? 'Please enter your name to complete registration' : 'Please fill in your details to complete registration'}</p>
          </div>
          
          {/* Phone Number Step */}
          {step === 'phone' ? (
            <form className="auth-form" onSubmit={handleSendOtp}>
              <div className="input-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9876543211"
                  required
                  disabled={loading}
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Send OTP'
                )}
              </button>
              
              {/* Alternative Sign In Options */}
              <div className="divider">
                <span>or continue with</span>
              </div>
              
              <button type="button" className="google-btn">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>
          ) : step === 'otp' ? (
            /* OTP Verification Step */
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <div className="input-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  maxLength="6"
                  required
                  disabled={loading}
                  className="otp-input"
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Verify OTP'
                )}
              </button>
              
              <div className="otp-actions">
                <p className="resend-text">Didn't receive the code?</p>
                <button type="button" className="resend-btn">
                  Resend OTP
                </button>
              </div>
              
              <button 
                type="button" 
                className="back-btn"
                onClick={() => setStep('phone')}
                disabled={loading}
              >
                Back to Phone Number
              </button>
            </form>
          ) : step === 'name' ? (
            /* Name Input Step */
            <form className="auth-form" onSubmit={handleNameSubmit}>
              <div className="input-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          ) : (
            <div className="profile-step">
              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profileData.email_id}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email_id: e.target.value }))}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="input-group">
                    <label>Country</label>
                    <select
                      value={profileData.country}
                      onChange={(e) => {
                        const country = e.target.value;
                        setProfileData(prev => ({ ...prev, country, state: '', district: '', tahshil: '', marketplace: '' }));
                        if (country) fetchStates(country);
                      }}
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.name}>{country.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group">
                    <label>State</label>
                    <select
                      value={profileData.state}
                      onChange={(e) => {
                        const state = e.target.value;
                        setProfileData(prev => ({ ...prev, state, district: '', tahshil: '', marketplace: '' }));
                        if (state) fetchDistricts(state);
                      }}
                      required
                      disabled={!profileData.country}
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="input-group">
                    <label>District</label>
                    <select
                      value={profileData.district}
                      onChange={(e) => {
                        const district = e.target.value;
                        setProfileData(prev => ({ ...prev, district, tahshil: '', marketplace: '' }));
                        if (district) fetchTahsils(district);
                      }}
                      required
                      disabled={!profileData.state}
                    >
                      <option value="">Select District</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group">
                    <label>Tehsile</label>
                    <select
                      value={profileData.tahshil}
                      onChange={(e) => {
                        const tahsil = e.target.value;
                        setProfileData(prev => ({ ...prev, tahshil: tahsil, marketplace: '' }));
                        if (tahsil) fetchMarketplaces(tahsil);
                      }}
                      required
                      disabled={!profileData.district}
                    >
                      <option value="">Select Tehsile</option>
                      {tahsils.map((tahsil) => (
                        <option key={tahsil.id} value={tahsil.id}>{tahsil.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="input-group">
                  <label>Market Place</label>
                  <select
                    value={profileData.marketplace}
                    onChange={(e) => setProfileData(prev => ({ ...prev, marketplace: e.target.value }))}
                    required
                    disabled={!profileData.tahshil}
                  >
                    <option value="">Select Market Place</option>
                    {marketplaces.map((marketplace) => (
                      <option key={marketplace.id || marketplace} value={marketplace.id || marketplace}>{marketplace.name || marketplace}</option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group">
                  <label>Address Line 1</label>
                  <input
                    type="text"
                    value={profileData.address_line_1}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address_line_1: e.target.value }))}
                    placeholder="Enter address line 1"
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label>Address Line 2</label>
                  <input
                    type="text"
                    value={profileData.address_line_2}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address_line_2: e.target.value }))}
                    placeholder="Enter address line 2 (optional)"
                  />
                </div>
                
                <div className="input-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={profileData.pincode}
                    onChange={(e) => setProfileData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="Enter pincode"
                    required
                  />
                </div>
                
                {error && <div className="error-message">{error}</div>}
              </form>
              
              <div className="sticky-button">
                <button 
                  type="button" 
                  className="primary-btn" 
                  disabled={loading}
                  onClick={handleProfileSubmit}
                >
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;