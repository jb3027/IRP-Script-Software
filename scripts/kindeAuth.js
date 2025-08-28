// Initialize Kinde client - wait for DOM to load
let kinde;

// Function to check and handle authentication redirect
async function handleAuthRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
        
        // Clear URL parameters immediately to prevent reprocessing
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Wait a moment for Kinde to process the authentication
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            if (kinde) {
                const isAuthenticated = await kinde.isAuthenticated();
                if (isAuthenticated) {
                    const user = await kinde.getUser();
                    if (user) {
                        handleAuthentication(user);
                        return true; // Successfully handled
                    }
                }
            }
        } catch (error) {
            console.error('Error handling auth redirect:', error);
        }
    }
    return false; // No redirect or failed to handle
}

// Initialize the Kinde client after DOM loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if createKindeClient is available (UMD version)
        if (typeof createKindeClient === 'undefined') {
            console.error('Kinde SDK not loaded. Please check the CDN link.');
            renderLoggedOutView();
            return;
        }
        
        kinde = await createKindeClient({
            client_id: "b6a6ec27637d4aa09c4e0e59992426da",
            //client_id: "3cb1915462fb44b68c52a8737952806f",
            domain: "https://jbtest001.kinde.com",
            redirect_uri: window.location.origin,
            // Callback function to handle redirects
            on_redirect_callback: (user, appState) => {
                if (user) {
                    handleAuthentication(user);
                } else {
                    renderLoggedOutView();
                }
            }
        });
        
        // Try to handle any authentication redirect first
        const redirectHandled = await handleAuthRedirect();
        if (redirectHandled) {
            // Redirect was handled, skip normal authentication check
            setupEventListeners();
            return;
        }
        
        // Check if user is already authenticated using multiple methods
        let isAuthenticated = false;
        let user = null;
        
        try {
            isAuthenticated = await kinde.isAuthenticated();
            if (isAuthenticated) {
                user = await kinde.getUser();
            }
        } catch (error) {
            console.warn('Kinde authentication check failed:', error);
            isAuthenticated = false;
        }
        
        // Fallback: Check sessionStorage for existing authentication
        const storedAuthState = sessionStorage.getItem('isKindeLoggedIn');
        const storedUser = sessionStorage.getItem('kindeUser');
        
        if (isAuthenticated && user) {
            // Primary path: Kinde says we're authenticated
            handleAuthentication(user);
        } else if (storedAuthState === 'true' && storedUser) {
            // Fallback path: Use stored authentication state
            try {
                const parsedUser = JSON.parse(storedUser);
                renderLoggedInView(parsedUser);
            } catch (error) {
                console.error('Failed to parse stored user data:', error);
                renderLoggedOutView();
            }
        } else {
            // No authentication found
            renderLoggedOutView();
        }
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing Kinde client:', error);
        renderLoggedOutView();
    }
});

function setupEventListeners() {
    const loginBtn = document.getElementById('login');
    const registerBtn = document.getElementById('register');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                if (!kinde) {
                    console.error('Kinde client not initialized');
                    return;
                }
                
                await kinde.login();
                
            } catch (error) {
                console.error('Login error:', error);
                // Try to get more details about the error
                if (error.message) {
                    console.error('Error message:', error.message);
                }
                if (error.stack) {
                    console.error('Error stack:', error.stack);
                }
            }
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                if (!kinde) {
                    console.error('Kinde client not initialized');
                    return;
                }
                
                await kinde.register();
                
            } catch (error) {
                console.error('Register error:', error);
                // Try to get more details about the error
                if (error.message) {
                    console.error('Error message:', error.message);
                }
                if (error.stack) {
                    console.error('Error stack:', error.stack);
                }
            }
        });
    }
}

function handleAuthentication(user) {
    // Store authentication state
    sessionStorage.setItem('isKindeLoggedIn', 'true');
    sessionStorage.setItem('kindeUser', JSON.stringify(user));
    
    renderLoggedInView(user);
}

function renderLoggedInView(user) {
   
    const loggedOutView = document.getElementById('logged_out_view');
    const loggedInView = document.getElementById('logged_in_view');
    const projectLogin = document.getElementById('project-login');
    const mainContent = document.querySelector('.main-content');
    
    // Hide the auth container (logged_out_view IS the auth-container)
    if (loggedOutView) {
        loggedOutView.style.display = 'none';
    }
    
    if (loggedInView) {
        loggedInView.style.display = 'block';
        // Add logout button to the main navigation
        addLogoutButton();
    }
    
    // Check if user already has a project selected
    const existingProjectName = sessionStorage.getItem('projectName');
    
    if (existingProjectName) {
        // User already has a project selected, show main content directly
        if (projectLogin) projectLogin.style.display = 'none';
        if (mainContent) {
            mainContent.style.display = 'block';
            // Update the project title
            const productionTitle = document.querySelector('.production-title');
            if (productionTitle) {
                productionTitle.textContent = existingProjectName;
            }
            document.title = existingProjectName + ' - Studio Script Writer';
        }
    } else {
        // No project selected, show project selection screen
        if (mainContent) mainContent.style.display = 'none';
        
        // Show project selection with extensive debugging and force visibility
        if (projectLogin) {            
            // Force all possible visibility styles - override CSS !important
            projectLogin.style.setProperty('display', 'flex', 'important');
            projectLogin.style.visibility = 'visible';
            projectLogin.style.opacity = '1';
            projectLogin.style.position = 'fixed';
            projectLogin.style.zIndex = '9999';
            projectLogin.classList.remove('hidden');
            
            // Reset body styles for main content
            document.body.style.background = '#f8f8f8';
            document.body.style.padding = '20px';
        } else {
            console.error('Could not find project-login element!');
        }
    }
    
}

function renderLoggedOutView() {
    const loggedOutView = document.getElementById('logged_out_view');
    const loggedInView = document.getElementById('logged_in_view');
    const projectLogin = document.getElementById('project-login');
    const mainContent = document.querySelector('.main-content');
    
    // Show the auth container (logged_out_view IS the auth-container)
    if (loggedOutView) {
        loggedOutView.style.display = 'flex'; // Use flex for proper centering
    }
    
    if (loggedInView) loggedInView.style.display = 'none';
    if (projectLogin) projectLogin.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    
    // Clear authentication state but preserve projectName for potential re-auth
    sessionStorage.removeItem('isKindeLoggedIn');
    sessionStorage.removeItem('kindeUser');
    // Only remove projectName if we're actually logging out, not during initial auth check
    const isActualLogout = arguments[0] === true;
    if (isActualLogout) {
        sessionStorage.removeItem('projectName');
    }
}

function addLogoutButton() {
    // Check if logout button already exists
    if (document.getElementById('kinde-logout-btn')) return;
    
    // Create logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'kinde-logout-btn';
    logoutBtn.className = 'btn button2 logout-button';
    logoutBtn.title = 'Logout';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    
    // Add click handler
    logoutBtn.addEventListener('click', async () => {
        try {
            await kinde.logout();
            // Always clear session state after logout, whether it succeeds or fails
            renderLoggedOutView(true);
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback logout - pass true to indicate this is an actual logout
            renderLoggedOutView(true);
        }
    });
    
    // Add to dedicated logout container
    const logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) {
        logoutContainer.appendChild(logoutBtn);
        logoutContainer.style.display = 'flex'; // Show the container
    }
}

// Export for global access if needed
window.kindeAuth = {
    kinde,
    renderLoggedInView,
    renderLoggedOutView,
    handleAuthentication
};
