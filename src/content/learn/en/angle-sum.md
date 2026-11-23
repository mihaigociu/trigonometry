---
title: sin(A + B), step by step
---

## The mistake everyone makes

It’s tempting to think sin(30° + 60°) = sin 30° + sin 60°. Check it: the left side is sin 90° = 1, and the right side is 0.5 + 0.866 = 1.366. They don’t match! Sine doesn’t “split” over addition. So what is sin(A + B)?

## The angle-sum formulas

> **sin(A + B) = sin A · cos B + cos A · sin B**
>
> **cos(A + B) = cos A · cos B − sin A · sin B**

The lab is the packet’s proof: the same height (sin(A+B)) is worked out two ways. Once directly, then as the sum of two pieces. The pieces come from three right triangles stacked on each other.

The key is step 4: the top angle of the small triangle is **A again**. Two lines perpendicular to two other lines meet at the same angle as those lines do.

## Everything that follows from them

The packet shows that **nearly every** trig formula comes from these two:

| replace | and you get |
|---|---|
| B → −B | sin(A − B) = sin A cos B − cos A sin B, cos(A − B) = cos A cos B + sin A sin B |
| B = A | **double angle**: sin 2A = 2 sin A cos A, cos 2A = cos²A − sin²A |
| cos 2A and sin²A + cos²A = 1 | **half angle**: sin²A = (1 − cos 2A)/2, cos²A = (1 + cos 2A)/2 |
| add or subtract the formulas | **product to sum**: sin A cos B = ½[sin(A+B) + sin(A−B)] |
| A+B = S, A−B = D | **sum to product**: sin S + sin D = 2 sin((S+D)/2) cos((S−D)/2) |

You can test all of them in the last lab, “Identity or impostor?”.

> Why does it matter? When two sounds or two waves add up, the sum-to-product formulas explain why you hear “beats”: a sound that slowly swells and fades.
