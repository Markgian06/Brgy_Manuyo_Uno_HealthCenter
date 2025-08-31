document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', function() {
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = '';
    }, 150);
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.service-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
});

    const serviceData = {
      dental: {
        title: "Dental Services",
        subtitle: "Complete oral healthcare for the whole family",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20"/>
          <path d="M2 12h20"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M8 8l8 8"/>
          <path d="M16 8l-8 8"/>
        </svg>`,
        content: `
          <div class="modal-section">
            <h3>What We Offer</h3>
            <p>Our dental services provide comprehensive oral healthcare to ensure your teeth and gums stay healthy. We offer professional dental care in a comfortable and safe environment.</p>
            <ul>
              <li>Routine dental cleaning and oral hygiene education</li>
              <li>Comprehensive dental examinations and check-ups</li>
              <li>Tooth extraction procedures (simple and surgical)</li>
              <li>Oral health consultations and preventive care</li>
              <li>Dental pain management and emergency care</li>
              <li>Fluoride treatments for cavity prevention</li>
            </ul>
          </div>
          
          <div class="highlight-box">
            <h4>💡 Did You Know?</h4>
            <p>Regular dental check-ups every 6 months can prevent 95% of serious dental problems and save you from costly treatments later.</p>
          </div>
          
          <div class="schedule-info">
            <h4>📅 Schedule Information</h4>
            <div class="schedule-grid">
              <div class="schedule-item">
                <strong>Walk-in Hours:</strong>
                Monday - Friday: 8:00 AM - 4:00 PM
              </div>
              <div class="schedule-item">
                <strong>Appointment Only:</strong>
                Complex procedures and consultations
              </div>
            </div>
          </div>
        `
      },
      pregnancy: {
        title: "Pregnancy Care",
        subtitle: "Supporting you through every step of your pregnancy",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>`,
        content: `
          <div class="modal-section">
            <h3>Comprehensive Prenatal Care</h3>
            <p>We provide complete pregnancy care services to ensure the health and safety of both mother and baby throughout the pregnancy journey.</p>
            <ul>
              <li>Regular prenatal check-ups and monitoring</li>
              <li>Prenatal vitamins and nutrition counseling</li>
              <li>Blood pressure and weight monitoring</li>
              <li>Fetal heart rate monitoring</li>
              <li>Basic ultrasound services (when available)</li>
              <li>Pregnancy education and birthing preparation</li>
              <li>Postpartum care and support</li>
            </ul>
          </div>
          
          <div class="highlight-box">
            <h4>🤱 Important Note</h4>
            <p>Early and regular prenatal care significantly reduces the risk of complications and ensures the best outcomes for both mother and baby.</p>
          </div>
          
          <div class="schedule-info">
            <h4>📅 Prenatal Schedule</h4>
            <div class="schedule-grid">
              <div class="schedule-item">
                <strong>Regular Check-ups:</strong>
                Every 4 weeks (1st & 2nd trimester)
              </div>
              <div class="schedule-item">
                <strong>Frequent Visits:</strong>
                Every 2 weeks (3rd trimester)
              </div>
            </div>
          </div>
        `
      },
      vaccine: {
        title: "Baby Vaccination",
        subtitle: "Protecting your child with essential immunizations",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6l-3-3 3-3z"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>`,
        content: `
          <div class="modal-section">
            <h3>Department of Health Vaccination Schedule</h3>
            <p>We follow the official Philippine Department of Health vaccination schedule to ensure your child receives all necessary immunizations at the right time.</p>
            <ul>
              <li>BCG vaccine (at birth) - protects against tuberculosis</li>
              <li>Hepatitis B vaccine series</li>
              <li>DPT (Diphtheria, Pertussis, Tetanus) vaccines</li>
              <li>Oral Polio Vaccine (OPV) and Inactivated Polio Vaccine (IPV)</li>
              <li>Measles, Mumps, Rubella (MMR) vaccine</li>
              <li>Pneumococcal vaccine</li>
              <li>Rotavirus vaccine</li>
            </ul>
          </div>
          
          <div class="highlight-box">
            <h4>🛡️ Vaccination Benefits</h4>
            <p>Vaccines are one of the most effective ways to prevent serious diseases in children. They're safe, effective, and help build immunity.</p>
          </div>
          
          <div class="schedule-info">
            <h4>📅 Vaccination Schedule</h4>
            <div class="schedule-grid">
              <div class="schedule-item">
                <strong>Walk-in Days:</strong>
                Tuesday & Thursday: 8:00 AM - 11:00 AM
              </div>
              <div class="schedule-item">
                <strong>Requirements:</strong>
                Birth certificate, immunization record
              </div>
            </div>
          </div>
        `
      },
      pampurga: {
        title: "Pampurga Services",
        subtitle: "Traditional herbal medicine and natural wellness",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>`,
        content: `
          <div class="modal-section">
            <h3>Traditional Herbal Medicine</h3>
            <p>Pampurga is a traditional Filipino herbal medicine practice that focuses on digestive health and overall wellness using natural remedies.</p>
            <ul>
              <li>Herbal consultations for digestive issues</li>
              <li>Natural remedies for stomach problems</li>
              <li>Traditional healing methods passed down through generations</li>
              <li>Complementary wellness treatments</li>
              <li>Herbal tea preparations and guidance</li>
              <li>Holistic health assessments</li>
            </ul>
          </div>
          
          <div class="highlight-box">
            <h4>🌿 Natural Approach</h4>
            <p>Our pampurga services combine traditional Filipino healing wisdom with modern healthcare principles for comprehensive wellness.</p>
          </div>
          
          <div class="schedule-info">
            <h4>📅 Consultation Hours</h4>
            <div class="schedule-grid">
              <div class="schedule-item">
                <strong>Traditional Healer:</strong>
                Wednesday & Friday: 9:00 AM - 12:00 PM
              </div>
              <div class="schedule-item">
                <strong>Consultation:</strong>
                By appointment only
              </div>
            </div>
          </div>
        `
      },
      tetanus: {
        title: "Anti-Tetanus Vaccination",
        subtitle: "Protection against tetanus infection",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
          <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
          <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
          <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>`,
        content: `
          <div class="modal-section">
            <h3>Tetanus Prevention & Treatment</h3>
            <p>Tetanus vaccination is crucial for preventing tetanus infection, especially important for wound care and injury prevention.</p>
            <ul>
              <li>Tetanus vaccine (Td) for adults and adolescents</li>
              <li>Tetanus booster shots every 10 years</li>
              <li>Emergency tetanus shots for wounds and injuries</li>
              <li>Vaccination record maintenance</li>
              <li>Consultation on tetanus prevention</li>
              <li>Wound care and tetanus risk assessment</li>
            </ul>
          </div>
          
          <div class="highlight-box">
            <h4>⚠️ When You Need Tetanus Shot</h4>
            <p>Get a tetanus shot immediately if you have a deep wound, animal bite, or haven't had a tetanus vaccine in the last 5-10 years.</p>
          </div>
          
          <div class="schedule-info">
            <h4>📅 Vaccination Hours</h4>
            <div class="schedule-grid">
              <div class="schedule-item">
                <strong>Regular Schedule:</strong>
                Monday - Friday: 8:00 AM - 4:00 PM
              </div>
              <div class="schedule-item">
                <strong>Emergency:</strong>
                Available during operating hours
              </div>
            </div>
          </div>
        `
      },
      flu: {
        title: "Flu Vaccine for Seniors",
        subtitle: "Specialized influenza protection for elderly patients",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <path d="M20 8v6M23 11h-6"/>
        </svg>`,
        content: `
          <div class="modal-section">
            <h3>Senior Citizen Flu Protection</h3>
            <p>Our specialized flu vaccination program is designed specifically for senior citizens (60+ years old) who are at higher risk for influenza complications.</p>
            <ul>
              <li>Annual influenza vaccination (seasonal flu shot)</li>
              <li>High-dose flu vaccine for seniors when available</li>
              <li>Pre-vaccination health screening</li>
              <li>Post-vaccination monitoring</li>
              <li>Flu prevention education</li>
              <li>Senior health wellness checks</li>
            </ul>
          </div>
          
          <div class="highlight-box">
            <h4>👴👵 Why Seniors Need Flu Vaccines</h4>
            <p>Adults 65+ are at higher risk for serious flu complications. The flu vaccine reduces this risk by 40-60% when well-matched to circulating viruses.</p>
          </div>
          
          <div class="schedule-info">
            <h4>📅 Senior Vaccination Schedule</h4>
            <div class="schedule-grid">
              <div class="schedule-item">
                <strong>Senior Days:</strong>
                Monday & Wednesday: 8:00 AM - 10:00 AM
              </div>
              <div class="schedule-item">
                <strong>Requirements:</strong>
                Senior Citizen ID, Health records
              </div>
            </div>
          </div>
        `
      },
      checkup: {
        title: "General Check-up",
        subtitle: "Comprehensive health examinations for all ages",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>`,
        content: `
          <div class="modal-section">
            <h3>Complete Health Assessment</h3>
            <p>Our general check-up services provide comprehensive health evaluations to monitor your overall wellness and detect potential health issues early.</p>
            <ul>
              <li>Vital signs monitoring (blood pressure, temperature, pulse, weight)</li>
              <li>Physical examination and health assessment</li>
              <li>Basic laboratory tests (when available)</li>
              <li>Health history review and documentation</li>
              <li>Preventive care counseling</li>
              <li>Referral services for specialized care</li>
              <li>Health maintenance guidance</li>
            </ul>
          </div>
          
          <div class="highlight-box">
            <h4>🏥 Preventive Healthcare</h4>
            <p>Regular check-ups help detect health problems early when they're easier to treat and can prevent serious complications.</p>
          </div>
          
          <div class="schedule-info">
            <h4>📅 Check-up Schedule</h4>
            <div class="schedule-grid">
              <div class="schedule-item">
                <strong>Walk-in Hours:</strong>
                Monday - Friday: 8:00 AM - 5:00 PM
              </div>
              <div class="schedule-item">
                <strong>Recommended:</strong>
                Annual check-ups for adults
              </div>
            </div>
          </div>
        `
      }
    };

    const modal = document.getElementById('serviceModal');
    const modalContent = document.getElementById('modalContent');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', function() {
        const serviceType = this.getAttribute('data-service');
        const service = serviceData[serviceType];
        
        if (service) {
          modalIcon.innerHTML = service.icon;
          modalTitle.textContent = service.title;
          modalSubtitle.textContent = service.subtitle;
          modalBody.innerHTML = service.content;
          
          modal.classList.add('show');
          document.body.style.overflow = 'hidden';
        }
        
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.style.transform = '';
        }, 150);
      });
    });

    function closeModalFunction() {
      modalContent.classList.add('closing');
      setTimeout(() => {
        modal.classList.remove('show');
        modalContent.classList.remove('closing');
        document.body.style.overflow = 'auto'; 
      }, 300);
    }

    closeModal.addEventListener('click', closeModalFunction);

    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModalFunction();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModalFunction();
      }
    });

 
    document.addEventListener('DOMContentLoaded', function() {
      const cards = document.querySelectorAll('.service-card');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
          card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });