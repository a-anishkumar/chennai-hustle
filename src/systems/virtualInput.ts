/**
 * Mutable input bridge for mobile virtual joystick & touch buttons
 * so PlayerController reads it at 60 FPS without React re-renders.
 */
export const virtualInput = {
  moveX: 0, // -1 .. +1
  moveY: 0, // -1 .. +1 (forward is +1)
  sprint: false,
};
