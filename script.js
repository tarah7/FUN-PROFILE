/* ==========================================================================
   NILAJITH'S SPONGEBOB PORTFOLIO - JAVASCRIPT INTERACTIONS
   ========================================================================== */

// --- Global State ---
let soundEnabled = true;
const maxBubbles = 40;
let activeAudioCtx = null;

// --- Skill Recipes Data ---
const skillRecipes = {
  'html-css': {
    title: 'Top Bun: HTML5 & CSS3 🍞',
    progress: 95,
    description: 'The visual structure and delicious casing of any web project. I build clean, accessible markup and modern, responsive styling with smooth layouts.',
    bullets: [
      'Semantic and SEO-friendly HTML5 structure',
      'Modern layouts using CSS Grid & Flexbox',
      'Fluid responsiveness & media queries',
      'Stunning CSS transitions, keyframe animations, and styling'
    ]
  },
  'java-cpp': {
    title: 'Tomato: Java & C++ 🍅',
    progress: 70,
    description: 'The solid algorithms and object-oriented seasoning. Excellent for building desktop utility scripts and solving school coding puzzles.',
    bullets: [
      'Basic algorithmic structures & search algorithms',
      'Object-Oriented Programming (OOP) concepts',
      'Pointer understanding (C++) & Memory management basics',
      'Class designs, method overloads, and console apps'
    ]
  },
  'python': {
    title: 'Golden Cheese: Python 🧀',
    progress: 90,
    description: 'The rich, melted core of my programming sandwich. Python is my favorite language for logic design, file manipulation, and building backend tools.',
    bullets: [
      'Procedural and Object-Oriented scripting',
      'File handling (CSV, JSON, XML text databases)',
      'Utility scripting for automation tasks',
      'Foundational library skills (NumPy, Tkinter, Flask)'
    ]
  },
  'problem-solving': {
    title: 'Lettuce: Problem Solving 🥬',
    progress: 85,
    description: 'Crispy analytical skills. I approach coding challenges step-by-step, drafting logical workflows and dry-running code in my head first.',
    bullets: [
      'Logical block diagram & flowchart modeling',
      'Fast debug trace skills & dry running logs',
      'Array operations and conditional flow optimizations',
      'Time complexity awareness and optimization'
    ]
  },
  'cs-fundamentals': {
    title: 'Meat Patty: Computer Science Basics 🍖',
    progress: 88,
    description: 'The juicy core of the +2 CS Syllabus. Understands what makes compilers tick, data structures, and computer organization fundamentals.',
    bullets: [
      'Data Representation (Binary, Octal, Hex, Boolean logic)',
      'Basic Data Structures (Arrays, Lists, Stacks, Queues)',
      'Database Concepts and basic SQL Queries',
      'Operating System basics & process lifecycle'
    ]
  },
  'tools': {
    title: 'Bottom Bun: Developer Tools 🥖',
    progress: 75,
    description: 'The sturdy foundation holding all my code together. Keeping my project files organized and using terminal controls for speed.',
    bullets: [
      'Basic Git version control workflows',
      'Command-Line / Terminal commands & scripting',
      'VS Code productivity workflows',
      'Web Browser dev-tools debugging'
    ]
  }
};

// --- Patrick Star Quotes ---
const patrickQuotes = [
  "Knowledge can never replace friendship. I'd rather be an idiot than lose you!",
  "Dumb people are blissfully unaware of how dumb they really are... (groans)",
  "Is mayonnaise an instrument?",
  "The inner machinations of my mind are an enigma. *spills milk*",
  "I'm ready! I'm ready! No, you're not!",
  "Sometimes we have to go deep inside ourselves to solve our problems.",
  "Uh, system database? Is that some kind of sandwich?",
  "Nilajith is a computer wizard! He built this with spatulas!"
];

// ==========================================================================
// AUDIO SYNTHESIZER (Web Audio API)
// ==========================================================================

function playPopSound(pitchMultiplier = 1.0) {
  if (!soundEnabled) return;
  
  try {
    // Initialize Audio Context on demand (handles browser policies)
    if (!activeAudioCtx) {
      activeAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (activeAudioCtx.state === 'suspended') {
      activeAudioCtx.resume();
    }
    
    const ctx = activeAudioCtx;
    const now = ctx.currentTime;
    
    // Create nodes
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    // Oscillator settings - Triangle wave gives a rounded, bubbly pop
    osc.type = 'triangle';
    
    // Bubbly pitch sweep (starts low, sweeps high rapidly, drops)
    const baseFreq = 180 * pitchMultiplier;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 5, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.12);
    
    // Filter sweep for dampening
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(8, now);
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.12);
    
    // Volume envelope
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
    
    // Connections
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    // Play
    osc.start(now);
    osc.stop(now + 0.13);
  } catch (error) {
    console.warn("Audio pop synthesis error:", error);
  }
}

// Zap Sound for Jellyfish zapping!
function playZapSound() {
  if (!soundEnabled) return;
  try {
    if (!activeAudioCtx) {
      activeAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (activeAudioCtx.state === 'suspended') {
      activeAudioCtx.resume();
    }
    
    const ctx = activeAudioCtx;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    
    // Laser/Zap sweep down
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.35);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (error) {
    console.warn("Zap sound error:", error);
  }
}

// ==========================================================================
// DYNAMIC BUBBLE GENERATOR
// ==========================================================================

const bubbleCanvas = document.getElementById('bubble-canvas');

function createBubble(x, y, size = null) {
  // Cap active bubble counts to prevent lags
  const activeBubbles = bubbleCanvas.querySelectorAll('.bubble');
  if (activeBubbles.length > maxBubbles) {
    activeBubbles[0].remove();
  }
  
  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  
  // Size calculations
  const r = size || Math.floor(Math.random() * 40) + 15;
  bubble.style.width = `${r}px`;
  bubble.style.height = `${r}px`;
  
  // Position
  bubble.style.left = `${x}px`;
  if (y !== null) {
    bubble.style.top = `${y}px`;
    // If spawned on-screen, float from click position up
    bubble.style.animation = 'floatBubble 6s forwards linear';
  } else {
    // Float from bottom
    bubble.style.bottom = `-50px`;
  }
  
  // Floating properties
  const drift = (Math.random() * 120 - 60) + 'px';
  bubble.style.setProperty('--drift', drift);
  
  // Sound pitch based on bubble size (small bubbles = higher pitch)
  const pitch = 1.0 + (30 - r) / 30; 
  
  // Interactive events
  const popAction = (e) => {
    e.stopPropagation();
    playPopSound(pitch);
    createPopBurst(bubble.offsetLeft + (r/2), bubble.offsetTop + (r/2), r);
    bubble.remove();
  };
  
  bubble.addEventListener('click', popAction);
  bubble.addEventListener('mouseenter', popAction);
  
  bubbleCanvas.appendChild(bubble);
}

// Spark/Mini-particle burst when bubble pops
function createPopBurst(x, y, originalSize) {
  for (let i = 0; i < 6; i++) {
    const burst = document.createElement('div');
    burst.style.position = 'absolute';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.style.width = '3px';
    burst.style.height = '3px';
    burst.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    burst.style.borderRadius = '50%';
    burst.style.pointerEvents = 'none';
    burst.style.zIndex = '99';
    
    const angle = (Math.PI * 2 / 6) * i;
    const distance = originalSize * 0.7;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    burst.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0 }
    ], {
      duration: 350,
      easing: 'ease-out'
    });
    
    bubbleCanvas.appendChild(burst);
    setTimeout(() => burst.remove(), 400);
  }
}

// Spawning background bubbles periodically
setInterval(() => {
  const startX = Math.random() * window.innerWidth;
  createBubble(startX, null);
}, 1400);

// Spawning chimney bubbles from Spongebob's pineapple
const chimney = document.getElementById('pineapple-chimney-smoke');
if (chimney) {
  setInterval(() => {
    const rect = chimney.getBoundingClientRect();
    const x = rect.left + window.scrollX;
    const y = rect.top + window.scrollY;
    // Spawn tiny bubble
    createBubble(x, y, 12);
  }, 2200);
}

// User click spawns bubbles
window.addEventListener('click', (e) => {
  // Prevent spawning bubbles on top of UI buttons or interactive cards
  if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.burger-layer')) {
    return;
  }
  
  // Spawn 3 mini bubbles
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      createBubble(e.pageX + (Math.random() * 20 - 10), e.pageY + (Math.random() * 20 - 10), Math.floor(Math.random() * 15) + 12);
    }, i * 100);
  }
});

// ==========================================================================
// FLOATING JELLYFISH
// ==========================================================================

const jellyfishCanvas = document.getElementById('jellyfish-canvas');

function spawnJellyfish(id, xPercent, yPercent) {
  const jelly = document.createElement('div');
  jelly.classList.add('jellyfish');
  jelly.style.left = `${xPercent}%`;
  jelly.style.top = `${yPercent}%`;
  
  // Custom delays and speeds for natural wiggles
  const floatDelay = Math.random() * 5;
  jelly.style.animationDelay = `${floatDelay}s`;
  jelly.style.animationDuration = `${7 + Math.random() * 4}s`;
  
  jelly.innerHTML = `
    <div class="jellyfish-head">
      <div class="jellyfish-spots"></div>
    </div>
    <div class="tentacles">
      <span class="tentacle"></span>
      <span class="tentacle"></span>
      <span class="tentacle"></span>
      <span class="tentacle"></span>
    </div>
  `;
  
  jelly.addEventListener('click', (e) => {
    e.stopPropagation();
    playZapSound();
    
    // Rapid wiggle effect
    jelly.animate([
      { transform: 'translate(0, 0) scale(1)', filter: 'hue-rotate(0deg)' },
      { transform: 'translate(5px, -10px) scale(1.1)', filter: 'hue-rotate(90deg) brightness(1.5)' },
      { transform: 'translate(-5px, 10px) scale(0.9)', filter: 'hue-rotate(180deg) brightness(1.5)' },
      { transform: 'translate(10px, -5px) scale(1.1)', filter: 'hue-rotate(270deg) brightness(1.5)' },
      { transform: 'translate(0, 0) scale(1)', filter: 'hue-rotate(360deg)' }
    ], {
      duration: 500,
      iterations: 2
    });
    
    // Spawn 10 bubbles
    const rect = jelly.getBoundingClientRect();
    const centerVal = rect.left + window.scrollX + (rect.width/2);
    const topVal = rect.top + window.scrollY;
    
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        createBubble(centerVal + (Math.random() * 40 - 20), topVal + (Math.random() * 20), Math.floor(Math.random() * 15) + 10);
      }, i * 60);
    }
  });
  
  jellyfishCanvas.appendChild(jelly);
}

// Spawn 4 jellyfish at varied points under the sea
spawnJellyfish('j1', 10, 35);
spawnJellyfish('j2', 80, 50);
spawnJellyfish('j3', 15, 80);
spawnJellyfish('j4', 85, 20);

// ==========================================================================
// KRABBY PATTY BURGER SKILL INTERACTIVITY
// ==========================================================================

const burgerStack = document.getElementById('burger-stack');
const burgerLayers = document.querySelectorAll('.burger-layer');
const displayDefault = document.getElementById('display-default-text');
const displayDetails = document.getElementById('display-details');
const skillTitle = document.getElementById('skill-title');
const skillProgress = document.getElementById('skill-progress');
const skillDescription = document.getElementById('skill-description');
const skillBullets = document.getElementById('skill-bullets');

burgerLayers.forEach(layer => {
  // Display skill details on hover or click
  const showSkill = () => {
    // Remove active styling on other layers
    burgerLayers.forEach(l => l.classList.remove('active'));
    layer.classList.add('active');
    
    const skillKey = layer.getAttribute('data-skill');
    const recipe = skillRecipes[skillKey];
    
    if (recipe) {
      playPopSound(1.2);
      
      // Hide default card, show active content
      displayDefault.classList.add('hidden');
      displayDetails.classList.remove('hidden');
      
      // Populate fields
      skillTitle.textContent = recipe.title;
      skillDescription.textContent = recipe.description;
      
      // Animate progress bar fill
      skillProgress.style.width = '0%';
      setTimeout(() => {
        skillProgress.style.width = `${recipe.progress}%`;
      }, 50);
      
      // Fill bullets
      skillBullets.innerHTML = '';
      recipe.bullets.forEach(bulletText => {
        const li = document.createElement('li');
        li.textContent = bulletText;
        skillBullets.appendChild(li);
      });
    }
  };

  layer.addEventListener('mouseenter', showSkill);
  layer.addEventListener('click', showSkill);
});

// Reset skill display card when cursor leaves the stack container (unless click lock is active)
burgerStack.addEventListener('mouseleave', () => {
  // Optionally, leave the active layer open instead of immediately closing it to keep text readable
});

// ==========================================================================
// PATRICK'S CHECKLIST & SPEECH BUBBLE CONTROLLER
// ==========================================================================

const patrickHead = document.querySelector('.patrick-head');
const patrickSpeech = document.querySelector('.patrick-star-speech .speech-bubble');

if (patrickHead && patrickSpeech) {
  patrickHead.addEventListener('click', () => {
    playPopSound(0.8);
    
    // Choose random funny Patrick quote
    const randQuote = patrickQuotes[Math.floor(Math.random() * patrickQuotes.length)];
    patrickSpeech.textContent = randQuote;
    
    // Wiggle Patrick's head
    patrickHead.animate([
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(1.1) rotate(10deg)' },
      { transform: 'scale(0.9) rotate(-10deg)' },
      { transform: 'scale(1) rotate(0deg)' }
    ], {
      duration: 400
    });
  });
}

// Checklist items wiggling/checking off interactive details
const checklistItems = document.querySelectorAll('.checklist-items li');
checklistItems.forEach(item => {
  item.addEventListener('click', () => {
    playPopSound(1.1);
    const box = item.querySelector('.checkbox-custom');
    
    // Toggle checked visual states
    if (box.classList.contains('checked')) {
      box.classList.remove('checked');
      box.textContent = '';
    } else {
      box.classList.add('checked');
      box.textContent = box.classList.contains('goal-box') ? '🎯' : '✓';
      
      // Wiggle checklist item
      item.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.05) translateX(5px)' },
        { transform: 'scale(1)' }
      ], { duration: 250 });
      
      // Spawn tiny burst of bubbles
      const rect = item.getBoundingClientRect();
      createBubble(rect.left + window.scrollX, rect.top + window.scrollY + (rect.height/2), 15);
    }
  });
});

// ==========================================================================
// SYSTEM TOGGLE CONTROLS (Sound)
// ==========================================================================

const soundToggle = document.getElementById('sound-toggle');
if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundToggle.innerHTML = '<span class="icon">🔊</span> Bubble Synth: ON';
      soundToggle.style.backgroundColor = 'var(--spongebob-yellow)';
      playPopSound(1.3);
    } else {
      soundToggle.innerHTML = '<span class="icon">🔇</span> Bubble Synth: OFF';
      soundToggle.style.backgroundColor = '#cfd8dc';
    }
  });
}

// Initialize audio context trigger on first user click/scroll
window.addEventListener('click', () => {
  if (!activeAudioCtx) {
    activeAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}, { once: true });
