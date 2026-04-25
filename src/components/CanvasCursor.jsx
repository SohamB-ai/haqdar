import React, { useEffect, useRef } from 'react';

// Animation variables
let ctx;
let f;
let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let lines = [];
const E = {
  debug: true,
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
};

function Node() {
  this.x = 0;
  this.y = 0;
  this.vy = 0;
  this.vx = 0;
}

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
    return this.offset + Math.sin(this.phase) * this.amplitude;
  },
  value: function () {
    return this.offset + Math.sin(this.phase) * this.amplitude;
  },
};

function Line(e) {
  this.init(e || {});
}
Line.prototype = {
  init: function (e) {
    this.spring = e.spring + 0.1 * Math.random() - 0.05;
    this.friction = E.friction + 0.01 * Math.random() - 0.005;
    this.nodes = [];
    for (var t, n = 0; n < E.size; n++) {
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
    for (var n, i = 0, a = this.nodes.length; i < a; i++) {
      t = this.nodes[i];
      if (i > 0) {
        n = this.nodes[i - 1];
        t.vx += (n.x - t.x) * e;
        t.vy += (n.y - t.y) * e;
        t.vx += n.vx * E.dampening;
        t.vy += n.vy * E.dampening;
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
    let n = this.nodes[0].x;
    let i = this.nodes[0].y;
    ctx.beginPath();
    ctx.moveTo(n, i);
    let a;
    for (a = 1; a < this.nodes.length - 2; a++) {
      e = this.nodes[a];
      t = this.nodes[a + 1];
      n = 0.5 * (e.x + t.x);
      i = 0.5 * (e.y + t.y);
      ctx.quadraticCurveTo(e.x, e.y, n, i);
    }
    e = this.nodes[a];
    t = this.nodes[a + 1];
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
    ctx.stroke();
    ctx.closePath();
  },
};

let animationFrameId;

function onMousemove(e) {
  function o() {
    lines = [];
    for (let i = 0; i < E.trails; i++) {
      lines.push(new Line({ spring: 0.45 + (i / E.trails) * 0.025 }));
    }
  }
  function c(e) {
    if (e.touches) {
      pos.x = e.touches[0].pageX;
      pos.y = e.touches[0].pageY;
    } else {
      pos.x = e.clientX;
      pos.y = e.clientY;
    }
  }
  function l(e) {
    if (e.touches.length === 1) {
      pos.x = e.touches[0].pageX;
      pos.y = e.touches[0].pageY;
    }
  }

  document.removeEventListener("mousemove", onMousemove);
  document.removeEventListener("touchstart", onMousemove);
  document.addEventListener("mousemove", c);
  document.addEventListener("touchmove", c, { passive: false });
  document.addEventListener("touchstart", l, { passive: false });
  c(e);
  o();
  render();
}

function render() {
  if (ctx && ctx.running) {
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "lighter";
    // Sweep through all colors (full hue spectrum) and make it thinner
    ctx.strokeStyle = "hsla(200, 100%, 50%, 0.2)"; // Fixed to light blue
    ctx.lineWidth = 2;
    for (let t = 0; t < E.trails; t++) {
      lines[t].update();
      lines[t].draw();
    }
    ctx.frame++;
    animationFrameId = window.requestAnimationFrame(render);
  }
}

function resizeCanvas() {
  if (ctx && ctx.canvas) {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  }
}

const renderCanvas = function (canvasId) {
  const canvasEl = document.getElementById(canvasId);
  if (!canvasEl) return;
  ctx = canvasEl.getContext("2d");
  ctx.running = true;
  ctx.frame = 1;
  f = new n({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 180,
    frequency: 0.005,
    offset: 180, // Full hue spectrum 0-360
  });
  
  // Set initial position
  pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  
  document.addEventListener("mousemove", onMousemove);
  document.addEventListener("touchstart", onMousemove, { passive: true });
  document.body.addEventListener("orientationchange", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("focus", () => {
    if (ctx && !ctx.running) {
      ctx.running = true;
      render();
    }
  });
  window.addEventListener("blur", () => {
    if (ctx) ctx.running = true; // Kept true as per original
  });
  resizeCanvas();
};

export default function CanvasCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Start animation
    if (canvasRef.current) {
      renderCanvas("cursor-canvas");
    }

    // Cleanup
    return () => {
      if (ctx) ctx.running = false;
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      // Remove event listeners
      document.removeEventListener("mousemove", onMousemove);
      document.removeEventListener("touchstart", onMousemove);
      window.removeEventListener("resize", resizeCanvas);
      document.body.removeEventListener("orientationchange", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      id="cursor-canvas"
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5, // Behind header (1000) but above background
        opacity: 0.6 // Slightly transparent to blend well
      }}
    />
  );
}
