import { Paddle } from "../gameObjects/paddle";

const keysPressed = new Set<string>();

export function setupKeyboard(
  paddle1: Paddle,
  paddle2: Paddle | null,
  togglePause: () => void
) {
  function updateMovement() {
    // Paddle 1
    if (keysPressed.has("w")) paddle1.dy = -paddle1.speed;
    else if (keysPressed.has("s")) paddle1.dy = paddle1.speed;
    else paddle1.dy = 0;

    // Paddle 2
    if (paddle2) {
      if (keysPressed.has("ArrowUp")) paddle2.dy = -paddle2.speed;
      else if (keysPressed.has("ArrowDown")) paddle2.dy = paddle2.speed;
      else paddle2.dy = 0;
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    const keysToBlock = ["ArrowUp", "ArrowDown", " ", "w", "s"];
    if (keysToBlock.includes(e.key)) e.preventDefault();

    keysPressed.add(e.key);

    if (e.code === "Space") togglePause();

    updateMovement();
  }

  function onKeyUp(e: KeyboardEvent) {
    const keysToBlock = ["ArrowUp", "ArrowDown", " ", "w", "s"];
    if (keysToBlock.includes(e.key)) e.preventDefault();

    keysPressed.delete(e.key);

    updateMovement();
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  return () => {
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
  };
}
