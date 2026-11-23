// Wrap in an IIFE to prevent variable collisions in global scope
(() => {
  // 1. Initialize Supabase
  const SUPABASE_URL = 'https://xikquyywehhgegaywpmy.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpa3F1eXl3ZWhoZ2VnYXl3cG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzNTA3MjAsImV4cCI6MjExMDkyNjcyMH0.hdi-zGxucQo8FNyyquQRxDF8DxxHGkx9JegX5hiS92g';

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("Supabase client library is not loaded. Please ensure the Supabase CDN script is included before auth.js.");
    return;
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Determine if we are on signup or login page
  const isSignUpPage = window.location.pathname.includes("signup.html");

  // 2. Email & Password Form Handler
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Retrieve email and password supporting both login and signup form markup
      const emailInput = document.getElementById("email") || document.getElementById("exampleInputEmail1");
      const passwordInput = document.getElementById("password") || document.getElementById("exampleInputPassword1");

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }

      const submitBtn = form.querySelector("button[type='submit']");
      const originalBtnText = submitBtn ? submitBtn.innerText : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = isSignUpPage ? "Verifying..." : "Signing in...";
      }

      try {
        if (isSignUpPage) {
          // Sign Up logic
          const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
          });

          if (error) {
            alert("Sign Up Error: " + error.message);
          } else {
            alert("Success! You can now login.");
            window.location.href = "login.html";
          }
        } else {
          // Sign In logic
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
          });

          if (error) {
            alert("Login Error: " + error.message);
          } else {
            // Store email for profile
            if (data.user && data.user.email) {
              localStorage.setItem("findit_user_email", data.user.email);
              const userPart = data.user.email.split('@')[0];
              localStorage.setItem("findit_user_name", userPart.charAt(0).toUpperCase() + userPart.slice(1));
            }
            alert("Logged in successfully! Welcome " + data.user.email);
            window.location.href = "index.html";
          }
        }
      } catch (err) {
        alert("An unexpected error occurred: " + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
        }
      }
    });
  }

  // 3. OAuth Sign In (Google)
  async function signInWithGoogle() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) alert("Google Auth Error: " + error.message);
  }

  // 4. OAuth Sign In (GitHub)
  async function signInWithGithub() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) alert("GitHub Auth Error: " + error.message);
  }

  // Attach OAuth handlers to buttons if present
  document.getElementById("btn-google")?.addEventListener("click", signInWithGoogle);
  document.getElementById("btn-github")?.addEventListener("click", signInWithGithub);
})();
