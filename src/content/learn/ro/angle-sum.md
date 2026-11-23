---
title: sin(A + B), pas cu pas
---

## Greșeala pe care o face toată lumea

Este tentant să crezi că sin(30° + 60°) = sin 30° + sin 60°. Verifică: în stânga ai sin 90° = 1, iar în dreapta 0,5 + 0,866 = 1,366. Nu se potrivește! Sinusul nu „se desface” peste adunare. Atunci ce este sin(A + B)?

## Formulele de adunare

> **sin(A + B) = sin A · cos B + cos A · sin B**
>
> **cos(A + B) = cos A · cos B − sin A · sin B**

Laboratorul este demonstrația din pachet: aceeași înălțime (sin(A+B)) se calculează în două feluri. O dată direct, apoi ca sumă de două bucăți. Bucățile vin din trei triunghiuri dreptunghice puse unul peste altul.

Cheia este pasul 4: unghiul de sus din triunghiul mic este **tot A**. Două drepte perpendiculare pe alte două drepte fac între ele același unghi ca acelea.

## Tot ce urmează din ele

Pachetul arată că **aproape toate** formulele trigonometrice vin din aceste două:

| înlocuiești | obții |
|---|---|
| B → −B | sin(A − B) = sin A cos B − cos A sin B, cos(A − B) = cos A cos B + sin A sin B |
| B = A | **unghiul dublu**: sin 2A = 2 sin A cos A, cos 2A = cos²A − sin²A |
| cos 2A și sin²A + cos²A = 1 | **jumătatea de unghi**: sin²A = (1 − cos 2A)/2, cos²A = (1 + cos 2A)/2 |
| aduni sau scazi formulele | **produs în sumă**: sin A cos B = ½[sin(A+B) + sin(A−B)] |
| A+B = S, A−B = D | **sumă în produs**: sin S + sin D = 2 sin((S+D)/2) cos((S−D)/2) |

Pe toate le poți pune la încercare în ultimul laborator, „Identitate sau impostor?”.

> De ce ar conta? Când două sunete sau două valuri se adună, formulele „sumă în produs” explică de ce auzi „bătăi”: un sunet care crește și scade încet.
