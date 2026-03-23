// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

function animateTrail() {
  trailX += (parseFloat(cursor.style.left) - trailX) * 0.12;
  trailY += (parseFloat(cursor.style.top) - trailY) * 0.12;
  trail.style.left = trailX + 'px';
  trail.style.top = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

const particles = [];
const PARTICLE_COUNT = 120;

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.baseX = this.x;
    this.baseY = this.y;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
  }
  update() {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const force = Math.max(0, 120 - dist) / 120;

    this.x -= dx * force * 0.04;
    this.y -= dy * force * 0.04;

    this.x += (this.baseX - this.x) * 0.02 + this.speedX;
    this.y += (this.baseY - this.y) * 0.02 + this.speedY;

    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 245, 255, ${this.alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.15 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== NEURAL NET SVG (hero) =====
const nn = document.getElementById('neuralNet');
const svgNS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('width', '400');
svg.setAttribute('height', '400');
svg.setAttribute('viewBox', '0 0 400 400');

const layers = [[60, 3], [160, 4], [240, 4], [340, 3]];
const nodePositions = [];

layers.forEach(([x, count]) => {
  const cols = [];
  const spacing = 400 / (count + 1);
  for (let i = 0; i < count; i++) {
    cols.push({ x, y: spacing * (i + 1) });
  }
  nodePositions.push(cols);
});

// Draw connections
for (let l = 0; l < nodePositions.length - 1; l++) {
  nodePositions[l].forEach(from => {
    nodePositions[l + 1].forEach(to => {
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', from.x); line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x); line.setAttribute('y2', to.y);
      line.setAttribute('stroke', 'rgba(0,245,255,0.15)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    });
  });
}

// Draw nodes
nodePositions.forEach((layer, li) => {
  layer.forEach(node => {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', '10');
    circle.setAttribute('fill', 'rgba(0,245,255,0.1)');
    circle.setAttribute('stroke', '#00f5ff');
    circle.setAttribute('stroke-width', '1.5');
    circle.style.animation = `pulse ${1.5 + Math.random()}s ease-in-out infinite`;
    svg.appendChild(circle);
  });
});

const style = document.createElementNS(svgNS, 'style');
style.textContent = `@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`;
svg.appendChild(style);
nn.appendChild(svg);

// Mouse tilt on neural net
document.addEventListener('mousemove', (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const rx = (e.clientY - cy) / cy * 15;
  const ry = (e.clientX - cx) / cx * -15;
  nn.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  nn.style.perspective = '600px';
});

// Card glow follow
const aboutCard = document.getElementById('aboutCard');
if (aboutCard) {
  aboutCard.addEventListener('mousemove', (e) => {
    const rect = aboutCard.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    aboutCard.querySelector('.card-glow').style.setProperty('--mx', mx + '%');
    aboutCard.querySelector('.card-glow').style.setProperty('--my', my + '%');
  });
}

// AIML card tilt
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== STAR RATING =====
const stars = document.querySelectorAll('#starRating span');
let selectedRating = 0;

stars.forEach(star => {
  star.addEventListener('mouseenter', () => {
    const val = parseInt(star.dataset.val);
    stars.forEach(s => {
      s.classList.toggle('hovered', parseInt(s.dataset.val) <= val);
    });
  });
  star.addEventListener('mouseleave', () => {
    stars.forEach(s => s.classList.remove('hovered'));
  });
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.val);
    document.getElementById('ratingVal').value = selectedRating;
    stars.forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.val) <= selectedRating);
    });
  });
});

// ===== LIVE SENTIMENT ANALYSIS (simple client-side) =====
const POSITIVE = ['great', 'excellent', 'amazing', 'love', 'good', 'helpful', 'wonderful', 'best', 'fantastic', 'happy', 'clear', 'well', 'nice', 'easy'];
const NEGATIVE = ['bad', 'poor', 'boring', 'difficult', 'hard', 'confusing', 'hate', 'terrible', 'worst', 'waste', 'slow', 'difficult', 'unclear'];

document.getElementById('feedbackText')?.addEventListener('input', function() {
  const text = this.value.toLowerCase();
  const words = text.split(/\s+/);
  let posScore = words.filter(w => POSITIVE.includes(w)).length;
  let negScore = words.filter(w => NEGATIVE.includes(w)).length;

  const emojiEl = document.getElementById('sentimentEmoji');
  const textEl = document.getElementById('sentimentText');

  if (text.length < 5) {
    emojiEl.textContent = '🤖';
    textEl.textContent = 'AI Sentiment: Waiting...';
  } else if (posScore > negScore) {
    emojiEl.textContent = '😊';
    textEl.textContent = `AI Sentiment: Positive (${posScore} positive signals)`;
    textEl.style.color = '#00ff88';
  } else if (negScore > posScore) {
    emojiEl.textContent = '😟';
    textEl.textContent = `AI Sentiment: Negative (${negScore} negative signals)`;
    textEl.style.color = '#ff006e';
  } else {
    emojiEl.textContent = '😐';
    textEl.textContent = 'AI Sentiment: Neutral';
    textEl.style.color = '#ffd700';
  }
});

// ===== SUBMIT FEEDBACK =====
const API_URL = 'https://your-app-name.onrender.com'; // REPLACE with your Render URL

async function submitFeedback() {
  const name = document.getElementById('studentName').value.trim();
  const course = document.getElementById('courseName').value.trim();
  const rating = document.getElementById('ratingVal').value;
  const feedback = document.getElementById('feedbackText').value.trim();
  const msgEl = document.getElementById('responseMsg');

  if (!name || !course || !feedback || rating === '0') {
    msgEl.textContent = '⚠ Please fill all fields and select a rating.';
    msgEl.className = 'response-msg error';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, course, rating: parseInt(rating), feedback })
    });
    const data = await res.json();
    if (res.ok) {
      msgEl.textContent = '✓ Feedback submitted successfully! Thank you.';
      msgEl.className = 'response-msg success';
      document.getElementById('studentName').value = '';
      document.getElementById('courseName').value = '';
      document.getElementById('feedbackText').value = '';
      document.getElementById('ratingVal').value = '0';
      stars.forEach(s => s.classList.remove('active'));
      selectedRating = 0;
    } else {
      msgEl.textContent = '✗ Error: ' + data.message;
      msgEl.className = 'response-msg error';
    }
  } catch (err) {
    msgEl.textContent = '✗ Could not reach server. Check connection.';
    msgEl.className = 'response-msg error';
  }
}

// ===== SEND CONTACT MESSAGE =====
async function sendContact() {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();
  const msgEl = document.getElementById('contactMsg');

  if (!name || !email || !message) {
    msgEl.textContent = '⚠ Please fill all contact fields.';
    msgEl.className = 'response-msg error';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();
    if (res.ok) {
      msgEl.textContent = '✓ Message sent! Jeba Rosa will get back to you.';
      msgEl.className = 'response-msg success';
      document.getElementById('contactName').value = '';
      document.getElementById('contactEmail').value = '';
      document.getElementById('contactMessage').value = '';
    } else {
      msgEl.textContent = '✗ Error: ' + data.message;
      msgEl.className = 'response-msg error';
    }
  } catch (err) {
    msgEl.textContent = '✗ Server unreachable. Try again.';
    msgEl.className = 'response-msg error';
  }
}

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.aiml-card, .about-card, .form-wrapper, .contact-wrapper').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});