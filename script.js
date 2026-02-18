// ============================================
// SERVICE WORKER REGISTRATION
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}

// ============================================
// FORMATAGE NOMBRES AVEC POINTS
// ============================================
function formatMontant(n) {
    if (n === null || n === undefined || isNaN(n)) return '0';
    return Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatInputMontant(input) {
    const raw = input.value.replace(/\./g, '').replace(/\s/g, '');
    if (raw === '' || isNaN(raw)) return;
    input.dataset.rawValue = raw;
}

// ============================================
// TOGGLE PUB / COMMISSION (ETAPE 2)
// ============================================
let pubChoix = 'non';
let commChoix = 'non';

function togglePubChoix(choix) {
    pubChoix = choix;
    const btnOui = document.getElementById('btnPubOui');
    const btnNon = document.getElementById('btnPubNon');
    const zone = document.getElementById('zoneBudgetPubInput');
    if (choix === 'oui') {
        btnOui.className = 'btn btn-primary';
        btnNon.className = 'btn btn-secondary';
        zone.classList.remove('hidden');
    } else {
        btnNon.className = 'btn btn-primary';
        btnOui.className = 'btn btn-secondary';
        zone.classList.add('hidden');
        document.getElementById('budgetPub').value = '0';
        calculerCommande();
    }
}

function toggleCommissionChoix(choix) {
    commChoix = choix;
    const btnOui = document.getElementById('btnCommOui');
    const btnNon = document.getElementById('btnCommNon');
    const zone = document.getElementById('zoneCommissionInput');
    if (choix === 'oui') {
        btnOui.className = 'btn btn-primary';
        btnNon.className = 'btn btn-secondary';
        zone.classList.remove('hidden');
    } else {
        btnNon.className = 'btn btn-primary';
        btnOui.className = 'btn btn-secondary';
        zone.classList.add('hidden');
        document.getElementById('commissionStock').value = '0';
        calculerCommande();
    }
}

// ============================================
// TOGGLE LOYER LABO
// ============================================
function fixToggleLoyer(choix) {
    const btnOui = document.getElementById('fixBtnLoyerOui');
    const btnNon = document.getElementById('fixBtnLoyerNon');
    const zone = document.getElementById('fixZoneLoyerInput');
    if (choix === 'oui') {
        btnOui.className = 'btn btn-primary';
        btnNon.className = 'btn btn-secondary';
        zone.classList.remove('hidden');
    } else {
        btnNon.className = 'btn btn-primary';
        btnOui.className = 'btn btn-secondary';
        zone.classList.add('hidden');
        document.getElementById('fixBoutiqueLoyerMensuel').value = '0';
    }
}

// ============================================
// VARIABLES GLOBALES
// ============================================
let ventes = [];
let projets = [];
let prixRevient = 0;
let typeCalcul = 'fournisseur';
let periodeActive = 'jour';
let deviseActuelle = 'FCFA';
let objectifJournalier = 50000;
let objectifPersonnel = null;
let nomUtilisateur = 'Boss';

// Taux de change vers FCFA (approximatifs)
const tauxDeChange = {
    'XAF': 1,
    'FCFA': 1,
    'XOF': 1,
    'EUR': 656,
    'USD': 610,
    'CAD': 450,
    'GBP': 770,
    'MAD': 60,
    'GNF': 0.07,
    'NGN': 0.75,
    'GHS': 50,
    'ZAR': 32,
    'KES': 4.5,
    'TZS': 0.24,
    'UGX': 0.16,
    'RWF': 0.5,
    'BIF': 0.21,
    'CDF': 0.22,
    'AOA': 0.7,
    'MZN': 9.5,
    'EGP': 13,
    'DZD': 4.5,
    'TND': 195,
    'CHF': 680,
    'INR': 7.3,
    'CNY': 85,
    'JPY': 4,
    'AED': 166,
    'SAR': 163,
    'BRL': 125,
    'MXN': 35,
    'ARS': 0.7,
    'AUD': 395,
    'NZD': 365,
    'SGD': 455,
    'HKD': 78,
    'SEK': 58,
    'NOK': 57,
    'DKK': 88,
    'PLN': 152,
    'CZK': 26,
    'HUF': 1.7,
    'RUB': 6.8,
    'TRY': 19,
    'THB': 17,
    'MYR': 130,
    'IDR': 0.039,
    'PHP': 11,
    'VND': 0.025,
    'KRW': 0.46,
    'TWD': 19,
    'COP': 0.15,
    'PEN': 165,
    'CLP': 0.68
};

// ============================================
// SUPABASE AUTH
// ============================================
const supabaseUrl = 'https://qeimizgeiqwtppzaecdz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlaW1pemdlaXF3dHBwemFlY2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzk5MTksImV4cCI6MjA4NTk1NTkxOX0._2x1hduAY1a6-ZqeLn8lV9M9qC4Ds7hOCMjXE468QKc';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let modeUtilisateur = 'user';
let currentTheme = 'system';
let modeEconomieDonnees = false;

// ============================================
// PROFILE DROPDOWN
// ============================================
function toggleProfileDropdown() {
    const dropdowns = document.querySelectorAll('.profile-dropdown');
    
    dropdowns.forEach(dropdown => {
        dropdown.classList.add('show');
    });
    hapticFeedback();
}

function closeProfileDropdown() {
    const dropdowns = document.querySelectorAll('.profile-dropdown');
    
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

function updateProfileDropdown() {
    const nameEls = document.querySelectorAll('[id^="dropdownProfileName"]');
    const levelEls = document.querySelectorAll('[id^="dropdownProfileLevel"]');
    const iconEls = document.querySelectorAll('[id^="btnModeProfil"]');
    
    nameEls.forEach(el => el.textContent = nomUtilisateur);
    
    const beneficeTotal = calculerBeneficeTotal();
    const niveau = getNiveauUtilisateur(beneficeTotal);
    
    levelEls.forEach(el => {
        el.className = 'profile-dropdown-level ' + niveau.badge;
        el.innerHTML = '<i class="fas fa-medal"></i> ' + niveau.nom;
    });
    
    iconEls.forEach(el => {
        el.classList.remove('mode-admin', 'mode-user');
        if (modeUtilisateur === 'admin') {
            el.classList.add('mode-admin');
        } else {
            el.classList.add('mode-user');
        }
    });
}

function getNiveauUtilisateur(benefice) {
    if (benefice >= 10000000) return { nom: 'Diamant', badge: 'badge-diamond' };
    if (benefice >= 5000000) return { nom: 'Platine', badge: 'badge-platinum' };
    if (benefice >= 1000000) return { nom: 'Or', badge: 'badge-gold' };
    if (benefice >= 500000) return { nom: 'Argent', badge: 'badge-silver' };
    return { nom: 'Bronze', badge: 'badge-bronze' };
}

// ============================================
// THEME MANAGEMENT
// ============================================
function changerTheme(mode) {
    const body = document.body;
    const btns = ['btn-theme-light', 'btn-theme-dark', 'btn-theme-system'];
    const btnsDesktop = ['btn-theme-light-desktop', 'btn-theme-dark-desktop', 'btn-theme-system-desktop'];
    
    localStorage.setItem('veko_theme', mode);
    currentTheme = mode;

    if (mode === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else if (mode === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'system');
    }

    btns.forEach(id => {
        const btn = document.getElementById(id);
        if(btn) {
            if (id === 'btn-theme-' + mode) {
                btn.style.background = 'rgba(255,255,255,0.1)';
                btn.style.color = 'var(--text-primary)';
                btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            } else {
                btn.style.background = 'none';
                btn.style.color = 'var(--text-muted)';
                btn.style.boxShadow = 'none';
            }
        }
    });
    
    btnsDesktop.forEach(id => {
        const btn = document.getElementById(id);
        if(btn) {
            if (id === 'btn-theme-' + mode + '-desktop') {
                btn.style.background = 'rgba(255,255,255,0.1)';
                btn.style.color = 'var(--text-primary)';
                btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            } else {
                btn.style.background = 'none';
                btn.style.color = 'var(--text-muted)';
                btn.style.boxShadow = 'none';
            }
        }
    });
    
    hapticFeedback();

    try { chargerGraphiqueEvolution(); } catch(e) {}
    try { chargerDashboard(); } catch(e) {}
}

function setTheme(theme) {
    changerTheme(theme);
}

function applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === 'system') {
        html.setAttribute('data-theme', 'system');
    } else {
        html.setAttribute('data-theme', theme);
    }
}

function updateThemeSlider(theme) {
    const indicators = document.querySelectorAll('[id^="themeIndicator"]');
    const options = document.querySelectorAll('.theme-slider-option');
    
    options.forEach(opt => opt.classList.remove('active'));
    
    if (theme === 'light') {
        indicators.forEach(ind => ind.className = 'theme-slider-indicator pos-0');
        document.querySelectorAll('[data-theme="light"]').forEach(el => el.classList.add('active'));
    } else if (theme === 'dark') {
        indicators.forEach(ind => ind.className = 'theme-slider-indicator pos-1');
        document.querySelectorAll('[data-theme="dark"]').forEach(el => el.classList.add('active'));
    } else {
        indicators.forEach(ind => ind.className = 'theme-slider-indicator pos-2');
        document.querySelectorAll('[data-theme="system"]').forEach(el => el.classList.add('active'));
    }
}

function updateThemeButtons() {
    updateThemeSlider(currentTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('veko_theme') || 'system';
    currentTheme = savedTheme;
    changerTheme(savedTheme);
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentTheme === 'system') {
            changerTheme('system');
        }
    });
    
    const ecoSaved = localStorage.getItem('veko_eco_mode') === 'true';
    const toggle = document.getElementById('toggle-eco-mode');
    const toggleDesktop = document.getElementById('toggle-eco-mode-desktop');
    if(toggle) toggle.checked = ecoSaved;
    if(toggleDesktop) toggleDesktop.checked = ecoSaved;
    if(ecoSaved) {
        document.body.classList.add('low-data');
        document.documentElement.classList.add('mode-economie');
        modeEconomieDonnees = true;
    }
}

// ============================================
// MODE ECONOMIE DE DONNEES
// ============================================
function toggleEcoMode(checkbox) {
    const isChecked = checkbox ? checkbox.checked : false;
    modeEconomieDonnees = isChecked;
    localStorage.setItem('veko_eco_mode', isChecked ? 'true' : 'false');
    
    const toggle = document.getElementById('toggle-eco-mode');
    const toggleDesktop = document.getElementById('toggle-eco-mode-desktop');
    if (toggle) toggle.checked = isChecked;
    if (toggleDesktop) toggleDesktop.checked = isChecked;
    
    if (isChecked) {
        document.body.classList.add('low-data');
        document.documentElement.classList.add('mode-economie');
        afficherNotification('Mode Economie active : Animations reduites', 'success');
    } else {
        document.body.classList.remove('low-data');
        document.documentElement.classList.remove('mode-economie');
    }
    
    hapticFeedback();
}

function toggleModeEconomie() {
    modeEconomieDonnees = document.getElementById('modeEconomie')?.checked || false;
    localStorage.setItem('veko_mode_economie', modeEconomieDonnees);
    applyModeEconomie();
    hapticFeedback();
}

function toggleDataSaver() {
    const toggle = document.getElementById('dataSaverToggle');
    const toggleDesktop = document.getElementById('dataSaverToggleDesktop');
    
    modeEconomieDonnees = toggle?.checked || toggleDesktop?.checked || false;
    localStorage.setItem('veko_mode_economie', modeEconomieDonnees);
    
    if (toggle) toggle.checked = modeEconomieDonnees;
    if (toggleDesktop) toggleDesktop.checked = modeEconomieDonnees;
    
    applyModeEconomie();
    hapticFeedback();
}

function applyModeEconomie() {
    const html = document.documentElement;
    if (modeEconomieDonnees) {
        html.classList.add('mode-economie');
    } else {
        html.classList.remove('mode-economie');
    }
    
    const toggle = document.getElementById('dataSaverToggle');
    const toggleDesktop = document.getElementById('dataSaverToggleDesktop');
    if (toggle) toggle.checked = modeEconomieDonnees;
    if (toggleDesktop) toggleDesktop.checked = modeEconomieDonnees;
}

function loadModeEconomie() {
    modeEconomieDonnees = localStorage.getItem('veko_mode_economie') === 'true';
    const checkbox = document.getElementById('modeEconomie');
    const dataSaver = document.getElementById('dataSaverToggle');
    if (checkbox) checkbox.checked = modeEconomieDonnees;
    if (dataSaver) dataSaver.checked = modeEconomieDonnees;
    applyModeEconomie();
}

// ============================================
// DECONNEXION
// ============================================
async function deconnexion() {
    if(confirm("Voulez-vous vraiment vous d\u00e9connecter ?")) {
        closeProfileDropdown();
        await supabaseClient.auth.signOut();
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('authScreen').style.display = 'flex';
        document.getElementById('authForm').style.display = 'block';
        document.getElementById('authEmail').value = '';
        document.getElementById('authMessage').style.display = 'none';
        document.getElementById('authError').style.display = 'none';
        hapticFeedback(50);
    }
}

function deconnecter() {
    deconnexion();
}

// ============================================
// DAILY DIGEST
// ============================================
function showDailyDigest(message) {
    const digest = document.getElementById('dailyDigest');
    const textEl = document.getElementById('dailyDigestText');
    if (textEl) textEl.textContent = message;
    if (digest) {
        digest.classList.add('show');
        setTimeout(() => {
            digest.classList.remove('show');
        }, 5000);
    }
}

function closeDailyDigest() {
    const digest = document.getElementById('dailyDigest');
    if (digest) digest.classList.remove('show');
}

function checkDailyDigest() {
    const today = new Date().toDateString();
    const lastDigest = localStorage.getItem('veko_last_digest');
    
    if (lastDigest !== today) {
        const ventesHier = getVentesParPeriode('hier');
        const ventesAvantHier = getVentesParPeriode('avant-hier');
        
        if (ventesHier.length > ventesAvantHier.length) {
            const diff = ventesHier.length - ventesAvantHier.length;
            setTimeout(() => {
                showDailyDigest('Felicitations ! Vous avez realise ' + diff + ' vente(s) de plus qu\'hier.');
            }, 2000);
        }
        localStorage.setItem('veko_last_digest', today);
    }
}

function getVentesParPeriode(periode) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return ventes.filter(v => {
        const venteDate = new Date(v.date);
        const venteDateOnly = new Date(venteDate.getFullYear(), venteDate.getMonth(), venteDate.getDate());
        
        if (periode === 'hier') {
            const hier = new Date(today);
            hier.setDate(hier.getDate() - 1);
            return venteDateOnly.getTime() === hier.getTime();
        } else if (periode === 'avant-hier') {
            const avantHier = new Date(today);
            avantHier.setDate(avantHier.getDate() - 2);
            return venteDateOnly.getTime() === avantHier.getTime();
        }
        return false;
    });
}

// ============================================
// HAPTIC FEEDBACK
// ============================================
function hapticFeedback(duration = 10) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

function vibrerSucces() {
    if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
    }
}

// ============================================
// COUNTER ANIMATION
// ============================================
function animateCounter(element, targetValue, duration = 500, suffix = '') {
    if (modeEconomieDonnees) {
        element.textContent = targetValue.toLocaleString() + suffix;
        return;
    }
    
    const startTime = performance.now();
    const startValue = 0;
    element.classList.add('counting');
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeProgress);
        
        element.textContent = currentValue.toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.remove('counting');
        }
    }
    
    requestAnimationFrame(update);
}

// ============================================
// AUTH SUPABASE - LOGIN / SESSION
// ============================================
let authMode = 'login';

function switchAuthTab(mode) {
    authMode = mode;
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const btn = document.getElementById('authSubmitBtn');
    const footer = document.getElementById('authFooter');
    const msgDiv = document.getElementById('authMessage');
    const errDiv = document.getElementById('authError');
    msgDiv.style.display = 'none';
    errDiv.style.display = 'none';

    if (mode === 'login') {
        tabLogin.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
        tabLogin.style.color = 'white';
        tabSignup.style.background = 'transparent';
        tabSignup.style.color = 'rgba(255,255,255,0.5)';
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
        footer.textContent = 'Entrez vos identifiants pour acc\u00e9der \u00e0 VEKO.';
    } else {
        tabSignup.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
        tabSignup.style.color = 'white';
        tabLogin.style.background = 'transparent';
        tabLogin.style.color = 'rgba(255,255,255,0.5)';
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Cr\u00e9er mon compte';
        footer.textContent = 'Un email de confirmation vous sera envoy\u00e9.';
    }
}

async function loginWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'https://veko-app.com'
        }
    });
    if (error) {
        const errDiv = document.getElementById('authError');
        const errText = document.getElementById('authErrorText');
        errText.textContent = error.message || 'Erreur de connexion Google.';
        errDiv.style.display = 'block';
    }
}

async function handleAuth() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const msgDiv = document.getElementById('authMessage');
    const msgText = document.getElementById('authMessageText');
    const errDiv = document.getElementById('authError');
    const errText = document.getElementById('authErrorText');
    const btn = document.getElementById('authSubmitBtn');
    msgDiv.style.display = 'none';
    errDiv.style.display = 'none';

    if (!email || !email.includes('@')) {
        errText.textContent = 'Veuillez entrer une adresse email valide.';
        errDiv.style.display = 'block';
        return;
    }
    if (!password || password.length < 6) {
        errText.textContent = 'Le mot de passe doit contenir au moins 6 caract\u00e8res.';
        errDiv.style.display = 'block';
        return;
    }

    const originalBtn = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
    btn.style.pointerEvents = 'none';

    if (authMode === 'signup') {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: window.location.origin + window.location.pathname
            }
        });

        btn.innerHTML = originalBtn;
        btn.style.pointerEvents = 'auto';

        if (error) {
            if (error.message.toLowerCase().includes('rate') || error.message.toLowerCase().includes('limit')) {
                errText.textContent = 'Trop de tentatives. Veuillez patienter quelques minutes.';
            } else {
                errText.textContent = error.message || 'Erreur lors de l\'inscription.';
            }
            errDiv.style.display = 'block';
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
            errText.textContent = 'Un compte existe d\u00e9j\u00e0 avec cet email. Utilisez "Se connecter".';
            errDiv.style.display = 'block';
        } else if (data.session) {
            showApp(data.user);
        } else {
            msgText.innerHTML = 'Un email de confirmation a \u00e9t\u00e9 envoy\u00e9 \u00e0 :<br><strong style="color: #8b5cf6;">' + email + '</strong><br>Cliquez sur le lien pour activer votre compte.';
            msgDiv.style.display = 'block';
            document.getElementById('authForm').style.display = 'none';
        }
    } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        btn.innerHTML = originalBtn;
        btn.style.pointerEvents = 'auto';

        if (error) {
            if (error.message.includes('Invalid login')) {
                errText.textContent = 'Email ou mot de passe incorrect.';
            } else if (error.message.includes('Email not confirmed')) {
                errText.textContent = 'Votre email n\'est pas encore confirm\u00e9. V\u00e9rifiez votre bo\u00eete mail.';
            } else if (error.message.toLowerCase().includes('rate') || error.message.toLowerCase().includes('limit')) {
                errText.textContent = 'Trop de tentatives. Veuillez patienter quelques minutes avant de r\u00e9essayer.';
            } else {
                errText.textContent = error.message || 'Erreur de connexion.';
            }
            errDiv.style.display = 'block';
        } else {
            showApp(data.user);
        }
    }
}

function showForgotPassword() {
    const msgDiv = document.getElementById('authMessage');
    const msgText = document.getElementById('authMessageText');
    const errDiv = document.getElementById('authError');
    const errText = document.getElementById('authErrorText');
    const form = document.getElementById('authForm');
    const footer = document.getElementById('authFooter');
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    msgDiv.style.display = 'none';
    errDiv.style.display = 'none';

    form.innerHTML = '<div style="margin-bottom: 16px;"><input type="email" id="resetEmail" placeholder="Votre adresse email" style="width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; color: white; font-size: 14px; outline: none; font-family: \'Inter\', sans-serif; transition: border-color 0.3s;" onfocus="this.style.borderColor=\'#8b5cf6\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.15)\'"></div><button onclick="sendResetEmail()" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: \'Inter\', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px;" id="resetBtn"><i class="fas fa-envelope"></i> Envoyer le lien de r\u00e9initialisation</button><button onclick="backToLogin()" style="width: 100%; padding: 10px; background: transparent; color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; font-size: 13px; cursor: pointer; font-family: \'Inter\', sans-serif; margin-top: 10px;"><i class="fas fa-arrow-left"></i> Retour</button>';
    forgotBtn.style.display = 'none';
    footer.textContent = 'Entrez votre email pour recevoir un lien de r\u00e9initialisation.';
}

function backToLogin() {
    location.reload();
}

async function sendResetEmail() {
    const email = document.getElementById('resetEmail').value.trim();
    const msgDiv = document.getElementById('authMessage');
    const msgText = document.getElementById('authMessageText');
    const errDiv = document.getElementById('authError');
    const errText = document.getElementById('authErrorText');
    const btn = document.getElementById('resetBtn');
    msgDiv.style.display = 'none';
    errDiv.style.display = 'none';

    if (!email || !email.includes('@')) {
        errText.textContent = 'Veuillez entrer une adresse email valide.';
        errDiv.style.display = 'block';
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
    btn.style.pointerEvents = 'none';

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
    });

    btn.innerHTML = '<i class="fas fa-envelope"></i> Envoyer le lien de r\u00e9initialisation';
    btn.style.pointerEvents = 'auto';

    if (error) {
        if (error.message.toLowerCase().includes('rate') || error.message.toLowerCase().includes('limit')) {
            errText.textContent = 'Trop de demandes. Attendez quelques minutes.';
        } else {
            errText.textContent = error.message || 'Erreur lors de l\'envoi.';
        }
        errDiv.style.display = 'block';
    } else {
        msgText.innerHTML = 'Un lien de r\u00e9initialisation a \u00e9t\u00e9 envoy\u00e9 \u00e0 :<br><strong style="color: #8b5cf6;">' + email + '</strong><br>V\u00e9rifiez votre bo\u00eete mail (et les spams).';
        msgDiv.style.display = 'block';
    }
}

async function checkSession() {
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=magiclink'))) {
        try {
            const { data, error } = await supabaseClient.auth.getSession();
            if (data.session) {
                window.history.replaceState(null, '', window.location.pathname);
                showApp(data.session.user);
                return;
            }
        } catch(e) {}
    }
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        showApp(session.user);
    } else {
        document.getElementById('authScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }
}

let currentUser = null;

function generateUsername(email) {
    const base = email ? email.split('@')[0] : 'user';
    const num = Math.floor(Math.random() * 9000) + 1000;
    return base.charAt(0).toUpperCase() + base.slice(1, 6) + num;
}

function getUserProfile() {
    const saved = localStorage.getItem('veko_user_profile');
    return saved ? JSON.parse(saved) : null;
}

function saveUserProfile(profile) {
    localStorage.setItem('veko_user_profile', JSON.stringify(profile));
}

function getDisplayName() {
    const profile = getUserProfile();
    if (profile && profile.username) return profile.username;
    if (currentUser && currentUser.user_metadata?.full_name) return currentUser.user_metadata.full_name;
    return null;
}

function showApp(user) {
    currentUser = user;
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';

    let profile = getUserProfile();
    if (!profile) {
        profile = {
            username: generateUsername(user.email),
            nom: '',
            prenom: '',
            telephone: '',
            indicatif: '+33',
            email: user.email
        };
        saveUserProfile(profile);
    } else {
        profile.email = user.email;
        saveUserProfile(profile);
    }

    const displayName = profile.username;

    modeUtilisateur = 'user';

    updateProfileDropdowns(displayName);
    initApp();
}

function updateProfileDropdowns(displayName) {
    ['dropdownProfileName', 'dropdownProfileNameDesktop'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = displayName + ' <i class="fas fa-pencil-alt" onclick="event.stopPropagation(); showTab(\'parametres\'); closeProfileDropdown();" style="font-size: 10px; cursor: pointer; margin-left: 6px; color: var(--accent-purple); opacity: 0.7;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7"></i>';
        }
    });
}

function loadSettingsPage() {
    const profile = getUserProfile();
    if (!profile) return;
    document.getElementById('settingsUsername').textContent = profile.username || '';
    document.getElementById('settingsEmail').textContent = profile.email || '';
    document.getElementById('settingsInputUsername').value = profile.username || '';
    document.getElementById('settingsPrenom').value = profile.prenom || '';
    document.getElementById('settingsNom').value = profile.nom || '';
    document.getElementById('settingsTelephone').value = profile.telephone || '';
    const indicatifSelect = document.getElementById('settingsIndicatif');
    if (profile.indicatif) indicatifSelect.value = profile.indicatif;
    document.getElementById('settingsNewPwd').value = '';
    document.getElementById('settingsConfirmPwd').value = '';
    const saveMsg = document.getElementById('settingsSaveMsg');
    const pwdMsg = document.getElementById('settingsPwdMsg');
    if (saveMsg) saveMsg.style.display = 'none';
    if (pwdMsg) pwdMsg.style.display = 'none';
}

function saveSettingsProfile() {
    const profile = getUserProfile() || {};
    const newUsername = document.getElementById('settingsInputUsername').value.trim();
    const msgDiv = document.getElementById('settingsSaveMsg');

    if (!newUsername) {
        msgDiv.style.display = 'block';
        msgDiv.style.background = 'rgba(239,68,68,0.1)';
        msgDiv.style.color = '#ef4444';
        msgDiv.textContent = 'Le nom d\'utilisateur ne peut pas \u00eatre vide.';
        return;
    }

    profile.username = newUsername;
    profile.prenom = document.getElementById('settingsPrenom').value.trim();
    profile.nom = document.getElementById('settingsNom').value.trim();
    profile.telephone = document.getElementById('settingsTelephone').value.trim();
    profile.indicatif = document.getElementById('settingsIndicatif').value;
    saveUserProfile(profile);

    document.getElementById('settingsUsername').textContent = newUsername;
    updateProfileDropdowns(newUsername);

    msgDiv.style.display = 'block';
    msgDiv.style.background = 'rgba(16,185,129,0.1)';
    msgDiv.style.color = '#10b981';
    msgDiv.textContent = 'Informations enregistr\u00e9es avec succ\u00e8s !';
    setTimeout(() => { msgDiv.style.display = 'none'; }, 3000);
}

async function changePasswordFromSettings() {
    const pw = document.getElementById('settingsNewPwd').value;
    const pw2 = document.getElementById('settingsConfirmPwd').value;
    const msgDiv = document.getElementById('settingsPwdMsg');
    const btn = document.getElementById('btnChangePwd');

    if (!pw || pw.length < 6) {
        msgDiv.style.display = 'block';
        msgDiv.style.background = 'rgba(239,68,68,0.1)';
        msgDiv.style.color = '#ef4444';
        msgDiv.textContent = 'Le mot de passe doit contenir au moins 6 caract\u00e8res.';
        return;
    }
    if (pw !== pw2) {
        msgDiv.style.display = 'block';
        msgDiv.style.background = 'rgba(239,68,68,0.1)';
        msgDiv.style.color = '#ef4444';
        msgDiv.textContent = 'Les mots de passe ne correspondent pas.';
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mise \u00e0 jour...';
    btn.style.pointerEvents = 'none';

    const { error } = await supabaseClient.auth.updateUser({ password: pw });

    btn.innerHTML = '<i class="fas fa-key"></i> Modifier le mot de passe';
    btn.style.pointerEvents = 'auto';

    if (error) {
        msgDiv.style.display = 'block';
        msgDiv.style.background = 'rgba(239,68,68,0.1)';
        msgDiv.style.color = '#ef4444';
        msgDiv.textContent = error.message || 'Erreur lors du changement.';
    } else {
        msgDiv.style.display = 'block';
        msgDiv.style.background = 'rgba(16,185,129,0.1)';
        msgDiv.style.color = '#10b981';
        msgDiv.textContent = 'Mot de passe modifi\u00e9 avec succ\u00e8s !';
        document.getElementById('settingsNewPwd').value = '';
        document.getElementById('settingsConfirmPwd').value = '';
        setTimeout(() => { msgDiv.style.display = 'none'; }, 3000);
    }
}

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        showResetPasswordForm();
    } else if (event === 'SIGNED_IN' && session) {
        const authScreen = document.getElementById('authScreen');
        if (authScreen && authScreen.style.display !== 'none') {
            showApp(session.user);
        }
    }
});

function showResetPasswordForm() {
    const authScreen = document.getElementById('authScreen');
    authScreen.style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    const container = authScreen.querySelector('div');
    const form = document.getElementById('authForm');
    const msgDiv = document.getElementById('authMessage');
    const errDiv = document.getElementById('authError');
    const footer = document.getElementById('authFooter');
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    const tabs = container.querySelector('div[style*="display: flex; margin-bottom: 20px"]');
    if (tabs) tabs.style.display = 'none';
    if (forgotBtn) forgotBtn.style.display = 'none';
    msgDiv.style.display = 'none';
    errDiv.style.display = 'none';
    footer.textContent = 'Choisissez votre nouveau mot de passe (min. 6 caract\u00e8res).';

    form.innerHTML = '<div style="margin-bottom: 16px;"><input type="password" id="newPassword" placeholder="Nouveau mot de passe" style="width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; color: white; font-size: 14px; outline: none; font-family: \'Inter\', sans-serif;" onfocus="this.style.borderColor=\'#8b5cf6\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.15)\'"></div><div style="margin-bottom: 16px;"><input type="password" id="confirmPassword" placeholder="Confirmer le mot de passe" style="width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; color: white; font-size: 14px; outline: none; font-family: \'Inter\', sans-serif;" onfocus="this.style.borderColor=\'#8b5cf6\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.15)\'"></div><button onclick="updatePassword()" id="updatePwdBtn" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: \'Inter\', sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="fas fa-key"></i> Changer le mot de passe</button>';
}

async function updatePassword() {
    const pw = document.getElementById('newPassword').value;
    const pw2 = document.getElementById('confirmPassword').value;
    const errDiv = document.getElementById('authError');
    const errText = document.getElementById('authErrorText');
    const msgDiv = document.getElementById('authMessage');
    const msgText = document.getElementById('authMessageText');
    const btn = document.getElementById('updatePwdBtn');
    errDiv.style.display = 'none';
    msgDiv.style.display = 'none';

    if (!pw || pw.length < 6) {
        errText.textContent = 'Le mot de passe doit contenir au moins 6 caract\u00e8res.';
        errDiv.style.display = 'block';
        return;
    }
    if (pw !== pw2) {
        errText.textContent = 'Les mots de passe ne correspondent pas.';
        errDiv.style.display = 'block';
        return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mise \u00e0 jour...';
    btn.style.pointerEvents = 'none';

    const { error } = await supabaseClient.auth.updateUser({ password: pw });

    btn.innerHTML = '<i class="fas fa-key"></i> Changer le mot de passe';
    btn.style.pointerEvents = 'auto';

    if (error) {
        errText.textContent = error.message || 'Erreur lors du changement.';
        errDiv.style.display = 'block';
    } else {
        msgText.innerHTML = 'Mot de passe chang\u00e9 avec succ\u00e8s ! Redirection...';
        msgDiv.style.display = 'block';
        document.getElementById('authForm').style.display = 'none';
        setTimeout(() => { location.reload(); }, 2000);
    }
}

function seDeconnecter() {
    deconnexion();
}

// ============================================
// INITIALISATION APP
// ============================================
function initApp() {
    loadTheme();
    loadModeEconomie();
    chargerDonnees();
    chargerProfil();
    afficherHistorique();
    afficherProjets();
    updateSelectProjet();
    updateChartProduitSelect();
    genererConseilAxis();
    updateMicroBadge();
    updateActivityRing();
    updateProfileDropdown();
    updateProgression();
    
    showTab('dashboard');
    
    checkMorningBrief();
    checkDailyDigest();
    checkEveningRecall();
    checkSundayStrategy();
    
    setTimeout(() => {
        chargerDashboard();
    }, 100);
}

// ============================================
// PROFIL UTILISATEUR
// ============================================
function chargerProfil() {
    const savedName = localStorage.getItem('veko_user_name');
    const savedObjectif = localStorage.getItem('veko_objectif_jour');
    
    if (savedName) {
        nomUtilisateur = savedName;
        document.getElementById('profileName').textContent = nomUtilisateur;
    }
    
    if (savedObjectif) {
        objectifJournalier = Number(savedObjectif);
    }
}

function sauvegarderProfil() {
    const nom = document.getElementById('inputNomProfil').value.trim();
    const objectif = Number(document.getElementById('inputObjectifJour').value) || 50000;
    
    if (nom) {
        nomUtilisateur = nom;
        localStorage.setItem('veko_user_name', nom);
        document.getElementById('profileName').textContent = nom;
    }
    
    objectifJournalier = objectif;
    localStorage.setItem('veko_objectif_jour', objectif);
    
    hapticFeedback();
    closeModalProfil();
    updateActivityRing();
    afficherNotification('Profil mis a jour !', 'success');
}

function openModalProfil() {
    document.getElementById('inputNomProfil').value = nomUtilisateur;
    document.getElementById('inputObjectifJour').value = objectifJournalier;
    document.getElementById('modalProfil').style.display = 'block';
}

function closeModalProfil() {
    document.getElementById('modalProfil').style.display = 'none';
}

// ============================================
// DAILY DIGEST NOTIFICATION
// ============================================
function showDailyDigest() {
    const aujourdhui = new Date();
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    
    const ventesAujourdhui = ventes.filter(v => {
        const dateVente = new Date(v.date);
        return dateVente.toDateString() === aujourdhui.toDateString() && !v.retournee;
    });
    
    const ventesHier = ventes.filter(v => {
        const dateVente = new Date(v.date);
        return dateVente.toDateString() === hier.toDateString() && !v.retournee;
    });
    
    const nbAujourdhui = ventesAujourdhui.length;
    const nbHier = ventesHier.length;
    const diff = nbAujourdhui - nbHier;
    
    if (nbAujourdhui > 0 && diff > 0) {
        afficherNotification(`Bravo ${nomUtilisateur} ! Tu as deja ${nbAujourdhui} vente(s) aujourd'hui, soit ${diff} de plus qu'hier !`, 'success');
        hapticFeedback(100);
    } else if (nbAujourdhui > 0) {
        afficherNotification(`${nbAujourdhui} vente(s) aujourd'hui. Continue sur cette lancee !`, 'info');
    }
}

// ============================================
// MICRO-BADGES
// ============================================
function updateMicroBadge() {
    const beneficeTotal = ventes.filter(v => !v.retournee).reduce((sum, v) => sum + v.benefice, 0);
    const container = document.getElementById('userMicroBadge');
    const previousBadge = localStorage.getItem('veko_badge_level') || 'debutant';
    
    let badge = '';
    let newLevel = 'debutant';
    
    if (beneficeTotal >= 10000000) {
        badge = '<span class="micro-badge badge-diamond"><i class="fas fa-gem"></i> Diamond</span>';
        newLevel = 'diamond';
    } else if (beneficeTotal >= 5000000) {
        badge = '<span class="micro-badge badge-platinum"><i class="fas fa-medal"></i> Platinum</span>';
        newLevel = 'platinum';
    } else if (beneficeTotal >= 1000000) {
        badge = '<span class="micro-badge badge-gold"><i class="fas fa-crown"></i> Gold</span>';
        newLevel = 'gold';
    } else if (beneficeTotal >= 500000) {
        badge = '<span class="micro-badge badge-silver"><i class="fas fa-star"></i> Silver</span>';
        newLevel = 'silver';
    } else if (beneficeTotal >= 100000) {
        badge = '<span class="micro-badge badge-bronze"><i class="fas fa-award"></i> Bronze</span>';
        newLevel = 'bronze';
    } else {
        badge = '<span class="micro-badge" style="background: var(--glass-bg); color: var(--text-muted); border: 1px solid var(--diamond-border);"><i class="fas fa-seedling"></i> Debutant</span>';
        newLevel = 'debutant';
    }
    
    if (newLevel !== previousBadge) {
        const levelOrder = ['debutant', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];
        if (levelOrder.indexOf(newLevel) > levelOrder.indexOf(previousBadge)) {
            hapticFeedback(200);
            afficherNotification('Felicitations ! Vous etes passe au niveau ' + newLevel.toUpperCase() + ' !', 'success');
        }
        localStorage.setItem('veko_badge_level', newLevel);
    }
    
    container.innerHTML = badge;
}

// ============================================
// ACTIVITY RING - Synchronisation Objectif du Jour
// ============================================
function updateActivityRing() {
    const ringBenefice = document.getElementById('ringBenefice');
    const ringCA = document.getElementById('ringCA');
    const ringVentes = document.getElementById('ringVentes');
    const centerValue = document.getElementById('ringCenterValue');
    const objectifActions = document.getElementById('objectifActions');
    const objectifSlideContent = document.getElementById('objectifSlideContent');

    const circumBenefice = 2 * Math.PI * 75;
    const circumCA = 2 * Math.PI * 60;
    const circumVentes = 2 * Math.PI * 45;

    if (!objectifPersonnel) {
        if (ringBenefice) { ringBenefice.style.strokeDashoffset = circumBenefice; ringBenefice.style.filter = 'none'; }
        if (ringCA) ringCA.style.strokeDashoffset = circumCA;
        if (ringVentes) ringVentes.style.strokeDashoffset = circumVentes;
        if (centerValue) centerValue.textContent = '0%';
        if (objectifActions) objectifActions.style.display = 'none';
        if (objectifSlideContent) {
            objectifSlideContent.innerHTML = `
                <div style="text-align: center; padding: 20px 0;">
                    <i class="fas fa-bullseye" style="font-size: 32px; color: var(--text-muted); margin-bottom: 12px;"></i>
                    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px;">Aucun objectif defini</p>
                    <button onclick="openModalObjectif()" class="btn btn-primary" style="width: auto; padding: 12px 24px;">
                        <i class="fas fa-plus"></i> Definir un objectif
                    </button>
                </div>
            `;
        }
        return;
    }

    if (objectifActions) objectifActions.style.display = 'flex';

    const aujourdhui = new Date();
    const debutParts = objectifPersonnel.dateDebut.split('-');
    const dateDebutObjectif = new Date(debutParts[0], debutParts[1] - 1, debutParts[2], 0, 0, 0);
    const finParts = objectifPersonnel.dateFin.split('-');
    const dateFin = new Date(finParts[0], finParts[1] - 1, finParts[2], 23, 59, 59);
    const joursRestants = Math.max(0, Math.ceil((dateFin - aujourdhui) / (1000 * 60 * 60 * 24)));
    objectifPersonnel.joursRestants = joursRestants;

    const debutJournee = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate(), 0, 0, 0);
    const finJournee = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate(), 23, 59, 59, 999);

    const ventesJour = ventes.filter(v => {
        const d = new Date(v.date);
        return d >= debutJournee && d <= finJournee && d >= dateDebutObjectif && !v.retournee;
    });

    const beneficeJour = ventesJour.reduce((sum, v) => sum + v.benefice, 0);
    const caJour = ventesJour.reduce((sum, v) => sum + v.ca, 0);
    const nbVentesJour = ventesJour.length;

    const objectifBenefice = objectifPersonnel.montantJournalier || objectifJournalier;
    const objectifCA = objectifBenefice * 2;
    const objectifVentes = Math.ceil(objectifBenefice / 10000) || 5;

    const pctBenefice = objectifBenefice > 0 ? Math.min((beneficeJour / objectifBenefice) * 100, 100) : 0;
    const pctCA = objectifCA > 0 ? Math.min((caJour / objectifCA) * 100, 100) : 0;
    const pctVentes = objectifVentes > 0 ? Math.min((nbVentesJour / objectifVentes) * 100, 100) : 0;

    if (ringBenefice) {
        setTimeout(() => {
            ringBenefice.style.strokeDashoffset = circumBenefice - (circumBenefice * pctBenefice / 100);
        }, 100);
        ringBenefice.style.filter = pctBenefice >= 100 ? 'drop-shadow(0 0 6px var(--accent-green))' : 'none';
    }
    if (ringCA) {
        setTimeout(() => {
            ringCA.style.strokeDashoffset = circumCA - (circumCA * pctCA / 100);
        }, 200);
        ringCA.style.filter = pctCA >= 100 ? 'drop-shadow(0 0 6px var(--accent-blue))' : 'none';
    }
    if (ringVentes) {
        setTimeout(() => {
            ringVentes.style.strokeDashoffset = circumVentes - (circumVentes * pctVentes / 100);
        }, 300);
        ringVentes.style.filter = pctVentes >= 100 ? 'drop-shadow(0 0 6px var(--accent-purple))' : 'none';
    }

    const avgPct = Math.round((pctBenefice + pctCA + pctVentes) / 3);
    if (centerValue) {
        animateCounter(centerValue, avgPct, 800, '%');
    }

    if (objectifSlideContent) {
        const progression = objectifPersonnel.montantJournalier > 0
            ? Math.round((beneficeJour / objectifPersonnel.montantJournalier) * 100) : 0;
        const progressColor = progression >= 100 ? 'var(--accent-green)' : 'var(--accent-orange)';

        objectifSlideContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div>
                    <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${objectifPersonnel.type || 'Objectif'}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${joursRestants} jours restants</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 18px; font-weight: 900; color: var(--accent-green);">${Math.round(objectifPersonnel.montantTotal).toLocaleString()} ${deviseActuelle}</div>
                    <div style="font-size: 10px; color: var(--text-muted);">${Math.round(objectifPersonnel.montantJournalier).toLocaleString()} ${deviseActuelle}/jour</div>
                </div>
            </div>
            <div style="background: var(--glass-bg); border-radius: 8px; height: 8px; overflow: hidden;">
                <div style="background: var(--gradient-success); height: 100%; width: ${Math.min(progression, 100)}%; border-radius: 8px; transition: width 0.5s;"></div>
            </div>
            <div style="text-align: center; margin-top: 8px; font-size: 12px; color: ${progressColor}; font-weight: 700;">${progression}% aujourd'hui</div>
        `;
        
        checkObjectifAtteint(progression, 'jour');
    }
}

function suiviObjectifJour() {
    updateActivityRing();
}

// ============================================
// GAMIFICATION - OBJECTIF ATTEINT
// ============================================
function checkObjectifAtteint(progression, type) {
    const today = new Date().toDateString();
    const key = 'veko_objectif_' + type + '_atteint';
    const lastAtteint = localStorage.getItem(key);
    
    if (progression >= 100 && lastAtteint !== today) {
        localStorage.setItem(key, today);
        
        setTimeout(() => {
            if (type === 'jour') {
                afficherNotification('Objectif du jour atteint ! Bravo, continuez !', 'success');
            } else {
                afficherNotification('Objectif general atteint ! Felicitations, vous etes un champion !', 'success');
            }
            hapticFeedback(200);
            
            checkNiveauGamification();
        }, 500);
    }
}

function checkNiveauGamification() {
    const objectifsAtteints = Number(localStorage.getItem('veko_objectifs_count') || '0') + 1;
    localStorage.setItem('veko_objectifs_count', String(objectifsAtteints));
    
    const niveaux = [
        { seuil: 1, nom: 'Debutant Motive', icon: 'fa-seedling' },
        { seuil: 3, nom: 'En Progression', icon: 'fa-chart-line' },
        { seuil: 7, nom: 'Regulier', icon: 'fa-star' },
        { seuil: 15, nom: 'Performant', icon: 'fa-fire' },
        { seuil: 30, nom: 'Expert', icon: 'fa-trophy' },
        { seuil: 50, nom: 'Maitre', icon: 'fa-crown' },
        { seuil: 100, nom: 'Legende', icon: 'fa-gem' }
    ];
    
    let niveauActuel = niveaux[0];
    for (let i = niveaux.length - 1; i >= 0; i--) {
        if (objectifsAtteints >= niveaux[i].seuil) {
            niveauActuel = niveaux[i];
            break;
        }
    }
    
    const lastNiveau = localStorage.getItem('veko_gamification_niveau');
    if (lastNiveau !== niveauActuel.nom) {
        localStorage.setItem('veko_gamification_niveau', niveauActuel.nom);
        if (lastNiveau) {
            setTimeout(() => {
                afficherNotification('Nouveau niveau : ' + niveauActuel.nom + ' ! (' + objectifsAtteints + ' objectifs atteints)', 'success');
                hapticFeedback(300);
            }, 2000);
        }
    }
}

// ============================================
// MORNING BRIEF STORY
// ============================================
function checkMorningBrief() {
    const heure = new Date().getHours();
    const aujourdhui = new Date().toDateString();
    const shownToday = localStorage.getItem('veko_morning_shown');
    
    if (heure >= 5 && heure < 11 && shownToday !== aujourdhui) {
        showMorningBrief();
    }
}

function showMorningBrief() {
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    
    const ventesHier = ventes.filter(v => {
        const dateVente = new Date(v.date);
        return dateVente.toDateString() === hier.toDateString();
    });
    
    const benefHier = ventesHier.filter(v => !v.retournee).reduce((sum, v) => sum + v.benefice, 0);
    const nbVentesHier = ventesHier.length;
    const aPubProvisoire = ventesHier.some(v => v.budgetPubProvisoire);
    
    const heure = new Date().getHours();
    let greeting = 'Bonjour';
    if (heure < 8) greeting = 'Debout tot !';
    else if (heure >= 10) greeting = 'Bonne matinee';
    
    document.getElementById('storyGreeting').textContent = greeting;
    document.getElementById('storyUserName').textContent = nomUtilisateur + ' !';
    document.getElementById('storyBenefHier').textContent = Math.round(benefHier).toLocaleString() + ' F';
    document.getElementById('storyVentesHier').textContent = nbVentesHier;
    
    if (aPubProvisoire) {
        document.getElementById('storyAlert').style.display = 'block';
        document.getElementById('storyAlertText').textContent = 'N\'oublie pas de repartir ta pub d\'hier !';
    } else {
        document.getElementById('storyAlert').style.display = 'none';
    }
    
    document.getElementById('morningStory').classList.add('show');
    
    setTimeout(() => {
        document.getElementById('storyProgressFill').style.width = '100%';
    }, 100);
    
    setTimeout(() => {
        closeMorningStory();
    }, 6000);
}

function closeMorningStory() {
    document.getElementById('morningStory').classList.remove('show');
    localStorage.setItem('veko_morning_shown', new Date().toDateString());
}

// ============================================
// EVENING RECALL
// ============================================
function checkEveningRecall() {
    const heure = new Date().getHours();
    const aujourdhui = new Date().toDateString();
    const shownToday = localStorage.getItem('veko_evening_shown');
    
    if (heure >= 19 && heure < 23 && shownToday !== aujourdhui) {
        const ventesAujourdhui = ventes.filter(v => {
            const dateVente = new Date(v.date);
            return dateVente.toDateString() === aujourdhui;
        });
        
        const aPubProvisoire = ventesAujourdhui.some(v => v.budgetPubProvisoire === true);
        
        if (ventesAujourdhui.length > 0 && aPubProvisoire) {
            showEveningRecall();
        }
    }
}

function showEveningRecall() {
    document.getElementById('eveningRecall').classList.add('show');
}

function closeEveningRecall() {
    document.getElementById('eveningRecall').classList.remove('show');
    localStorage.setItem('veko_evening_shown', new Date().toDateString());
}

function submitEveningPub() {
    const devise = document.getElementById('eveningDeviseMeta').value;
    const montant = Number(document.getElementById('eveningBudgetPub').value) || 0;
    
    if (montant <= 0) {
        alert('Veuillez entrer un montant valide !');
        return;
    }
    
    let budgetFCFA = montant;
    if (devise !== 'XAF' && devise !== 'FCFA') {
        budgetFCFA = montant * (tauxDeChange[devise] || 1);
    }
    
    const aujourdhui = new Date();
    const ventesAujourdhui = ventes.filter(v => {
        const dateVente = new Date(v.date);
        return dateVente.toDateString() === aujourdhui.toDateString();
    });
    
    if (ventesAujourdhui.length === 0) {
        alert('Aucune vente aujourd\'hui !');
        return;
    }
    
    const budgetParVente = budgetFCFA / ventesAujourdhui.length;
    
    ventes.forEach(v => {
        const dateVente = new Date(v.date);
        if (dateVente.toDateString() === aujourdhui.toDateString()) {
            v.budgetPub = budgetParVente;
            v.budgetPubProvisoire = false;
            v.depensesTotales = v.coutAcquisition + v.commissionTotale + v.budgetPub + v.fraisLivraisonClient;
            v.benefice = v.ca - v.depensesTotales;
        }
    });
    
    sauvegarderDonnees();
    hapticFeedback();
    closeEveningRecall();
    afficherNotification('Budget pub reparti avec succes !', 'success');
    afficherHistorique();
    chargerDashboard();
    suiviObjectifJour();
}

// ============================================
// SUNDAY STRATEGY
// ============================================
function checkSundayStrategy() {
    const jour = new Date().getDay();
    const heure = new Date().getHours();
    const shownThisWeek = localStorage.getItem('veko_sunday_shown');
    const thisWeek = getWeekNumber(new Date());
    
    if (jour === 0 && heure >= 18 && shownThisWeek !== String(thisWeek)) {
        showTab('simulation');
        afficherNotification('Dimanche soir ! C\'est le moment de planifier ta semaine !', 'info');
        localStorage.setItem('veko_sunday_shown', String(thisWeek));
    }
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ============================================
// FAB (Floating Action Button)
// ============================================
function toggleFab() {
    const fabMain = document.getElementById('fabMain');
    const fabMenu = document.getElementById('fabMenu');
    
    fabMain.classList.toggle('active');
    fabMenu.classList.toggle('show');
    hapticFeedback(5);
}

// ============================================
// NOTIFICATIONS PANEL
// ============================================
function openNotifPanel() {
    document.getElementById('notifPanel').classList.add('show');
    document.getElementById('notifOverlay').classList.add('show');
    genererConseilAxis();
    updateNotifList();
}

function closeNotifPanel() {
    document.getElementById('notifPanel').classList.remove('show');
    document.getElementById('notifOverlay').classList.remove('show');
}

function switchNotifTab(tab) {
    document.getElementById('tabNotifs').classList.remove('active');
    document.getElementById('tabConseils').classList.remove('active');
    document.getElementById('notifListNotifs').style.display = 'none';
    document.getElementById('notifListConseils').style.display = 'none';
    
    if (tab === 'notifs') {
        document.getElementById('tabNotifs').classList.add('active');
        document.getElementById('notifListNotifs').style.display = 'block';
    } else {
        document.getElementById('tabConseils').classList.add('active');
        document.getElementById('notifListConseils').style.display = 'block';
    }
}

function updateNotifList() {
    const container = document.getElementById('notifListNotifs');
    let html = '';
    
    const aujourdhui = new Date();
    const ventesAujourdhui = ventes.filter(v => {
        const dateVente = new Date(v.date);
        return dateVente.toDateString() === aujourdhui.toDateString();
    });
    
    const aPubProvisoire = ventesAujourdhui.some(v => v.budgetPubProvisoire === true);
    
    if (aPubProvisoire && ventesAujourdhui.length > 0) {
        html += `
            <div class="notif-item" style="border-left: 4px solid var(--accent-orange);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i class="fas fa-bullhorn" style="color: var(--accent-orange);"></i>
                    <span style="font-weight: 700; color: var(--text-primary);">Budget pub a repartir</span>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
                    ${ventesAujourdhui.length} vente(s) aujourd'hui sans budget pub. N'oublie pas de le repartir !
                </p>
                <button onclick="showTab('historique'); closeNotifPanel();" style="padding: 8px 14px; background: var(--accent-orange); color: white; border: none; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
                    Repartir maintenant
                </button>
            </div>
        `;
    }
    
    projets.forEach(p => {
        const ventesProjet = ventes.filter(v => v.projetId === p.id && !v.retournee);
        const vendus = ventesProjet.reduce((sum, v) => sum + v.nbPieces, 0);
        const restant = (p.nbArticles || 0) - vendus;
        
        if (restant > 0 && restant <= 3) {
            html += `
                <div class="notif-item" style="border-left: 4px solid var(--accent-red);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <i class="fas fa-box" style="color: var(--accent-red);"></i>
                        <span style="font-weight: 700; color: var(--text-primary);">Stock faible: ${p.nom}</span>
                    </div>
                    <p style="font-size: 12px; color: var(--text-muted);">
                        Il ne reste que ${restant} piece(s). Pensez a recommander !
                    </p>
                </div>
            `;
        }
    });
    
    if (html === '') {
        html = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>Aucune alerte pour le moment</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// ============================================
// CONSEILS VEKO
// ============================================
function genererConseilAxis() {
    const container = document.getElementById('notifListConseils');
    if (!container) return;
    
    let conseils = [];
    
    if (ventes.length === 0) {
        conseils.push({
            icon: 'fa-lightbulb',
            color: 'var(--accent-blue)',
            titre: 'Bienvenue sur VEKO !',
            message: 'Commencez par enregistrer vos produits dans l\'onglet Projets, puis ajoutez votre premiere vente.'
        });
    } else {
        const ventesRecentes = ventes.slice(-10);
        const beneficeTotal = ventes.filter(v => !v.retournee).reduce((sum, v) => sum + v.benefice, 0);
        const caTotal = ventes.filter(v => !v.retournee).reduce((sum, v) => sum + v.ca, 0);
        const margeGlobale = caTotal > 0 ? (beneficeTotal / caTotal) * 100 : 0;
        
        if (margeGlobale >= 30) {
            conseils.push({
                icon: 'fa-trophy',
                color: 'var(--accent-green)',
                titre: 'Excellente marge !',
                message: `Votre marge globale de ${margeGlobale.toFixed(1)}% est excellente. Continuez ainsi !`
            });
        } else if (margeGlobale >= 15) {
            conseils.push({
                icon: 'fa-chart-line',
                color: 'var(--accent-orange)',
                titre: 'Marge acceptable',
                message: `Votre marge de ${margeGlobale.toFixed(1)}% est correcte. Essayez d'optimiser vos couts ou d'augmenter vos prix.`
            });
        } else if (margeGlobale > 0) {
            conseils.push({
                icon: 'fa-exclamation-triangle',
                color: 'var(--accent-red)',
                titre: 'Marge faible',
                message: `Attention, votre marge de ${margeGlobale.toFixed(1)}% est trop basse. Revoyez votre strategie de prix.`
            });
        }
        
        if (projets.length > 0) {
            projets.forEach(p => {
                const ventesProjet = ventes.filter(v => v.projetId === p.id && !v.retournee);
                const vendus = ventesProjet.reduce((sum, v) => sum + v.nbPieces, 0);
                const restant = (p.nbArticles || 0) - vendus;
                
                if (restant > 0 && restant <= 3) {
                    conseils.push({
                        icon: 'fa-box',
                        color: 'var(--accent-orange)',
                        titre: `Stock bas: ${p.nom}`,
                        message: `Il ne reste que ${restant} piece(s). Anticipez votre prochaine commande pour ne pas manquer de ventes !`
                    });
                }
            });
        }
        
        const ventesRetournees = ventes.filter(v => v.retournee);
        if (ventesRetournees.length > 0) {
            const pertesTotales = ventesRetournees.reduce((sum, v) => sum + Math.abs(v.benefice), 0);
            conseils.push({
                icon: 'fa-undo',
                color: 'var(--accent-red)',
                titre: 'Retours detectes',
                message: `${ventesRetournees.length} commande(s) retournee(s) pour ${Math.round(pertesTotales).toLocaleString()} F de pertes. Analysez les raisons.`
            });
        }
        
        if (conseils.length === 0) {
            conseils.push({
                icon: 'fa-check-circle',
                color: 'var(--accent-green)',
                titre: 'Tout va bien !',
                message: `Vous avez realise ${ventes.length} vente(s) pour un benefice total de ${Math.round(beneficeTotal).toLocaleString()} F. Continuez !`
            });
        }
    }
    
    let html = conseils.map(c => `
        <div class="notif-item">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <i class="fas ${c.icon}" style="color: ${c.color};"></i>
                <span style="font-weight: 700; color: var(--text-primary);">${c.titre}</span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted);">${c.message}</p>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// ============================================
// NAVIGATION
// ============================================
function showTab(tab) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById('page-' + tab).classList.add('active');
    
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.remove('active');
    });
    
    document.querySelectorAll('.desktop-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const desktopItem = document.querySelector(`.desktop-nav-item[data-tab="${tab}"]`);
    if (desktopItem) {
        desktopItem.classList.add('active');
    }
    
    const navMap = {
        'dashboard': 'navDashboard',
        'nouvelle': 'navCalcul',
        'projets': 'navProjets',
        'historique': 'navHistorique',
        'simulation': 'navSimulation',
        'clients': 'navClients'
    };
    
    const navId = navMap[tab];
    if (navId) {
        const navBtn = document.getElementById(navId);
        if (navBtn) {
            navBtn.classList.add('active');
        }
    }
    
    if (tab === 'historique') {
        afficherHistorique();
        updateFiltreProduit();
    }
    
    if (tab === 'clients') {
        afficherClients();
    }
    
    if (tab === 'simulation') {
        calculerSimulation();
    }
    
    if (tab === 'dashboard') {
        chargerDashboard();
        updateActivityRing();
    }

    if (tab === 'parametres') {
        loadSettingsPage();
    }
}

// ============================================
// DEVISE
// ============================================
function openModalDevise() {
    document.getElementById('modalDevise').style.display = 'block';
    document.getElementById('selectDevise').value = deviseActuelle;
}

function closeModalDevise() {
    document.getElementById('modalDevise').style.display = 'none';
}

function saveDevise() {
    deviseActuelle = document.getElementById('selectDevise').value;
    localStorage.setItem('veko_devise', deviseActuelle);
    
    document.querySelectorAll('#deviseActuelle, #deviseActuelleDesktop').forEach(el => {
        el.textContent = deviseActuelle;
    });
    document.querySelectorAll('.devise-label').forEach(el => {
        el.textContent = deviseActuelle;
    });
    
    hapticFeedback();
    closeModalDevise();
    afficherNotification('Devise mise a jour: ' + deviseActuelle, 'success');
    
    chargerDashboard();
    afficherHistorique();
}

// ============================================
// PROJETS
// ============================================
let typeProjet = 'fournisseur';

function changerTypeProjet(type) {
    typeProjet = type;
    const btnF = document.getElementById('btnProjetFournisseur');
    const btnP = document.getElementById('btnProjetProduction');
    const formF = document.getElementById('projetFormFournisseur');
    const formP = document.getElementById('projetFormProduction');
    if (type === 'fournisseur') {
        btnF.className = 'btn btn-primary'; btnF.style.flex = '1'; btnF.style.padding = '12px'; btnF.style.fontSize = '13px';
        btnP.className = 'btn btn-secondary'; btnP.style.flex = '1'; btnP.style.padding = '12px'; btnP.style.fontSize = '13px';
        formF.classList.remove('hidden');
        formP.classList.add('hidden');
    } else {
        btnP.className = 'btn btn-primary'; btnP.style.flex = '1'; btnP.style.padding = '12px'; btnP.style.fontSize = '13px';
        btnF.className = 'btn btn-secondary'; btnF.style.flex = '1'; btnF.style.padding = '12px'; btnF.style.fontSize = '13px';
        formP.classList.remove('hidden');
        formF.classList.add('hidden');
    }
}

function openModalProjet() {
    projetEnCoursEdition = null;
    document.getElementById('modalProjet').style.display = 'block';
    document.getElementById('projetNom').value = '';
    document.getElementById('projetPrixVente').value = '';
    document.getElementById('projetPrixAchat').value = '';
    document.getElementById('projetNbArticles').value = '';
    document.getElementById('projetFraisLivraison').value = '0';
    document.getElementById('projetCoutMatieres').value = '';
    document.getElementById('projetCoutMainOeuvre').value = '';
    document.getElementById('projetAutresFrais').value = '0';
    document.getElementById('projetNbProduits').value = '';
    changerTypeProjet('fournisseur');
}

function closeModalProjet() {
    document.getElementById('modalProjet').style.display = 'none';
}

function sauvegarderProjet() {
    const nom = document.getElementById('projetNom').value.trim();
    const prixVenteProjet = Number(document.getElementById('projetPrixVente').value) || 0;
    
    if (!nom) {
        alert('Veuillez entrer un nom de produit !');
        return;
    }

    let coutTotal, nbArticles, prixRevientCalc, projet;

    if (typeProjet === 'fournisseur') {
        const prixAchat = Number(document.getElementById('projetPrixAchat').value) || 0;
        nbArticles = Number(document.getElementById('projetNbArticles').value) || 0;
        const fraisLivraison = Number(document.getElementById('projetFraisLivraison').value) || 0;
        
        if (prixAchat <= 0 || nbArticles <= 0) {
            alert('Veuillez remplir tous les champs obligatoires !');
            return;
        }
        
        coutTotal = (prixAchat * nbArticles) + fraisLivraison;
        prixRevientCalc = coutTotal / nbArticles;
        
        projet = {
            id: Date.now(),
            nom: nom,
            type: 'fournisseur',
            prixAchat: prixAchat,
            prixVente: prixVenteProjet,
            nbArticles: nbArticles,
            fraisLivraison: fraisLivraison,
            prixRevient: prixRevientCalc,
            dateCreation: new Date().toISOString()
        };
    } else {
        const coutMatieres = Number(document.getElementById('projetCoutMatieres').value) || 0;
        const coutMainOeuvre = Number(document.getElementById('projetCoutMainOeuvre').value) || 0;
        const autresFrais = Number(document.getElementById('projetAutresFrais').value) || 0;
        nbArticles = Number(document.getElementById('projetNbProduits').value) || 0;
        
        if (coutMatieres <= 0 || nbArticles <= 0) {
            alert('Veuillez remplir tous les champs obligatoires !');
            return;
        }
        
        coutTotal = coutMatieres + coutMainOeuvre + autresFrais;
        prixRevientCalc = coutTotal / nbArticles;
        
        projet = {
            id: Date.now(),
            nom: nom,
            type: 'production',
            prixVente: prixVenteProjet,
            coutMatieres: coutMatieres,
            coutMainOeuvre: coutMainOeuvre,
            autresFrais: autresFrais,
            nbArticles: nbArticles,
            prixRevient: prixRevientCalc,
            dateCreation: new Date().toISOString()
        };
    }
    
    if (projetEnCoursEdition) {
        projet.id = projetEnCoursEdition;
        const idx = projets.findIndex(p => p.id === projetEnCoursEdition);
        if (idx !== -1) projets[idx] = projet; else projets.push(projet);
        projetEnCoursEdition = null;
    } else {
        projets.push(projet);
    }
    sauvegarderDonnees();
    
    hapticFeedback();
    closeModalProjet();
    afficherProjets();
    updateSelectProjet();
    updateChartProduitSelect();
    afficherNotification('Produit ajoute: ' + nom, 'success');
    setTimeout(() => showFelicitation('Nouveau produit ajoute !'), 300);
}

function afficherProjets() {
    const container = document.getElementById('listeProjets');
    
    if (projets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>Aucun produit enregistre.<br>Cliquez sur "Nouveau" pour commencer !</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    projets.forEach(p => {
        const ventesProjet = ventes.filter(v => v.projetId === p.id && !v.retournee);
        const vendus = ventesProjet.reduce((sum, v) => sum + v.nbPieces, 0);
        const restant = (p.nbArticles || 0) - vendus;
        const beneficeProjet = ventesProjet.reduce((sum, v) => sum + v.benefice, 0);
        
        const couleurStock = restant <= 0 ? 'var(--accent-red)' : restant <= 3 ? 'var(--accent-orange)' : 'var(--accent-green)';
        
        html += `
            <div class="commande-item" style="border-left: 4px solid ${couleurStock};">
                <div class="commande-header">
                    <div>
                        <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${p.nom}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">
                            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; margin-right: 4px; background: ${p.type === 'production' ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)'}; color: ${p.type === 'production' ? 'var(--accent-purple)' : 'var(--accent-blue)'};">${p.type === 'production' ? 'PRODUCTION' : 'FOURNISSEUR'}</span>
                            Prix revient: ${Math.round(p.prixRevient).toLocaleString()} ${deviseActuelle}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 16px; font-weight: 900; color: ${couleurStock};">
                            ${restant} restant(s)
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted);">
                            sur ${p.nbArticles}
                        </div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                    <div style="font-size: 12px; color: var(--text-muted);">
                        ${ventesProjet.length} vente(s) | Benefice: <span style="color: ${beneficeProjet >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight: 700;">${Math.round(beneficeProjet).toLocaleString()} ${deviseActuelle}</span>
                    </div>
                    <button onclick="supprimerProjet(${p.id})" style="padding: 6px 12px; background: var(--accent-red); color: white; border: none; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button onclick="ouvrirModifierProjet(${p.id})" style="padding: 6px 12px; background: var(--accent-blue); color: white; border: none; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer; margin-left: 4px;">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function supprimerProjet(projetId) {
    if (!confirm('Supprimer ce produit ?')) return;
    
    projets = projets.filter(p => p.id !== projetId);
    sauvegarderDonnees();
    hapticFeedback();
    afficherProjets();
    updateSelectProjet();
    updateChartProduitSelect();
    afficherNotification('Produit supprime', 'success');
}

function updateSelectProjet() {
    const select = document.getElementById('selectProjet');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Saisie manuelle --</option>';
    
    projets.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nom} (${Math.round(p.prixRevient).toLocaleString()} F)</option>`;
    });
    
    select.value = currentValue;
}

function updateChartProduitSelect() {
    const select = document.getElementById('chartProduitSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Tous</option>';
    projets.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nom}</option>`;
    });
}

function chargerProjetDansCalcul() {
    const projetId = Number(document.getElementById('selectProjet').value);
    
    if (!projetId) {
        document.getElementById('prixAchatUnit').value = '';
        document.getElementById('nbArticlesAchetes').value = '';
        document.getElementById('fraisLivraisonFournisseur').value = '';
        document.getElementById('resultRevient').classList.add('hidden');
        prixRevient = 0;
        return;
    }
    
    const projet = projets.find(p => p.id === projetId);
    
    document.getElementById('prixAchatUnit').value = projet.prixAchat;
    document.getElementById('nbArticlesAchetes').value = projet.nbArticles;
    document.getElementById('fraisLivraisonFournisseur').value = projet.fraisLivraison;
    
    if (projet.prixVente && projet.prixVente > 0) {
        document.getElementById('prixVenteUnit').value = projet.prixVente;
    }
    
    const coutTotal = (projet.prixAchat * projet.nbArticles) + projet.fraisLivraison;
    prixRevient = projet.prixRevient;
    
    document.getElementById('coutTotalAchat').textContent = coutTotal.toLocaleString();
    document.getElementById('prixRevientUnit').textContent = Math.round(prixRevient).toLocaleString();
    document.getElementById('resultRevient').classList.remove('hidden');
}

// ============================================
// CALCUL FOURNISSEUR/PRODUCTION
// ============================================
function changerTypeCalcul(type) {
    typeCalcul = type;
    
    if (type === 'fournisseur') {
        document.getElementById('etape1Title').textContent = 'ETAPE 1 : Calcul Fournisseur';
        document.getElementById('formFournisseur').classList.remove('hidden');
        document.getElementById('formProduction').classList.add('hidden');
        document.getElementById('btnFournisseur').classList.remove('btn-secondary');
        document.getElementById('btnFournisseur').classList.add('btn-primary');
        document.getElementById('btnProduction').classList.remove('btn-primary');
        document.getElementById('btnProduction').classList.add('btn-secondary');
    } else {
        document.getElementById('etape1Title').textContent = 'ETAPE 1 : Cout de Production';
        document.getElementById('formFournisseur').classList.add('hidden');
        document.getElementById('formProduction').classList.remove('hidden');
        document.getElementById('btnFournisseur').classList.remove('btn-primary');
        document.getElementById('btnFournisseur').classList.add('btn-secondary');
        document.getElementById('btnProduction').classList.remove('btn-secondary');
        document.getElementById('btnProduction').classList.add('btn-primary');
    }
    
    document.getElementById('resultRevient').classList.add('hidden');
    prixRevient = 0;
}

function calculerRevient() {
    if (typeCalcul === 'fournisseur') {
        const prixAchatUnit = Number(document.getElementById('prixAchatUnit').value) || 0;
        const nbArticles = Number(document.getElementById('nbArticlesAchetes').value) || 0;
        const fraisLivraison = Number(document.getElementById('fraisLivraisonFournisseur').value) || 0;
        
        if (prixAchatUnit === 0 || nbArticles === 0) {
            document.getElementById('resultRevient').classList.add('hidden');
            return;
        }
        
        const coutTotal = (prixAchatUnit * nbArticles) + fraisLivraison;
        prixRevient = coutTotal / nbArticles;
        
        document.getElementById('coutTotalAchat').textContent = coutTotal.toLocaleString();
        document.getElementById('prixRevientUnit').textContent = Math.round(prixRevient).toLocaleString();
        document.getElementById('resultRevient').classList.remove('hidden');
    } else {
        const coutMatieres = Number(document.getElementById('coutMatieres').value) || 0;
        const coutMainOeuvre = Number(document.getElementById('coutMainOeuvre').value) || 0;
        const autresFrais = Number(document.getElementById('autresFrais').value) || 0;
        const nbProduits = Number(document.getElementById('nbProduitsProduction').value) || 0;
        
        if (nbProduits === 0 || (coutMatieres === 0 && coutMainOeuvre === 0)) {
            document.getElementById('resultRevient').classList.add('hidden');
            return;
        }
        
        const coutTotal = coutMatieres + coutMainOeuvre + autresFrais;
        prixRevient = coutTotal / nbProduits;
        
        document.getElementById('coutTotalAchat').textContent = coutTotal.toLocaleString();
        document.getElementById('prixRevientUnit').textContent = Math.round(prixRevient).toLocaleString();
        document.getElementById('resultRevient').classList.remove('hidden');
    }
    
    calculerCommande();
}

// ============================================
// TOGGLE BUDGET PUB ET COMMISSION
// ============================================
function toggleBudgetPubInput() {
    const option = document.getElementById('budgetPubOption').value;
    const input = document.getElementById('budgetPub');
    if (option === 'aucun') {
        input.value = 0;
        input.disabled = true;
        input.style.opacity = '0.5';
    } else {
        input.disabled = false;
        input.style.opacity = '1';
    }
    calculerCommande();
}

function toggleCommissionInput() {
    const option = document.getElementById('commissionOption').value;
    const input = document.getElementById('commissionStock');
    if (option === 'moi-meme') {
        input.value = 0;
        input.disabled = true;
        input.style.opacity = '0.5';
    } else {
        input.disabled = false;
        input.style.opacity = '1';
    }
    calculerCommande();
}

// ============================================
// CALCUL COMMANDE
// ============================================
function calculerCommande() {
    const nbPieces = Number(document.getElementById('nbPiecesCommande').value) || 0;
    const prixVente = Number(document.getElementById('prixVenteUnit').value) || 0;
    const budgetPub = Number(document.getElementById('budgetPub').value) || 0;
    const fraisLivClient = Number(document.getElementById('fraisLivraisonClient').value) || 0;
    const commissionUnit = Number(document.getElementById('commissionStock').value) || 0;
    
    if (nbPieces === 0 || prixVente === 0 || prixRevient === 0) {
        document.getElementById('resultCommande').classList.add('hidden');
        return;
    }
    
    const ca = nbPieces * prixVente;
    const coutAcquisition = nbPieces * prixRevient;
    const commissionTotale = nbPieces * commissionUnit;
    const depensesTotales = coutAcquisition + commissionTotale + budgetPub + fraisLivClient;
    const benefice = ca - depensesTotales;
    
    document.getElementById('ca').textContent = formatMontant(ca) + ' ' + deviseActuelle;
    document.getElementById('coutAcquisition').textContent = formatMontant(coutAcquisition) + ' ' + deviseActuelle;
    document.getElementById('commissionTotale').textContent = formatMontant(commissionTotale) + ' ' + deviseActuelle;
    
    if (pubChoix === 'oui' && budgetPub === 0) {
        document.getElementById('pubTotal').innerHTML = '<span style="color: var(--accent-orange);">0 ' + deviseActuelle + ' (a repartir)</span>';
    } else {
        document.getElementById('pubTotal').textContent = formatMontant(budgetPub) + ' ' + deviseActuelle;
    }
    
    document.getElementById('livraisonTotal').textContent = formatMontant(fraisLivClient) + ' ' + deviseActuelle;
    document.getElementById('depensesTotales').textContent = formatMontant(depensesTotales) + ' ' + deviseActuelle;
    
    const beneficeElem = document.getElementById('beneficeNet');
    if (pubChoix === 'oui' && budgetPub === 0) {
        beneficeElem.innerHTML = formatMontant(benefice) + ' ' + deviseActuelle + ' <span style="font-size: 14px; color: var(--accent-orange);">(provisoire)</span>';
    } else if (pubChoix === 'non') {
        beneficeElem.innerHTML = formatMontant(benefice) + ' ' + deviseActuelle + ' <span style="font-size: 14px; color: var(--accent-green);">(d\u00e9finitif)</span>';
    } else {
        beneficeElem.textContent = formatMontant(benefice) + ' ' + deviseActuelle;
    }
    beneficeElem.className = 'result-value ' + (benefice >= 0 ? '' : 'negative');
    
    document.getElementById('resultCommande').classList.remove('hidden');
}

// ============================================
// REINITIALISER ETAPE 2
// ============================================
function reinitialiserEtape2() {
    document.getElementById('nomClient').value = '';
    document.getElementById('telClient').value = '';
    document.getElementById('nbPiecesCommande').value = '';
    document.getElementById('prixVenteUnit').value = '';
    document.getElementById('budgetPub').value = '0';
    document.getElementById('fraisLivraisonClient').value = '0';
    document.getElementById('commissionStock').value = '0';
    document.getElementById('resultCommande').classList.add('hidden');
    
    pubChoix = 'non';
    commChoix = 'non';
    togglePubChoix('non');
    toggleCommissionChoix('non');
    
    hapticFeedback();
    afficherNotification('Formulaire reinitialise', 'info');
}

// ============================================
// ENREGISTRER VENTE
// ============================================
function enregistrerVente() {
    const nomClient = document.getElementById('nomClient').value.trim() || 'Client';
    const telClient = document.getElementById('telClient').value.trim() || '';
    const projetId = Number(document.getElementById('selectProjet').value) || null;
    const projetNom = projetId ? projets.find(p => p.id === projetId)?.nom : null;
    const nbPieces = Number(document.getElementById('nbPiecesCommande').value) || 0;
    const prixVente = Number(document.getElementById('prixVenteUnit').value) || 0;
    const budgetPub = Number(document.getElementById('budgetPub').value) || 0;
    const fraisLivClient = Number(document.getElementById('fraisLivraisonClient').value) || 0;
    const commissionUnit = Number(document.getElementById('commissionStock').value) || 0;
    
    if (nbPieces === 0 || prixVente === 0 || prixRevient === 0) {
        alert('Veuillez completer toutes les informations !');
        return;
    }
    
    const ca = nbPieces * prixVente;
    const coutAcquisition = nbPieces * prixRevient;
    const commissionTotale = nbPieces * commissionUnit;
    const depensesTotales = coutAcquisition + commissionTotale + budgetPub + fraisLivClient;
    const benefice = ca - depensesTotales;
    
    const vente = {
        id: Date.now(),
        date: new Date().toISOString(),
        nomClient: nomClient,
        telClient: telClient,
        projetId: projetId,
        projetNom: projetNom,
        nbPieces: nbPieces,
        prixVenteUnit: prixVente,
        prixRevientUnit: prixRevient,
        ca: ca,
        coutAcquisition: coutAcquisition,
        commissionUnit: commissionUnit,
        commissionTotale: commissionTotale,
        budgetPub: budgetPub,
        budgetPubProvisoire: pubChoix === 'oui' && budgetPub === 0,
        pasDeFraisPub: pubChoix === 'non',
        gestionnaireOption: commChoix,
        fraisLivraisonClient: fraisLivClient,
        depensesTotales: depensesTotales,
        benefice: benefice
    };
    
    ventes.push(vente);
    sauvegarderDonnees();
    suiviObjectifJour();
    
    afficherNotification('Vente enregistree !', 'success');
    
    const nbVentesTotal = ventes.filter(v => !v.retournee).length;
    if (nbVentesTotal === 1) {
        setTimeout(() => showFelicitation('Premiere vente enregistree ! Vous avez debloque la categorie Bronze. Continuez pour progresser !'), 500);
    } else {
        setTimeout(() => showFelicitation('Bravo ! Commande enregistree avec succes.'), 300);
    }
    updateProgression();
    try { afficherClients(); } catch(e) {}
    try { chargerDashboard(); } catch(e) {}
    try { afficherHistorique(); } catch(e) {}
    try { updateActivityRing(); } catch(e) {}
    try { updateMicroBadge(); } catch(e) {}
    try { afficherProjets(); } catch(e) {}
    
    document.getElementById('nomClient').value = '';
    document.getElementById('telClient').value = '';
    document.getElementById('nbPiecesCommande').value = '';
    document.getElementById('prixVenteUnit').value = '';
    document.getElementById('budgetPub').value = '0';
    document.getElementById('fraisLivraisonClient').value = '0';
    document.getElementById('commissionStock').value = '0';
    document.getElementById('resultCommande').classList.add('hidden');
    
    pubChoix = 'non';
    commChoix = 'non';
    document.getElementById('btnPubOui').className = 'btn btn-secondary';
    document.getElementById('btnPubNon').className = 'btn btn-secondary';
    document.getElementById('zoneBudgetPubInput').classList.add('hidden');
    document.getElementById('btnCommOui').className = 'btn btn-secondary';
    document.getElementById('btnCommNon').className = 'btn btn-secondary';
    document.getElementById('zoneCommissionInput').classList.add('hidden');
}

// ============================================
// HISTORIQUE
// ============================================
function filtrerPeriode(periode) {
    periodeActive = periode;
    
    ['jour', 'semaine', 'mois', 'tout'].forEach(p => {
        const btn = document.getElementById('btn-' + p);
        if (btn) {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        }
    });
    
    const activeBtn = document.getElementById('btn-' + periode);
    if (activeBtn) {
        activeBtn.classList.remove('btn-secondary');
        activeBtn.classList.add('btn-primary');
    }
    
    afficherHistorique();
}

function filtrerVentesPeriode() {
    const maintenant = new Date();
    const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    
    if (periodeActive === 'tout') {
        return ventes;
    }
    
    return ventes.filter(v => {
        const dateVente = new Date(v.date);
        
        if (periodeActive === 'jour') {
            return dateVente >= aujourdhui;
        } else if (periodeActive === 'semaine') {
            const debutSemaine = new Date(aujourdhui);
            debutSemaine.setDate(aujourdhui.getDate() - aujourdhui.getDay() + 1);
            return dateVente >= debutSemaine;
        } else if (periodeActive === 'mois') {
            const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
            return dateVente >= debutMois;
        }
        
        return true;
    });
}

function getCouleurBenefice(benefice, ca) {
    const marge = ca > 0 ? (benefice / ca) * 100 : 0;
    
    if (benefice < 0) {
        return { color: 'var(--accent-red)', emoji: '🔴', label: 'PERTE' };
    } else if (marge >= 30) {
        return { color: 'var(--accent-green)', emoji: '🟢', label: 'EXCELLENT' };
    } else if (marge >= 15) {
        return { color: 'var(--accent-orange)', emoji: '🟡', label: 'MOYEN' };
    } else {
        return { color: 'var(--accent-red)', emoji: '🔴', label: 'FAIBLE' };
    }
}

function afficherHistorique() {
    let ventesFiltrees = filtrerVentesPeriode();
    
    const searchVal = (document.getElementById('searchClient')?.value || '').trim().toLowerCase();
    if (searchVal) {
        ventesFiltrees = ventesFiltrees.filter(v => {
            const nom = (v.nomClient || '').toLowerCase();
            const tel = (v.telClient || '').toLowerCase();
            const produit = (v.projetNom || '').toLowerCase();
            return nom.includes(searchVal) || tel.includes(searchVal) || produit.includes(searchVal);
        });
    }
    
    updateSearchSuggestions();
    
    const filtreProduit = document.getElementById('filtreProduit')?.value || '';
    if (filtreProduit) {
        ventesFiltrees = ventesFiltrees.filter(v => v.projetNom === filtreProduit);
    }
    
    const dateDebut = document.getElementById('filtreeDateDebut')?.value;
    const dateFin = document.getElementById('filtreeDateFin')?.value;
    if (dateDebut) {
        ventesFiltrees = ventesFiltrees.filter(v => new Date(v.date) >= new Date(dateDebut));
    }
    if (dateFin) {
        const df = new Date(dateFin);
        df.setHours(23, 59, 59, 999);
        ventesFiltrees = ventesFiltrees.filter(v => new Date(v.date) <= df);
    }
    
    const ventesAujourdhui = ventes.filter(v => {
        const dateVente = new Date(v.date);
        const aujourdhui = new Date();
        return dateVente.toDateString() === aujourdhui.toDateString();
    });
    
    const aPubProvisoire = ventesAujourdhui.some(v => v.budgetPubProvisoire === true);
    
    const cardRepartir = document.getElementById('cardRepartirPub');
    if (cardRepartir) {
        if (periodeActive === 'jour' && aPubProvisoire && ventesAujourdhui.length > 0) {
            cardRepartir.style.display = 'block';
        } else {
            cardRepartir.style.display = 'none';
        }
    }
    
    const nbVentes = ventesFiltrees.length;
    const beneficeTotal = ventesFiltrees.reduce((sum, v) => sum + v.benefice, 0);
    const caTotal = ventesFiltrees.reduce((sum, v) => sum + v.ca, 0);
    const depensesTotal = ventesFiltrees.reduce((sum, v) => sum + v.depensesTotales, 0);
    const marge = caTotal > 0 ? ((beneficeTotal / caTotal) * 100).toFixed(1) : 0;
    
    const couleurStats = getCouleurBenefice(beneficeTotal, caTotal);
    
    document.getElementById('statNbVentes').textContent = nbVentes;
    
    const beneficeElem = document.getElementById('statBenefice');
    beneficeElem.innerHTML = `<span style="color: ${couleurStats.color};">${couleurStats.emoji} ${Math.round(beneficeTotal).toLocaleString()} ${deviseActuelle}</span>`;
    
    document.getElementById('statCA').textContent = Math.round(caTotal).toLocaleString() + ' ' + deviseActuelle;
    document.getElementById('statDepenses').textContent = Math.round(depensesTotal).toLocaleString() + ' ' + deviseActuelle;
    
    const margeElem = document.getElementById('statMarge');
    margeElem.textContent = marge + '%';
    margeElem.style.color = couleurStats.color;
    
    const panierMoyen = nbVentes > 0 ? Math.round(caTotal / nbVentes) : 0;
    const panierMoyenElem = document.getElementById('statPanierMoyen');
    if (panierMoyenElem) panierMoyenElem.textContent = panierMoyen.toLocaleString() + ' ' + deviseActuelle;
    
    afficherPerformanceProjets(ventesFiltrees);
    
    const container = document.getElementById('listeVentes');
    
    if (ventesFiltrees.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Aucune vente pour cette periode</p>
            </div>
        `;
        return;
    }
    
    const ventesTries = [...ventesFiltrees].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    ventesTries.forEach(v => {
        const date = new Date(v.date);
        const dateStr = date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const provisoireTag = v.budgetPubProvisoire ? ' <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: var(--accent-orange); font-size: 9px;">PROVISOIRE</span>' : '';
        const nomClient = v.nomClient || 'Client';
        const projetTag = v.projetNom ? ` <span class="badge" style="font-size: 9px;">${v.projetNom}</span>` : '';
        
        const couleur = getCouleurBenefice(v.benefice, v.ca);
        
        html += `
            <div class="commande-item" style="border-left: 4px solid ${couleur.color}; cursor: pointer;" onclick="toggleCommandeDetails(${v.id})">
                <div class="commande-header">
                    <div>
                        <span class="commande-date">${dateStr}${provisoireTag}${projetTag}</span>
                        <div style="font-size: 12px; color: var(--accent-blue); font-weight: 600; margin-top: 4px;">
                            <i class="fas fa-user" style="font-size: 10px;"></i> ${nomClient}
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div>
                            <div class="commande-benefice" style="color: ${couleur.color};">
                                ${couleur.emoji} ${Math.round(v.benefice).toLocaleString()} ${deviseActuelle}
                            </div>
                            <div style="font-size: 9px; color: ${couleur.color}; font-weight: 700; text-align: right; margin-top: 2px;">
                                ${couleur.label}
                            </div>
                        </div>
                        <i class="fas fa-chevron-down" style="color: var(--text-muted); font-size: 10px;"></i>
                    </div>
                </div>
                <div id="cmd-details-${v.id}" style="display: none; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--diamond-border);">
                    <div class="commande-details">
                        <strong>${v.nbPieces} piece(s)</strong> vendues a <strong>${v.prixVenteUnit.toLocaleString()} ${deviseActuelle}</strong><br>
                        CA: ${Math.round(v.ca).toLocaleString()} ${deviseActuelle} | Depenses: ${Math.round(v.depensesTotales).toLocaleString()} ${deviseActuelle}
                        ${v.telClient ? '<br><i class="fas fa-phone" style="font-size: 10px;"></i> ' + v.telClient : ''}
                        ${v.budgetPub > 0 ? '<br>Pub: ' + Math.round(v.budgetPub).toLocaleString() + ' ' + deviseActuelle : ''}
                        ${v.fraisLivraisonClient > 0 ? '<br>Livraison: ' + Math.round(v.fraisLivraisonClient).toLocaleString() + ' ' + deviseActuelle : ''}
                        ${v.commissionTotale > 0 ? '<br>Commission: ' + Math.round(v.commissionTotale).toLocaleString() + ' ' + deviseActuelle : ''}
                    </div>
                    <div style="margin-top: 10px; display: flex; gap: 8px;" onclick="event.stopPropagation()">
                        <button onclick="marquerRetournee(${v.id})" style="padding: 6px 12px; background: var(--accent-orange); color: white; border: none; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-undo"></i> Retournee
                        </button>
                        <button onclick="supprimerVente(${v.id})" style="padding: 6px 12px; background: var(--accent-red); color: white; border: none; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function afficherPerformanceProjets(ventesAffichees) {
    const container = document.getElementById('performanceProjets');
    const card = document.getElementById('cardPerformanceProjets');
    
    if (!container || !card) return;
    
    if (projets.length === 0) {
        card.style.display = 'none';
        return;
    }
    
    const statsProjets = {};
    
    projets.forEach(p => {
        const ventesProjet = ventesAffichees.filter(v => v.projetId === p.id);
        if (ventesProjet.length > 0) {
            const benefice = ventesProjet.reduce((sum, v) => sum + v.benefice, 0);
            const ca = ventesProjet.reduce((sum, v) => sum + v.ca, 0);
            statsProjets[p.id] = {
                nom: p.nom,
                prixRevient: p.prixRevient,
                nbVentes: ventesProjet.length,
                benefice: benefice,
                ca: ca
            };
        }
    });
    
    if (Object.keys(statsProjets).length === 0) {
        card.style.display = 'none';
        return;
    }
    
    card.style.display = 'block';
    
    let html = '';
    Object.values(statsProjets).forEach(stat => {
        const couleur = getCouleurBenefice(stat.benefice, stat.ca);
        html += `
            <div class="info-row">
                <div>
                    <div style="font-weight: 700; color: var(--text-primary);">${stat.nom}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${stat.nbVentes} vente(s) | Revient: ${Math.round(stat.prixRevient).toLocaleString()} ${deviseActuelle}</div>
                </div>
                <div>
                    <div style="font-weight: 900; font-size: 15px; color: ${couleur.color};">
                        ${couleur.emoji} ${Math.round(stat.benefice).toLocaleString()} ${deviseActuelle}
                    </div>
                    <div style="font-size: 9px; color: ${couleur.color}; font-weight: 700; text-align: right;">
                        ${couleur.label}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function supprimerVente(id) {
    if (!confirm('Supprimer cette vente ?')) return;
    
    ventes = ventes.filter(v => v.id !== id);
    sauvegarderDonnees();
    hapticFeedback();
    afficherHistorique();
    updateMicroBadge();
    updateActivityRing();
    suiviObjectifJour();
    afficherNotification('Vente supprimee', 'success');
}

function marquerRetournee(id) {
    const vente = ventes.find(v => v.id === id);
    if (!vente) return;
    
    if (!confirm(`Marquer comme retournee ?\n\nClient: ${vente.nomClient || 'Client'}\nMontant: ${Math.round(vente.ca).toLocaleString()} F`)) {
        return;
    }
    
    vente.retournee = true;
    vente.benefice = -Math.abs(vente.depensesTotales);
    vente.ca = 0;
    
    sauvegarderDonnees();
    hapticFeedback();
    afficherHistorique();
    updateMicroBadge();
    updateActivityRing();
    suiviObjectifJour();
    genererConseilAxis();
    afficherNotification('Commande marquee comme retournee', 'warning');
}

// ============================================
// REPARTIR PUB
// ============================================
function calculerConversionPub() {
    const devise = document.getElementById('deviseMeta').value;
    const montant = Number(document.getElementById('budgetPubJour').value) || 0;
    
    document.getElementById('deviseMetaLabel').textContent = devise;
    
    if (montant > 0 && devise !== 'XAF' && devise !== 'FCFA') {
        const converti = montant * (tauxDeChange[devise] || 1);
        document.getElementById('montantConverti').textContent = Math.round(converti).toLocaleString() + ' FCFA';
        document.getElementById('resultatConversion').style.display = 'block';
    } else {
        document.getElementById('resultatConversion').style.display = 'none';
    }
}

function repartirPubJour() {
    const devise = document.getElementById('deviseMeta').value;
    const montant = Number(document.getElementById('budgetPubJour').value) || 0;
    
    if (montant <= 0) {
        alert('Veuillez entrer un montant valide !');
        return;
    }
    
    let budgetFCFA = montant;
    if (devise !== 'XAF' && devise !== 'FCFA') {
        budgetFCFA = montant * (tauxDeChange[devise] || 1);
    }
    
    const aujourdhui = new Date();
    const ventesAujourdhui = ventes.filter(v => {
        const dateVente = new Date(v.date);
        return dateVente.toDateString() === aujourdhui.toDateString();
    });
    
    if (ventesAujourdhui.length === 0) {
        alert('Aucune vente aujourd\'hui !');
        return;
    }
    
    const budgetParVente = budgetFCFA / ventesAujourdhui.length;
    
    if (!confirm(`Repartir ${Math.round(budgetFCFA).toLocaleString()} FCFA sur ${ventesAujourdhui.length} vente(s) ?\n\nCout pub par vente: ${Math.round(budgetParVente).toLocaleString()} FCFA`)) {
        return;
    }
    
    ventes.forEach(v => {
        const dateVente = new Date(v.date);
        if (dateVente.toDateString() === aujourdhui.toDateString()) {
            v.budgetPub = budgetParVente;
            v.budgetPubProvisoire = false;
            v.depensesTotales = v.coutAcquisition + v.commissionTotale + v.budgetPub + v.fraisLivraisonClient;
            v.benefice = v.ca - v.depensesTotales;
        }
    });
    
    sauvegarderDonnees();
    document.getElementById('budgetPubJour').value = '';
    document.getElementById('resultatConversion').style.display = 'none';
    hapticFeedback(50);
    afficherHistorique();
    updateMicroBadge();
    updateActivityRing();
    suiviObjectifJour();
    afficherNotification('Budget pub reparti !', 'success');
}

// ============================================
// SIMULATION
// ============================================
let typeSimulation = 'fournisseur';

function changerTypeSimulation(type) {
    typeSimulation = type;
    
    if (type === 'fournisseur') {
        document.getElementById('simBtnFournisseur').classList.remove('btn-secondary');
        document.getElementById('simBtnFournisseur').classList.add('btn-primary');
        document.getElementById('simBtnProduction').classList.remove('btn-primary');
        document.getElementById('simBtnProduction').classList.add('btn-secondary');
        document.getElementById('simZoneFournisseur').style.display = 'block';
        document.getElementById('simZoneProduction').style.display = 'none';
    } else {
        document.getElementById('simBtnProduction').classList.remove('btn-secondary');
        document.getElementById('simBtnProduction').classList.add('btn-primary');
        document.getElementById('simBtnFournisseur').classList.remove('btn-primary');
        document.getElementById('simBtnFournisseur').classList.add('btn-secondary');
        document.getElementById('simZoneFournisseur').style.display = 'none';
        document.getElementById('simZoneProduction').style.display = 'block';
    }
    
    calculerSimulation();
}

function calculerSimulation() {
    let prixRevientSim = 0;
    
    if (typeSimulation === 'fournisseur') {
        const prixAchat = Number(document.getElementById('simPrixAchat').value) || 0;
        const quantite = Number(document.getElementById('simQuantite').value) || 0;
        const fraisLiv = Number(document.getElementById('simFraisLivraison').value) || 0;
        
        if (quantite > 0) {
            prixRevientSim = (prixAchat * quantite + fraisLiv) / quantite;
        }
    } else {
        const coutMatieres = Number(document.getElementById('simCoutMatieres').value) || 0;
        const coutMainOeuvre = Number(document.getElementById('simCoutMainOeuvre').value) || 0;
        const autresFrais = Number(document.getElementById('simAutresFrais').value) || 0;
        const quantiteProd = Number(document.getElementById('simQuantiteProd').value) || 0;
        
        if (quantiteProd > 0) {
            prixRevientSim = (coutMatieres + coutMainOeuvre + autresFrais) / quantiteProd;
        }
    }
    
    const prixVente = Number(document.getElementById('simPrixVente').value) || 0;
    const commission = Number(document.getElementById('simCommission').value) || 0;
    const budgetPub = Number(document.getElementById('simBudgetPub').value) || 0;
    const devisePub = document.getElementById('simDevisePub').value;
    const fraisLivClient = Number(document.getElementById('simFraisLivClient').value) || 0;
    const ventesJour = Number(document.getElementById('simVentesJour').value) || 0;
    
    if (prixRevientSim === 0 || prixVente === 0 || ventesJour === 0) {
        document.getElementById('verdictAxis').style.display = 'none';
        document.getElementById('analyseEtSi').style.display = 'none';
        return;
    }
    
    let budgetPubFCFA = budgetPub;
    if (devisePub !== 'XAF' && devisePub !== 'FCFA') {
        budgetPubFCFA = budgetPub * (tauxDeChange[devisePub] || 1);
    }
    
    const pubParVente = budgetPubFCFA / ventesJour;
    const beneficeUnit = prixVente - prixRevientSim - commission - pubParVente - fraisLivClient;
    const ventes7jours = ventesJour * 7;
    const beneficeTotal = beneficeUnit * ventes7jours;
    const marge = (beneficeUnit / prixVente) * 100;
    
    document.getElementById('simPrixRevient').textContent = Math.round(prixRevientSim).toLocaleString() + ' F';
    document.getElementById('simBeneficeUnit').textContent = Math.round(beneficeUnit).toLocaleString() + ' F';
    document.getElementById('simBeneficeUnit').style.color = beneficeUnit > 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('simVentesTotal').textContent = ventes7jours;
    document.getElementById('simBeneficeTotal').textContent = Math.round(beneficeTotal).toLocaleString() + ' F';
    document.getElementById('simBeneficeTotal').style.color = beneficeTotal > 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    
    let message = '';
    const nomProduit = document.getElementById('simNomProduit').value.trim() || 'ce produit';
    
    if (marge >= 30) {
        message = `<strong style="color: var(--accent-green);">Excellente strategie !</strong><br><br>Si tu vends ${nomProduit} a ${prixVente.toLocaleString()} F avec cette configuration, tu realiseras une marge de <strong>${marge.toFixed(1)}%</strong>.<br><br>Avec ${ventesJour} vente(s) par jour, tu genereras <strong>${Math.round(beneficeTotal).toLocaleString()} F de benefice en 7 jours</strong>.<br><br><strong>Mon conseil :</strong> Lance-toi ! Cette configuration est solide.`;
    } else if (marge >= 15) {
        message = `<strong style="color: var(--accent-orange);">Strategie acceptable</strong><br><br>Avec une marge de ${marge.toFixed(1)}%, tu es dans la moyenne. En 7 jours, tu ferais ${Math.round(beneficeTotal).toLocaleString()} F.<br><br><strong>Suggestions :</strong><br>- Reduire ton budget pub de ${Math.round(budgetPubFCFA * 0.2).toLocaleString()} F<br>- Ou augmenter le prix a ${Math.round(prixVente * 1.1).toLocaleString()} F`;
    } else if (marge > 0) {
        message = `<strong style="color: var(--accent-red);">Marge trop faible : ${marge.toFixed(1)}%</strong><br><br>Tu gagneras seulement ${Math.round(beneficeUnit).toLocaleString()} F par vente. Sur 7 jours: ${Math.round(beneficeTotal).toLocaleString()} F.<br><br><strong>Solutions :</strong><br>1. Augmente le prix a ${Math.round(prixVente * 1.2).toLocaleString()} F<br>2. Reduis le budget pub a ${Math.round(budgetPubFCFA * 0.5).toLocaleString()} F<br>3. Trouve un fournisseur moins cher`;
    } else {
        message = `<strong style="color: var(--accent-red);">ATTENTION : Tu vas perdre de l'argent !</strong><br><br>Avec cette configuration, tu perdrais ${Math.abs(Math.round(beneficeUnit)).toLocaleString()} F a chaque vente. Sur 7 jours: <strong>-${Math.abs(Math.round(beneficeTotal)).toLocaleString()} F</strong> !<br><br><strong>Ne lance PAS ce produit avant d'avoir :</strong><br>- Reduit drastiquement ton budget pub<br>- Augmente significativement ton prix de vente<br>- Trouve un meilleur fournisseur`;
    }
    
    document.getElementById('simMessageAxis').innerHTML = message;
    document.getElementById('verdictAxis').style.display = 'block';
    
    const ventesOpt = Math.round(ventes7jours * 1.3);
    const benefOpt = Math.round(beneficeUnit * ventesOpt);
    const ventesReal = ventes7jours;
    const benefReal = Math.round(beneficeTotal);
    const ventesPess = Math.round(ventes7jours * 0.7);
    const benefPess = Math.round(beneficeUnit * ventesPess);
    
    document.getElementById('etSiOptVentes').textContent = ventesOpt;
    document.getElementById('etSiOptBenef').textContent = benefOpt.toLocaleString() + ' F';
    document.getElementById('etSiRealVentes').textContent = ventesReal;
    document.getElementById('etSiRealBenef').textContent = benefReal.toLocaleString() + ' F';
    document.getElementById('etSiPessVentes').textContent = ventesPess;
    document.getElementById('etSiPessBenef').textContent = benefPess.toLocaleString() + ' F';
    
    document.getElementById('analyseEtSi').style.display = 'block';
}

function sauvegarderStrategie() {
    afficherNotification('Strategie enregistree dans vos notes !', 'success');
}

// ============================================
// FIXATEUR DE PRIX
// ============================================
let fixateurData = {};

function fixToggleInconnu() {
    const checkbox = document.getElementById('fixConcurrenceInconnu');
    const input = document.getElementById('fixPrixConcurrence');
    if (checkbox.checked) {
        input.value = '';
        input.disabled = true;
        input.style.opacity = '0.4';
    } else {
        input.disabled = false;
        input.style.opacity = '1';
    }
}

function fixToggleConcurrence() {
    const input = document.getElementById('fixPrixConcurrence');
    const checkbox = document.getElementById('fixConcurrenceInconnu');
    if (input.value) {
        checkbox.checked = false;
        input.disabled = false;
        input.style.opacity = '1';
    }
}

function fixAllerEtape2() {
    const nom = document.getElementById('fixNomProduit').value.trim();
    const prixObjectif = Number(document.getElementById('fixPrixObjectif').value) || 0;
    const prixConcurrence = Number(document.getElementById('fixPrixConcurrence').value) || null;
    const concurrenceInconnu = document.getElementById('fixConcurrenceInconnu').checked;

    if (!nom) {
        afficherNotification('Entrez le nom du produit', 'error');
        return;
    }
    if (prixObjectif <= 0) {
        afficherNotification('Entrez votre prix de vente souhaite', 'error');
        return;
    }

    fixateurData = {
        nom: nom,
        prixObjectif: prixObjectif,
        prixConcurrence: concurrenceInconnu ? null : prixConcurrence,
        concurrenceInconnu: concurrenceInconnu
    };

    document.getElementById('fixEtape1').classList.add('hidden');
    document.getElementById('fixEtape2').classList.remove('hidden');
    document.getElementById('fixNomProduitEtape2').textContent = nom;

    document.getElementById('fixProgressBar1').style.width = '100%';
    document.getElementById('fixStep2Dot').style.background = 'linear-gradient(135deg, #8b5cf6, #ec4899)';
    document.getElementById('fixStep2Dot').style.border = 'none';
    document.getElementById('fixStep2Dot').style.color = 'white';

    fixateurData.sourceType = null;
    hapticFeedback();
}

function fixRetourEtape1() {
    document.getElementById('fixEtape2').classList.add('hidden');
    document.getElementById('fixEtape1').classList.remove('hidden');

    document.getElementById('fixProgressBar1').style.width = '0%';
    document.getElementById('fixStep2Dot').style.background = 'var(--glass-bg)';
    document.getElementById('fixStep2Dot').style.border = '2px solid var(--diamond-border)';
    document.getElementById('fixStep2Dot').style.color = 'var(--text-muted)';
    hapticFeedback();
}

function fixChoisirSource(type) {
    fixateurData.sourceType = type;
    const gradActive = 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))';
    const borderActive = '#8b5cf6';

    ['local', 'import', 'production'].forEach(t => {
        const radio = document.getElementById('fixRadio' + t.charAt(0).toUpperCase() + t.slice(1));
        const dot = document.getElementById('fixDot' + t.charAt(0).toUpperCase() + t.slice(1));
        const inner = document.getElementById('fixDot' + t.charAt(0).toUpperCase() + t.slice(1) + 'Inner');
        if (t === type) {
            radio.style.background = gradActive;
            radio.style.borderColor = borderActive;
            dot.style.borderColor = borderActive;
            if (inner) { inner.style.display = 'block'; inner.style.background = '#8b5cf6'; inner.style.borderRadius = '50%'; }
        } else {
            radio.style.background = 'var(--glass-bg)';
            radio.style.borderColor = 'var(--diamond-border)';
            dot.style.borderColor = 'var(--diamond-border)';
            if (inner) inner.style.display = 'none';
        }
    });

    document.getElementById('fixZoneLocal').classList.add('hidden');
    document.getElementById('fixZoneImport').classList.add('hidden');
    document.getElementById('fixZoneProduction').classList.add('hidden');

    if (type === 'local') document.getElementById('fixZoneLocal').classList.remove('hidden');
    else if (type === 'import') document.getElementById('fixZoneImport').classList.remove('hidden');
    else if (type === 'production') document.getElementById('fixZoneProduction').classList.remove('hidden');

    hapticFeedback();
}

function fixChoisirTransport(choix) {
    fixateurData.transportType = choix;
    const gratuit = document.getElementById('fixRadioTransportGratuit');
    const paye = document.getElementById('fixRadioTransportPaye');
    const dotG = document.getElementById('fixDotTransGratuit');
    const dotP = document.getElementById('fixDotTransPaye');

    if (choix === 'gratuit') {
        gratuit.style.borderColor = '#8b5cf6';
        gratuit.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))';
        dotG.style.borderColor = '#8b5cf6'; dotG.style.background = '#8b5cf6';
        paye.style.borderColor = 'var(--diamond-border)'; paye.style.background = 'var(--glass-bg)';
        dotP.style.borderColor = 'var(--diamond-border)'; dotP.style.background = 'transparent';
        document.getElementById('fixZoneTransportPaye').classList.add('hidden');
    } else {
        paye.style.borderColor = '#8b5cf6';
        paye.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))';
        dotP.style.borderColor = '#8b5cf6'; dotP.style.background = '#8b5cf6';
        gratuit.style.borderColor = 'var(--diamond-border)'; gratuit.style.background = 'var(--glass-bg)';
        dotG.style.borderColor = 'var(--diamond-border)'; dotG.style.background = 'transparent';
        document.getElementById('fixZoneTransportPaye').classList.remove('hidden');
    }
    hapticFeedback();
}

function fixChoisirImportMode(mode) {
    fixateurData.importMode = mode;
    const btnG = document.getElementById('fixBtnImportGlobal');
    const btnD = document.getElementById('fixBtnImportDetail');
    if (mode === 'global') {
        btnG.className = 'btn btn-primary'; btnG.style.flex = '1'; btnG.style.padding = '12px'; btnG.style.fontSize = '12px';
        btnD.className = 'btn btn-secondary'; btnD.style.flex = '1'; btnD.style.padding = '12px'; btnD.style.fontSize = '12px';
        document.getElementById('fixZoneImportGlobal').classList.remove('hidden');
        document.getElementById('fixZoneImportDetail').classList.add('hidden');
    } else {
        btnD.className = 'btn btn-primary'; btnD.style.flex = '1'; btnD.style.padding = '12px'; btnD.style.fontSize = '12px';
        btnG.className = 'btn btn-secondary'; btnG.style.flex = '1'; btnG.style.padding = '12px'; btnG.style.fontSize = '12px';
        document.getElementById('fixZoneImportDetail').classList.remove('hidden');
        document.getElementById('fixZoneImportGlobal').classList.add('hidden');
    }
    hapticFeedback();
}

function fixToggleTemps() {
    const checked = document.getElementById('fixProdFacturerTemps').checked;
    if (checked) {
        document.getElementById('fixZoneTemps').classList.remove('hidden');
    } else {
        document.getElementById('fixZoneTemps').classList.add('hidden');
    }
}

function fixAllerEtape3() {
    if (!fixateurData.sourceType) {
        afficherNotification('Choisissez votre source d\'acquisition', 'error');
        return;
    }

    if (fixateurData.sourceType === 'local') {
        const prix = Number(document.getElementById('fixLocalPrixAchat').value) || 0;
        if (prix <= 0) { afficherNotification('Entrez le prix d\'achat unitaire', 'error'); return; }
        fixateurData.prixAchatUnit = prix;
        fixateurData.transportFrais = 0;
        if (fixateurData.transportType === 'paye') {
            const montant = Number(document.getElementById('fixLocalTransportMontant').value) || 0;
            const nb = Number(document.getElementById('fixLocalTransportNb').value) || 0;
            if (montant <= 0 || nb <= 0) { afficherNotification('Remplissez les frais de transport', 'error'); return; }
            fixateurData.transportFrais = montant / nb;
        }
    } else if (fixateurData.sourceType === 'import') {
        if (!fixateurData.importMode) { afficherNotification('Choisissez Cout Global ou Detail', 'error'); return; }
        if (fixateurData.importMode === 'global') {
            const cout = Number(document.getElementById('fixImportCoutGlobal').value) || 0;
            const nb = Number(document.getElementById('fixImportNbGlobal').value) || 0;
            if (cout <= 0 || nb <= 0) { afficherNotification('Remplissez le cout et le nombre d\'articles', 'error'); return; }
            fixateurData.prixAchatUnit = cout / nb;
        } else {
            const prixUnit = Number(document.getElementById('fixImportPrixUnit').value) || 0;
            const fraisLog = Number(document.getElementById('fixImportFraisLog').value) || 0;
            const nb = Number(document.getElementById('fixImportNbDetail').value) || 0;
            if (prixUnit <= 0 || nb <= 0) { afficherNotification('Remplissez tous les champs', 'error'); return; }
            fixateurData.prixAchatUnit = prixUnit + (fraisLog / nb);
        }
    } else if (fixateurData.sourceType === 'production') {
        const coutMat = Number(document.getElementById('fixProdCoutMateriaux').value) || 0;
        if (coutMat <= 0) { afficherNotification('Entrez le cout des materiaux', 'error'); return; }
        let coutTemps = 0;
        if (document.getElementById('fixProdFacturerTemps').checked) {
            const heures = Number(document.getElementById('fixProdHeures').value) || 0;
            const prixH = Number(document.getElementById('fixProdPrixHeure').value) || 0;
            if (heures <= 0 || prixH <= 0) { afficherNotification('Remplissez le temps et le prix horaire', 'error'); return; }
            coutTemps = heures * prixH;
        }
        fixateurData.prixAchatUnit = coutMat + coutTemps;
    }

    document.getElementById('fixProgressBar2').style.width = '100%';
    document.getElementById('fixStep3Dot').style.background = 'linear-gradient(135deg, #8b5cf6, #ec4899)';
    document.getElementById('fixStep3Dot').style.border = 'none';
    document.getElementById('fixStep3Dot').style.color = 'white';

    document.getElementById('fixEtape2').classList.add('hidden');
    document.getElementById('fixEtape3').classList.remove('hidden');
    document.getElementById('fixNomProduitEtape3').textContent = fixateurData.nom;

    hapticFeedback();
}

function fixRetourEtape2() {
    document.getElementById('fixEtape3').classList.add('hidden');
    document.getElementById('fixEtape2').classList.remove('hidden');

    document.getElementById('fixProgressBar2').style.width = '0%';
    document.getElementById('fixStep3Dot').style.background = 'var(--glass-bg)';
    document.getElementById('fixStep3Dot').style.border = '2px solid var(--diamond-border)';
    document.getElementById('fixStep3Dot').style.color = 'var(--text-muted)';
    hapticFeedback();
}

function fixCocherLesDeux() {
    document.getElementById('fixCanalBoutique').checked = true;
    document.getElementById('fixCanalEnLigne').checked = true;
    fixToggleCanal();
    hapticFeedback();
}

function fixToggleCanal() {
    const boutique = document.getElementById('fixCanalBoutique').checked;
    const enLigne = document.getElementById('fixCanalEnLigne').checked;
    const lblB = document.getElementById('fixCanalBoutiqueLabel');
    const lblE = document.getElementById('fixCanalEnLigneLabel');

    if (boutique) {
        document.getElementById('fixZoneBoutique').classList.remove('hidden');
        lblB.style.borderColor = '#8b5cf6';
        lblB.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))';
    } else {
        document.getElementById('fixZoneBoutique').classList.add('hidden');
        lblB.style.borderColor = 'var(--diamond-border)';
        lblB.style.background = 'var(--glass-bg)';
    }

    if (enLigne) {
        document.getElementById('fixZoneEnLigne').classList.remove('hidden');
        lblE.style.borderColor = '#8b5cf6';
        lblE.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))';
    } else {
        document.getElementById('fixZoneEnLigne').classList.add('hidden');
        lblE.style.borderColor = 'var(--diamond-border)';
        lblE.style.background = 'var(--glass-bg)';
    }
}

function fixChoisirProduitSeul(choix) {
    fixateurData.produitSeul = choix;
    const btnOui = document.getElementById('fixBtnProduitSeulOui');
    const btnNon = document.getElementById('fixBtnProduitSeulNon');
    if (choix === 'oui') {
        btnOui.className = 'btn btn-primary'; btnOui.style.flex = '1'; btnOui.style.padding = '10px'; btnOui.style.fontSize = '12px';
        btnNon.className = 'btn btn-secondary'; btnNon.style.flex = '1'; btnNon.style.padding = '10px'; btnNon.style.fontSize = '12px';
        document.getElementById('fixZoneProduitSeul').classList.remove('hidden');
        document.getElementById('fixZoneProduitMultiple').classList.add('hidden');
    } else {
        btnNon.className = 'btn btn-primary'; btnNon.style.flex = '1'; btnNon.style.padding = '10px'; btnNon.style.fontSize = '12px';
        btnOui.className = 'btn btn-secondary'; btnOui.style.flex = '1'; btnOui.style.padding = '10px'; btnOui.style.fontSize = '12px';
        document.getElementById('fixZoneProduitMultiple').classList.remove('hidden');
        document.getElementById('fixZoneProduitSeul').classList.add('hidden');
    }
    hapticFeedback();
}

function fixChoisirPalier(nb) {
    fixateurData.palierProduits = nb;
    const container = document.getElementById('fixPaliersAutresProduits');
    container.querySelectorAll('button').forEach(btn => {
        btn.className = 'btn btn-secondary';
        btn.style.padding = '8px 14px'; btn.style.fontSize = '11px';
    });
    const idx = { 10: 0, 20: 1, 50: 2, 100: 3, '-1': 4 }[nb];
    if (idx !== undefined && container.children[idx]) {
        container.children[idx].className = 'btn btn-primary';
        container.children[idx].style.padding = '8px 14px'; container.children[idx].style.fontSize = '11px';
    }
    if (nb === -1) {
        document.getElementById('fixZonePourcentLoyer').classList.remove('hidden');
    } else {
        document.getElementById('fixZonePourcentLoyer').classList.add('hidden');
        fixateurData.loyerPourcent = null;
    }
    hapticFeedback();
}

function fixChoisirPourcent(pct) {
    fixateurData.loyerPourcent = pct;
    const container = document.getElementById('fixPourcentBtns');
    container.querySelectorAll('button').forEach(btn => {
        btn.className = 'btn btn-secondary';
        btn.style.flex = '1'; btn.style.padding = '10px'; btn.style.fontSize = '12px';
    });
    const idx = { 5: 0, 10: 1, 20: 2, 50: 3 }[pct];
    if (idx !== undefined && container.children[idx]) {
        container.children[idx].className = 'btn btn-primary';
        container.children[idx].style.flex = '1'; container.children[idx].style.padding = '10px'; container.children[idx].style.fontSize = '12px';
    }
    hapticFeedback();
}

function fixTogglePubInconnu() {
    const checked = document.getElementById('fixPubInconnu').checked;
    const input = document.getElementById('fixEnLigneBudgetPub');
    if (checked) {
        input.value = '';
        input.disabled = true;
        input.style.opacity = '0.4';
        document.getElementById('fixZonePubJour').classList.remove('hidden');
    } else {
        input.disabled = false;
        input.style.opacity = '1';
        document.getElementById('fixZonePubJour').classList.add('hidden');
    }
}

function fixTogglePubInput() {
    const input = document.getElementById('fixEnLigneBudgetPub');
    if (input.value) {
        document.getElementById('fixPubInconnu').checked = false;
        input.disabled = false;
        input.style.opacity = '1';
        document.getElementById('fixZonePubJour').classList.add('hidden');
    }
}

function fixChoisirPub(choix) {
    fixateurData.faitPub = choix;
    const btnO = document.getElementById('fixBtnPubOui');
    const btnN = document.getElementById('fixBtnPubNon');
    if (choix === 'oui') {
        btnO.className = 'btn btn-primary'; btnO.style.flex = '1'; btnO.style.padding = '10px'; btnO.style.fontSize = '12px';
        btnN.className = 'btn btn-secondary'; btnN.style.flex = '1'; btnN.style.padding = '10px'; btnN.style.fontSize = '12px';
        document.getElementById('fixZonePubOui').classList.remove('hidden');
        document.getElementById('fixZonePubNon').classList.add('hidden');
    } else {
        btnN.className = 'btn btn-primary'; btnN.style.flex = '1'; btnN.style.padding = '10px'; btnN.style.fontSize = '12px';
        btnO.className = 'btn btn-secondary'; btnO.style.flex = '1'; btnO.style.padding = '10px'; btnO.style.fontSize = '12px';
        document.getElementById('fixZonePubNon').classList.remove('hidden');
        document.getElementById('fixZonePubOui').classList.add('hidden');
    }
    hapticFeedback();
}

function fixToggleBoutiqueVolumeInconnu() {
    fixateurData.boutiqueVolumeInconnu = true;
    const input = document.getElementById('fixBoutiqueVolumeSeul');
    const btn = document.getElementById('fixBtnBoutiqueVolumeInconnu');
    input.value = '';
    input.disabled = true;
    input.style.opacity = '0.4';
    btn.className = 'btn btn-primary';
    btn.style.padding = '8px 12px'; btn.style.fontSize = '10px';
    document.getElementById('fixZoneBoutiqueVolumeInconnu').classList.remove('hidden');
    hapticFeedback();
}

function fixToggleBoutiqueVolumeInput() {
    const input = document.getElementById('fixBoutiqueVolumeSeul');
    if (input.value) {
        fixateurData.boutiqueVolumeInconnu = false;
        input.disabled = false;
        input.style.opacity = '1';
        const btn = document.getElementById('fixBtnBoutiqueVolumeInconnu');
        btn.className = 'btn btn-secondary';
        btn.style.padding = '8px 12px'; btn.style.fontSize = '10px';
        document.getElementById('fixZoneBoutiqueVolumeInconnu').classList.add('hidden');
    }
}

function fixToggleVolumeInconnu() {
    fixateurData.volumeInconnu = true;
    const input = document.getElementById('fixEnLigneVolume');
    const btn = document.getElementById('fixBtnVolumeInconnu');
    input.value = '';
    input.disabled = true;
    input.style.opacity = '0.4';
    btn.className = 'btn btn-primary';
    btn.style.padding = '8px 12px'; btn.style.fontSize = '10px';
    document.getElementById('fixZoneVolumeInconnu').classList.remove('hidden');
    hapticFeedback();
}

function fixToggleVolumeInput() {
    const input = document.getElementById('fixEnLigneVolume');
    if (input.value) {
        fixateurData.volumeInconnu = false;
        input.disabled = false;
        input.style.opacity = '1';
        const btn = document.getElementById('fixBtnVolumeInconnu');
        btn.className = 'btn btn-secondary';
        btn.style.padding = '8px 12px'; btn.style.fontSize = '10px';
        document.getElementById('fixZoneVolumeInconnu').classList.add('hidden');
    }
}

function fixChoisirStaff(type) {
    fixateurData.staffType = type;
    ['fixBtnStaffNon', 'fixBtnStaffSalaire', 'fixBtnStaffCommission'].forEach(id => {
        const el = document.getElementById(id);
        el.className = 'btn btn-secondary';
        el.style.padding = '10px'; el.style.fontSize = '12px'; el.style.textAlign = 'left';
    });
    const btnId = type === 'non' ? 'fixBtnStaffNon' : type === 'salaire' ? 'fixBtnStaffSalaire' : 'fixBtnStaffCommission';
    const btn = document.getElementById(btnId);
    btn.className = 'btn btn-primary';
    btn.style.padding = '10px'; btn.style.fontSize = '12px'; btn.style.textAlign = 'left';

    document.getElementById('fixZoneStaffSalaire').classList.add('hidden');
    document.getElementById('fixZoneStaffCommission').classList.add('hidden');
    if (type === 'salaire') document.getElementById('fixZoneStaffSalaire').classList.remove('hidden');
    if (type === 'commission') document.getElementById('fixZoneStaffCommission').classList.remove('hidden');
    hapticFeedback();
}

function fixValiderEtape3() {
    const boutique = document.getElementById('fixCanalBoutique').checked;
    const enLigne = document.getElementById('fixCanalEnLigne').checked;

    if (!boutique && !enLigne) {
        afficherNotification('Choisissez au moins un canal de vente', 'error');
        return;
    }

    fixateurData.canaux = {};

    if (boutique) {
        const loyer = Number(document.getElementById('fixBoutiqueLoyerMensuel').value) || 0;
        if (!fixateurData.produitSeul) { afficherNotification('Indiquez si ce produit est le seul en boutique', 'error'); return; }

        fixateurData.canaux.boutique = { loyerMensuel: loyer };

        if (fixateurData.produitSeul === 'oui') {
            let vol = Number(document.getElementById('fixBoutiqueVolumeSeul').value) || 0;
            if (fixateurData.boutiqueVolumeInconnu) {
                vol = 10;
            } else if (vol <= 0) { afficherNotification('Entrez le volume de vente prevu', 'error'); return; }
            fixateurData.canaux.boutique.loyerParArticle = loyer / vol;
        } else {
            if (!fixateurData.palierProduits) { afficherNotification('Choisissez le nombre de produits en boutique', 'error'); return; }
            if (fixateurData.palierProduits === -1) {
                if (!fixateurData.loyerPourcent) { afficherNotification('Choisissez le pourcentage du loyer', 'error'); return; }
                fixateurData.canaux.boutique.loyerParArticle = (loyer * fixateurData.loyerPourcent / 100);
            } else {
                fixateurData.canaux.boutique.loyerParArticle = loyer / (fixateurData.palierProduits + 1);
            }
        }
    }

    if (enLigne) {
        if (!fixateurData.faitPub) { afficherNotification('Indiquez si vous faites de la pub ou non', 'error'); return; }
        let budgetPub = 0;
        if (fixateurData.faitPub === 'oui') {
            const pubInconnu = document.getElementById('fixPubInconnu').checked;
            if (pubInconnu) {
                const pubJour = Number(document.getElementById('fixEnLignePubJour').value) || 0;
                if (pubJour <= 0) { afficherNotification('Entrez votre budget pub journalier', 'error'); return; }
                budgetPub = pubJour * 30;
            } else {
                budgetPub = Number(document.getElementById('fixEnLigneBudgetPub').value) || 0;
                if (budgetPub <= 0) { afficherNotification('Entrez le budget pub ou cochez "Je ne sais pas trop"', 'error'); return; }
            }
        }

        let volume = Number(document.getElementById('fixEnLigneVolume').value) || 0;
        if (fixateurData.volumeInconnu) {
            volume = 10;
        } else if (volume <= 0) {
            afficherNotification('Entrez le volume de vente ou cliquez "Je ne sais pas"', 'error'); return;
        }

        fixateurData.canaux.enLigne = {
            budgetPub: budgetPub,
            volume: volume,
            pubParArticle: volume > 0 ? budgetPub / volume : 0
        };
    }

    fixateurData.staff = { type: fixateurData.staffType || 'non', salaireMensuel: 0, commissionParVente: 0 };
    if (fixateurData.staffType === 'salaire') {
        const sal = Number(document.getElementById('fixStaffSalaireMontant').value) || 0;
        if (sal <= 0) { afficherNotification('Entrez le montant des salaires mensuels', 'error'); return; }
        fixateurData.staff.salaireMensuel = sal;
    } else if (fixateurData.staffType === 'commission') {
        const com = Number(document.getElementById('fixStaffCommissionMontant').value) || 0;
        if (com <= 0) { afficherNotification('Entrez le montant de la commission par vente', 'error'); return; }
        fixateurData.staff.commissionParVente = com;
    }

    hapticFeedback();
    fixGenererRapport();
}

function fixGenererRapport() {
    const d = fixateurData;
    let coutRevient = d.prixAchatUnit || 0;
    let detailCouts = [];

    detailCouts.push({ label: 'Prix acquisition / fabrication', montant: d.prixAchatUnit || 0 });

    if (d.sourceType === 'local' && d.transportFrais > 0) {
        coutRevient += d.transportFrais;
        detailCouts.push({ label: 'Transport / article', montant: d.transportFrais });
    }

    let loyerUnit = 0;
    if (d.canaux && d.canaux.boutique) {
        loyerUnit = d.canaux.boutique.loyerParArticle || 0;
        if (loyerUnit > 0) {
            coutRevient += loyerUnit;
            detailCouts.push({ label: 'Loyer & charges / article', montant: loyerUnit });
        }
    }

    let pubUnit = 0;
    if (d.canaux && d.canaux.enLigne) {
        pubUnit = d.canaux.enLigne.pubParArticle || 0;
        if (pubUnit > 0) {
            coutRevient += pubUnit;
            detailCouts.push({ label: 'Pub / article', montant: pubUnit });
        }
    }

    let staffUnit = 0;
    if (d.staff) {
        if (d.staff.commissionParVente > 0) {
            staffUnit = d.staff.commissionParVente;
            coutRevient += staffUnit;
            detailCouts.push({ label: 'Commission staff / vente', montant: staffUnit });
        }
    }

    const prixSouhaite = d.prixObjectif;
    const benefice = prixSouhaite - coutRevient;
    const marge = prixSouhaite > 0 ? (benefice / prixSouhaite) * 100 : 0;

    document.getElementById('fixEtape3').classList.add('hidden');
    document.getElementById('fixRapport').classList.remove('hidden');
    document.getElementById('fixRapportNom').textContent = d.nom;

    document.getElementById('fixRapportCoutRevient').textContent = Math.round(coutRevient).toLocaleString() + ' ' + deviseActuelle;
    document.getElementById('fixRapportPrixSouhaite').textContent = Math.round(prixSouhaite).toLocaleString() + ' ' + deviseActuelle;

    const benefElem = document.getElementById('fixRapportBenefUnit');
    benefElem.textContent = Math.round(benefice).toLocaleString() + ' ' + deviseActuelle;
    benefElem.style.color = benefice >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';

    const margePctElem = document.getElementById('fixRapportMargePct');
    margePctElem.textContent = 'Marge : ' + Math.round(marge) + '%';
    margePctElem.style.color = marge >= 30 ? 'var(--accent-green)' : marge >= 15 ? 'var(--accent-orange)' : 'var(--accent-red)';

    if (benefice > 0) {
        document.getElementById('fixRapportMargeVoulue').textContent = 'Vous gagnez ' + Math.round(benefice).toLocaleString() + ' par vente';
    } else if (benefice === 0) {
        document.getElementById('fixRapportMargeVoulue').textContent = 'Aucun benefice a ce prix';
    } else {
        document.getElementById('fixRapportMargeVoulue').textContent = 'Vous perdez ' + Math.round(Math.abs(benefice)).toLocaleString() + ' par vente';
    }

    const analysePrix = document.getElementById('fixAnalysePrix');
    if (benefice > 0 && marge >= 30) {
        analysePrix.style.background = 'rgba(16,185,129,0.08)';
        analysePrix.style.border = '1px solid rgba(16,185,129,0.2)';
        analysePrix.innerHTML = '<div style="font-size: 12px; font-weight: 700; color: var(--accent-green);"><i class="fas fa-check-circle" style="margin-right: 6px;"></i>Prix realiste</div><div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">Votre prix de ' + Math.round(prixSouhaite).toLocaleString() + ' ' + deviseActuelle + ' vous laisse une bonne marge de ' + Math.round(marge) + '%. C\'est viable.</div>';
    } else if (benefice > 0 && marge >= 10) {
        analysePrix.style.background = 'rgba(245,158,11,0.08)';
        analysePrix.style.border = '1px solid rgba(245,158,11,0.2)';
        analysePrix.innerHTML = '<div style="font-size: 12px; font-weight: 700; color: var(--accent-orange);"><i class="fas fa-exclamation-circle" style="margin-right: 6px;"></i>Prix serr\u00e9</div><div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">Votre marge de ' + Math.round(marge) + '% est faible. Le moindre imprevue rogne vos gains. Visez au minimum ' + Math.round(coutRevient / 0.65).toLocaleString() + ' ' + deviseActuelle + '.</div>';
    } else {
        analysePrix.style.background = 'rgba(239,68,68,0.08)';
        analysePrix.style.border = '1px solid rgba(239,68,68,0.2)';
        analysePrix.innerHTML = '<div style="font-size: 12px; font-weight: 700; color: var(--accent-red);"><i class="fas fa-times-circle" style="margin-right: 6px;"></i>Prix non viable</div><div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">A ' + Math.round(prixSouhaite).toLocaleString() + ' ' + deviseActuelle + ', vous ' + (benefice < 0 ? 'perdez ' + Math.round(Math.abs(benefice)).toLocaleString() + ' ' + deviseActuelle + ' par vente' : 'ne gagnez quasiment rien') + '. Votre cout reel est de ' + Math.round(coutRevient).toLocaleString() + ' ' + deviseActuelle + '.</div>';
    }

    const alerteConc = document.getElementById('fixAlerteConcurrence');
    const concBox = document.getElementById('fixRapportConcurrentBox');
    alerteConc.classList.add('hidden');
    concBox.style.display = 'none';

    if (d.prixConcurrence && d.prixConcurrence > 0) {
        concBox.style.display = 'block';
        document.getElementById('fixRapportPrixConcurrent').textContent = Math.round(d.prixConcurrence).toLocaleString() + ' ' + deviseActuelle;
        const ecart = d.prixConcurrence - coutRevient;
        const ecartElem = document.getElementById('fixRapportEcartConcurrent');
        if (ecart > 0) {
            ecartElem.textContent = 'Marge possible : ' + Math.round(ecart).toLocaleString() + ' ' + deviseActuelle;
            ecartElem.style.color = 'var(--accent-green)';
        } else {
            ecartElem.textContent = 'Impossible de s\'aligner';
            ecartElem.style.color = 'var(--accent-red)';
        }

        if (coutRevient > d.prixConcurrence) {
            alerteConc.classList.remove('hidden');
            document.getElementById('fixAlerteConcurrenceMsg').textContent = 'Votre cout de revient (' + Math.round(coutRevient).toLocaleString() + ' ' + deviseActuelle + ') depasse le prix concurrent (' + Math.round(d.prixConcurrence).toLocaleString() + ' ' + deviseActuelle + '). Impossible de s\'aligner sans perte.';
        }
    }

    let detailHtml = '';
    detailCouts.forEach(c => {
        detailHtml += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--diamond-border);"><span style="font-size: 11px; color: var(--text-secondary);">' + c.label + '</span><span style="font-size: 12px; font-weight: 700; color: var(--text-primary);">' + Math.round(c.montant).toLocaleString() + ' ' + deviseActuelle + '</span></div>';
    });
    detailHtml += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; margin-top: 4px;"><span style="font-size: 12px; font-weight: 800; color: var(--text-primary);">TOTAL (Cout reel)</span><span style="font-size: 14px; font-weight: 900; color: var(--accent-red);">' + Math.round(coutRevient).toLocaleString() + ' ' + deviseActuelle + '</span></div>';
    document.getElementById('fixDetailCouts').innerHTML = detailHtml;

    const breakeven = Math.round(coutRevient);
    const securite = Math.round(coutRevient / 0.85);
    let conseille = Math.round(coutRevient / 0.65);
    let conseilleDesc = 'Marge 30-40% - le juste milieu';
    if (d.prixConcurrence && d.prixConcurrence > coutRevient) {
        const margeConcurrent = ((d.prixConcurrence - coutRevient) / d.prixConcurrence) * 100;
        if (margeConcurrent >= 15) {
            conseille = Math.round(d.prixConcurrence * 0.95);
            conseilleDesc = 'Alignement concurrent (-5%) - marge ' + Math.round(((conseille - coutRevient) / conseille) * 100) + '%';
        }
    }
    const premium = Math.round(coutRevient / 0.40);

    document.getElementById('fixPrixBreakeven').textContent = breakeven.toLocaleString() + ' ' + deviseActuelle;
    document.getElementById('fixPrixSecurite').textContent = securite.toLocaleString() + ' ' + deviseActuelle;
    document.getElementById('fixPrixConseille').textContent = conseille.toLocaleString() + ' ' + deviseActuelle;
    document.getElementById('fixPrixConseilleDesc').textContent = conseilleDesc;
    document.getElementById('fixPrixPremium').textContent = premium.toLocaleString() + ' ' + deviseActuelle;

    let chargesFixes = 0;
    if (d.canaux && d.canaux.boutique && d.canaux.boutique.loyerMensuel) chargesFixes += d.canaux.boutique.loyerMensuel;
    if (d.canaux && d.canaux.enLigne && d.canaux.enLigne.budgetPub) chargesFixes += d.canaux.enLigne.budgetPub;
    if (d.staff && d.staff.salaireMensuel > 0) {
        chargesFixes += d.staff.salaireMensuel;
        detailCouts.push({ label: 'Salaire staff (mensuel dilue)', montant: d.staff.salaireMensuel });
    }

    const benefParVenteSansFixes = prixSouhaite - (d.prixAchatUnit || 0) - (d.sourceType === 'local' ? (d.transportFrais || 0) : 0) - staffUnit;
    let seuilRentabilite = 0;
    if (benefParVenteSansFixes > 0 && chargesFixes > 0) {
        seuilRentabilite = Math.ceil(chargesFixes / benefParVenteSansFixes);
    }

    const pointMortEl = document.getElementById('fixPointMort');
    const pointMortMsg = document.getElementById('fixPointMortMsg');
    if (benefParVenteSansFixes > 0 && chargesFixes > 0) {
        pointMortEl.style.display = 'block';
        pointMortMsg.innerHTML = 'Au prix de <strong>' + Math.round(prixSouhaite).toLocaleString() + ' ' + deviseActuelle + '</strong>, vous devez vendre <strong style="color: var(--accent-blue); font-size: 16px;">' + seuilRentabilite + ' articles</strong> par mois pour couvrir vos charges fixes (' + Math.round(chargesFixes).toLocaleString() + ' ' + deviseActuelle + ') et commencer a faire du benefice.';
        if (d.volumeInconnu) {
            pointMortMsg.innerHTML += '<br><span style="font-size: 11px; color: var(--accent-orange);"><i class="fas fa-exclamation-circle" style="margin-right: 4px;"></i>Volume inconnu : les calculs utilisent 10 unites/mois comme base prudente. Votre objectif reel est de ' + seuilRentabilite + ' ventes minimum.</span>';
        }
    } else if (benefice <= 0) {
        pointMortEl.style.display = 'block';
        pointMortMsg.innerHTML = '<span style="color: var(--accent-red);">A ce prix, chaque vente vous fait perdre de l\'argent. Aucun volume ne compensera. Augmentez votre prix de vente.</span>';
    } else {
        pointMortEl.style.display = 'none';
    }

    const grilleEl = document.getElementById('fixGrilleBenefices');
    const grilleContenu = document.getElementById('fixGrilleContenu');
    if (benefice > 0) {
        grilleEl.style.display = 'block';
        const paliers = [5, 10, 20, 50, 100];
        let gHtml = '';
        paliers.forEach(n => {
            const revenu = n * prixSouhaite;
            const coutVar = n * coutRevient;
            const benef = revenu - coutVar;
            const couleur = benef > 0 ? 'var(--accent-green)' : 'var(--accent-red)';
            const rentable = chargesFixes > 0 && n >= seuilRentabilite;
            const badge = rentable ? ' <span style="font-size: 8px; padding: 2px 5px; background: rgba(16,185,129,0.15); color: var(--accent-green); border-radius: 4px; font-weight: 700;">RENTABLE</span>' : '';
            gHtml += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--diamond-border);"><span style="font-size: 12px; color: var(--text-secondary);">Si vous vendez <strong style="color: var(--text-primary);">' + n + '</strong> articles' + badge + '</span><span style="font-size: 13px; font-weight: 800; color: ' + couleur + ';">' + Math.round(benef).toLocaleString() + ' ' + deviseActuelle + '</span></div>';
        });
        grilleContenu.innerHTML = gHtml;
    } else {
        grilleEl.style.display = 'none';
    }

    let conseil = '';
    if (benefice < 0) {
        conseil = 'Votre prix de vente ne couvre meme pas vos couts. Vous perdez ' + Math.round(Math.abs(benefice)).toLocaleString() + ' ' + deviseActuelle + ' a chaque vente. Il faut soit augmenter le prix a minimum ' + securite.toLocaleString() + ' ' + deviseActuelle + ', soit reduire vos charges.';
    } else if (marge < 15) {
        conseil = 'Votre marge est tres faible (' + Math.round(marge) + '%). Le moindre imprevue (retour, casse, remise) vous met en perte. Visez au moins ' + securite.toLocaleString() + ' ' + deviseActuelle + ' pour etre en securite.';
    } else if (marge < 30) {
        conseil = 'Votre marge de ' + Math.round(marge) + '% est correcte mais laisse peu de place pour investir. Pour accelerer votre croissance, visez ' + conseille.toLocaleString() + ' ' + deviseActuelle + '.';
    } else {
        conseil = 'Bonne strategie ! A ' + Math.round(prixSouhaite).toLocaleString() + ' ' + deviseActuelle + ' avec une marge de ' + Math.round(marge) + '%, vous avez un business solide.';
    }

    if (seuilRentabilite > 30) {
        conseil += ' Votre loyer est trop eleve pour ce produit seul. Vous devez vendre ' + seuilRentabilite + ' articles/mois pour etre rentable. Envisagez de vendre d\'autres articles ou d\'augmenter votre marge.';
    }
    if (loyerUnit > 0 && loyerUnit > d.prixAchatUnit * 0.3) {
        conseil += ' Vos charges fixes (loyer) representent une part importante de vos couts. Augmentez votre volume de vente pour diluer ce poids.';
    }
    if (pubUnit > 0 && pubUnit > d.prixAchatUnit * 0.5) {
        conseil += ' Votre budget pub est eleve par rapport au cout produit. Optimisez vos campagnes pour reduire le cout par vente.';
    }
    if (d.prixConcurrence && d.prixConcurrence > 0 && prixSouhaite > d.prixConcurrence * 1.3) {
        conseil += ' Votre prix est 30%+ au-dessus des concurrents. Assurez-vous d\'avoir un argument de valeur fort (qualite, service, marque).';
    }
    if (d.prixConcurrence && d.prixConcurrence > 0 && prixSouhaite < d.prixConcurrence * 0.7 && benefice > 0) {
        const pctHausse = Math.round(((d.prixConcurrence - prixSouhaite) / prixSouhaite) * 100);
        conseil += ' Vous etes tres en-dessous du prix concurrent ! Vous pouvez augmenter votre prix de ' + pctHausse + '% pour valoriser votre image et maximiser vos gains.';
    }
    if (d.volumeInconnu) {
        conseil += ' Comme votre volume est incertain, concentrez-vous sur le seuil de ' + seuilRentabilite + ' ventes/mois minimum. En-dessous, vous ne couvrez pas vos frais fixes.';
    }

    document.getElementById('fixConseilVeko').textContent = conseil;

    const scenarioAligne = document.getElementById('fixScenarioAligne');
    if (d.prixConcurrence && d.prixConcurrence > 0) {
        scenarioAligne.style.display = 'block';
        const benefAligne = d.prixConcurrence - coutRevient;
        const aligneMsg = document.getElementById('fixScenarioAligneMsg');
        if (benefAligne > 0) {
            aligneMsg.innerHTML = 'En vous alignant a <strong>' + Math.round(d.prixConcurrence).toLocaleString() + ' ' + deviseActuelle + '</strong>, votre benefice net serait de <strong style="color: var(--accent-green);">' + Math.round(benefAligne).toLocaleString() + ' ' + deviseActuelle + '</strong> par vente (marge ' + Math.round((benefAligne / d.prixConcurrence) * 100) + '%).';
        } else {
            aligneMsg.innerHTML = '<span style="color: var(--accent-red); font-weight: 700;">Alerte : S\'aligner sur la concurrence (' + Math.round(d.prixConcurrence).toLocaleString() + ' ' + deviseActuelle + ') vous fera perdre ' + Math.round(Math.abs(benefAligne)).toLocaleString() + ' ' + deviseActuelle + ' par vente. Votre cout reel est trop eleve pour ce marche.</span>';
        }
    } else {
        scenarioAligne.style.display = 'none';
    }

    const prixEquilibre = Math.round(coutRevient / 0.80);
    document.getElementById('fixScenarioEquilibreMsg').innerHTML = 'Pour couvrir tous vos frais avec <strong>20% de marge de securite</strong> pour les imprevus (retours, casse, remises), vendez a minimum <strong style="color: var(--accent-blue); font-size: 14px;">' + prixEquilibre.toLocaleString() + ' ' + deviseActuelle + '</strong>. Benefice net: ' + Math.round(prixEquilibre - coutRevient).toLocaleString() + ' ' + deviseActuelle + '/vente.';

    fixateurData._coutRevient = coutRevient;
    const pocheInput = document.getElementById('fixScenarioPocheInput');
    const pocheSection = document.getElementById('fixScenarioPocheSection');
    if (pocheInput && Number(pocheInput.value) > 0) {
        fixCalculerPoche();
        if (pocheSection) pocheSection.style.display = 'block';
    } else {
        document.getElementById('fixScenarioPocheMsg').textContent = '';
        if (pocheSection) pocheSection.style.display = 'none';
    }

    const justifEl = document.getElementById('fixJustifierPrix');
    const justifContenu = document.getElementById('fixJustifierContenu');
    const prixConseilleFinal = conseille;
    if (d.prixConcurrence && d.prixConcurrence > 0 && prixConseilleFinal > d.prixConcurrence) {
        justifEl.style.display = 'block';
        const tips = [
            { icon: 'fa-truck', color: 'var(--accent-green)', text: 'Offrez la livraison gratuite pour justifier le prix et eliminer une friction d\'achat.' },
            { icon: 'fa-box-open', color: 'var(--accent-purple)', text: 'Ameliorez le packaging : un emballage premium augmente la valeur percue de 20 a 40%.' },
            { icon: 'fa-headset', color: 'var(--accent-blue)', text: 'Misez sur le SAV : un suivi client exceptionnel (WhatsApp, echange rapide) fidélise et justifie un prix plus eleve.' },
            { icon: 'fa-gift', color: 'var(--accent-orange)', text: 'Ajoutez un bonus ou cadeau : un petit extra surprise cree un effet "wow" qui desactive la comparaison de prix.' },
            { icon: 'fa-certificate', color: '#ec4899', text: 'Creez une marque / identite forte : les clients paient plus cher pour une marque en qui ils ont confiance.' },
            { icon: 'fa-clock', color: 'var(--accent-cyan)', text: 'Proposez une livraison express : la rapidite est un argument de vente puissant que vos concurrents n\'ont peut-etre pas.' }
        ];
        let tHtml = '';
        tips.forEach(t => {
            tHtml += '<div style="display: flex; align-items: flex-start; gap: 10px;"><i class="fas ' + t.icon + '" style="color: ' + t.color + '; font-size: 14px; margin-top: 2px; flex-shrink: 0;"></i><span style="font-size: 11px; color: var(--text-secondary); line-height: 1.5;">' + t.text + '</span></div>';
        });
        justifContenu.innerHTML = tHtml;
    } else {
        justifEl.style.display = 'none';
    }
}

function fixCalculerPoche() {
    const montantNet = Number(document.getElementById('fixScenarioPocheInput').value) || 0;
    const msg = document.getElementById('fixScenarioPocheMsg');
    if (montantNet <= 0 || !fixateurData._coutRevient) {
        msg.textContent = '';
        return;
    }
    const prixPoche = Math.round(fixateurData._coutRevient + montantNet);
    const margePoche = Math.round((montantNet / prixPoche) * 100);
    msg.innerHTML = 'Pour garder <strong>' + Math.round(montantNet).toLocaleString() + ' ' + deviseActuelle + ' net</strong> dans votre poche, vous devez vendre a <strong style="color: var(--accent-green); font-size: 14px;">' + prixPoche.toLocaleString() + ' ' + deviseActuelle + '</strong> (marge ' + margePoche + '%).';
    if (fixateurData.prixConcurrence && prixPoche > fixateurData.prixConcurrence) {
        msg.innerHTML += '<br><span style="font-size: 10px; color: var(--accent-orange);"><i class="fas fa-exclamation-circle" style="margin-right: 4px;"></i>Ce prix est au-dessus du concurrent (' + Math.round(fixateurData.prixConcurrence).toLocaleString() + ' ' + deviseActuelle + '). Consultez les conseils de justification ci-dessous.</span>';
    }
}

function fixRecommencer() {
    document.getElementById('fixRapport').classList.add('hidden');
    document.getElementById('fixEtape1').classList.remove('hidden');
    document.getElementById('fixEtape2').classList.add('hidden');
    document.getElementById('fixEtape3').classList.add('hidden');

    document.getElementById('fixProgressBar1').style.width = '0%';
    document.getElementById('fixProgressBar2').style.width = '0%';
    ['fixStep2Dot', 'fixStep3Dot'].forEach(id => {
        const el = document.getElementById(id);
        el.style.background = 'var(--glass-bg)';
        el.style.border = '2px solid var(--diamond-border)';
        el.style.color = 'var(--text-muted)';
    });

    document.getElementById('fixNomProduit').value = '';
    document.getElementById('fixPrixObjectif').value = '';
    document.getElementById('fixPrixConcurrence').value = '';
    document.getElementById('fixPrixConcurrence').disabled = false;
    document.getElementById('fixPrixConcurrence').style.opacity = '1';
    document.getElementById('fixConcurrenceInconnu').checked = false;

    document.getElementById('fixLocalPrixAchat').value = '';
    document.getElementById('fixLocalTransportMontant').value = '';
    document.getElementById('fixLocalTransportNb').value = '';
    document.getElementById('fixImportCoutGlobal').value = '';
    document.getElementById('fixImportNbGlobal').value = '';
    document.getElementById('fixImportPrixUnit').value = '';
    document.getElementById('fixImportFraisLog').value = '';
    document.getElementById('fixImportNbDetail').value = '';
    document.getElementById('fixProdCoutMateriaux').value = '';
    document.getElementById('fixProdHeures').value = '';
    document.getElementById('fixProdPrixHeure').value = '';
    document.getElementById('fixProdFacturerTemps').checked = false;

    ['fixZoneLocal', 'fixZoneImport', 'fixZoneProduction', 'fixZoneTransportPaye',
     'fixZoneImportGlobal', 'fixZoneImportDetail', 'fixZoneTemps'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    ['fixRadioLocal', 'fixRadioImport', 'fixRadioProduction'].forEach(id => {
        const el = document.getElementById(id);
        el.style.background = 'var(--glass-bg)';
        el.style.borderColor = 'var(--diamond-border)';
    });
    ['fixDotLocalInner', 'fixDotImportInner', 'fixDotProductionInner'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    ['fixDotLocal', 'fixDotImport', 'fixDotProduction'].forEach(id => {
        document.getElementById(id).style.borderColor = 'var(--diamond-border)';
    });
    ['fixRadioTransportGratuit', 'fixRadioTransportPaye'].forEach(id => {
        const el = document.getElementById(id);
        el.style.borderColor = 'var(--diamond-border)';
        el.style.background = 'var(--glass-bg)';
    });
    ['fixDotTransGratuit', 'fixDotTransPaye'].forEach(id => {
        const el = document.getElementById(id);
        el.style.borderColor = 'var(--diamond-border)';
        el.style.background = 'transparent';
    });
    ['fixBtnImportGlobal', 'fixBtnImportDetail'].forEach(id => {
        const el = document.getElementById(id);
        el.className = 'btn btn-secondary';
        el.style.flex = '1'; el.style.padding = '12px'; el.style.fontSize = '12px';
    });

    document.getElementById('fixCanalBoutique').checked = false;
    document.getElementById('fixCanalEnLigne').checked = false;
    ['fixZoneBoutique', 'fixZoneEnLigne'].forEach(id => document.getElementById(id).classList.add('hidden'));
    ['fixCanalBoutiqueLabel', 'fixCanalEnLigneLabel'].forEach(id => {
        const el = document.getElementById(id);
        el.style.borderColor = 'var(--diamond-border)';
        el.style.background = 'var(--glass-bg)';
    });

    document.getElementById('fixBoutiqueLoyerMensuel').value = '';
    document.getElementById('fixBoutiqueVolumeSeul').value = '';
    document.getElementById('fixBoutiqueVolumeSeul').disabled = false;
    document.getElementById('fixBoutiqueVolumeSeul').style.opacity = '1';
    const bvBtn = document.getElementById('fixBtnBoutiqueVolumeInconnu');
    if (bvBtn) { bvBtn.className = 'btn btn-secondary'; bvBtn.style.padding = '8px 12px'; bvBtn.style.fontSize = '10px'; }
    const bvZone = document.getElementById('fixZoneBoutiqueVolumeInconnu');
    if (bvZone) bvZone.classList.add('hidden');
    ['fixZoneProduitSeul', 'fixZoneProduitMultiple', 'fixZonePourcentLoyer'].forEach(id => document.getElementById(id).classList.add('hidden'));
    ['fixBtnProduitSeulOui', 'fixBtnProduitSeulNon'].forEach(id => {
        const el = document.getElementById(id);
        el.className = 'btn btn-secondary';
        el.style.flex = '1'; el.style.padding = '10px'; el.style.fontSize = '12px';
    });
    document.getElementById('fixPaliersAutresProduits').querySelectorAll('button').forEach(btn => {
        btn.className = 'btn btn-secondary';
        btn.style.padding = '8px 14px'; btn.style.fontSize = '11px';
    });
    document.getElementById('fixPourcentBtns').querySelectorAll('button').forEach(btn => {
        btn.className = 'btn btn-secondary';
        btn.style.flex = '1'; btn.style.padding = '10px'; btn.style.fontSize = '12px';
    });

    ['fixBtnPubOui', 'fixBtnPubNon'].forEach(id => {
        const el = document.getElementById(id);
        el.className = 'btn btn-secondary';
        el.style.flex = '1'; el.style.padding = '10px'; el.style.fontSize = '12px';
    });
    ['fixZonePubOui', 'fixZonePubNon', 'fixZonePubJour', 'fixZoneVolumeInconnu'].forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('fixEnLigneBudgetPub').value = '';
    document.getElementById('fixEnLigneBudgetPub').disabled = false;
    document.getElementById('fixEnLigneBudgetPub').style.opacity = '1';
    document.getElementById('fixPubInconnu').checked = false;
    document.getElementById('fixEnLignePubJour').value = '';
    document.getElementById('fixEnLigneVolume').value = '';
    document.getElementById('fixEnLigneVolume').disabled = false;
    document.getElementById('fixEnLigneVolume').style.opacity = '1';
    const volBtn = document.getElementById('fixBtnVolumeInconnu');
    volBtn.className = 'btn btn-secondary';
    volBtn.style.padding = '8px 12px'; volBtn.style.fontSize = '10px';

    ['fixBtnStaffNon', 'fixBtnStaffSalaire', 'fixBtnStaffCommission'].forEach(id => {
        const el = document.getElementById(id);
        el.className = 'btn btn-secondary';
        el.style.padding = '10px'; el.style.fontSize = '12px'; el.style.textAlign = 'left';
    });
    ['fixZoneStaffSalaire', 'fixZoneStaffCommission'].forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('fixStaffSalaireMontant').value = '';
    document.getElementById('fixStaffCommissionMontant').value = '';

    document.getElementById('fixScenarioPocheInput').value = '';
    const pocheSection = document.getElementById('fixScenarioPocheSection');
    if (pocheSection) pocheSection.style.display = 'none';

    fixateurData = {};
    hapticFeedback();
}

// ============================================
// DASHBOARD CEO
// ============================================
let chartEvolution = null;
let chartRepartition = null;
let periodeKPIActive = 'mois';

function changerPeriodeKPI(periode) {
    periodeKPIActive = periode;
    
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const dateRangeSelector = document.getElementById('dateRangeSelector');
    if (periode === 'personnalise') {
        dateRangeSelector.style.display = 'block';
    } else {
        dateRangeSelector.style.display = 'none';
    }
    
    updateKPILabels(periode);
    updateKPIsByPeriod(periode);
    hapticFeedback();
}

// ============================================
// KPI EXPLAIN MODAL
// ============================================
function showKPIExplain(type) {
    const modal = document.getElementById('kpiExplainModal');
    const overlay = document.getElementById('kpiExplainOverlay');
    const titleEl = document.getElementById('kpiExplainTitle');
    const contentEl = document.getElementById('kpiExplainContent');
    
    const caValue = document.getElementById('kpiCaMois').textContent;
    const benefValue = document.getElementById('kpiBeneficeMois').textContent;
    const margeValue = document.getElementById('kpiMargeMoyenne').textContent;
    const ventesValue = document.getElementById('kpiNbVentes').textContent;
    
    const explains = {
        ca: {
            icon: 'fa-chart-line',
            color: 'var(--accent-blue)',
            title: 'Chiffre d\'Affaires (CA)',
            content: `<p><strong>Votre CA actuel: ${caValue}</strong></p>
                <p>Le Chiffre d\'Affaires represente le total de vos recettes generees par les ventes sur la periode selectionnee.</p>
                <div class="kpi-explain-formula">CA = Prix de vente x Quantite vendue</div>
                <p>C\'est le montant brut que vous avez encaisse avant deduction des charges. Il indique le volume d\'activite de votre entreprise.</p>`
        },
        benefice: {
            icon: 'fa-coins',
            color: 'var(--accent-green)',
            title: 'Benefice Net',
            content: `<p><strong>Votre Benefice: ${benefValue}</strong></p>
                <p>Le Benefice Net est ce qu\'il vous reste apres avoir paye toutes vos charges: achat marchandise, pub, livraison, commission.</p>
                <div class="kpi-explain-formula">Benefice = CA - (Cout achat + Pub + Livraison + Commission)</div>
                <p>C\'est l\'argent reel que vous gagnez. Un benefice positif signifie que votre activite est rentable.</p>`
        },
        marge: {
            icon: 'fa-percentage',
            color: 'var(--accent-orange)',
            title: 'Marge Moyenne',
            content: `<p><strong>Votre Marge: ${margeValue}</strong></p>
                <p>La Marge Moyenne represente le pourcentage de benefice que vous realisez en moyenne sur chaque vente.</p>
                <div class="kpi-explain-formula">Marge = (Benefice / CA) x 100</div>
                <p>Une marge de 30% signifie que pour 100F de CA, vous gagnez 30F net. Plus la marge est elevee, plus vous etes rentable.</p>`
        },
        ventes: {
            icon: 'fa-shopping-bag',
            color: 'var(--accent-purple)',
            title: 'Nombre de Ventes',
            content: `<p><strong>Vos Ventes: ${ventesValue}</strong></p>
                <p>C\'est le nombre total de transactions effectuees sur la periode selectionnee.</p>
                <div class="kpi-explain-formula">Ventes = Nombre de commandes enregistrees</div>
                <p>Un nombre eleve de ventes avec un CA faible peut indiquer des prix trop bas. L\'ideal est d\'augmenter les deux.</p>`
        }
    };
    
    const data = explains[type];
    titleEl.innerHTML = `<i class="fas ${data.icon}" style="color: ${data.color};"></i><span>${data.title}</span>`;
    contentEl.innerHTML = data.content;
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

function closeKPIExplain() {
    document.getElementById('kpiExplainModal').classList.remove('show');
    document.getElementById('kpiExplainOverlay').classList.remove('show');
}

// ============================================
// KPI PERIOD MANAGEMENT
// ============================================
function updateKPILabels(periode) {
    const labels = {
        'jour': { ca: 'CA du Jour', benefice: 'Benefice Jour', ventes: 'Ventes Jour' },
        'semaine': { ca: 'CA Semaine', benefice: 'Benefice Semaine', ventes: 'Ventes Semaine' },
        'mois': { ca: 'CA du Mois', benefice: 'Benefice Mois', ventes: 'Ventes Mois' },
        'personnalise': { ca: 'CA Periode', benefice: 'Benefice Periode', ventes: 'Ventes Periode' }
    };
    
    const l = labels[periode] || labels['mois'];
    const caLabel = document.getElementById('kpiCaLabel');
    const benefLabel = document.getElementById('kpiBeneficeLabel');
    const ventesLabel = document.getElementById('kpiVentesLabel');
    
    if (caLabel) caLabel.textContent = l.ca;
    if (benefLabel) benefLabel.textContent = l.benefice;
    if (ventesLabel) ventesLabel.textContent = l.ventes;
}

function updateKPIsByPeriod(periode) {
    const now = new Date();
    let dateDebut, dateFin;
    
    if (periode === 'jour') {
        dateDebut = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (periode === 'semaine') {
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        dateDebut = new Date(now.setDate(diff));
        dateDebut.setHours(0, 0, 0, 0);
        dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + 6);
        dateFin.setHours(23, 59, 59);
    } else if (periode === 'mois') {
        dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFin = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else {
        return;
    }
    
    updateKPIsWithDates(dateDebut, dateFin);
}

function updateKPIsByDateRange() {
    const debutInput = document.getElementById('kpiDateDebut').value;
    const finInput = document.getElementById('kpiDateFin').value;
    
    if (!debutInput || !finInput) return;
    
    const dateDebut = new Date(debutInput);
    const dateFin = new Date(finInput);
    dateFin.setHours(23, 59, 59);
    
    updateKPIsWithDates(dateDebut, dateFin);
}

function updateKPIsWithDates(dateDebut, dateFin) {
    const ventesPeriode = ventes.filter(v => {
        const date = new Date(v.date);
        return date >= dateDebut && date <= dateFin;
    });
    
    const ca = ventesPeriode.reduce((sum, v) => sum + v.ca, 0);
    const benefice = ventesPeriode.filter(v => !v.retournee).reduce((sum, v) => sum + v.benefice, 0);
    const marge = ca > 0 ? (benefice / ca * 100) : 0;
    const nbVentes = ventesPeriode.length;
    
    const kpiCa = document.getElementById('kpiCaMois');
    const kpiBenef = document.getElementById('kpiBeneficeMois');
    const kpiMarge = document.getElementById('kpiMargeMoyenne');
    const kpiVentes = document.getElementById('kpiNbVentes');
    
    if (kpiCa) animateCounter(kpiCa, Math.round(ca), 500, ' ' + deviseActuelle);
    if (kpiBenef) {
        animateCounter(kpiBenef, Math.round(benefice), 500, ' ' + deviseActuelle);
        kpiBenef.style.color = benefice >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    }
    if (kpiMarge) animateCounter(kpiMarge, Math.round(marge * 10) / 10, 500, '%');
    if (kpiVentes) animateCounter(kpiVentes, nbVentes, 500, '');
}

function chargerDashboard() {
    const maintenant = new Date();
    const moisActuel = maintenant.getMonth();
    const anneeActuelle = maintenant.getFullYear();
    
    const ventesMois = ventes.filter(v => {
        const date = new Date(v.date);
        return date.getMonth() === moisActuel && date.getFullYear() === anneeActuelle;
    });
    
    const caMois = ventesMois.reduce((sum, v) => sum + v.ca, 0);
    const kpiCa = document.getElementById('kpiCaMois');
    if (kpiCa) {
        animateCounter(kpiCa, Math.round(caMois), 1000, ' ' + deviseActuelle);
    }
    
    const beneficeMois = ventesMois.filter(v => !v.retournee).reduce((sum, v) => sum + v.benefice, 0);
    const kpiBenef = document.getElementById('kpiBeneficeMois');
    if (kpiBenef) {
        animateCounter(kpiBenef, Math.round(beneficeMois), 1000, ' ' + deviseActuelle);
        kpiBenef.style.color = beneficeMois >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    }
    
    const margeMoyenne = caMois > 0 ? (beneficeMois / caMois * 100) : 0;
    const kpiMarge = document.getElementById('kpiMargeMoyenne');
    if (kpiMarge) {
        kpiMarge.textContent = margeMoyenne.toFixed(1) + '%';
        kpiMarge.style.color = margeMoyenne >= 30 ? 'var(--accent-green)' : margeMoyenne >= 15 ? 'var(--accent-orange)' : 'var(--accent-red)';
    }
    
    const kpiNb = document.getElementById('kpiNbVentes');
    if (kpiNb) {
        animateCounter(kpiNb, ventesMois.length, 800, '');
    }
    
    afficherObjectifMensuel();
    afficherProduitTop(ventesMois);
    afficherTauxRetour(ventesMois);
    
    chargerGraphiqueEvolution();
    
    if (projets.length > 0 && ventesMois.length > 0) {
        document.getElementById('cardRepartitionCA').style.display = 'block';
        chargerGraphiqueRepartition(ventesMois);
    } else {
        document.getElementById('cardRepartitionCA').style.display = 'none';
    }
    
    chargerProduitsRisque();
    updateObjectiveSlide();
    updateRecapSlide();
}

function definirObjectif() {
    const existant = JSON.parse(localStorage.getItem('veko_objectif') || 'null');
    const typeDefaut = existant ? existant.type : 'CA';
    const montantDefaut = existant ? existant.montant : '';

    const overlay = document.createElement('div');
    overlay.id = 'objectifOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;';
    overlay.innerHTML = `
        <div style="width:100%;max-width:360px;background:var(--dark-card);border:1px solid var(--diamond-border);border-radius:20px;padding:28px;">
            <h3 style="font-size:16px;font-weight:800;color:var(--text-primary);margin-bottom:20px;text-align:center;">
                <i class="fas fa-bullseye" style="color:var(--accent-orange);margin-right:8px;"></i>Fixer un objectif
            </h3>
            <div style="margin-bottom:14px;">
                <label style="font-size:11px;color:var(--text-muted);font-weight:600;display:block;margin-bottom:6px;">Type d'objectif</label>
                <select id="objectifTypeModal" class="input" style="padding:12px;">
                    <option value="CA" ${typeDefaut === 'CA' ? 'selected' : ''}>Chiffre d'Affaires (CA)</option>
                    <option value="Benefice" ${typeDefaut === 'Benefice' ? 'selected' : ''}>B\u00e9n\u00e9fice Net</option>
                    <option value="Ventes" ${typeDefaut === 'Ventes' ? 'selected' : ''}>Nombre de ventes</option>
                </select>
            </div>
            <div style="margin-bottom:20px;">
                <label style="font-size:11px;color:var(--text-muted);font-weight:600;display:block;margin-bottom:6px;">Montant / Nombre cible</label>
                <input type="number" id="objectifMontantModal" class="input" placeholder="Ex: 500000" value="${montantDefaut}" style="padding:12px;">
            </div>
            <div style="display:flex;gap:10px;">
                <button onclick="fermerObjectifModal()" style="flex:1;padding:12px;background:var(--glass-bg);border:1px solid var(--diamond-border);border-radius:10px;color:var(--text-secondary);font-size:13px;font-weight:600;cursor:pointer;">Annuler</button>
                <button onclick="sauverObjectif()" style="flex:1;padding:12px;background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:10px;color:white;font-size:13px;font-weight:700;cursor:pointer;">Valider</button>
            </div>
            ${existant ? '<button onclick="supprimerObjectif()" style="width:100%;margin-top:10px;padding:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:10px;color:var(--accent-red);font-size:12px;cursor:pointer;font-weight:600;">Supprimer l\'objectif</button>' : ''}
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) fermerObjectifModal(); });
}

function fermerObjectifModal() {
    const o = document.getElementById('objectifOverlay');
    if (o) o.remove();
}

function sauverObjectif() {
    const type = document.getElementById('objectifTypeModal').value;
    const montant = parseFloat(document.getElementById('objectifMontantModal').value);
    if (!montant || montant <= 0) return;
    const now = new Date();
    const obj = { type: type, montant: montant, mois: now.getMonth(), annee: now.getFullYear() };
    localStorage.setItem('veko_objectif', JSON.stringify(obj));
    fermerObjectifModal();
    afficherObjectifMensuel();
    try { chargerDashboard(); } catch(e) {}
}

function supprimerObjectif() {
    localStorage.removeItem('veko_objectif');
    fermerObjectifModal();
    document.getElementById('cardObjectif').style.display = 'none';
    try { chargerDashboard(); } catch(e) {}
}

function afficherObjectifMensuel() {
    const cardObjectif = document.getElementById('cardObjectif');
    
    if (!objectifPersonnel) {
        cardObjectif.style.display = 'none';
        return;
    }
    
    cardObjectif.style.display = 'block';
    
    const debutParts = objectifPersonnel.dateDebut.split('-');
    const dateDebutObj = new Date(debutParts[0], debutParts[1] - 1, debutParts[2], 0, 0, 0);
    const finParts = objectifPersonnel.dateFin.split('-');
    const dateFinObj = new Date(finParts[0], finParts[1] - 1, finParts[2], 23, 59, 59);
    
    const ventesObjectif = ventes.filter(v => {
        const d = new Date(v.date);
        return d >= dateDebutObj && d <= dateFinObj && !v.retournee;
    });
    
    let valeurActuelle = 0;
    if (objectifPersonnel.type === 'CA') {
        valeurActuelle = ventesObjectif.reduce((sum, v) => sum + v.ca, 0);
    } else if (objectifPersonnel.type === 'Ventes') {
        valeurActuelle = ventesObjectif.length;
    } else {
        valeurActuelle = ventesObjectif.reduce((sum, v) => sum + v.benefice, 0);
    }
    
    const progression = Math.min((valeurActuelle / objectifPersonnel.montantTotal) * 100, 100);
    const couleur = progression >= 100 ? 'var(--accent-green)' : progression >= 75 ? 'var(--accent-orange)' : 'var(--accent-blue)';
    const joursRestants = objectifPersonnel.joursRestants || 0;
    const unite = objectifPersonnel.type === 'Ventes' ? '' : ' ' + deviseActuelle;
    
    document.getElementById('objectifDetails').innerHTML = `
        <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 12px; color: var(--text-muted);">${objectifPersonnel.type} | ${joursRestants} jour(s) restant(s)</span>
                <span style="font-size: 12px; font-weight: 700; color: ${couleur};">${progression.toFixed(0)}%</span>
            </div>
            <div style="background: var(--diamond-border); height: 10px; border-radius: 5px; overflow: hidden;">
                <div style="background: ${couleur}; height: 100%; width: ${progression}%; transition: all 0.5s; border-radius: 5px;"></div>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
            <span>${objectifPersonnel.type === 'Ventes' ? valeurActuelle : Math.round(valeurActuelle).toLocaleString()}${unite}</span>
            <span>${objectifPersonnel.type === 'Ventes' ? objectifPersonnel.montantTotal : Math.round(objectifPersonnel.montantTotal).toLocaleString()}${unite}</span>
        </div>
    `;
    
    checkObjectifAtteint(progression, 'general');
}

function afficherProduitTop(ventesMois) {
    const container = document.getElementById('produitTopPerf');
    
    if (projets.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 12px;">Creez des projets d'abord</p>`;
        return;
    }
    
    const statsProj = {};
    projets.forEach(p => {
        const ventesP = ventesMois.filter(v => v.projetId === p.id && !v.retournee);
        const benefP = ventesP.reduce((sum, v) => sum + v.benefice, 0);
        statsProj[p.id] = { nom: p.nom, benef: benefP, nb: ventesP.length };
    });
    
    const meilleur = Object.values(statsProj).sort((a, b) => b.benef - a.benef)[0];
    
    if (meilleur && meilleur.nb > 0) {
        container.innerHTML = `
            <div style="background: var(--gradient-success); color: white; padding: 14px; border-radius: 12px;">
                <div style="font-size: 16px; font-weight: 900; margin-bottom: 4px;">${meilleur.nom}</div>
                <div style="font-size: 12px; opacity: 0.9;">${meilleur.nb} vente(s) | ${Math.round(meilleur.benef).toLocaleString()} ${deviseActuelle}</div>
            </div>
        `;
    } else {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 12px;">Aucune vente ce mois</p>`;
    }
}

function afficherTauxRetour(ventesMois) {
    const container = document.getElementById('tauxRetour');
    
    const nbRetours = ventesMois.filter(v => v.retournee).length;
    const tauxRetour = ventesMois.length > 0 ? (nbRetours / ventesMois.length * 100) : 0;
    const couleurRetour = tauxRetour >= 10 ? 'var(--accent-red)' : tauxRetour >= 5 ? 'var(--accent-orange)' : 'var(--accent-green)';
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: var(--text-muted);">${nbRetours} retour(s) sur ${ventesMois.length} vente(s)</span>
            <span style="font-size: 22px; font-weight: 900; color: ${couleurRetour};">${tauxRetour.toFixed(1)}%</span>
        </div>
    `;
}

function getChartTextColor(opacity) {
    const theme = document.documentElement.getAttribute('data-theme');
    let isDark = true;
    if (theme === 'light') isDark = false;
    else if (theme === 'system') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? 'rgba(255,255,255,' + opacity + ')' : 'rgba(26,26,46,' + opacity + ')';
}

function getChartGridColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    let isDark = true;
    if (theme === 'light') isDark = false;
    else if (theme === 'system') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
}

function chargerGraphiqueEvolution() {
    const ctx = document.getElementById('chartEvolution7j');
    if (!ctx) return;
    
    if (chartEvolution) {
        chartEvolution.destroy();
    }
    
    const nbJours = Number(document.getElementById('chartPeriodSelect').value) || 7;
    const projetIdFilter = document.getElementById('chartProduitSelect').value;
    
    const labels = [];
    const dataCA = [];
    const dataBenef = [];
    
    for (let i = nbJours - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        labels.push(dateStr);
        
        let ventesJour = ventes.filter(v => {
            const dv = new Date(v.date);
            return dv.toDateString() === date.toDateString();
        });
        
        if (projetIdFilter) {
            ventesJour = ventesJour.filter(v => v.projetId === Number(projetIdFilter));
        }
        
        dataCA.push(ventesJour.reduce((sum, v) => sum + v.ca, 0));
        dataBenef.push(ventesJour.filter(v => !v.retournee).reduce((sum, v) => sum + v.benefice, 0));
    }
    
    const totalCA = dataCA.reduce((a, b) => a + b, 0);
    const totalBenef = dataBenef.reduce((a, b) => a + b, 0);
    const moyenneCA = totalCA / nbJours;
    const moyenneBenef = totalBenef / nbJours;
    
    const statsContainer = document.getElementById('chartStatsContainer');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; padding: 12px; background: var(--glass-bg); border-radius: 12px; border: 1px solid var(--diamond-border);">
                <div style="text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Total CA</div>
                    <div style="font-size: 14px; font-weight: 900; color: var(--accent-blue);">${Math.round(totalCA).toLocaleString()}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Total Benef</div>
                    <div style="font-size: 14px; font-weight: 900; color: ${totalBenef >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">${Math.round(totalBenef).toLocaleString()}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Moy CA/j</div>
                    <div style="font-size: 14px; font-weight: 900; color: var(--accent-blue);">${Math.round(moyenneCA).toLocaleString()}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Moy Benef/j</div>
                    <div style="font-size: 14px; font-weight: 900; color: ${moyenneBenef >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">${Math.round(moyenneBenef).toLocaleString()}</div>
                </div>
            </div>
        `;
    }
    
    const couleursProduits = [
        { border: 'rgba(59, 130, 246, 1)', bg: 'rgba(59, 130, 246, 0.1)' },
        { border: 'rgba(16, 185, 129, 1)', bg: 'rgba(16, 185, 129, 0.1)' },
        { border: 'rgba(139, 92, 246, 1)', bg: 'rgba(139, 92, 246, 0.1)' },
        { border: 'rgba(245, 158, 11, 1)', bg: 'rgba(245, 158, 11, 0.1)' },
        { border: 'rgba(239, 68, 68, 1)', bg: 'rgba(239, 68, 68, 0.1)' },
        { border: 'rgba(6, 182, 212, 1)', bg: 'rgba(6, 182, 212, 0.1)' },
        { border: 'rgba(236, 72, 153, 1)', bg: 'rgba(236, 72, 153, 0.1)' },
        { border: 'rgba(34, 197, 94, 1)', bg: 'rgba(34, 197, 94, 0.1)' }
    ];
    
    let datasets = [];
    
    if (!projetIdFilter && projets.length > 1) {
        projets.forEach((projet, index) => {
            const couleur = couleursProduits[index % couleursProduits.length];
            const dataProjet = [];
            
            for (let i = nbJours - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                
                const ventesJour = ventes.filter(v => {
                    const dv = new Date(v.date);
                    return dv.toDateString() === date.toDateString() && v.projetId === projet.id && !v.retournee;
                });
                
                dataProjet.push(ventesJour.reduce((sum, v) => sum + v.benefice, 0));
            }
            
            const hasData = dataProjet.some(d => d !== 0);
            if (hasData) {
                datasets.push({
                    label: projet.nom,
                    data: dataProjet,
                    borderColor: couleur.border,
                    backgroundColor: couleur.bg,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 4,
                    pointBackgroundColor: couleur.border,
                    pointBorderColor: couleur.border,
                    pointBorderWidth: 2,
                    borderWidth: 2
                });
            }
        });
        
        datasets.push({
            label: 'CA Total',
            data: dataCA,
            borderColor: getChartTextColor(0.5),
            backgroundColor: getChartTextColor(0.05),
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: getChartTextColor(0.5),
            pointBorderColor: getChartTextColor(0.8),
            pointBorderWidth: 1,
            borderWidth: 1,
            borderDash: [5, 5]
        });
    } else {
        datasets = [{
            label: 'CA (Chiffre d\'Affaires)',
            data: dataCA,
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: 'rgba(59, 130, 246, 1)',
            pointBorderWidth: 2
        }, {
            label: 'Benefice Net',
            data: dataBenef,
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointBorderColor: 'rgba(16, 185, 129, 1)',
            pointBorderWidth: 2
        }];
    }
    
    chartEvolution = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: { 
                        color: getChartTextColor(0.7), 
                        font: { size: 11, weight: 'bold' },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(18, 26, 46, 0.95)',
                    titleColor: '#fff',
                    bodyColor: 'rgba(255,255,255,0.8)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' ' + deviseActuelle;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: getChartTextColor(0.5), font: { size: 10 } },
                    grid: { color: getChartGridColor() }
                },
                y: { 
                    beginAtZero: true,
                    ticks: { 
                        color: getChartTextColor(0.5), 
                        font: { size: 10 },
                        callback: function(value) {
                            if (value >= 1000000) return (value/1000000).toFixed(1) + 'M';
                            if (value >= 1000) return (value/1000).toFixed(0) + 'K';
                            return value;
                        }
                    },
                    grid: { color: getChartGridColor() }
                }
            }
        }
    });
}

function chargerGraphiqueRepartition(ventesMois) {
    const ctx = document.getElementById('chartRepartitionCA');
    if (!ctx) return;
    
    if (chartRepartition) {
        chartRepartition.destroy();
    }
    
    const caParProjet = {};
    projets.forEach(p => {
        const caP = ventesMois.filter(v => v.projetId === p.id).reduce((sum, v) => sum + v.ca, 0);
        if (caP > 0) {
            caParProjet[p.nom] = caP;
        }
    });
    
    const caSansProjet = ventesMois.filter(v => !v.projetId).reduce((sum, v) => sum + v.ca, 0);
    if (caSansProjet > 0) {
        caParProjet['Sans projet'] = caSansProjet;
    }
    
    chartRepartition = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(caParProjet),
            datasets: [{
                data: Object.values(caParProjet),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
                borderWidth: 2,
                borderColor: 'rgba(10, 15, 30, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: { 
                        color: getChartTextColor(0.7), 
                        font: { size: 11, weight: 'bold' },
                        padding: 12,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const pct = ((value / total) * 100).toFixed(1);
                                return {
                                    text: label + ': ' + value.toLocaleString() + ' F (' + pct + '%)',
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(18, 26, 46, 0.95)',
                    titleColor: '#fff',
                    bodyColor: 'rgba(255,255,255,0.8)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed.toLocaleString() + ' F (' + pct + '%)';
                        }
                    }
                }
            }
        }
    });
}

function chargerProduitsRisque() {
    const cardProduitsRisque = document.getElementById('cardProduitsRisque');
    const produitsRisque = document.getElementById('produitsRisque');
    
    if (projets.length === 0) {
        cardProduitsRisque.style.display = 'none';
        return;
    }
    
    const produitsProbleme = [];
    
    projets.forEach(p => {
        const ventesRecentes = ventes.filter(v => {
            const date = new Date(v.date);
            const il30j = new Date();
            il30j.setDate(il30j.getDate() - 30);
            return v.projetId === p.id && date >= il30j && !v.retournee;
        });
        
        if (ventesRecentes.length >= 3) {
            const margeMoyenne = ventesRecentes.reduce((sum, v) => sum + (v.benefice / v.ca * 100), 0) / ventesRecentes.length;
            
            if (margeMoyenne < 15) {
                produitsProbleme.push({ nom: p.nom, marge: margeMoyenne });
            }
        }
    });
    
    if (produitsProbleme.length > 0) {
        cardProduitsRisque.style.display = 'block';
        produitsRisque.innerHTML = produitsProbleme.map(p => `
            <div style="background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 10px; margin-bottom: 8px; border-left: 4px solid var(--accent-red);">
                <div style="font-weight: 700; color: var(--accent-red); margin-bottom: 4px;">${p.nom}</div>
                <div style="font-size: 11px; color: var(--text-muted);">Marge: ${p.marge.toFixed(1)}% (en dessous du seuil)</div>
            </div>
        `).join('');
    } else {
        cardProduitsRisque.style.display = 'none';
    }
}

// ============================================
// OBJECTIF MENSUEL
// ============================================
function saveObjectif() {
    const type = document.getElementById('objectifType').value;
    const montant = document.getElementById('objectifMontant').value;
    const dateDebut = document.getElementById('objectifDateDebut').value;
    const dateFin = document.getElementById('objectifDateFin').value;
    
    if (!montant || isNaN(montant) || Number(montant) <= 0) {
        afficherNotification('Veuillez entrer un montant valide', 'error');
        return;
    }
    
    if (!dateDebut || !dateFin) {
        afficherNotification('Veuillez selectionner les dates', 'error');
        return;
    }
    
    if (new Date(dateFin) < new Date(dateDebut)) {
        afficherNotification('La date de fin doit etre apres la date de debut', 'error');
        return;
    }
    
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const joursTotal = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
    const aujourdhui = new Date();
    const joursRestants = Math.max(0, Math.ceil((fin - aujourdhui) / (1000 * 60 * 60 * 24)));
    const montantJournalier = Number(montant) / joursTotal;
    
    objectifPersonnel = {
        type: type,
        montantTotal: Number(montant),
        montantJournalier: montantJournalier,
        dateDebut: dateDebut,
        dateFin: dateFin,
        joursTotal: joursTotal,
        joursRestants: joursRestants
    };
    
    localStorage.setItem('veko_objectif_personnel', JSON.stringify(objectifPersonnel));
    objectifJournalier = montantJournalier;
    
    closeModalObjectif();
    hapticFeedback(30);
    afficherNotification('Objectif defini: ' + Number(montant).toLocaleString() + ' ' + deviseActuelle + ' en ' + joursTotal + ' jours', 'success');
    updateActivityRing();
}

function supprimerObjectif() {
    if (confirm('Voulez-vous vraiment supprimer cet objectif ?')) {
        objectifPersonnel = null;
        localStorage.removeItem('veko_objectif_personnel');
        objectifJournalier = 50000;
        hapticFeedback(30);
        afficherNotification('Objectif supprime', 'success');
        updateActivityRing();
    }
}

function openModalObjectif() {
    const modal = document.getElementById('modalObjectif');
    if (modal) {
        if (objectifPersonnel) {
            document.getElementById('objectifType').value = objectifPersonnel.type || 'Benefice';
            document.getElementById('objectifMontant').value = objectifPersonnel.montantTotal || '';
            document.getElementById('objectifDateDebut').value = objectifPersonnel.dateDebut || '';
            document.getElementById('objectifDateFin').value = objectifPersonnel.dateFin || '';
        } else {
            document.getElementById('objectifType').value = 'Benefice';
            document.getElementById('objectifMontant').value = '';
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('objectifDateDebut').value = today;
            document.getElementById('objectifDateFin').value = '';
        }
        modal.style.display = 'block';
    }
}

function closeModalObjectif() {
    const modal = document.getElementById('modalObjectif');
    if (modal) modal.style.display = 'none';
}

// ============================================
// OBJECTIVE SLIDER
// ============================================
function slideToObjective(index) {
    const slides = document.querySelectorAll('.objective-slide');
    const dots = document.querySelectorAll('.slider-dot');
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function updateObjectiveSlide() {
    const container = document.getElementById('objectifSlideContent');
    if (!container) return;
    
    const objectifData = JSON.parse(localStorage.getItem('veko_objectif_perso') || 'null');
    
    if (!objectifData || !objectifData.montant) {
        container.innerHTML = `
            <div class="objective-empty">
                <div class="objective-empty-icon">
                    <i class="fas fa-plus"></i>
                </div>
                <div style="color: var(--text-muted); font-size: 13px; margin-bottom: 8px;">Aucun objectif defini</div>
                <button class="objective-empty-btn" onclick="definirObjectif()">
                    <i class="fas fa-bullseye"></i>
                    Se fixer un objectif
                </button>
            </div>
        `;
    } else {
        const now = new Date();
        let progression = 0;
        let valeurActuelle = 0;
        
        if (objectifData.type === 'CA') {
            valeurActuelle = ventes.reduce((sum, v) => sum + v.ca, 0);
        } else if (objectifData.type === 'Benefice') {
            valeurActuelle = ventes.filter(v => !v.retournee).reduce((sum, v) => sum + v.benefice, 0);
        } else {
            valeurActuelle = ventes.length;
        }
        
        progression = Math.min((valeurActuelle / objectifData.montant) * 100, 100);
        
        container.innerHTML = `
            <div style="text-align: center; padding: 10px 0;">
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
                    ${objectifData.type}: ${Number(objectifData.montant).toLocaleString()} ${deviseActuelle}
                </div>
                <div style="position: relative; width: 100%; height: 12px; background: var(--diamond-border); border-radius: 6px; overflow: hidden;">
                    <div style="height: 100%; width: ${progression}%; background: var(--gradient-primary); border-radius: 6px; transition: width 0.5s;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px;">
                    <span style="color: var(--text-muted);">Actuel: ${Math.round(valeurActuelle).toLocaleString()} ${objectifData.type !== 'Ventes' ? deviseActuelle : ''}</span>
                    <span style="color: var(--accent-blue); font-weight: 700;">${progression.toFixed(0)}%</span>
                </div>
            </div>
        `;
    }
}

function updateRecapSlide() {
    const recapCA = document.getElementById('recapCA');
    const recapBenefice = document.getElementById('recapBenefice');
    
    if (!recapCA || !recapBenefice) return;
    
    const aujourdhui = new Date();
    const ventesJour = ventes.filter(v => {
        const dateVente = new Date(v.date);
        return dateVente.toDateString() === aujourdhui.toDateString();
    });
    
    const caJour = ventesJour.reduce((sum, v) => sum + v.ca, 0);
    const benefJour = ventesJour.filter(v => !v.retournee).reduce((sum, v) => sum + v.benefice, 0);
    
    animateCounter(recapCA, Math.round(caJour), 500, ' ' + deviseActuelle);
    animateCounter(recapBenefice, Math.round(benefJour), 500, ' ' + deviseActuelle);
    
    recapBenefice.style.color = benefJour >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
}

// ============================================
// EXPORT PDF
// ============================================
function genererRapportPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const maintenant = new Date();
        const moisNom = maintenant.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        
        const ventesMois = ventes.filter(v => {
            const date = new Date(v.date);
            return date.getMonth() === maintenant.getMonth() && date.getFullYear() === maintenant.getFullYear();
        });
        
        const caMois = ventesMois.reduce((sum, v) => sum + v.ca, 0);
        const beneficeMois = ventesMois.filter(v => !v.retournee).reduce((sum, v) => sum + v.benefice, 0);
        const margeMois = caMois > 0 ? (beneficeMois / caMois * 100) : 0;
        const nbVentes = ventesMois.length;
        const nbRetours = ventesMois.filter(v => v.retournee).length;
        const totalPub = ventesMois.reduce((sum, v) => sum + (v.budgetPub || 0), 0);
        const totalPieces = ventesMois.reduce((sum, v) => sum + (v.nbPieces || 0), 0);
        const totalCoutAcquisition = ventesMois.reduce((sum, v) => sum + (v.coutAcquisition || 0), 0);
        const totalCommissions = ventesMois.reduce((sum, v) => sum + (v.commissionTotale || 0), 0);
        const totalLivraison = ventesMois.reduce((sum, v) => sum + (v.fraisLivraisonClient || 0), 0);
        
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('VEKO', 20, 25);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Rapport Mensuel - ' + moisNom, 70, 25);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Recapitulatif Financier', 20, 55);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        let y = 70;
        doc.text('Chiffre d\'Affaires Total: ' + Math.round(caMois).toLocaleString() + ' ' + deviseActuelle, 25, y);
        y += 8;
        
        doc.setTextColor(beneficeMois >= 0 ? 16 : 239, beneficeMois >= 0 ? 185 : 68, beneficeMois >= 0 ? 129 : 68);
        doc.text('Benefice Net Total: ' + Math.round(beneficeMois).toLocaleString() + ' ' + deviseActuelle, 25, y);
        y += 8;
        
        doc.setTextColor(0, 0, 0);
        doc.text('Marge Nette Moyenne: ' + margeMois.toFixed(1) + '%', 25, y);
        y += 12;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Statistiques des Ventes', 20, y);
        y += 12;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Nombre total de ventes: ' + nbVentes, 25, y);
        y += 8;
        doc.text('Nombre d\'articles vendus: ' + totalPieces, 25, y);
        y += 8;
        doc.text('Ventes retournees: ' + nbRetours, 25, y);
        y += 12;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Detail des Depenses', 20, y);
        y += 12;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(239, 68, 68);
        doc.text('Cout d\'Achat Total: ' + Math.round(totalCoutAcquisition).toLocaleString() + ' ' + deviseActuelle, 25, y);
        y += 8;
        doc.text('Budget Publicite Total: ' + Math.round(totalPub).toLocaleString() + ' ' + deviseActuelle, 25, y);
        y += 8;
        doc.text('Commissions Gestionnaire: ' + Math.round(totalCommissions).toLocaleString() + ' ' + deviseActuelle, 25, y);
        y += 8;
        doc.text('Frais de Livraison: ' + Math.round(totalLivraison).toLocaleString() + ' ' + deviseActuelle, 25, y);
        y += 12;
        
        doc.setTextColor(0, 0, 0);
        if (projets.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Performance par Produit', 20, y);
            y += 12;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            const statsProjets = projets.map(p => {
                const ventesP = ventesMois.filter(v => v.projetId === p.id && !v.retournee);
                const benefP = ventesP.reduce((sum, v) => sum + v.benefice, 0);
                const caP = ventesP.reduce((sum, v) => sum + v.ca, 0);
                return { nom: p.nom, nb: ventesP.length, benef: benefP, ca: caP };
            }).sort((a, b) => b.benef - a.benef);
            
            statsProjets.forEach(stat => {
                if (stat.nb > 0) {
                    doc.setTextColor(stat.benef >= 0 ? 16 : 239, stat.benef >= 0 ? 185 : 68, stat.benef >= 0 ? 129 : 68);
                    doc.text(stat.nom + ': ' + stat.nb + ' vente(s) - CA: ' + Math.round(stat.ca).toLocaleString() + ' - Benef: ' + Math.round(stat.benef).toLocaleString() + ' ' + deviseActuelle, 25, y);
                    y += 8;
                }
            });
        }
        
        // PAGE 2: Graphiques
        doc.addPage();
        
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Graphiques et Analyses', 20, 17);
        
        doc.setTextColor(0, 0, 0);
        y = 35;
        
        // Graphique Evolution
        if (chartEvolution) {
            try {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Evolution CA et Benefices', 20, y);
                y += 5;
                
                const chartEvolutionImg = chartEvolution.toBase64Image('image/png', 1);
                doc.addImage(chartEvolutionImg, 'PNG', 15, y, 180, 80);
                y += 90;
            } catch (e) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('Graphique d\'evolution non disponible', 25, y);
                y += 15;
            }
        }
        
        // Graphique Repartition
        if (chartRepartition && projets.length > 0) {
            try {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Repartition du CA par Produit', 20, y);
                y += 5;
                
                const chartRepartitionImg = chartRepartition.toBase64Image('image/png', 1);
                doc.addImage(chartRepartitionImg, 'PNG', 40, y, 130, 80);
                y += 90;
            } catch (e) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('Graphique de repartition non disponible', 25, y);
                y += 15;
            }
        }
        
        // Footer page 2
        doc.setTextColor(128, 128, 128);
        doc.setFontSize(9);
        doc.text('Page 2/2', 100, 285);
        
        // Footer page 1
        doc.setPage(1);
        doc.setTextColor(128, 128, 128);
        doc.setFontSize(9);
        doc.text('Rapport genere automatiquement par VEKO', 20, 280);
        doc.text('Date: ' + maintenant.toLocaleDateString('fr-FR') + ' a ' + maintenant.toLocaleTimeString('fr-FR'), 20, 286);
        doc.text('Page 1/2', 100, 285);
        
        doc.save('VEKO_Rapport_' + moisNom.replace(' ', '_') + '.pdf');
        
        hapticFeedback(50);
        afficherNotification('Rapport PDF genere avec succes !', 'success');
        
    } catch (error) {
        console.error('Erreur PDF:', error);
        alert('Erreur lors de la generation du PDF. Verifiez que jsPDF est charge.');
    }
}

// ============================================
// EXPORT / IMPORT DONNEES
// ============================================
function exporterDonnees() {
    const data = {
        ventes: ventes,
        projets: projets,
        devise: deviseActuelle,
        nomUtilisateur: nomUtilisateur,
        objectifJour: objectifJournalier,
        dateExport: new Date().toISOString(),
        version: 'VEKO-V2.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veko-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    hapticFeedback();
    afficherNotification('Donnees exportees !', 'success');
}

function importerDonnees() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (!confirm(`Importer ${data.ventes?.length || 0} ventes et ${data.projets?.length || 0} projets ?\n\nCela remplacera vos donnees actuelles !`)) {
                    return;
                }
                
                ventes = data.ventes || [];
                projets = data.projets || [];
                if (data.devise) {
                    deviseActuelle = data.devise;
                    document.getElementById('deviseActuelle').textContent = deviseActuelle;
                }
                if (data.nomUtilisateur) {
                    nomUtilisateur = data.nomUtilisateur;
                    localStorage.setItem('veko_user_name', nomUtilisateur);
                }
                if (data.objectifJour) {
                    objectifJournalier = data.objectifJour;
                    localStorage.setItem('veko_objectif_jour', objectifJournalier);
                }
                
                sauvegarderDonnees();
                hapticFeedback(50);
                afficherNotification('Import reussi !', 'success');
                location.reload();
                
            } catch (error) {
                alert('Fichier invalide');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// ============================================
// SAUVEGARDE LOCALE
// ============================================
function sauvegarderDonnees() {
    localStorage.setItem('nzoi_ventes', JSON.stringify(ventes));
    localStorage.setItem('nzoi_projets', JSON.stringify(projets));
}

function chargerDonnees() {
    const dataVentes = localStorage.getItem('nzoi_ventes');
    const dataProjets = localStorage.getItem('nzoi_projets');
    const dataDevise = localStorage.getItem('veko_devise');
    const dataObjectif = localStorage.getItem('veko_objectif_personnel');
    
    if (dataVentes) {
        ventes = JSON.parse(dataVentes);
    }
    if (dataProjets) {
        projets = JSON.parse(dataProjets);
    }
    if (dataDevise) {
        deviseActuelle = dataDevise;
        document.querySelectorAll('#deviseActuelle, #deviseActuelleDesktop').forEach(el => {
            el.textContent = deviseActuelle;
        });
    }
    if (dataObjectif) {
        objectifPersonnel = JSON.parse(dataObjectif);
        if (objectifPersonnel) {
            const fin = new Date(objectifPersonnel.dateFin);
            const aujourdhui = new Date();
            objectifPersonnel.joursRestants = Math.max(0, Math.ceil((fin - aujourdhui) / (1000 * 60 * 60 * 24)));
            objectifJournalier = objectifPersonnel.montantJournalier || 50000;
        }
    }
}

// ============================================
// NOTIFICATIONS SYSTEME
// ============================================
function afficherNotification(message, type = 'info') {
    const couleurs = {
        success: 'var(--accent-green)',
        warning: 'var(--accent-orange)',
        error: 'var(--accent-red)',
        info: 'var(--accent-blue)'
    };
    
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${couleurs[type]};
        color: white;
        padding: 14px 18px;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        z-index: 9999;
        font-size: 13px;
        font-weight: 600;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    notif.textContent = message;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100px)';
        notif.style.transition = 'all 0.3s ease-out';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ============================================
// MODE UTILISATEUR
// ============================================
function toggleModeUtilisateur() {
    openModalProfil();
}

// ============================================
// EVENTS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    const emailInput = document.getElementById('authEmail');
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loginWithEmail();
        });
    }
});

window.addEventListener('resize', () => {
    const sidebar = document.querySelector('.desktop-sidebar');
    if (sidebar) {
        if (window.innerWidth >= 1024) {
            sidebar.style.display = 'block';
        } else {
            sidebar.style.display = 'none';
        }
    }
});

window.addEventListener('load', () => {
    const sidebar = document.querySelector('.desktop-sidebar');
    if (sidebar && window.innerWidth >= 1024) {
        sidebar.style.display = 'block';
    }
});

document.addEventListener('click', function(e) {
    const fabMain = document.getElementById('fabMain');
    const fabMenu = document.getElementById('fabMenu');
    
    if (fabMain && fabMenu && !fabMain.contains(e.target) && !fabMenu.contains(e.target)) {
        fabMain.classList.remove('active');
        fabMenu.classList.remove('show');
    }
});

function openModalConfidentialite() {
    const m = document.getElementById('modalConfidentialite');
    if (m) { m.classList.remove('hidden'); m.style.display = 'flex'; }
}
function closeModalConfidentialite() {
    const m = document.getElementById('modalConfidentialite');
    if (m) { m.classList.add('hidden'); m.style.display = 'none'; }
}

// ============================================
// TOGGLE FILTRES DATES
// ============================================
function toggleFiltresDates() {
    const el = document.getElementById('filtresDatesCustom');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function resetFiltresCommandes() {
    const dd = document.getElementById('filtreeDateDebut');
    const df = document.getElementById('filtreeDateFin');
    const fp = document.getElementById('filtreProduit');
    const sc = document.getElementById('searchClient');
    if (dd) dd.value = '';
    if (df) df.value = '';
    if (fp) fp.value = '';
    if (sc) sc.value = '';
    afficherHistorique();
}

function updateFiltreProduit() {
    const select = document.getElementById('filtreProduit');
    if (!select) return;
    const current = select.value;
    const nomsUniques = [...new Set(ventes.filter(v => v.projetNom).map(v => v.projetNom))];
    select.innerHTML = '<option value="">Tous les produits</option>';
    nomsUniques.forEach(nom => {
        select.innerHTML += '<option value="' + nom + '">' + nom + '</option>';
    });
    select.value = current;
}

// ============================================
// SEARCH SUGGESTIONS
// ============================================
function updateSearchSuggestions() {
    const searchVal = (document.getElementById('searchClient')?.value || '').trim().toLowerCase();
    const container = document.getElementById('searchSuggestions');
    if (!container) return;
    
    if (searchVal.length < 2) { container.style.display = 'none'; return; }
    
    const noms = [...new Set(ventes.map(v => v.nomClient).filter(n => n && n !== 'Client' && n.toLowerCase().includes(searchVal)))];
    const tels = [...new Set(ventes.map(v => v.telClient).filter(t => t && t.includes(searchVal)))];
    const produits = [...new Set(ventes.map(v => v.projetNom).filter(p => p && p.toLowerCase().includes(searchVal)))];
    
    const all = [...noms.map(n => ({label: n, icon: 'fa-user'})), ...tels.map(t => ({label: t, icon: 'fa-phone'})), ...produits.map(p => ({label: p, icon: 'fa-box'}))];
    
    if (all.length === 0) { container.style.display = 'none'; return; }
    
    container.style.display = 'block';
    container.innerHTML = all.slice(0, 6).map(s => 
        '<div onclick="document.getElementById(\'searchClient\').value=\'' + s.label.replace(/'/g, "\\'") + '\'; afficherHistorique(); document.getElementById(\'searchSuggestions\').style.display=\'none\';" style="padding: 8px; cursor: pointer; font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; border-radius: 6px;" onmouseover="this.style.background=\'var(--glass-bg)\'" onmouseout="this.style.background=\'none\'"><i class="fas ' + s.icon + '" style="color: var(--text-muted); font-size: 10px; width: 16px;"></i>' + s.label + '</div>'
    ).join('');
}

// ============================================
// PAGE CLIENTS
// ============================================
function afficherClients() {
    const container = document.getElementById('listeClients');
    if (!container) return;
    
    const searchVal = (document.getElementById('searchClientPage')?.value || '').trim().toLowerCase();
    
    const clientsMap = {};
    ventes.filter(v => !v.retournee && v.nomClient && v.nomClient !== 'Client').forEach(v => {
        const key = (v.nomClient || '').toLowerCase();
        if (!clientsMap[key]) {
            clientsMap[key] = { nom: v.nomClient, tel: v.telClient || '', commandes: 0, ca: 0, benefice: 0, derniere: v.date };
        }
        clientsMap[key].commandes++;
        clientsMap[key].ca += v.ca;
        clientsMap[key].benefice += v.benefice;
        if (new Date(v.date) > new Date(clientsMap[key].derniere)) clientsMap[key].derniere = v.date;
    });
    
    let clients = Object.values(clientsMap).sort((a, b) => new Date(b.derniere) - new Date(a.derniere));
    
    if (searchVal) {
        clients = clients.filter(c => c.nom.toLowerCase().includes(searchVal) || c.tel.includes(searchVal));
    }
    
    if (clients.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-user-plus"></i><p>Aucun client trouve.</p></div>';
        return;
    }
    
    container.innerHTML = clients.map(c => {
        const date = new Date(c.derniere).toLocaleDateString('fr-FR');
        return '<div style="padding: 14px; background: var(--glass-bg); border: 1px solid var(--diamond-border); border-radius: 14px; margin-bottom: 10px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center;">' +
            '<div><div style="font-weight: 700; color: var(--text-primary); font-size: 14px;"><i class="fas fa-user" style="margin-right: 6px; color: var(--accent-purple);"></i>' + c.nom + '</div>' +
            (c.tel ? '<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"><i class="fas fa-phone" style="margin-right: 4px;"></i>' + c.tel + '</div>' : '') +
            '</div><div style="text-align: right;"><div style="font-size: 16px; font-weight: 900; color: var(--accent-green);">' + Math.round(c.ca).toLocaleString() + ' ' + deviseActuelle + '</div>' +
            '<div style="font-size: 10px; color: var(--text-muted);">' + c.commandes + ' commande(s)</div></div></div>' +
            '<div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--diamond-border); font-size: 11px; color: var(--text-muted);">' +
            '<span>Benefice: <strong style="color: var(--accent-green);">' + Math.round(c.benefice).toLocaleString() + ' ' + deviseActuelle + '</strong></span>' +
            '<span>Dernier achat: ' + date + '</span></div></div>';
    }).join('');
}

// ============================================
// COMMANDES DEPLIABLES
// ============================================
function toggleCommandeDetails(id) {
    const el = document.getElementById('cmd-details-' + id);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// ============================================
// MODIFIER PRODUIT
// ============================================
var projetEnCoursEdition = null;

function ouvrirModifierProjet(id) {
    const projet = projets.find(p => p.id === id);
    if (!projet) return;
    
    projetEnCoursEdition = id;
    
    document.getElementById('modalProjet').style.display = 'block';
    
    document.getElementById('projetNom').value = projet.nom;
    document.getElementById('projetPrixVente').value = projet.prixVente || '';
    
    if (projet.type === 'production') {
        changerTypeProjet('production');
        document.getElementById('projetCoutMatieres').value = projet.coutMatieres || '';
        document.getElementById('projetCoutMainOeuvre').value = projet.coutMainOeuvre || '';
        document.getElementById('projetAutresFrais').value = projet.autresFrais || 0;
        document.getElementById('projetNbProduits').value = projet.nbArticles || '';
    } else {
        changerTypeProjet('fournisseur');
        document.getElementById('projetPrixAchat').value = projet.prixAchat || '';
        document.getElementById('projetNbArticles').value = projet.nbArticles || '';
        document.getElementById('projetFraisLivraison').value = projet.fraisLivraison || 0;
    }
}

// ============================================
// PROGRESSION SYSTEM
// ============================================
function getVekoPoints() {
    const nbVentes = ventes.filter(v => !v.retournee).length;
    let points = 10;
    points += nbVentes * 10;
    return points;
}

function getProgressionLevel(points) {
    if (points >= 500) return { nom: 'Diamant', next: 999, color: '#06b6d4', border: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' };
    if (points >= 300) return { nom: 'Platine', next: 500, color: '#a855f7', border: 'linear-gradient(135deg, #a855f7, #ec4899)' };
    if (points >= 150) return { nom: 'Or', next: 300, color: '#ffd700', border: 'linear-gradient(135deg, #ffd700, #f59e0b)' };
    if (points >= 50) return { nom: 'Argent', next: 150, color: '#c0c0c0', border: 'linear-gradient(135deg, #c0c0c0, #94a3b8)' };
    if (points >= 20) return { nom: 'Bronze', next: 50, color: '#cd7f32', border: 'linear-gradient(135deg, #cd7f32, #92400e)' };
    return { nom: 'Debutant', next: 20, color: '#8b5cf6', border: 'linear-gradient(135deg, #8b5cf6, #ec4899)' };
}

function updateProgression() {
    const points = getVekoPoints();
    const level = getProgressionLevel(points);
    
    ['', 'Desktop'].forEach(suffix => {
        const ptsEl = document.getElementById('progressionPoints' + suffix);
        const nextEl = document.getElementById('progressionNext' + suffix);
        const fillEl = document.getElementById('progressionFill' + suffix);
        
        if (ptsEl) ptsEl.textContent = points + ' pts';
        if (nextEl) nextEl.textContent = 'Prochain: ' + level.next + ' pts';
        if (fillEl) {
            const prevLevel = getProgressionLevel(points - 1);
            const prevThreshold = points >= 500 ? 300 : points >= 300 ? 150 : points >= 150 ? 50 : points >= 50 ? 20 : points >= 20 ? 10 : 0;
            const range = level.next - prevThreshold;
            const progress = Math.min(100, ((points - prevThreshold) / range) * 100);
            fillEl.style.width = progress + '%';
        }
    });
    
    document.querySelectorAll('[id^="btnModeProfil"]').forEach(el => {
        el.style.border = '2px solid transparent';
        el.style.borderImage = level.border + ' 1';
        el.style.borderRadius = '50%';
        el.style.borderImage = 'none';
        el.style.borderColor = level.color;
    });
}

// ============================================
// FELICITATION MESSAGES
// ============================================
function showFelicitation(message) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#8b5cf6,#ec4899);color:white;padding:24px 32px;border-radius:20px;z-index:99999;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:felicPop 0.4s ease;max-width:300px;';
    div.innerHTML = '<div style="font-size:32px;margin-bottom:8px;">&#127881;</div><div style="font-size:15px;font-weight:800;">' + message + '</div>';
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity = '0'; div.style.transition = 'opacity 0.5s'; setTimeout(() => div.remove(), 500); }, 2500);
}

// ============================================
// SIDEBAR EXPAND/COLLAPSE LOGO
// ============================================
function updateSidebarLogo() {
    const sidebar = document.querySelector('.desktop-sidebar');
    if (!sidebar) return;
    const img = sidebar.querySelector('.sidebar-logo-img');
    const text = sidebar.querySelector('.sidebar-logo-text');
    if (!img || !text) return;
    
    if (sidebar.classList.contains('expanded') || sidebar.offsetWidth > 80) {
        img.style.display = 'none';
        text.style.display = 'block';
    } else {
        img.style.display = 'block';
        text.style.display = 'none';
    }
}

const sidebarObserver = new MutationObserver(updateSidebarLogo);
const sidebarEl = document.querySelector('.desktop-sidebar');
if (sidebarEl) {
    sidebarObserver.observe(sidebarEl, { attributes: true, attributeFilter: ['class', 'style'] });
    new ResizeObserver(updateSidebarLogo).observe(sidebarEl);
}

