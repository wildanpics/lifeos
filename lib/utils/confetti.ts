import confetti from 'canvas-confetti';

/**
 * Triggers a satisfying, high-performance central confetti burst.
 */
export const triggerConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.65 },
    colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
    disableForReducedMotion: true
  });
};

/**
 * Triggers a luxury double-sided cannon show for ultimate goal completions & milestones.
 */
export const triggerPremiumSuccessConfetti = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);
    
    // Left side cannon
    confetti({ 
      ...defaults, 
      particleCount, 
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
    });
    
    // Right side cannon
    confetti({ 
      ...defaults, 
      particleCount, 
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
    });
  }, 200);
};
