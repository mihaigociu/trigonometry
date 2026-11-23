---
title: Any triangle
---

## When there’s no right angle

Sin, cos and tan started with the right triangle. But trigonometry can solve **any** triangle. The packet’s idea is always the same: draw a height to cut the triangle into two right triangles.

Sides get lower-case letters after the corner they face: side **a** is opposite corner **A**, and so on.

## The law of sines

The height from C can be written two ways: h = b·sin A, and also h = a·sin B. Set them equal and you get:

> **a / sin A = b / sin B = c / sin C = 2R**

R is the radius of the circle through all three corners (the circumscribed circle). Turn it on in the lab: the fractions always equal its diameter.

**When to use it:** when you know a side and the angle opposite it, plus one more fact.

## The law of cosines

> **a² = b² + c² − 2·b·c·cos A**

It’s Pythagoras’ theorem with a correction. When A = 90°, cos A = 0 and the correction disappears. When A is acute, cos A > 0 and side a comes out shorter than Pythagoras would give. When A is obtuse, cos A < 0 and the side comes out longer.

**When to use it:** when you know two sides and the angle between them, or all three sides and want the angles.

## Five formulas for the area

| formula | you need |
|---|---|
| ½ · base · height | a side and the height onto it |
| ½ · b · c · sin A | two sides and the angle between them |
| √(s(s−a)(s−b)(s−c)) (Heron) | just the three sides; s = (a+b+c)/2 is the semi-perimeter |
| r · s | the inscribed circle’s radius and the semi-perimeter |
| a·b·c / 4R | the sides and the circumscribed circle’s radius |

The packet derives them all from the first one: for example, the height is c·sin A, so area = ½·b·c·sin A. Heron’s formula comes from the half-angle formulas.

> For the curious: the packet also has Mollweide’s formulas and the law of tangents, (a−b)/(a+b) = tan((A−B)/2) / tan((A+B)/2). Try checking them with the numbers from the lab!
