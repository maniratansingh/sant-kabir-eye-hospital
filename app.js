document.addEventListener('DOMContentLoaded', () => {
    // --- Header Scroll Effect ---
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking navigation link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // --- Appointment Booking Modal ---
    const modal = document.getElementById('bookingModal');
    const modalContent = document.querySelector('.modal-content');
    const bookTriggers = document.querySelectorAll('.btn-book-trigger');
    const closeTriggers = document.querySelectorAll('.modal-close, .modal-overlay, .modal-close-success');
    const bookingForm = document.getElementById('bookingForm');
    const successMessage = document.getElementById('successMessage');
    const preferredDateInput = document.getElementById('preferredDate');

    // Pre-fill date picker with tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    preferredDateInput.value = `${yyyy}-${mm}-${dd}`;
    preferredDateInput.min = `${yyyy}-${mm}-${dd}`; // Prevent booking past dates

    // Open Modal
    const openModal = (e) => {
        e.preventDefault();
        
        // If trigger card had a specific service (like cataract/glaucoma), select it in dropdown
        const card = e.target.closest('.service-card');
        if (card) {
            const serviceHeading = card.querySelector('h3').textContent.toLowerCase();
            const selectElement = document.getElementById('eyeService');
            
            if (serviceHeading.includes('cataract')) selectElement.value = 'cataract';
            else if (serviceHeading.includes('glaucoma')) selectElement.value = 'glaucoma';
            else if (serviceHeading.includes('oculoplastic')) selectElement.value = 'oculoplasty';
            else if (serviceHeading.includes('squint')) selectElement.value = 'squint';
            else if (serviceHeading.includes('diabetic')) selectElement.value = 'retinopathy';
            else if (serviceHeading.includes('refractive') || serviceHeading.includes('optical')) selectElement.value = 'refraction';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Disable background scrolling
        modal.setAttribute('aria-hidden', 'false');
    };

    // Close Modal
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable background scrolling
        modal.setAttribute('aria-hidden', 'true');
        
        // Reset form after closing (delayed for smooth transition)
        setTimeout(() => {
            bookingForm.style.display = 'flex';
            successMessage.style.display = 'none';
            bookingForm.reset();
            preferredDateInput.value = `${yyyy}-${mm}-${dd}`;
        }, 300);
    };

    bookTriggers.forEach(trigger => trigger.addEventListener('click', openModal));
    closeTriggers.forEach(trigger => trigger.addEventListener('click', closeModal));

    // Handle Form Submission
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name    = document.getElementById('patientName').value.trim();
        const phone   = document.getElementById('patientPhone').value.trim();
        const date    = document.getElementById('preferredDate').value;
        const service = document.getElementById('eyeService').options[document.getElementById('eyeService').selectedIndex].text;
        const message = (document.getElementById('patientMessage').value || '').trim();

        // Simple Phone Validation (10 digits)
        if (!/^[0-9]{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }

        // --- Send to Telegram Group ---
        // TODO: Insert your Telegram Bot Token and Chat ID securely before deployment
        const TG_TOKEN   = '8771442885:AAHEBn18TyzVqzLv-t4LHC9ycysvfATE2Ts';
        const TG_CHAT_ID = '-1004415167828';
        const text = [
            '🏥 *New Appointment Request*',
            `👤 *Name:* ${name}`,
            `📞 *Phone:* ${phone}`,
            `📅 *Preferred Date:* ${date}`,
            `👁 *Service:* ${service}`,
            message ? `💬 *Notes:* ${message}` : '',
            `🌐 *Source:* Desktop Website`
        ].filter(Boolean).join('\n');

        fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: text,
                parse_mode: 'Markdown'
            })
        }).catch(() => {}); // Silent fail — success shown regardless

        // Show success transition
        bookingForm.style.transition = 'opacity 0.2s ease';
        bookingForm.style.opacity = '0';

        setTimeout(() => {
            bookingForm.style.display = 'none';
            bookingForm.style.opacity = '1';
            successMessage.style.display = 'block';
            successMessage.style.opacity = '0';

            setTimeout(() => {
                successMessage.style.transition = 'opacity 0.3s ease';
                successMessage.style.opacity = '1';
            }, 50);
        }, 200);
    });

    // --- Elegant Scroll Entrance Animations ---
    const observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            } else {
                entry.target.classList.remove('reveal-active'); // Re-trigger reveal animation every time it scrolls into view!
            }
        });
    }, observerOptions);

    // Apply scroll animation classes and setup observers matching the new HTML
    const scrollElements = document.querySelectorAll(
        '.hero-glass-card, .service-card, .why-us-card, .working-hours-card, .contact-info-card'
    );

    scrollElements.forEach(el => {
        el.classList.add('reveal');
        animateOnScroll.observe(el);
    });

    // Only run scroll listener on 4K / Ultra-Large displays to avoid style invalidation lag on standard laptops
    const isLargeDisplay = window.matchMedia('(min-width: 3800px), (min-height: 2000px)').matches;
    if (isLargeDisplay) {
        const sections = document.querySelectorAll('.hero-section, .services-section, .why-us-section, .contact-section');
        let ticking = false;

        const updateParallax = () => {
            sections.forEach(sec => {
                const rect = sec.getBoundingClientRect();
                const viewHeight = window.innerHeight;
                if (rect.top < viewHeight && rect.bottom > 0) {
                    const scrollRatio = (viewHeight - rect.top) / (viewHeight + rect.height);
                    sec.style.setProperty('--scroll-ratio', scrollRatio.toFixed(4));
                }
            });
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
        
        // Initial positioning
        updateParallax();
    }

    // --- Bilingual Translation Toggle Logic ---
    const translations = {
        "brand-tagline": { en: "Eye Hospital", hi: "नेत्र अस्पताल" },
        "nav-home": { en: "Home", hi: "मुख्य पृष्ठ" },
        "nav-services": { en: "Services", hi: "विशेषताएं" },
        "nav-welfare": { en: "Welfare & Hours", hi: "कल्याण और समय" },
        "nav-contact": { en: "Contact", hi: "संपर्क डेस्क" },
        "btn-book": { en: "Book Appointment", hi: "परामर्श बुक करें" },
        "hero-badge-1": { en: "Award-Winning Eye Care Facility", hi: "पुरस्कार विजेता नेत्र देखभाल सुविधा" },
        "hero-badge-2": { en: "Ayushman Bharat Yojana Partner", hi: "आयुष्मान भारत योजना सहयोगी" },
        "hero-title": { en: "Pioneering Vision Correction & Cataract Solutions in Basti", hi: "बस्ती में अत्याधुनिक दृष्टि सुधार और मोतियाबिंद समाधान" },
        "hero-description": { en: "Sant Kabir Eye Hospital offers world-class ophthalmic treatments, precision diagnostics, and expert surgical care. Trust our dedicated professionals to restore and protect your eyesight with compassion.", hi: "संत कबीर आई हॉस्पिटल विश्व स्तरीय नेत्र चिकित्सा, सटीक निदान और विशेषज्ञ शल्य चिकित्सा देखभाल प्रदान करता है। करुणा के साथ आपकी दृष्टि को बहाल करने के लिए हमारे समर्पित पेशेवरों पर भरोसा करें।" },
        "btn-book-checkup": { en: "Book Check-Up", hi: "चेक-अप बुक करें" },
        "btn-call": { en: "Call Specialist", hi: "डॉक्टर से बात करें" },
        "stat-val-1": { en: "25+ Yrs", hi: "25+ वर्ष" },
        "stat-lbl-1": { en: "Surgical Exp.", hi: "सर्जरी अनुभव" },
        "stat-val-2": { en: "15k+", hi: "15k+" },
        "stat-lbl-2": { en: "Micro-Surgeries", hi: "सूक्ष्म-सर्जरी" },
        "stat-val-3": { en: "PM-JAY", hi: "PM-JAY" },
        "stat-lbl-3": { en: "Cashless Cover", hi: "कैशलेस कवर" },
        "srv-subtitle": { en: "Eye Diseases", hi: "नेत्र रोग" },
        "srv-title": { en: "Get To Know About Eye Diseases And The Problems That Come With It", hi: "नेत्र रोगों और उनसे होने वाली समस्याओं के बारे में जानें" },
        "srv-card-1-title": { en: "Cataract", hi: "मोतियाबिंद" },
        "srv-card-1-desc": { en: "A cataract is clouding or opacity of the lens inside the eye. It causes gradual blurring of vision and finally blindness.", hi: "मोतियाबिंद आंख के अंदर के लेंस का धुंधला होना है। यह दृष्टि के धीरे-धीरे धुंधले होने और अंततः अंधापन का कारण बनता है।" },
        "btn-know-more": { en: "KNOW MORE", hi: "और जानें" },
        "srv-card-2-title": { en: "Glaucoma", hi: "काला मोतिया" },
        "srv-card-2-desc": { en: "Glaucoma is a term given to a group of eye conditions in which the optic nerve is damaged leading to loss of visual field.", hi: "काला मोतिया आंखों की उन स्थितियों का समूह है जिसमें ऑप्टिक तंत्रिका क्षतिग्रस्त हो जाती है, जिससे दृष्टि क्षेत्र की हानि होती है।" },
        "srv-card-3-title": { en: "Oculoplastic Surgery", hi: "पलक और फेस सर्जरी" },
        "srv-card-3-desc": { en: "Oculoplastic surgery, includes a wide variety of surgical procedures that deal with the orbit (eye socket), eyelids, tear ducts, and the face.", hi: "ओकुलोप्लास्टिक सर्जरी में आंख की सॉकेट, पलकों, आंसू नलिकाओं और चेहरे से संबंधित विभिन्न प्रकार की सर्जिकल प्रक्रियाएं शामिल हैं।" },
        "srv-card-4-title": { en: "Squint", hi: "भेंगापन" },
        "srv-card-4-desc": { en: "Squint is a condition where the eyes point in different directions. One eye may turn inwards, outwards, upwards or downwards while the other eye may look differently.", hi: "भेंगापन वह स्थिति है जहां आंखें अलग-अलग दिशाओं में देखती हैं। एक आंख अंदर, बाहर, ऊपर या नीचे घूम सकती है जबकि दूसरी आंख सामान्य रहती है।" },
        "srv-card-5-title": { en: "Diabetic Retinopathy", hi: "मधुमेह नेत्र रोग" },
        "srv-card-5-desc": { en: "Diabetic retinopathy is a complication of diabetes and causes damage to the retina (Microangiopathy).", hi: "मधुमेह रेटिनोपैथी मधुमेह (डायबिटीज) की एक जटिलता है और आंख के पिछले हिस्से (रेटिना) को नुकसान पहुंचाती है।" },
        "srv-card-6-title": { en: "Optical Services", hi: "चश्मा और दृष्टि जांच" },
        "srv-card-6-desc": { en: "Precision computerized vision testing to resolve near-sightedness, far-sightedness, astigmatism, and custom optical prescriptions.", hi: "निकट-दृष्टि, दूर-दृष्टि, दृष्टिवैषम्य (एस्टिग्मैटिज्म) को दूर करने के लिए सटीक कंप्यूटरीकृत दृष्टि परीक्षण और नया चश्मा पर्चा।" },
        "welf-subtitle": { en: "Premium Services & Government Welfare", hi: "प्रीमियम सेवाएं और सरकारी कल्याण" },
        "welf-title": { en: "High-Precision Eye Care with Cashless Welfare Cover", hi: "कैशलेस कल्याण कवर के साथ उच्च-सटीक नेत्र देखभाल" },
        "welf-desc": { en: "We combine high-precision private diagnostic care and premium lens implant options with a commitment to public welfare. Eligible families receive cashless, completely free surgeries under government initiatives.", hi: "हम सार्वजनिक कल्याण के प्रति प्रतिबद्धता के साथ उच्च-सटीक निजी नैदानिक देखभाल और प्रीमियम लेंस प्रत्यारोपण विकल्पों को जोड़ते हैं। पात्र परिवारों को सरकारी पहलों के तहत कैशलेस, पूरी तरह से मुफ्त सर्जरी मिलती है।" },
        "welf-feat-1-title": { en: "Ayushman Bharat Cashless Cover", hi: "आयुष्मान भारत कैशलेस कवर" },
        "welf-feat-1-desc": { en: "Comprehensive diagnostics, micro-surgical eye treatments, and follow-up care covered 100% free of cost for eligible PM-JAY cardholders.", hi: "पात्र पीएम-जय कार्डधारकों के लिए नैदानिक जांच, माइक्रो-सर्जिकल नेत्र उपचार, और फॉलो-अप केयर 100% निःशुल्क कवर की गई है।" },
        "welf-feat-2-title": { en: "Advanced Premium Surgical Implants", hi: "उन्नत प्रीमियम सर्जिकल इम्प्लांट्स" },
        "welf-feat-2-desc": { en: "Specialized premium lens implant options (Toric, Multifocal) and computer-assisted diagnostics for patients seeking ultimate post-op visual clarity.", hi: "सर्वोत्तम पोस्ट-ऑपरेटिव दृश्य स्पष्टता चाहने वाले रोगियों के लिए विशेष प्रीमियम लेंस प्रत्यारोपण विकल्प (टोरिक, मल्टीफोकल) और कंप्यूटर-सहायता प्राप्त निदान उपलब्ध हैं।" },
        "welf-feat-3-title": { en: "World Class Healthcare Standards", hi: "विश्व स्तरीय चिकित्सा मानक" },
        "welf-feat-3-desc": { en: "Sterile ophthalmic surgical theaters, premium diagnostics suite, and fully air-conditioned comfort.", hi: "कीटाणुरहित नेत्र शल्य चिकित्सा थिएटर, प्रीमियम नैदानिक सूट, और पूरी तरह से वातानुकूलित आराम कक्ष।" },
        "tech-subtitle": { en: "Advanced Diagnostics", hi: "उन्नत नैदानिक तकनीक" },
        "tech-title": { en: "Premium Diagnostic & Treatment Equipment", hi: "प्रीमियम नैदानिक एवं उपचार उपकरण" },
        "tech-desc": { en: "Our centers are equipped with world-class diagnostic, laser, and surgical technologies to detect eye conditions early and ensure absolute surgical precision.", hi: "हमारे केंद्र आंखों की बीमारियों का जल्द पता लगाने और सर्जरी में पूर्ण सटीकता सुनिश्चित करने के लिए विश्व स्तरीय नैदानिक, लेज़र और सर्जिकल तकनीकों से लैस हैं।" },
        "tech-fundus-title": { en: "Retinal Fundus Camera", hi: "रेटिनल फंडस कैमरा" },
        "tech-fundus-desc": { en: "Painless high-resolution imaging of the retina at the back of the eye. Enables early detection of diabetic retinopathy and glaucoma.", hi: "आँखों के पीछे रेटिना की दर्द रहित उच्च-रिज़ॉल्यूशन वाली इमेजिंग। यह डायबिटिक रेटिनोपैथी और ग्लूकोमा का शीघ्र पता लगाने में मदद करता है।" },
        "tech-perimeter-title": { en: "Visual Field Auto Perimeter", hi: "विजुअल फील्ड ऑटो परिमीटर" },
        "tech-perimeter-desc": { en: "Precise computerized visual field testing to map peripheral vision. Critical for early screening of glaucoma and optic nerve damage.", hi: "आँखों के चारों ओर दृष्टि क्षेत्र (विजुअल फील्ड) को मापने के लिए सटीक कंप्यूटर परीक्षण। ग्लूकोमा और ऑप्टिक तंत्रिका क्षति की शीघ्र जांच के लिए आवश्यक।" },
        "tech-laser-title": { en: "Retinal Green Laser", hi: "रेटिनल ग्रीन लेज़र" },
        "tech-laser-desc": { en: "Advanced, non-invasive photocoagulation laser treatment. Used to seal retinal tears and treat diabetic eye diseases.", hi: "उन्नत, गैर-आक्रामक रेटिना लेज़र उपचार। इसका उपयोग डायबिटिक रेटिनोपैथी और रेटिना के फटने/छिद्रों को सील करने के लिए किया जाता है।" },
        "tech-bscan-title": { en: "B-Scan Ophthalmic Ultrasound", hi: "बी-स्कैन ओप्थाल्मिक अल्ट्रासाउंड" },
        "tech-bscan-desc": { en: "High-frequency sound wave imaging to visualize internal structures of the eye, vital when mature cataracts block direct visibility.", hi: "उच्च आवृत्ति ध्वनि तरंगों द्वारा आँख के अंदर की विस्तृत तस्वीरें। मोतियाबिंद के कारण आँख के आंतरिक हिस्से को देखना अवरुद्ध होने पर अत्यंत आवश्यक परीक्षण।" },
        "tech-zeiss-title": { en: "Zeiss Surgical Microscope", hi: "ज़ीस सर्जिकल माइक्रोस्कोप" },
        "tech-zeiss-desc": { en: "World-class precision optics offering maximum visual clarity during high-accuracy micro-surgical cataract procedures.", hi: "उच्च परिशुद्धता सूक्ष्म-सर्जिकल मोतियाबिंद प्रक्रियाओं के दौरान सर्वोत्तम दृश्य स्पष्टता प्रदान करने वाला विश्व स्तरीय सटीक माइक्रोस्कोप।" },
        "tech-tonometer-title": { en: "Non-Contact Tonometer", hi: "नॉन-कॉन्टैक्ट टोनोमीटर" },
        "tech-tonometer-desc": { en: "Quick, pain-free air-puff technology to measure intraocular eye pressure for glaucoma screening without touching the eye.", hi: "आँखों को बिना छुए हवा के हल्के झोंके से ग्लूकोमा की जाँच के लिए आँखों का दबाव मापने की दर्द रहित त्वरित तकनीक।" },
        "hours-title": { en: "Our Working Hours", hi: "क्लीनिक संचालन समय" },
        "hours-tagline": { en: "Providing uninterrupted emergency & regular consultations", hi: "निरंतर आपातकालीन और नियमित नेत्र परामर्श प्रदान करना" },
        "day-mon": { en: "Monday", hi: "सोमवार" },
        "day-tue": { en: "Tuesday", hi: "मंगलवार" },
        "day-wed": { en: "Wednesday", hi: "बुधवार" },
        "day-thu": { en: "Thursday", hi: "गुरुवार" },
        "day-fri": { en: "Friday", hi: "शुक्रवार" },
        "day-sat": { en: "Saturday", hi: "शनिवार" },
        "day-sun": { en: "Sunday", hi: "रविवार" },
        "time-standard": { en: "9:00 AM - 6:00 PM", hi: "सुबह 09:00 - शाम 06:00 बजे" },
        "time-sun": { en: "Closed (Emergency Only)", hi: "बंद (केवल आपातकालीन परामर्श)" },
        "hours-note": { en: "<strong>Note:</strong> Closed on festive holidays. Please call ahead to confirm holiday schedules.", hi: "<strong>सूचना:</strong> त्योहारों की छुट्टियों पर बंद रहता है। कृपया अवकाश की पुष्टि के लिए पहले कॉल करें।" },
        "contact-title": { en: "Reach Our Centers Directly", hi: "सीधे हमारे केंद्रों पर संपर्क करें" },
        "contact-desc": { en: "If you have questions, need diagnostic reports, or want to make inquiries, feel free to call our hotlines or visit the center directly.", hi: "यदि आपके पास कोई प्रश्न है, नैदानिक रिपोर्ट की आवश्यकता है, या कोई जानकारी चाहते हैं, तो बेझिझक हमारी हेल्पलाइन पर कॉल करें या सीधे केंद्र पर आएं।" },
        "contact-warning": { en: "<strong>⚠️ Notice:</strong> We never ask for online payments. All transactions are handled physically at the hospital premises to authorized staff only. हम कभी भी ऑनलाइन भुगतान नहीं मांगते हैं। सभी लेनदेन केवल अस्पताल परिसर में अधिकृत कर्मचारी को ही नकद/भौतिक रूप से किए जाने चाहिए।", hi: "<strong>⚠️ आवश्यक सूचना:</strong> हम कभी भी ऑनलाइन भुगतान नहीं मांगते हैं। सभी लेनदेन केवल अस्पताल परिसर में अधिकृत कर्मचारी को ही नकद/भौतिक रूप से किए जाने चाहिए।" },
        "desk-inquiry": { en: "Primary Inquiry Desk", hi: "प्राथमिक पूछताछ डेस्क" },
        "desk-admin": { en: "Senior Administrator", hi: "वरिष्ठ प्रशासन कार्यालय" },
        "desk-emergency": { en: "Emergency Helpline", hi: "आपातकालीन हेल्पलाइन" },
        "addr-title": { en: "Location Address", hi: "अस्पताल का पता" },
        "addr-desc": { en: "Bansi Road, near Pindari Hospital, Katra,<br>Basti, Moor Ghat, Uttar Pradesh 272001", hi: "बांसी रोड, पिंडारी अस्पताल के पास, कटरा,<br>बस्ती, मूर घाट, उत्तर प्रदेश 272001" },
        "btn-directions": { en: "Open in Google Maps", hi: "गूगल मैप्स पर खोलें" },
        "modal-title": { en: "Book Eye Examination", hi: "नेत्र जांच बुक करें" },
        "modal-warning": { en: "<strong>⚠️ Manual Booking & No Online Payments</strong><p style=\"margin-bottom: 4px; font-size: 0.78rem;\">Appointments are scheduled manually; this form submits an inquiry. We never ask for online payments—all official fees must be paid in-person at the hospital counter to authorized staff only.</p><p class=\"hindi-text\" style=\"font-size: 0.75rem; color: #dc3545;\"><strong>सुरक्षा सूचना:</strong> बुकिंग मैन्युअल है। ऑनलाइन कोई भुगतान न करें—सभी शुल्क केवल अस्पताल परिसर में सीधे काउंटर पर दें।</p>", hi: "<strong>⚠️ मैन्युअल बुकिंग और कोई ऑनलाइन भुगतान नहीं</strong><p style=\"margin-bottom: 4px; font-size: 0.78rem;\">अपॉइंटमेंट मैन्युअल रूप से निर्धारित किए जाते हैं; यह फॉर्म केवल एक पूछताछ सबमिट करता है। हम कभी ऑनलाइन भुगतान नहीं मांगते—सभी शुल्क अस्पताल काउंटर पर अधिकृत कर्मचारी को ही दें।</p><p class=\"hindi-text\" style=\"font-size: 0.75rem; color: #dc3545;\"><strong>सुरक्षा सूचना:</strong> बुकिंग मैन्युअल है। ऑनलाइन कोई भुगतान न करें—सभी शुल्क केवल अस्पताल परिसर में सीधे काउंटर पर दें।</p>" },
        "lbl-name": { en: "Patient Full Name*", hi: "रोगी का पूरा नाम*" },
        "plh-name": { en: "Enter full name", hi: "रोगी का नाम दर्ज करें" },
        "lbl-email": { en: "Email Address*", hi: "ईमेल पता*" },
        "plh-email": { en: "Enter email address", hi: "ईमेल पता दर्ज करें" },
        "lbl-phone": { en: "Phone Number*", hi: "मोबाइल नंबर*" },
        "plh-phone": { en: "10-digit mobile number", hi: "10-अंकीय मोबाइल नंबर" },
        "lbl-date": { en: "Preferred Date*", hi: "पसंद की तिथि*" },
        "lbl-service": { en: "Eye Issue / Select Service (आँख की समस्या/चयन करें)", hi: "आँख की समस्या / सेवा का चयन" },
        "lbl-message": { en: "Describe your symptoms (Optional)", hi: "अपनी समस्या बताएं (वैकल्पिक)" },
        "plh-message": { en: "Explain any vision problems, blurring, etc.", hi: "धुंधलापन, जलन या किसी अन्य लक्षण के बारे में बताएं" },
        "btn-confirm-booking": { en: "Confirm Appointment Request", hi: "अपॉइंटमेंट अनुरोध की पुष्टि करें" },
        "success-title": { en: "Request Submitted!", hi: "अनुरोध सफलतापूर्वक सबमिट हुआ!" },
        "success-desc": { en: "We've received your request. An ophthalmology specialist will reach out to you shortly to coordinate your visit.", hi: "हमें आपका अनुरोध प्राप्त हो गया है। हमारी टीम जल्द ही आपसे संपर्क कर परामर्श का समय निर्धारित करेगी।" },
        "btn-close-window": { en: "Close Window", hi: "खिड़की बंद करें" }
    };

    const btnLangEn = document.getElementById('btnLangEn');
    const btnLangHi = document.getElementById('btnLangHi');

    function applyLanguage(lang) {
        localStorage.setItem('preferredLang', lang);
        
        if (lang === 'hi') {
            btnLangHi?.classList.add('active');
            btnLangEn?.classList.remove('active');
        } else {
            btnLangEn?.classList.add('active');
            btnLangHi?.classList.remove('active');
        }

        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[key] && translations[key][lang]) {
                if (key.includes('warning') || key.includes('desc') || key.includes('note') || key.includes('addr')) {
                    el.innerHTML = translations[key][lang];
                } else {
                    el.innerText = translations[key][lang];
                }
            }
        });

        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('placeholder', translations[key][lang]);
            }
        });
    }

    btnLangEn?.addEventListener('click', () => applyLanguage('en'));
    btnLangHi?.addEventListener('click', () => applyLanguage('hi'));

    const savedLang = localStorage.getItem('preferredLang') || 'en';
    applyLanguage(savedLang);
});

// Inject CSS styles for scroll reveal animations directly
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    .reveal {
        opacity: 0;
        transform: translateY(40px) scale(0.96);
        transition: opacity 0.85s cubic-bezier(0.25, 1, 0.5, 1), transform 0.85s cubic-bezier(0.25, 1, 0.5, 1);
        will-change: transform, opacity;
    }
    .reveal-active {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    /* Add slight staggering for service cards */
    .services-grid .service-card:nth-child(1) { transition-delay: 0.0s; }
    .services-grid .service-card:nth-child(2) { transition-delay: 0.05s; }
    .services-grid .service-card:nth-child(3) { transition-delay: 0.1s; }
    .services-grid .service-card:nth-child(4) { transition-delay: 0.0s; }
    .services-grid .service-card:nth-child(5) { transition-delay: 0.05s; }
    .services-grid .service-card:nth-child(6) { transition-delay: 0.1s; }
`;
document.head.appendChild(styleSheet);
