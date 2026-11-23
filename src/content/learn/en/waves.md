---
title: The wave maker
---

## Four knobs, four effects

Every trig wave can be written like this:

> y = **A** · sin(**b**·x + **φ**) + **k**

| letter | what it does | what you see |
|---|---|---|
| **A** | amplitude | the wave gets taller or flatter; if A is negative, it flips upside down |
| **b** | frequency | the wave squeezes (b > 1) or stretches (b < 1); **period = 360° / b** |
| **φ** | phase angle | the wave slides left or right by **φ / b** |
| **k** | vertical shift | the whole wave moves up or down; its middle line becomes y = k |

The packet calls b·x + φ the **dynamic term** (the part that changes with x) and φ the **stationary term**.

## The φ trap

When b isn’t 1, the wave does **not** slide by φ; it slides by φ/b. Why? The wave starts its cycle where b·x + φ = 0, which is x = −φ/b. In the packet’s example, y = 5·tan(⅘x + 20°) − 8, the shift is −20° / ⅘ = **−25°**, so 25° to the left.

## The packet’s example, checked

Press **“The lesson’s example”** and you’ll see exactly the graph from the packet:

- tan’s period is 180°, so the new period is 180° / ⅘ = **225°**;
- the asymptotes (vertical lines the curve gets close to but never touches) are where ⅘x + 20° = 90°, which is x = 87.5°, and then every 225°;
- the graph crosses the y axis at 5·tan 20° − 8 ≈ **−6.18**;
- the point where tan = 1 is at (31¼°, −3).

## How to read a graph (the packet’s method)

1. **Isolate** the trig function: y + 8 = 5·tan(⅘x + 20°).
2. **Move the axes**: write y′ = y + 8 and x′ = ⅘x + 20°. Now you have the plain graph y′ = 5·tan x′.
3. **Stretch**: sideways, everything gets 5/4 times longer (the period becomes 225°).
4. **Label** easy points: where it crosses the axes, the asymptotes, and where tan = 1.

> The “Match the wave” game is this method in reverse: you see the graph and have to find the formula.
