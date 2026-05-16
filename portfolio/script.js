// Mobile menu toggle
const menuBtn = document.querySelector('.menu-btn');
const menu = document.querySelector('.navbar .menu');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    menu.classList.toggle('active');
    const icon = menuBtn.querySelector('i');
    icon.classList.toggle('active');
  });
}
// Close menu on link click
document.querySelectorAll('.navbar .menu a').forEach(a => {
  a.addEventListener('click', () => {
    menu.classList.remove('active');
  });
});

// Theme Toggle Logic
const themeSwitch = document.getElementById('theme-switch');
const themeIcon = themeSwitch ? themeSwitch.querySelector('i') : null;

// Check for saved user preference, if any, on load of the website
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
  if(themeIcon) { themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon'); }
}

if (themeSwitch && themeIcon) {
  themeSwitch.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
      localStorage.setItem('theme', 'light');
    } else {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
      localStorage.setItem('theme', 'dark');
    }
  });
}

// Typed.js style typing effect
const roles = ['Full Stack Developer,\nAI & ML Engineer :)'];
let ri = 0, ci = 0, deleting = false;
const typeEl = document.getElementById('typewriter');
function typewrite() {
  const word = roles[ri];
  if (!deleting) {
    typeEl.innerHTML = word.substring(0, ++ci).replace(/\n/g, '<br>');
    if (ci === word.length) { deleting = true; setTimeout(typewrite, 2500); return; }
  } else {
    typeEl.innerHTML = word.substring(0, --ci).replace(/\n/g, '<br>');
    if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
  }
  setTimeout(typewrite, deleting ? 40 : 80);
}
typewrite();

// Fetch GitHub projects
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  try {
    const res = await fetch('https://api.github.com/users/Phaneendra1228/repos?sort=pushed&per_page=30');
    const repos = await res.json();
    const filtered = repos.filter(r => !r.fork && !r.archived);
    const filteredProjects = filtered.filter(r => {
      const name = r.name.toLowerCase();
      const description = (r.description || '').toLowerCase();
      return !['portfolio', 'personal-portfolio', 'portfolio-website', 'personal-portfolio-website'].includes(name)
        && !description.includes('portfolio website');
    });
    if (!filteredProjects.length) {
      grid.innerHTML = '<p style="text-align:center;color:#ccc;width:100%">Projects coming soon...</p>';
      return;
    }
    grid.innerHTML = filteredProjects.map(r => {
      let link = r.html_url;
      let title = r.name.replace(/-/g, ' ');
      let tag = 'Web Development';

      if (r.name.toLowerCase() === 'personalized-entrance-exam-coach' || r.name.toLowerCase() === 'learnflow') {
        link = 'https://learnflow-i17r.onrender.com/login';
        title = 'LearnFlow';
      }
      
      if (title.toLowerCase() === 'interview mentor') {
        tag = 'App Development';
      }

      return `
      <div class="box">
        <span>${tag}</span>
        <i class="fas fa-code"></i>
        <h3>${title}</h3>
        <p>${r.description || r.name.replace(/-/g, ' ')}</p>
        <a href="${link}" target="_blank" rel="noopener" class="project-link">View Project</a>
      </div>
    `}).join('');
    if (window.initTilt) window.initTilt();
  } catch(e) {
    grid.innerHTML = '<p style="text-align:center;color:#ccc;width:100%">Could not load projects. <a href="https://github.com/Phaneendra1228" style="color:#f9ca24">Visit GitHub</a></p>';
  }
}

// Contact form
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    const btn = form.querySelector('button');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      });
      
      if (response.ok) {
        const alertEl = document.getElementById('alert');
        if (alertEl) {
          alertEl.style.visibility = 'visible';
          alertEl.innerHTML = `<span class="closebtn" onclick="this.parentElement.style.visibility='hidden'">&times;</span>✅ Your message has been sent successfully!`;
        }
        form.reset();
      } else {
        alert('There was an error sending your message. Please try again.');
      }
    } catch (error) {
      alert('There was an error sending your message. Please try again.');
    } finally {
      btn.textContent = 'Send message';
      btn.disabled = false;
    }
  });
}

loadProjects();

// Scroll Reveal Animations
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      // observer.unobserve(entry.target); // Optional: stop observing once revealed
    }
  });
}, observerOptions);

document.querySelectorAll('section').forEach(sec => {
  sec.classList.add('reveal');
  observer.observe(sec);
});

// Sticky Navbar & Scroll Up Button & Scroll Progress Scroll Effect
const scrollUpBtn = document.querySelector('.scroll-up-btn');
const scrollProgress = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
  // Sticky Navbar
  const nav = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  
  // Scroll Up Button
  if (scrollUpBtn) {
    if (window.scrollY > 500) {
      scrollUpBtn.classList.add('show');
    } else {
      scrollUpBtn.classList.remove('show');
    }
  }

  // Scroll Progress Bar
  if (scrollProgress) {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollProgress.style.width = scrolled + '%';
  }
});

// Scroll Up Button Click
if (scrollUpBtn) {
  scrollUpBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Initialize 3D Tilt Effect on Elements
if (typeof VanillaTilt !== 'undefined') {
  VanillaTilt.init(document.querySelectorAll(".hero-photo"), {
    max: 10,
    speed: 400,
    glare: true,
    "max-glare": 0.2
  });
  VanillaTilt.init(document.querySelectorAll(".check-bg"), {
    max: 15,
    speed: 400,
    scale: 1.05
  });
  
  // A helper function to initialize tilt on dynamically loaded projects
  window.initTilt = function() {
    VanillaTilt.init(document.querySelectorAll(".services .box"), {
      max: 8,
      speed: 400,
      glare: true,
      "max-glare": 0.1
    });
  };
}

// Background Parallax Mouse Effect
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  document.body.style.setProperty('--mouse-x', x);
  document.body.style.setProperty('--mouse-y', y);
});
