import { useEffect } from 'react';

// ── Wave oscillator ─────────────────────────────────────────────────────────
function n(e) {
  this.init(e || {});
}
n.prototype = {
  init: function (e) {
    this.phase = e.phase || 0;
    this.offset = e.offset || 0;
    this.frequency = e.frequency || 0.001;
    this.amplitude = e.amplitude || 1;
  },
  update: function () {
    this.phase += this.frequency;
    return (this.offset + Math.sin(this.phase) * this.amplitude);
  },
  value: function () {
    return this.offset + Math.sin(this.phase) * this.amplitude;
  },
};

// ── Physics node ─────────────────────────────────────────────────────────────
function Node() {
  this.x = 0;
  this.y = 0;
  this.vy = 0;
  this.vx = 0;
}

// ── Trail line ───────────────────────────────────────────────────────────────
function Line(e) {
  this.init(e || {});
}
Line.prototype = {
  init: function (e) {
    this.spring = e.spring + 0.1 * Math.random() - 0.05;
    this.friction = E.friction + 0.01 * Math.random() - 0.005;
    this.nodes = [];
    for (var t, i = 0; i < E.size; i++) {
      t = new Node();
      t.x = pos.x;
      t.y = pos.y;
      this.nodes.push(t);
    }
  },
  update: function () {
    let e = this.spring;
    let t = this.nodes[0];
    t.vx += (pos.x - t.x) * e;
    t.vy += (pos.y - t.y) * e;
    for (var i = 0, a = this.nodes.length; i < a; i++) {
      t = this.nodes[i];
      if (i > 0) {
        const prev = this.nodes[i - 1];
        t.vx += (prev.x - t.x) * e;
        t.vy += (prev.y - t.y) * e;
        t.vx += prev.vx * E.dampening;
        t.vy += prev.vy * E.dampening;
      }
      t.vx *= this.friction;
      t.vy *= this.friction;
      t.x += t.vx;
      t.y += t.vy;
      e *= E.tension;
    }
  },
  draw: function () {
    let e, t;
    let nx = this.nodes[0].x;
    let ny = this.nodes[0].y;
    ctx.beginPath();
    ctx.moveTo(nx, ny);
    let a;
    for (a = 1; a < this.nodes.length - 2; a++) {
      e = this.nodes[a];
      t = this.nodes[a + 1];
      nx = 0.5 * (e.x + t.x);
      ny = 0.5 * (e.y + t.y);
      ctx.quadraticCurveTo(e.x, e.y, nx, ny);
    }
    e = this.nodes[a];
    t = this.nodes[a + 1];
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
    ctx.stroke();
    ctx.closePath();
  },
};

// ── Globals ──────────────────────────────────────────────────────────────────
var ctx,
  f,
  pos = {},
  lines = [],
  E = {
    debug: true,
    friction: 0.5,
    trails: 80,
    size: 50,
    dampening: 0.025,
    tension: 0.99,
  };

// ── Event handlers ────────────────────────────────────────────────────────────
function onMousemove(e) {
  function o() {
    lines = [];
    for (let i = 0; i < E.trails; i++)
      lines.push(new Line({ spring: 0.45 + (i / E.trails) * 0.025 }));
  }
  function c(e) {
    if (e.touches) {
      pos.x = e.touches[0].pageX;
      pos.y = e.touches[0].pageY;
    } else {
      pos.x = e.clientX;
      pos.y = e.clientY;
    }
    e.preventDefault();
  }
  function l(e) {
    if (e.touches.length === 1) {
      pos.x = e.touches[0].pageX;
      pos.y = e.touches[0].pageY;
    }
  }
  document.removeEventListener('mousemove', onMousemove);
  document.removeEventListener('touchstart', onMousemove);
  document.addEventListener('mousemove', c);
  document.addEventListener('touchmove', c, { passive: false });
  document.addEventListener('touchstart', l, { passive: false });
  c(e);
  o();
  render();
}

function render() {
  if (ctx && ctx.running) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'hsla(' + Math.round(f.update()) + ', 100%, 65%, 0.05)';
    ctx.lineWidth = 10;
    for (var t = 0; t < E.trails; t++) {
      lines[t].update();
      lines[t].draw();
    }
    ctx.frame++;
    window.requestAnimationFrame(render);
  }
}

function resizeCanvas() {
  if (ctx && ctx.canvas) {
    ctx.canvas.width = window.innerWidth - 20;
    ctx.canvas.height = window.innerHeight;
  }
}

function renderCanvas() {
  const el = document.getElementById('canvas');
  if (!el) return;
  ctx = el.getContext('2d');
  ctx.running = true;
  ctx.frame = 1;
  f = new n({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 15,
    frequency: 0.0015,
    offset: 200,
  });
  document.addEventListener('mousemove', onMousemove);
  document.addEventListener('touchstart', onMousemove);
  document.body.addEventListener('orientationchange', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('focus', () => {
    if (ctx && !ctx.running) {
      ctx.running = true;
      render();
    }
  });
  window.addEventListener('blur', () => {
    if (ctx) ctx.running = true;
  });
  resizeCanvas();
}

// ── React component ───────────────────────────────────────────────────────────
export default function CanvasCursor() {
  useEffect(() => {
    renderCanvas();
    return () => {
      if (ctx) ctx.running = false;
      document.removeEventListener('mousemove', onMousemove);
      document.removeEventListener('touchstart', onMousemove);
      window.removeEventListener('resize', resizeCanvas);
      document.body.removeEventListener('orientationchange', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      id="canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
