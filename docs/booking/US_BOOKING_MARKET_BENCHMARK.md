# Benchmark du marché US des logiciels de réservation et de gestion de salons (2026)

> **Objet** : situer Saloon Management face aux outils réellement utilisés par les salons de coiffure et de tressage aux États-Unis, en extraire les standards, les différenciateurs et les lacunes, puis en déduire des recommandations priorisées pour le parcours de réservation V2 ([BOOKING_V2_REQUIREMENTS.md](BOOKING_V2_REQUIREMENTS.md)).
>
> **Méthode** : recherche web et lecture des pages officielles (tarifs, centres d'aide), des sites d'avis (Capterra, G2, Trustpilot) et des forums communautaires des éditeurs (Square Seller Community). **Toutes les sources ont été consultées le 2026-10-16.** Les URL complètes sont listées en section 8.
>
> **Limites** :
> - Reddit (r/Hairstylist, r/Braids, r/smallbusiness) bloque le robot de recherche utilisé ; les retours « terrain » proviennent donc de Trustpilot, Capterra, G2, des communautés Square et de blogs tiers qui citent Reddit. Ils sont signalés comme tels.
> - Plusieurs pages de tarifs officielles ne rendent pas leurs chiffres au robot (Square, GlossGenius partiellement, Vagaro add-ons). Quand un chiffre vient d'un tiers ou d'un concurrent (blogs Pabau, GlossGenius, DoTheBeauty, Koalendar, SchedulingKit, CostBench), il est marqué **(tiers)** et à confirmer avant usage commercial.
> - Les notes d'avis changent chaque jour ; celles indiquées sont celles vues le 2026-10-16.

---

## 0. Synthèse

1. Le marché US se divise en trois familles : **marketplaces pour indépendants** (Booksy, StyleSeat, Fresha, Vagaro dans une moindre mesure), **outils de planning généralistes ou solo** (Acuity, Square Appointments, GlossGenius, Goldie, Setmore) et **plateformes de salon multi-sites** (Mangomint, Boulevard, Phorest, Mindbody, Zenoti). Schedulicity a été racheté par Vagaro en janvier 2025 et sa page de tarifs redirige désormais vers Vagaro.
2. Les tresseuses afro-américaines utilisent surtout Booksy, StyleSeat, Acuity, Square et GlossGenius : marketplace pour trouver des clientes, acompte obligatoire, formulaires de préparation des cheveux. StyleSeat a même une page de vente dédiée « Booking built for braiders ».
3. Les **acomptes** (fixe ou %), les **frais de no-show / annulation tardive sur carte enregistrée**, les **rappels SMS automatiques**, les **formulaires d'admission** et le **choix « n'importe quel staff »** sont devenus des standards : tous les produits sérieux les ont.
4. Les **add-ons** (option + supplément de prix + supplément de durée) existent chez Acuity, Mangomint, Booksy, GlossGenius, StyleSeat, Goldie, Phorest. Acuity et Mangomint sont les plus complets (durée négative possible, groupes d'options, « prix de base » recalculé).
5. Les **commissions par styliste** existent partout dans les offres équipe, mais la **prestation partagée entre deux stylistes** est mal traitée : Square répartit les pourboires au prorata mais ne scinde pas les commissions ; Fresha scinde au prorata de la valeur des services ; Mangomint permet des services « à deux staff » uniquement depuis l'agenda interne.
6. Le **suivi des dépenses et du profit** est rare : GlossGenius (module Expenses), Goldie (Pro Plus) et Vagaro (colonne « Business Cost » du Sales Summary) seulement. C'est une lacune citée par les avis Mangomint et Boulevard (« reporting pour la compta et la paie par prestataire »).
7. Les plaintes dominantes : **frais marketplace prélevés sur des clientes qui n'étaient pas nouvelles** (Booksy Boost, StyleSeat New Client Connection, Fresha 20 %, Vagaro Fill My Books), **support lent**, **bugs après mises à jour**, **une seule règle d'acompte pour tout le salon** (Vagaro), **une seule carte enregistrée par cliente** (GlossGenius).
8. Pour Saloon Management, l'opportunité est claire : un parcours salon → style → extras → styliste → acompte, un modèle de données qui gère la prestation à deux stylistes et sa répartition, et un reporting revenu / dépenses / profit par styliste que les outils grand public n'offrent pas.

---

## 1. Panorama et positionnement

| Produit | Famille | Cible principale | Marketplace US | Modèle de prix (résumé) |
|---|---|---|---|---|
| Booksy | Marketplace + gestion | Indépendants, barbiers, tresseuses, petites équipes | Oui (Boost) | 29,99 $/mois + 20 $/staff ; Boost 30 % de la 1re visite |
| StyleSeat | Marketplace + gestion | Indépendants (coiffure afro, tresses, ongles) | Oui | 35 $/mois (promo 19 $) ; 30 % nouvelle cliente ; 2,35 $ payés par la cliente |
| Fresha | Marketplace + gestion | Indépendants à salons moyens | Oui | 19,95 $/mois solo ou 14,95 $/membre ; 20 % nouvelle cliente marketplace |
| Vagaro | Tout-en-un + marketplace | Solo à multi-sites | Oui (Fill My Books) | 30 $/mois + 10 $/agenda ; add-ons payants |
| Square Appointments | POS + planning | Solo (gratuit) à salons | Non | 0 / 49 / 149 $ par site (tiers) ; frais de paiement |
| Acuity Scheduling | Planning généraliste | Indépendants, multi-agendas | Non | 16 à 69 $/mois |
| GlossGenius | Gestion beauté mobile-first | Indépendants et équipes < 10 | Non | 24 à 168 $/mois ; 2,6 % flat |
| Goldie | Planning mobile | Indépendants | Non | Gratuit / 19,99 / 39,99 $ |
| Setmore | Planning généraliste | TPE tous secteurs | Non | Gratuit (4 users) / Pro par user |
| Mangomint | Plateforme salon/spa | Salons 2 à 50+ staff | Non | 120 $/site + 10 $/user |
| Boulevard | Plateforme salon/spa premium | Salons et chaînes | Non | 143 à 410 $/site |
| Schedulicity | Racheté par Vagaro (01/2025) | — | — | Redirige vers Vagaro |
| Zenoti | Plateforme enterprise | Chaînes, franchises | Non | Sur devis (300 à 500 $+/site, tiers) |
| Mindbody | Plateforme wellness/beauté | Salons, spas, fitness | Oui (app Mindbody) | À partir de 79 $/site ; autres paliers sur devis |
| Phorest | Plateforme salon | Salons 3+ staff | Non | Sur devis |

---

## 2. Fiches produit

Légende des encadrés : **Tarifs**, **Réservation en ligne**, **Staff et paie**, **Côté cliente**, **Reporting**, **Paiements**, **UX et plaintes**. « non trouvé » = l'information n'a pas pu être vérifiée dans une source.

### 2.1 Booksy (Booksy International, siège US à Chicago)

- **Positionnement** : marketplace grand public + app de gestion « Booksy Biz » (Lite mobile / Pro tablette et web). Très utilisé par les barbiers et les tresseuses ; Capterra 4,4/5 (479 avis), Trustpilot 3,0/5 (16 574 avis, 77 % de 5 étoiles, 4 % de 1 étoile).
- **Tarifs** (page officielle biz.booksy.com/pricing) : 29,99 $/mois + taxes, toutes fonctions incluses ; 20 $/mois par membre d'équipe supplémentaire ; essai 14 jours sans carte. **Boost** : gratuit à activer, **30 % de la première visite** d'une cliente venue par Boost, **plafonné à 100 $**, visites suivantes sans commission. Paiements : 2,69 % + 0,30 $ (mobile / saisie), 2,49 % + 0,10 $ (lecteur), 2,49 % + 0,20 $ (Tap to Pay) ; virement J+1 gratuit, virement rapide 1,5 %. Lecteurs Stripe S710 299 $, M2 53,10 $. 2 000 SMS marketing gratuits/mois ; rappels gratuits.
- **Réservation en ligne** : catégories ; **« service options » à durées et prix différents** (variantes) et **« bookable add-ons and upgrades »** (lancés en 2022, un add-on = service ou produit rattaché à la prestation principale) ; **acompte** « full, partial or fixed amount », exprimé en pourcentage par service sur la page No-Show Protection (exemple 50 %), appliqué automatiquement au total à l'encaissement ; frais d'annulation tardive sur carte enregistrée, fenêtre de préavis configurable, frais prélevés automatiquement ou annulés manuellement ; **liste d'attente automatique** ; **formulaires d'admission et décharges** ; tampon entre rendez-vous ; fenêtres de réservation / reprogrammation et délai minimum ; la cliente « peut voir, gérer et reprogrammer ses rendez-vous dans les limites de la politique ». Multi-sites : « chaque staff ou chaque location peut avoir son propre agenda », Biz Pro visé pour « plusieurs staff ou plusieurs locations » ; pas d'article d'aide détaillé trouvé. Option « n'importe qui » : non trouvée (le flux décrit par Booksy fait choisir un employé puis « Change staff »). Pas d'intervalle de créneau documenté.
- **Staff et paie** : commissions « standard ou personnalisées par staff et par type de vente », calculées à l'encaissement avec les pourboires ; rapport « Staff Commissions & Tips » et « Staff performance » ; rôles Owner / Manager / Reception / Staffer / Basic Staffer, seuls Owner et Manager voient commissions et rapports complets. Prestation à deux stylistes : non trouvé.
- **Côté cliente** : marketplace avec avis collectés automatiquement, Reserve with Google, rappels SMS/e-mail gratuits, fiches clientes, cartes cadeaux en ligne, abonnements et packages, e-mail et SMS marketing.
- **Reporting** : ventes, performance staff, fin de journée et trésorerie, 8 catégories de rapports ; **pas de suivi des dépenses** trouvé dans la documentation Booksy.
- **Paiements** : processeur intégré (Stripe sous-jacent), Tap to Pay iPhone/Android, carte enregistrée, paiement fractionné non documenté.
- **UX et plaintes** : facile à prendre en main, réservations 24/7, marketing intégré. Plaintes récurrentes (Trustpilot, Capterra) : **Boost facturé sur des clientes qui n'étaient pas nouvelles** (y compris venues du site perso du stylist) ; la commission Boost n'est annulée que si le no-show est marqué **le jour même** ; support lent (« 88 % d'avis négatifs sur le support » dans le résumé Capterra, échantillon de 26) ; fonctions activées sans consentement ; crashs ; les clientes doivent installer l'app pour réserver (avis anciens).

### 2.2 StyleSeat (San Francisco)

- **Positionnement** : marketplace historique de la coiffure afro, tresses, ongles ; pages de vente « Booking built for braiders » et « Built for Natural Hairstylists ». Capterra 3,9/5 (56 avis), Trustpilot 3,9/5 (423 avis).
- **Tarifs** (blog officiel « How much does StyleSeat cost », màj août 2026, et « Does StyleSeat have hidden fees », 2026-10-06) : abonnement **35 $/mois** (promo 19 $/mois ou 199 $/an, essai 21 jours) ; **New Client Connection 30 % du premier rendez-vous, plafonné à 50 $**, une fois par cliente, désactivable ; **Smart Pricing 5,5 % du service, plafonné à 16,50 $**, optionnel ; **frais de réservation 2,35 $ payés par la cliente** ; Tap to Pay 2,5 % + 0,30 $ ; carte enregistrée 2,6 % + 0,30 $ ; virement instantané 1,8 % ; site web 10 $/mois ; 500 SMS gratuits puis 1 500 pour 10 $. Les acomptes exigent le plan Premium avec paiements activés (article d'aide).
- **Réservation en ligne** : catégories ; chaque style « peut avoir ses tailles, longueurs, durées et prix », durées affichées en **fourchette** (ex. knotless 4 h, « 3,5 à 6 ») ; **add-ons tarifés d'avance** (longueur supplémentaire, mèches fournies, rinçage vinaigre, tresses accent) ; **acompte en % ou montant fixe** (exemple 25 % / 70 $), réservation non confirmée sans acompte ; politique flexible / modérée / stricte, exemple **50 % si annulation < 48 h, 100 % no-show**, prélevée sur la carte enregistrée ; **AutoCheckout** débite le solde + pourboire ; **formulaires de préparation** rattachés à un service (laver et sécher les cheveux, photo d'inspiration) ; multi-sites : non trouvé (produit pensé pour l'indépendant) ; « n'importe qui » : sans objet ; auto-reprogrammation cliente : oui, l'acompte initial est reporté sans nouveau prélèvement ; liste d'attente : non trouvé.
- **Staff et paie** : produit solo ; commissions / équipe : non trouvé.
- **Côté cliente** : marketplace par ville avec photos, vidéo, avis, prix ; rappels SMS automatiques **48 h avant et le matin même, avec instructions de préparation et rappel des frais de retard** ; notes, photos, historique par cliente ; **« rebook nudges timed to takedowns »** (relance calée sur la dépose des tresses).
- **Reporting** : revenus ; dépenses : non trouvé.
- **Paiements** : intégré (Tap to Pay, carte enregistrée, PayPal / Venmo acceptés pour l'acompte sans protection).
- **UX et plaintes** : apport de clientes réel (« helped me grow my clientele »), mais **fees jugés élevés** (« so many fees it's hard to make a profit »), **frais nouvelle cliente appliqués à des clientes référées**, retards de paiement (« always an issue with receiving my money »), **clientes ajoutées au planning sans validation du pro**, notifications manquées ; côté clientes, les demandes d'acompte sont jugées « pushy » et les frais de 2,35 $ « cachés ». Trustpilot global 1,5/5 cité par un agrégateur (non recoupé).

### 2.3 Acuity Scheduling (Squarespace)

- **Positionnement** : planificateur généraliste, très répandu chez les tresseuses US (c'est l'outil actuel d'Adorable Braids). Capterra 4,8/5 (5 744 avis), G2 4,6/5 (410).
- **Tarifs** (acuityscheduling.com/pricing) : **Starter 16 $/mois annuel (20 $ mensuel), Standard 27 $ (34 $), Premium 55 $ (69 $)** ; agendas (staff ou lieu) 1 / 6 / 36 ; SMS, liste d'attente, packages, abonnements et cartes cadeaux à partir de Standard ; **acomptes et formulaires sur tous les plans** ; Premium : AI Booking Assistant, fuseaux multiples, API/CSS ; essai 7 jours ; Stripe, Square, PayPal, Venmo ; aucun plan gratuit. Des agrégateurs citent encore les anciens noms Emerging / Growing / Powerhouse (tiers, obsolète).
- **Réservation en ligne** : catégories ; **add-ons** avec « price and duration changes » (0 = pas de changement, **valeurs négatives possibles**), add-ons réservés à l'admin possibles ; pooling « **Any available** » qui affecte au calendrier ayant le moins de rendez-vous ce jour-là (ou ordre alphabétique) ; multi-sites via regroupement de calendriers ; acompte via paiement à la réservation ; **« Start time intervals »** automatique (PGCD des durées) ou personnalisé en minutes ; padding avant/après ; « Minimize gaps » (n'affiche que les créneaux collés aux rendez-vous existants) ; la cliente reprogramme seule mais **ne peut changer que la date et l'heure**, pas le calendrier ni le type ; liste d'attente à partir de Standard ; formulaires d'admission obligatoires ou optionnels.
- **Staff et paie** : aucune notion de commission, de pourboire ni de paie ; deux stylistes sur un rendez-vous : non (un rendez-vous = un calendrier).
- **Côté cliente** : pas de marketplace, pas d'avis ; rappels e-mail (tous plans) et SMS (Standard+) ; fiches clientes ; packages / cartes cadeaux.
- **Reporting** : rapports de rendez-vous et de revenus par calendrier ; dépenses : non.
- **Paiements** : via processeurs externes, pas de Tap to Pay propre, carte enregistrée selon processeur.
- **UX et plaintes** : logique de planning très fine, formulaires appréciés ; plaintes : prix pour une petite structure, personnalisation limitée, « not a beauty salon booking system » (pas de marketplace, pas de POS, pas de commissions). Observé sur le catalogue Adorable Braids : 129 prestations à plat parce que chaque taille est une prestation, descriptions longues répétant les règles de préparation et le prix des mèches.

### 2.4 Square Appointments (Block)

- **Positionnement** : planning adossé au POS Square, option gratuite la plus utilisée par les indépendantes. Capterra 4,5/5 (257 avis).
- **Tarifs** : la page officielle n'expose pas ses chiffres au robot. Trois sources de 2026 concordent (GlossGenius blog mars 2026, DoTheBeauty juin 2026, SquareFeeCalculator oct. 2026, **tiers**) : **Free 0 $, Plus 49 $/site/mois, Premium 149 $/site/mois**, Square Pro sur devis au-delà de 250 000 $/an. Des guides plus anciens citent 29 / 69 $ (ancienne grille). Frais : en personne 2,6 % + 15 ¢ (Free), 2,5 % + 15 ¢ (Plus), 2,4 % + 15 ¢ (Premium) ; en ligne 3,3 % + 30 ¢ (Free) puis 2,9 % + 30 ¢ ; **saisie manuelle / carte enregistrée 3,5 % + 15 ¢** sur tous les plans.
- **Réservation en ligne** : Free : site de réservation, rappels, agendas illimités. Plus : **politique d'annulation et frais de no-show**, **multi-staff booking** (plusieurs services par différents staff dans un rendez-vous), **liste d'attente**, rappels personnalisés. Premium : ressources (chaises, pièces), « service cost tracking », rapport des réservations futures. **Acomptes** (article 8096) : montant fixe ou % **par service**, sur tous les services ou certains, texte de politique et caractère remboursable affichés ; no-show protection : forfait par rendez-vous, par service, ou % du service, prélevable jusqu'à 14 jours après, carte tenue pour un seul rendez-vous (un post communautaire indique qu'elle peut être sauvegardée si la cliente coche « Save card ») ; prépaiement intégral possible (la cliente ne peut alors plus annuler seule) ; « processing time » (temps de pose pendant lequel un autre rendez-vous est bookable), **minimum 5 minutes** ; réservation « avec n'importe quel membre » annoncée sur la page produit ; multi-sites natif (page « multi-location »).
- **Staff et paie** : commissions par employé via Square Team (taux fixes ou **paliers** par volume), attribution figée au moment de la vente ; pourboires d'un rendez-vous multi-staff **répartis au prorata de la valeur des services** ; **pas de scission automatique des commissions pour un même service à deux staff** (« manual process », réponse d'un modérateur Square) ; un salon rapporte que les rendez-vous remboursés comptaient toujours en commission ; Square Payroll est un produit séparé.
- **Côté cliente** : pas de marketplace ; rappels SMS/e-mail ; fiches clientes ; Loyalty et Marketing payants à part ; cartes cadeaux.
- **Reporting** : rapports ventes, staff et stocks surtout sur Plus/Premium ; dépenses : non (seulement « service cost tracking » Premium).
- **Paiements** : processeur natif, Tap to Pay iPhone/Android, carte enregistrée, paiement fractionné à l'encaissement POS.
- **UX et plaintes** : gratuit et solide pour une solo ; plaintes : paramétrage modifié sans préavis (bouton « Book now » apparu et doubles réservations), hausse de prix 2025, app tablette instable, commissions calculées sur le brut, obligation de scinder la transaction si un staff ne reçoit pas de pourboire.

### 2.5 GlossGenius (New York)

- **Positionnement** : app « beauty-first », mobile d'abord, cible indépendantes et équipes jusqu'à 9 ; Capterra 4,8/5 (348 avis).
- **Tarifs** (glossgenius.com/pricing) : **Standard 24 $/mois annuel (28 $ mensuel), Gold 48 $ (56 $), Platinum 148 $ (168 $)** ; Standard < 10 staff, Platinum 10+ ; **2,6 % flat** sur toutes les cartes (tap, carte enregistrée, saisie), facture en ligne 2,9 % + 0,30 $, virement instantané 1,8 % ; **Payroll en option 40 $/mois + 6 $/siège** ; Reception (IA) 50 $/mois ; 500 crédits SMS Gold, 2 500 Platinum.
- **Réservation en ligne** : site de réservation personnalisable (mais templates et domaine non personnalisable, plaintes) ; **service add-ons** choisis par la cliente à la réservation ou ajoutés à l'encaissement, agenda mis à jour automatiquement ; **acomptes pour tous les services, certains, ou seulement les nouvelles clientes** ; carte enregistrée obligatoire possible, politique d'annulation ; **formulaires et décharges rattachés à un service** (Gold) ; **liste d'attente automatisée** (Gold) ; salles et ressources (Gold) ; double booking autorisé sur le site ; multi-sites : non documenté ; « n'importe qui » : non trouvé.
- **Staff et paie** : permissions individuelles, horaires, congés ; **commissions personnalisables** (Platinum) ; rapports de commissions ; paie intégrée ou comptes bancaires séparés pour les booth renters ; deux stylistes sur un rendez-vous : non trouvé.
- **Côté cliente** : pas de marketplace ; Google booking et avis (Gold) ; notifications illimitées ; notes et formules clientes ; e-mail et SMS marketing ; packages, abonnements, cartes cadeaux.
- **Reporting** : **module Expenses** (catégories, photo du reçu, dépenses récurrentes, rapport par période **et par staff**), rapport de performance staff, Sales et Expenses « All Staff » ou par membre ; pas de rapport de profit par styliste trouvé.
- **Paiements** : intégré, Tap to Pay sans surcoût, carte enregistrée ; **une seule carte sauvegardée par cliente** (plainte).
- **UX et plaintes** : design soigné, notifications automatiques, formules clientes ; plaintes : « glitchy », rapports « a joke » pour une structure qui grandit, orienté mobile plutôt que desktop, création des formulaires fastidieuse (une question à la fois à rattacher à un service), pas de jours fériés dans le calendrier, impossible de demander une carte quand c'est le pro qui crée le rendez-vous.

### 2.6 Vagaro (Pleasanton, Californie)

- **Positionnement** : tout-en-un + marketplace, solo à multi-sites, a absorbé Schedulicity ; Capterra 4,7/5 (≈ 3 500 avis).
- **Tarifs** (vagaro.com/pro/pricing + support « Plans, Pricing, and Premium Features ») : **30 $/mois** pour 1 agenda (promo 23,99 $ les 6 premiers mois), **+ 10 $ par agenda bookable jusqu'à 7**, gratuit au-delà ; multi-sites sur devis. Add-ons : **Forms 10 $/mois**, Drive dès 10 $/mois, **Payroll 34 $/mois + 5 $/employé** (Gusto), **Text marketing dès 20 $/mois** (1 000 crédits), Branded App 100 $ de développement + ≈ 100 $/mois (sources officielles contradictoires) + 10 $/site, comptabilité QuickBooks/Xero ≈ 30 $/mois (tiers). Paiements : Tap to Phone **2,6 % + 16 ¢** (petit marchand) / 2,29 % + 25 ¢ (gros), dip & tap 2,6 % + 10 ¢, « as low as 2.2 % » en marketing. Marketplace : listing gratuit ; **Fill My Books / Daily Deals : 20 % de la première réservation d'une nouvelle cliente, 5 % si cliente existante**, opt-in, prélevés comme acompte.
- **Réservation en ligne** : catégories ; jusqu'à **6 services par réservation le même jour, enchaînés, chacun avec « any » ou un prestataire précis** ; **Service Bundles** (ex. massage en couple) réalisés « en même temps par deux prestataires différents » quand marqués Required ; add-ons et variantes : « service menus and add-ons » cités (tiers), détail non trouvé ; **acompte : une seule règle universelle par entreprise** (% ou fixe, au-dessus d'un montant minimum de panier), impossible de varier par service (réponse support juillet 2025), nécessite Merchant Services + Online Shopping Cart ; frais d'annulation / no-show automatiques ; liste d'attente multi-prestataires ; formulaires (add-on) avec photos et signature ; « no preference » : « choose any or a specific employee » ; multi-sites natif.
- **Staff et paie** : paie configurable (heures, taux, **commission service / produit / classe / forfait**, heures sup, pourboires), rapports de commissions accumulées, Gusto pour le versement ; booth rent billing ; partage d'une prestation entre deux stylistes : non trouvé hors bundles.
- **Côté cliente** : marketplace, Apple Maps / Instagram / Facebook booking, rappels illimités, fidélité, abonnements, packages, cartes cadeaux, Daily Deals, notes SOAP, 1 000 e-mails/mois.
- **Reporting** : « Advanced reporting » ; **Sales Summary avec colonne « Business Cost » et calcul du profit** ; Sales by Product avec marge ; pas de module de saisie de dépenses générales (loyer, etc.) trouvé.
- **Paiements** : Vagaro Merchant Services, lecteur offert, Tap to Phone, Apple / Google Pay, virement instantané.
- **UX et plaintes** : très complet, prix d'entrée bas ; plaintes (Trustpilot, Capterra, roundup 2026) : **surprises de facturation** (frais marketplace prélevés après désactivation, 7 « coûts cachés » recensés par un tiers), **bugs après mises à jour**, support inégal, **acompte non personnalisable par rendez-vous**, notifications multiples pour une visite multi-services.

### 2.7 Fresha (Londres, forte présence US)

- **Positionnement** : ex-« gratuit », passé en abonnement en 2025 ; marketplace mondiale ; Capterra 4,8/5 (1 443 avis).
- **Tarifs** (fresha.com/pricing, US) : **Independent 19,95 $/mois** (1 membre bookable), **Team 14,95 $/membre/mois**, Enterprise > 20 ; essai 7 jours ; **20 % de commission unique sur une nouvelle cliente marketplace (minimum 6 $)**, gratuit pour les clientes existantes et les liens directs / Instagram / Facebook ; paiements : en ligne 2,79 % + 0,20 $, **en personne 2,29 % + 0,20 $** (+ 0,10 $ par autorisation Tap to Pay), saisie manuelle 3,30 % + 0,20 $, Klarna 5,99 % + 0,30 $ ; terminaux dès 139 $.
- **Réservation en ligne** : catégories ; **« Any professional »** affecté automatiquement au membre éligible **qui a le plus de temps libre ce jour-là** (répartition équitable), icône cœur pour la styliste préférée ; temps de pose et de finition (« processing and finishing times ») ; ressources ; **réservations de groupe** (l'acompte de la cliente principale couvre tout le groupe) ; **politiques de paiement** : acompte en % entiers, non remboursable ou remboursable dans une fenêtre, ou simple capture de carte ; no-show marquable après l'heure de début, frais limités au montant de la politique ; formulaires de consultation ; patch tests ; liste d'attente ; prix et durée **par membre d'équipe** (Team) ; multi-sites natif ; variantes / add-ons : non trouvé explicitement.
- **Staff et paie** (Team) : feuilles de temps, pourboires, **commissions par service / produit / abonnement / carte cadeau, variables par jour ou par site, fixes ou par paliers**, choix d'inclure remises et taxes ; **quand plusieurs membres travaillent sur un rendez-vous, la commission est scindée au prorata de la valeur des services de chacun** ; **pay runs** (bulletin interne) avec avances, déductions, refacturation des frais de paiement ou de la commission marketplace au staff, versement du wallet entreprise vers le wallet du membre.
- **Côté cliente** : marketplace, avis clients, Client Connect, rappels, fiches, abonnements, packages, cartes cadeaux, promotions.
- **Reporting** : rapports ventes, équipe, pay runs ; dépenses : non trouvé.
- **Paiements** : intégré, Tap to Pay, terminaux, Klarna.
- **UX et plaintes** : interface moderne, prix d'entrée faible ; plaintes : **20 % prélevés sur des clientes jugées à tort nouvelles** (y compris venues de la pub du salon), **retenue de paiements** (anecdote 2 400 $), support e-mail lent, fin du gratuit mal vécue.

### 2.8 Mangomint (Los Angeles)

- **Positionnement** : plateforme salon/spa « premium », support très noté ; G2 4,9/5 (105 avis), Capterra 298 avis.
- **Tarifs** (mangomint.com/pricing, depuis le 1er août 2026) : **120 $/mois par site + 10 $/mois par utilisateur** (staff et réception), utilisateurs désactivés non facturés, plus de paliers Essentials/Standard/Unlimited (165/245/375 $, obsolètes) ; paiements **2,45 % + 15 ¢ en personne, 2,90 % + 30 ¢ à distance** ; Payroll 50 $/mois + 8 $/salarié ; téléphone 70 $/ligne ; marketing dès 30 $ ; essai gratuit, onboarding et migration gratuits, sans contrat.
- **Réservation en ligne** : **Service Customizations** : groupes d'options avec question affichée à la cliente, chaque option **modifie la durée (mêmes incréments que l'agenda), le prix (+/-) ou exige une ressource** ; affichage « prix de base » combiné (ex. coupe courte 70 $ / longue 120 $), prix « 100 $+ » ou masqués ; **« Anyone »** activable, ordre aléatoire ou fixe, exclusions, affectation « Anyone » configurable ; **services nécessitant deux staff** (non visibles en ligne pour les groupes, réservables depuis l'agenda, réglage « éviter les trous pour les deux staff ») ; réservations de groupe et services « couple » ; **Express Booking** : lien SMS où la cliente vérifie ses infos, **ajoute sa carte, accepte la politique d'annulation, téléverse des photos**, avec délai d'expiration qui libère le créneau ; acompte partiel ou paiement intégral ; **Intelligent Waitlist** (cliente alertée si un créneau se libère, staff alerté en cas de correspondance) ; Virtual Waiting Room ; formulaires et charting ; multi-sites natif.
- **Staff et paie** : commissions service et produit par staff, salaires ou taux horaires, paie intégrée (add-on) ; pas de paliers de commission documentés.
- **Côté cliente** : pas de marketplace ; SMS bidirectionnel ; Automated Flows ; abonnements, packages, cartes cadeaux.
- **Reporting** : rapports complets mais avis demandant mieux « pour la compta et la paie par prestataire » ; dépenses : non trouvé.
- **Paiements** : intégré, Tap to Pay : non trouvé explicitement.
- **UX et plaintes** : support « réponse en 5 minutes », app mobile qui fait presque tout ; plaintes : **prix** et add-ons qui s'additionnent (Shopify, crédits marketing pour éditer un e-mail), bookings en ligne parfois en retard sur l'agenda, un avis UK sur l'absence de support après onboarding.

### 2.9 Boulevard (Los Angeles)

- **Positionnement** : plateforme haut de gamme pour salons et chaînes ; Capterra 4,6/5 (364), G2 4,4/5 (110).
- **Tarifs** (joinblvd.com/pricing, offre d'automne 2026) : **Essentials 143 $/mois** (1 site, 5 prestataires, 250 SMS), **Premier 234 $/site** (normalement 293 $), **Prestige 328 $/site** (normalement 410 $, Forms inclus, 2 500 SMS) ; Forms dès 65 $/mois/site ; QuickBooks 45 $ ; frais d'onboarding ≈ 495 $ (tiers) ; **Boulevard Offset** : la cliente paie 3 % de surcharge et le salon 1 % ; taux de base non publié (remise sur relevé).
- **Réservation en ligne** : **Precision Scheduling** : n'affiche pas tous les créneaux libres mais ceux qui réduisent les trous, réserve des blocs longs pour les services à forte valeur, tient compte des temps de pose, recalculé à chaque réservation/annulation ; self-booking 24/7 avec choix du stylist et plusieurs services ; acomptes automatiques ; formulaires (add-on ou Prestige) ; multi-sites natif ; add-ons / variantes : non trouvé.
- **Staff et paie** : commissions par service ou produit, paliers sur ventes retail, pourboires répartis entre membres, versements booth renters ; **pas de paie native** (export vers un outil de paie) ; « check out multiple stylists at once » apprécié.
- **Côté cliente** : pas de marketplace ; app Duo sur iPad ; abonnements, cartes cadeaux, e-mails/SMS payés à l'usage.
- **Reporting** : jugé faible (« reports are so very very bad », « inaccurate reporting ») ; dépenses : non trouvé.
- **Paiements** : intégré, Duo, Offset.
- **UX et plaintes** : expérience cliente soignée, encaissement multi-stylistes ; plaintes 2026 : plantages (2 crashs en 4 semaines, février 2026), rapports, pas de messagerie interne, prix.

### 2.10 Schedulicity (Bozeman, Montana) — racheté par Vagaro

- Vagaro a annoncé l'acquisition le **13 janvier 2025** (Business Wire), avec onboarding des clients Schedulicity vers Vagaro ; **schedulicity.com/pricing redirige aujourd'hui vers vagaro.com/pricing**. Historique : 20 à 30 $/mois selon le nombre d'agendas, add-ons à 5-10 $/mois, Schedulicity Pay 2,5 % + 15 ¢ (tiers, CostBench / ToolRadar, non vérifiables). À considérer comme **fusionné dans Vagaro** pour ce benchmark.

### 2.11 Zenoti (Bellevue, Washington)

- **Positionnement** : enterprise (chaînes, franchises, med spa) ; G2 4,5/5 (297 avis).
- **Tarifs** : **sur devis uniquement** (page officielle « Get a Quote ») ; 300 à 500 $+/site/mois, contrats 12-24 mois, onboarding de plusieurs semaines, 10 000 à 15 000 $/mois pour les grandes chaînes (tous **tiers**) ; add-ons IA (chatbot 150-400 $/mois, SMS bidirectionnel 29-169 $/mois, tiers) ; usage communication facturé à la consommation.
- **Fonctions** (page pricing) : Appointment Book, Employee Management, **Payroll & Commissions**, Staff Performance & Goals, Inventory, Resources, POS, Text2Pay, abonnements, cartes cadeaux, fidélité, Webstore, Social Booking, Reserve with Google, marketing automation, Reputation Management, AI Phone Line, agents IA (réceptionniste, retention, planning employés) sur AI Plus. Détail acomptes / add-ons / deux stylistes : non trouvé.
- **UX et plaintes** : multi-sites et paie reconnus ; **courbe d'apprentissage** forte, app mobile « really glitchy », facturation après résiliation, opacité tarifaire.

### 2.12 Mindbody (San Luis Obispo) — incluant Booker

- **Positionnement** : wellness/fitness historique, offre beauté issue du rachat de Booker ; marketplace « Mindbody app » (3 M d'acheteurs mensuels revendiqués).
- **Tarifs** (mindbodyonline.com/pricing) : **Starter à partir de 79 $/mois/site**, Accelerate et Ultimate « Let's talk » ; tiers : Starter 139 $, Accelerate 279-289 $, Ultimate 469-499 $, Ultimate Plus 599-699 $, traitement 2,75 % + 0,25 $ (tiers), frais d'onboarding 200-500 $ (tiers). Starter : gestion, POS, widgets, site, app listing, reporting de base ; Accelerate : analytics, **ressources et « Pick-a-Spot » (chaise choisie par la cliente)**, codes promo ; Ultimate : e-mail/SMS automatisés, AI front desk 24/7, pipeline commercial.
- **Fonctions beauté** : réservation en ligne, carte enregistrée, abonnements ; acomptes / add-ons / commissions : non trouvé dans les sources consultées.
- **UX et plaintes** (avis Booker, 2016-2022) : pannes hebdomadaires, bugs, support et facturation dégradés après rachat, rappels passés en payant ; peu de retours récents trouvés.

### 2.13 Phorest (Dublin, bureaux US)

- **Positionnement** : salons 3+ staff, premium ; Capterra 4,8/5 (431 avis).
- **Tarifs** (phorest.com/us/pricing) : **sur devis** ; plans Starter, Grow, Complete Advantage, Elite ; 2-Way SMS 7 500 messages pour 99 $ ; SMS 5 ¢ avec 1 000 gratuits/mois (Starter), 5 000 (Grow), 27 000 (Complete Advantage) ; un tiers cite « à partir de 29 $/mois » sans précision.
- **Fonctions** : réservation 24/7 **avec acomptes dès Starter** ; **« Add-Ons & Zero-Minute Services »** et « add service extras without increasing appointment time » ; **commissions fixes ou par paliers** ; app staff PhorestGo (planning, création de rendez-vous, vue manager sur Grow) ; demandes d'avis automatiques et Online Reputation Manager ; fidélité TreatCard (Grow) ; Phorest Pay (taux non publiés).
- **UX et plaintes** : fonctions riches ; plaintes 2025-2026 : **prix vs valeur**, support qui ne rappelle pas, navigation lourde en multi-sites, format de date des rappels, promesses d'onboarding non tenues.

### 2.14 Goldie (ex-Appointfix)

- **Positionnement** : app mobile pour indépendantes ; Capterra 4,8/5 (1 160 avis).
- **Tarifs** (heygoldie.com/pricing) : **Starter gratuit** (20 rendez-vous/mois, 1 utilisateur, **acomptes**, politique d'annulation, Reserve with Google, WhatsApp) ; **Pro 19,99 $/mois ou 199,99 $/an** (illimité, **no-show protection**, rappels automatiques, 500 SMS, **service add-ons**, rapports de revenus et prévisions, cartes cadeaux, fidélité, BNPL) ; **Pro Plus 39,99 $/mois ou 399,99 $/an** (équipe et agendas multiples, logins et permissions, rapports par staff, formulaires, **suivi des dépenses**, liste d'attente, tarification dynamique, réceptionniste IA) ; traitement 2,7 % + 0,30 $ (vu dans un résultat de recherche sur la page tarifs, non confirmé dans le rendu).
- **UX et plaintes** : acomptes et messagerie WhatsApp appréciés ; plaintes : support limité (problème Stripe en période de fêtes), site de réservation parfois en panne, pas d'app cliente, flux de rappel « répondre YES ».

### 2.15 Setmore

- **Positionnement** : planning généraliste, pas de spécificité beauté.
- **Tarifs** (setmore.com/pricing) : **Free jusqu'à 4 utilisateurs** (rendez-vous illimités, e-mail reminder, paiements Square/Stripe, Tap to Pay, page brandée) ; **Pro** : page affiche 5 $/utilisateur/mois en annuel et ailleurs 12 $ (**contradiction sur la page même**), ajoute SMS (500 crédits), **acomptes**, récurrence, synchro 2 voies, suppression du branding, API.
- **Fonctions** : pas d'add-ons, de commissions, de marketplace, de formulaires avancés trouvés.
- **UX et plaintes** : simple et gratuit ; avis anciens sur des bugs ; App Store 4,7 (8,9 k) cité par un concurrent.

---

## 3. Tableau comparatif

Légende : ✅ présent et documenté · ⚠️ partiel, payant en option, ou limité · ❌ absent / non prévu · ? non trouvé.

### 3.1 Réservation en ligne

| Produit | Catégories | Variantes (taille / longueur) | Add-ons prix + durée | Choix staff / « n'importe qui » | Multi-sites | Acompte par prestation | No-show / annulation sur carte | Liste d'attente | Formulaire / politiques | Auto-reprog. cliente | Tampons | Pas de créneau |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Booksy | ✅ | ✅ service options | ✅ | ⚠️ staff puis « Change staff » | ⚠️ agendas par lieu | ✅ full / partiel / fixe | ✅ | ✅ auto | ✅ | ✅ dans fenêtre | ✅ | ? |
| StyleSeat | ✅ | ✅ tailles, longueurs, durée en fourchette | ✅ | ❌ solo | ❌ | ✅ % ou fixe (Premium) | ✅ 50 % / 100 % ex. | ? | ✅ prep forms | ✅ acompte reporté | ? | ? |
| Acuity | ✅ | ⚠️ = une prestation par variante | ✅ +/- prix, +/- durée | ✅ Any available (moins chargé) | ⚠️ regroupement de calendriers | ✅ tous plans | ⚠️ via processeur | ✅ Standard+ | ✅ tous plans | ⚠️ date/heure seulement | ✅ padding | ✅ intervalle custom |
| Square Appts | ✅ | ⚠️ | ⚠️ (variantes d'articles) | ✅ | ✅ | ✅ fixe ou % par service | ✅ Plus+ (forfait, par service, %) | ✅ Plus+ | ⚠️ contrats automatiques | ✅ | ✅ processing time | ⚠️ min 5 min |
| GlossGenius | ✅ | ⚠️ | ✅ | ? | ? | ✅ tous / certains / nouvelles | ✅ | ✅ Gold+ | ✅ Gold+ par service | ✅ | ✅ gap time | ? |
| Vagaro | ✅ | ⚠️ | ⚠️ cité, non documenté | ✅ any / précis par service | ✅ | ❌ une règle globale | ✅ | ✅ multi-prestataires | ⚠️ Forms 10 $/mois | ✅ | ✅ | ? |
| Fresha | ✅ | ⚠️ prix/durée par membre | ? | ✅ Any professional (plus de temps libre) | ✅ | ✅ % entiers, fenêtre de remboursement | ✅ | ✅ | ✅ | ✅ | ✅ processing/finishing | ? |
| Mangomint | ✅ | ✅ options « base price » | ✅ groupes d'options, ressources | ✅ Anyone + exclusions | ✅ | ✅ partiel / intégral | ✅ Express Booking | ✅ intelligent | ✅ | ✅ | ✅ | ✅ incréments agenda |
| Boulevard | ✅ | ? | ? | ✅ | ✅ | ✅ auto | ✅ | ? | ⚠️ Forms 65 $/mois ou Prestige | ✅ | ✅ Precision Scheduling | ? |
| Zenoti | ✅ | ? | ? | ✅ | ✅ | ? | ✅ | ? | ✅ | ✅ | ✅ | ? |
| Mindbody | ✅ | ? | ? | ✅ | ✅ | ? | ✅ | ? | ⚠️ | ✅ | ✅ | ? |
| Phorest | ✅ | ? | ✅ incl. « zero-minute » | ✅ | ✅ | ✅ dès Starter | ✅ | ? | ✅ | ✅ | ✅ | ? |
| Goldie | ✅ | ⚠️ | ✅ Pro | ⚠️ Pro Plus | ❌ | ✅ même en gratuit | ✅ Pro | ✅ Pro Plus | ✅ Pro Plus | ✅ | ✅ | ? |
| Setmore | ✅ | ❌ | ❌ | ✅ | ⚠️ | ✅ Pro | ⚠️ | ❌ | ⚠️ | ✅ | ✅ | ? |

### 3.2 Staff, paie, cliente, reporting, paiements

| Produit | Commission / % par styliste | Pourboires | Prestation à deux stylistes | Planning staff + app | Marketplace | Avis | Rappels SMS/e-mail | Fiches + notes | Fidélité / abonnements / cartes cadeaux | Revenu par styliste | Dépenses / profit | Paiement intégré | Tap to Pay | Carte enregistrée |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Booksy | ✅ par staff et type de vente | ✅ | ? | ✅ Biz app | ✅ Boost 30 % (max 100 $) | ✅ auto | ✅ gratuits | ✅ | ✅ | ✅ rapport commissions & tips | ❌ | ✅ | ✅ 2,49 % + 20 ¢ | ✅ |
| StyleSeat | ❌ solo | ✅ AutoCheckout | ❌ | ❌ | ✅ 30 % (max 50 $) + 2,35 $ cliente | ✅ | ✅ 48 h + matin, instructions | ✅ photos | ⚠️ | ⚠️ solo | ❌ | ✅ | ✅ 2,5 % + 30 ¢ | ✅ 2,6 % + 30 ¢ |
| Acuity | ❌ | ❌ | ❌ | ⚠️ calendriers | ❌ | ❌ | ✅ (SMS Standard+) | ✅ | ⚠️ packages | ⚠️ par calendrier | ❌ | ⚠️ Stripe/Square/PayPal | ⚠️ via Square | ⚠️ |
| Square Appts | ✅ fixe ou paliers (Team) | ✅ prorata multi-staff | ⚠️ services différents seulement, commissions manuelles | ✅ | ❌ | ❌ | ✅ | ✅ | ⚠️ Loyalty payant | ✅ Plus+ | ❌ (service cost Premium) | ✅ | ✅ | ✅ 3,5 % + 15 ¢ |
| GlossGenius | ✅ Platinum | ✅ | ? | ✅ | ❌ | ✅ Google (Gold) | ✅ illimités | ✅ formules | ✅ | ✅ par staff | ✅ Expenses | ✅ 2,6 % flat | ✅ | ⚠️ 1 carte max |
| Vagaro | ✅ service/produit/classe/forfait | ✅ | ⚠️ bundles simultanés | ✅ | ✅ 20 % / 5 % opt-in | ✅ | ✅ illimités | ✅ SOAP | ✅ | ✅ | ⚠️ Business Cost | ✅ | ✅ 2,6 % + 16 ¢ | ✅ |
| Fresha | ✅ par service / jour / site, paliers | ✅ auto dans pay run | ✅ scission prorata valeur | ✅ timesheets | ✅ 20 % (min 6 $) | ✅ | ✅ | ✅ | ✅ | ✅ pay runs | ❌ | ✅ | ✅ 2,29 % + 20 ¢ + 10 ¢ | ✅ |
| Mangomint | ✅ service / produit | ✅ | ⚠️ services à 2 staff (agenda interne) | ✅ | ❌ | ⚠️ | ✅ 2 voies | ✅ charting | ✅ | ✅ | ❌ | ✅ 2,45 % + 15 ¢ | ? | ✅ Express Booking |
| Boulevard | ✅ par service / produit, paliers retail | ✅ répartis | ⚠️ encaissement multi-stylistes | ✅ | ❌ | ⚠️ | ✅ payants à l'usage | ✅ | ✅ | ✅ | ❌ | ✅ Offset 3 % / 1 % | ⚠️ Duo | ✅ |
| Zenoti | ✅ Payroll & Commissions | ✅ | ? | ✅ | ❌ | ✅ Reputation | ✅ | ✅ | ✅ | ✅ | ? | ✅ Text2Pay | ? | ✅ |
| Mindbody | ? | ? | ? | ✅ | ✅ app Mindbody | ⚠️ | ⚠️ Ultimate | ✅ | ✅ | ⚠️ Accelerate+ | ? | ✅ | ? | ✅ |
| Phorest | ✅ fixe ou paliers | ✅ | ? | ✅ PhorestGo | ❌ | ✅ auto + Reputation Manager | ✅ 5 ¢/SMS | ✅ | ✅ TreatCard | ✅ | ? | ✅ Phorest Pay | ? | ✅ |
| Goldie | ⚠️ rapports par staff (Pro Plus) | ✅ | ❌ | ⚠️ Pro Plus | ❌ | ✅ site | ✅ 500 SMS Pro | ✅ | ✅ Pro | ⚠️ | ✅ Pro Plus | ✅ | ? | ✅ |
| Setmore | ❌ | ❌ | ❌ | ⚠️ | ❌ | ⚠️ | ✅ Pro | ✅ | ❌ | ❌ | ❌ | ⚠️ Square/Stripe | ✅ | ⚠️ |

---

## 4. Standards du marché (ce que tout produit sérieux a en 2026)

Ces fonctions sont présentes chez au moins 10 des 15 produits ; leur absence serait perçue comme un défaut par une propriétaire habituée à Acuity, Booksy ou Square.

1. **Catalogue par catégories** avec photo, description, durée et prix, et site/lien de réservation 24/7 partageable (bio Instagram).
2. **Acompte à la réservation**, montant fixe ou pourcentage, déduit automatiquement du total à l'encaissement (Booksy, StyleSeat, Square, GlossGenius, Fresha, Mangomint, Phorest, Goldie, Acuity, Setmore Pro). Le réglage **par prestation** (Square, Booksy, GlossGenius) est devenu la norme ; la règle unique de Vagaro est citée comme un défaut.
3. **Carte enregistrée + politique d'annulation** : fenêtre de préavis, frais d'annulation tardive et de no-show en % ou forfait, prélevés automatiquement (Booksy, StyleSeat, Square Plus, Fresha, GlossGenius, Vagaro, Goldie Pro).
4. **Rappels automatiques SMS et e-mail** (généralement 24-48 h avant), confirmation à la réservation, et message de politique dans le rappel.
5. **Choix de la styliste ou « n'importe qui »**, avec affectation automatique équilibrée (Fresha, Acuity, Mangomint, Vagaro, Square).
6. **Auto-gestion par la cliente** : reprogrammer ou annuler dans les limites de la politique, sans appeler le salon, acompte conservé sur le nouveau créneau (StyleSeat, Booksy).
7. **Formulaires d'admission / décharges** rattachés à une prestation et acceptés avant confirmation (Acuity tous plans, Booksy, StyleSeat, GlossGenius Gold, Fresha, Vagaro Forms, Goldie Pro Plus).
8. **Tampons et temps de pose** (padding, processing time) pour éviter les enchaînements impossibles et autoriser un second rendez-vous pendant le temps de pose.
9. **Liste d'attente** quand aucun créneau ne convient (Booksy, Acuity Standard+, Square Plus+, GlossGenius Gold, Vagaro, Fresha, Mangomint, Goldie Pro Plus).
10. **Fiche cliente** avec historique, notes, photos, carte(s) enregistrée(s), et marquage des nouvelles clientes.
11. **Commissions par styliste** (taux par staff et par type de vente, pourboires séparés) et **rapport de revenu par styliste** dans toutes les offres « équipe » (Booksy, Square Team, GlossGenius Platinum, Vagaro, Fresha Team, Mangomint, Boulevard, Phorest, Zenoti).
12. **Paiement intégré** avec Tap to Pay sur téléphone et taux publiés entre 2,29 % et 2,7 % en personne, 2,6 % à 3,5 % à distance ; virement J+1 gratuit, instantané 1,5 à 1,8 %.
13. **Rôles et permissions** (propriétaire, manager, réception, staff) avec restriction de l'accès aux chiffres financiers (Booksy, Vagaro, GlossGenius, Mangomint, Goldie Pro Plus).
14. **Avis clientes** collectés après le rendez-vous et affichés sur le profil (Booksy, StyleSeat, Fresha, Vagaro, Phorest, Goldie) ; Google Reviews chez GlossGenius et Phorest.
15. **Cartes cadeaux, packages, abonnements** (hors Acuity Starter, Setmore, Goldie Starter).

---

## 5. Différenciateurs (ce que seuls un ou deux produits font bien)

| Différenciateur | Produit(s) | Pourquoi c'est pertinent pour un salon de tresses |
|---|---|---|
| **Options structurées avec effet sur la durée et le prix, groupées par question** (« Quelle longueur ? ») et affichage d'un prix de base recalculé, prix « 100 $+ » ou masqué | Mangomint (Service Customizations), Acuity (add-ons +/- durée) | Reproduit exactement le besoin « style → taille → longueur → extras » sans multiplier les prestations (129 chez Adorable Braids) |
| **Durée affichée en fourchette** (« 4 h, de 3,5 à 6 ») et **relance de re-réservation calée sur la dépose** | StyleSeat | Les tresses durent 3 à 10 h et se refont toutes les 6-8 semaines |
| **Rappels avec instructions de préparation** (cheveux lavés et séchés, mèches à apporter) 48 h avant et le matin même | StyleSeat | Les règles de préparation sont aujourd'hui noyées dans les descriptions Acuity |
| **« Any professional » affecté au membre qui a le plus de temps libre** ce jour-là | Fresha | Équité entre stylistes payées au pourcentage |
| **Scission automatique de la commission au prorata de la valeur quand plusieurs membres travaillent un même rendez-vous** | Fresha | Base pour la prestation partagée ; à compléter par une répartition au temps passé |
| **Services nécessitant deux staff** avec réglage « éviter les trous pour les deux » | Mangomint | Les styles de 10 h à deux stylistes |
| **Express Booking** : le manager crée le rendez-vous, la cliente reçoit un lien pour ajouter sa carte, accepter la politique, envoyer des photos ; le créneau se libère à expiration | Mangomint | Réservations prises par téléphone ou WhatsApp, courantes dans les salons afro |
| **Precision Scheduling** : n'afficher que les créneaux qui limitent les trous, réserver des blocs longs pour les prestations longues | Boulevard, Acuity (« Minimize gaps ») | Éviter qu'un rendez-vous de 1 h bloque une journée de 8 h |
| **Rapport de dépenses avec reçus, récurrences et filtre par staff** | GlossGenius ; Goldie Pro Plus | Les propriétaires demandent « le revenu détaillé » que Booksy/Square n'offrent pas |
| **Pay run interne** : commissions + pourboires + avances + refacturation des frais, puis versement vers le wallet du membre | Fresha | Équivalent d'un bulletin de paie styliste au pourcentage |
| **Acompte de groupe** couvrant plusieurs rendez-vous | Fresha | Réservations mère + filles fréquentes |
| **Paiement « Offset »** : surcharge 3 % payée par la cliente, 1 % par le salon | Boulevard | Modèle de frais à étudier pour les acomptes |
| **Booth renters** avec comptes bancaires séparés | GlossGenius, Boulevard, Vagaro | Stylistes indépendantes en location de chaise |
| **Marketplace avec commission plafonnée** (100 $ Booksy, 50 $ StyleSeat) | Booksy, StyleSeat | Si Saloon Management ajoute une découverte publique, plafonner et rendre opt-in |

---

## 6. Lacunes connues (ce que les utilisatrices reprochent)

1. **Frais marketplace prélevés à tort** : Booksy Boost sur des clientes venues du site perso, StyleSeat New Client Connection sur des clientes référées, Fresha 20 % sur des clientes issues de la pub du salon, Vagaro Fill My Books prélevé après désactivation. Commission Booksy annulée seulement si le no-show est marqué le jour même. → Toute commission de découverte doit être **traçable** (source de la réservation visible) et **contestable**.
2. **Acompte unique pour tout le salon** (Vagaro) et acompte réservé au plan Premium (StyleSeat) → l'acompte doit être réglable par prestation, voire par add-on (prestations longues = acompte plus élevé).
3. **Une seule carte enregistrée par cliente** et impossibilité de demander la carte quand c'est le pro qui crée le rendez-vous (GlossGenius) → multi-cartes et lien de paiement type Express Booking.
4. **Reporting insuffisant pour la compta et la paie par prestataire** (Mangomint, Boulevard « inaccurate reporting », GlossGenius « reports were a joke » pour une structure qui grandit, Square commissions sur rendez-vous remboursés, commissions sur brut au lieu du net).
5. **Pas de suivi des dépenses** chez Booksy, Square, Fresha, Acuity, Mangomint, Boulevard → pas de profit réel ni de marge par styliste.
6. **Prestation à deux stylistes mal gérée** : Square ne scinde pas les commissions d'un même service, oblige à scinder la transaction si un staff n'a pas de pourboire ; Mangomint n'expose pas les services à deux staff en ligne ; Vagaro passe par des bundles simultanés. Aucun produit ne gère « styliste principale réservée + seconde styliste ajoutée par la manager plus tard, avec part au temps passé ».
7. **Catalogue à plat** : chez Acuity (observé) une prestation par taille × longueur, descriptions longues répétant les règles de préparation, le nombre de paquets de mèches et leur prix ; besoin de champs structurés « cheveux fournis / à apporter », « nombre de paquets », « prix du paquet », « préparation exigée ».
8. **Créneaux trop fins ou trop grossiers** : Square impose un minimum de 5 min de processing time ; Acuity calcule l'intervalle automatiquement (surprise pour l'utilisatrice) → paramètre explicite 5 / 10 / 15 / 30 min par salon.
9. **Support lent et bugs après mises à jour** (Booksy, Vagaro, Boulevard, StyleSeat, GlossGenius) → stabilité et changelog visible.
10. **Clientes ajoutées au planning sans validation** (StyleSeat) vs **validation manuelle** souhaitée par certains pros → option « confirmation requise » par salon (déjà `requireClientApproval`).
11. **Notifications multiples pour une visite multi-services** (Vagaro) → une seule confirmation par visite.
12. **Coûts cachés côté cliente** : frais de 2,35 $ (StyleSeat), mèches non incluses annoncées après l'acompte (témoignage Substack) → afficher le total, les mèches et la politique avant le paiement de l'acompte.
13. **Pas de jours fériés / indisponibilités de prestation** (GlossGenius ; Acuity gère via texte « Not available from 03/01 to 04/14 ») → période d'indisponibilité par prestation (RG-B14).
14. **Prix opaques des plateformes salon** (Zenoti, Phorest, Mindbody sur devis, Square qui ne rend pas ses prix) → opportunité de prix publics simples.

---

## 7. Recommandations pour Saloon Management

Priorisation MoSCoW adaptée au cas des salons de tresses multi-sites avec stylistes payées au pourcentage. Chaque ligne cite le produit qui sert de modèle et le lien avec les RG-B de [BOOKING_V2_REQUIREMENTS.md](BOOKING_V2_REQUIREMENTS.md).

### Must

| # | Recommandation | Inspiré de | Lien RG |
|---|---|---|---|
| M1 | **Add-ons réutilisables** avec libellé, supplément de prix (+/-) et supplément de durée (+/-), regroupés par question (« Longueur », « Lavage ») et rattachés à plusieurs prestations ; total prix + durée recalculé dans le récapitulatif | Mangomint Service Customizations, Acuity add-ons | RG-B01 à B04 |
| M2 | **Variantes de prestation** (taille : small / medium / large / jumbo) avec prix et durée de base, pour réduire le catalogue au lieu d'une prestation par combinaison | Booksy service options, Mangomint « base price » | RG-B15 |
| M3 | **Acompte par prestation** (fixe ou %), surclassable par le salon, avec politique d'annulation (fenêtre, % retenu en annulation tardive, % en no-show) affichée et acceptée avant paiement ; acompte reporté en cas de reprogrammation ; **carte enregistrée** (plusieurs par cliente, Stripe SetupIntent) pour prélever les frais, avec journal des prélèvements contestables | Square deposits per service, Booksy, StyleSeat (25 % / 50 % / 100 %), Fresha capture card, GlossGenius (contre-exemple : 1 carte) | RG-B07 |
| M4 | **Parcours cliente salon → prestation → extras → styliste (ou « n'importe qui ») → date/heure → récapitulatif → acompte**, liste directe des salons de la propriétaire avec ville et adresse | Acuity (calendriers groupés par location), Square multi-location | RG-B05, B06 |
| M5 | **« N'importe quelle styliste »** affectée automatiquement à la styliste éligible la moins chargée du jour, avec exclusions possibles et réaffectation par la manager | Fresha Any professional, Acuity Any available, Mangomint Anyone | RG-B06 |
| M6 | **Règles d'admission par salon** (cases obligatoires : cheveux lavés et séchés, +20 $ si non préparés, mèches à apporter, pas de début après 17 h 30) stockées de façon structurée et reprises dans les rappels | Acuity intake forms, StyleSeat prep forms, Booksy forms | RG-B12 |
| M7 | **Rappels SMS/e-mail automatiques** à la réservation, 48 h avant et le matin même, incluant préparation, mèches, politique d'annulation et lien de reprogrammation | StyleSeat, Booksy (rappels gratuits) | nouveau |
| M8 | **Prestation partagée** : styliste principale réservée, seconde styliste ajoutée par la manager, vérification de disponibilité, une seule confirmation cliente | Mangomint services à deux staff, Vagaro bundles, Square multi-staff (contre-exemple) | RG-B08 |
| M9 | **Revenu par styliste** avec part en pourcentage, pourboires séparés, répartition d'une prestation partagée (défaut au prorata du temps, modifiable) et export « pay run » par période | Fresha pay runs + scission prorata, Booksy Staff Commissions & Tips | RG-B09 |

### Should

| # | Recommandation | Inspiré de | Lien RG |
|---|---|---|---|
| S1 | **Dépenses et profit** : saisie des dépenses (catégorie, reçu, récurrence, salon, styliste optionnelle), rapport profit = revenus − parts stylistes − dépenses, par salon et par période | GlossGenius Expenses, Goldie Pro Plus, Vagaro Business Cost | module Expenses existant |
| S2 | **Lien de réservation / paiement envoyé par la manager** (« Express Booking ») : rendez-vous créé en interne, la cliente ajoute sa carte, accepte la politique, paie l'acompte, joint une photo ; créneau libéré à expiration | Mangomint Express Booking | RG-B07 |
| S3 | **Intervalle de créneau configurable par salon** (5 / 10 / 15 / 30 min) et option « limiter les trous » (proposer d'abord les créneaux adjacents aux rendez-vous existants) | Acuity Start time intervals + Minimize gaps, Boulevard Precision Scheduling | `getAvailableSlots` |
| S4 | **Liste d'attente persistante** par salon / prestation / styliste / date, notification quand un créneau se libère, conversion en réservation | Mangomint Intelligent Waitlist, Booksy automated waitlist | RG-B13 |
| S5 | **Fiche cliente enrichie** : historique des styles, photos, notes de préparation, mèches habituelles, cartes, marqueur « nouvelle cliente », source de la réservation | StyleSeat, GlossGenius (formules), Vagaro SOAP | existant partiel |
| S6 | **Prestation enrichie** : champs structurés « mèches » (fournies / à apporter, nombre de paquets, marque conseillée, prix du paquet en stock) affichés avant l'acompte et dans les rappels ; durée en fourchette ; indisponibilité sur une période (saison, congés) | Observation catalogue Acuity, StyleSeat (add-on « supplied braiding hair », fourchette de durée), témoignage Substack | RG-B14, B15 |
| S7 | **Paiement du solde à l'encaissement** avec pourboire, Tap to Pay sur téléphone et paiement fractionné (acompte + solde + éventuel second moyen) | StyleSeat AutoCheckout, Square, GlossGenius 2,6 % flat | `lib/payment` |

### Could

| # | Recommandation | Inspiré de | Lien RG |
|---|---|---|---|
| C1 | **Relance de re-réservation** calée sur la durée de vie du style (ex. 6-8 semaines après des knotless) | StyleSeat « rebook nudges timed to takedowns », Goldie rebooking reminders | nouveau |
| C2 | **Réservation de groupe** (mère + enfants) avec un seul acompte couvrant plusieurs rendez-vous | Fresha group booking, Mangomint group bookings | nouveau |
| C3 | **Avis après rendez-vous** (page publique, lien Google Reviews) et **fidélité / cartes cadeaux / packages** simples (ex. 10e retouche offerte) | Booksy, Phorest Online Reputation Manager, GlossGenius Google reviews, Vagaro | nouveau |
| C4 | **Découverte publique des salons** (annuaire par ville) sans commission ou avec commission plafonnée, opt-in, et source de réservation tracée pour éviter les litiges Boost / NCC | Booksy, StyleSeat, Fresha (contre-exemples sur les litiges) | step salon existant |

Total : 20 recommandations (9 Must, 7 Should, 4 Could). Les rôles manager (RG-B10, B11) ne sont pas repris ici car déjà spécifiés dans BOOKING_V2_REQUIREMENTS.md ; la surcharge de frais répercutée à la cliente (Boulevard Offset, StyleSeat 2,35 $) est notée comme piste tarifaire, pas comme fonctionnalité.

---

## 8. Sources (toutes consultées le 2026-10-16)

### Pages officielles (tarifs, fonctions, centres d'aide)
- Booksy pricing : https://biz.booksy.com/pricing
- Booksy pricing plans (liste de fonctions) : https://biz.booksy.com/pricing-plans
- Booksy No-Show Protection : https://biz.booksy.com/features/no-show-protection
- Booksy add-ons (blog) : https://biz.booksy.com/blog/add-ons-encourage-clients-to-book-more-services-and-products
- Booksy lancement add-ons (SkinInc, 2022) : https://www.skininc.com/home/news/22288859/booksy-booksy-launches-new-addons-feature-to-its-app
- Booksy multibooking (blog) : https://biz.booksy.com/blog/new-feature-in-booksy-multibooking
- Booksy calendrier et scheduling : https://biz.booksy.com/features/calendar-scheduling
- Booksy permissions staff : https://support.booksy.com/hc/en-us/articles/16535688940946-How-do-I-manage-staff-permissions
- Booksy rapport performance staff : https://support.booksy.com/hc/en-us/articles/16534905410066-Can-I-generate-a-staff-member-performance-report
- Booksy variantes par staff : https://support.booksy.com/hc/en-us/articles/16535124505362-Can-my-Staff-Members-have-different-pricing-or-durations-for-the-services-my-business-offers (403 au fetch, titre et résumé via recherche)
- Booksy stats & reports : https://biz.booksy.com/features/stats-and-reports
- Booksy Biz Pro vs Lite : https://biz.booksy.com/blog/booksy-biz-pro-and-booksy-biz-lite-which-is-right-for-your-business
- StyleSeat coût : https://www.styleseat.com/blog/how-much-does-styleseat-cost/
- StyleSeat frais cachés : https://www.styleseat.com/blog/does-styleseat-have-hidden-fees/
- StyleSeat braiders : https://styleseat.com/join/braiders
- StyleSeat deposits (pros) : https://help.styleseat.com/support/solutions/articles/69000851802-deposits-information-for-professionals
- StyleSeat deposits (clients) : https://help.styleseat.com/articles/13612540-deposits-information-for-clients
- StyleSeat custom deposits : https://www.styleseat.com/join/deposits
- StyleSeat no-show policy : https://www.styleseat.com/blog/should-i-charge-for-no-shows-and-late-cancellation
- StyleSeat vs Booksy (comparatif éditeur) : https://www.styleseat.com/blog/styleseat-vs-booksy-fees-plans/
- Acuity pricing : https://www.acuityscheduling.com/pricing
- Acuity add-ons : https://help.acuityscheduling.com/hc/articles/16676886445837 (403 au fetch, contenu via recherche)
- Acuity start time intervals : https://help.acuityscheduling.com/hc/articles/16676924846733
- Acuity pooling / Any available : https://help.acuityscheduling.com/hc/en-us/articles/16676903042829-Pooling-calendar-availability-in-Acuity-Scheduling
- Acuity how clients book : https://help.acuityscheduling.com/hc/en-us/articles/16676869573645-How-clients-book-appointments
- Acuity vs Vagaro (comparatif éditeur) : https://acuityscheduling.com/compare/acuity-vs-vagaro
- Square Appointments pricing (chiffres non rendus) : https://squareup.com/us/en/appointments/pricing
- Square multi-staff appointments : https://squareup.com/help/us/en/article/7238-multi-staff-appointment-staff-scheduling
- Square deposits : https://squareup.com/help/us/en/article/8096-deposits-on-square-appointments
- Square cancellation / prepayment policies : https://squareup.com/help/us/en/article/5493-set-a-custom-cancellation-policy-with-square-appointments
- Square multi-location : https://squareup.com/us/en/appointments/features/multi-location
- Square Community, commissions (beta) : https://www.sellercommunity.com/t5/General-Discussion/Beta-Square-Appointments-Commission-Tracking-now-recruiting/m-p/210778
- Square Community, commissions fixes et paliers : https://sellercommunity.com/t5/Product-Updates/New-Fixed-Rate-and-Tiered-Commissions-with-Square-Appointments/ba-p/276713
- Square Community, scission commission deux staff : https://community.squareup.com/t5/Payments-Troubleshooting/Can-I-do-one-transaction-with-2-different-user-bills-for/m-p/676609
- Square Community, commission sur brut : https://community.squareup.com/t5/Staff-Payroll/Commission-Based-on-Gross-sales-not-Net-Sales/td-p/790700
- Square Community, double booking / processing time 5 min : https://sellercommunity.com/t5/Square-Appointments/Need-to-be-able-to-double-book-in-square-appointments/m-p/707284
- Square Community, booking multiple staff : https://community.squareup.com/t5/Appointments-Bookings/Booking-multiple-staff-members/td-p/702716
- GlossGenius pricing : https://glossgenius.com/pricing
- GlossGenius processing calculator (2,6 % flat) : https://glossgenius.com/payment-processing-calculator
- GlossGenius online booking (add-ons) : https://glossgenius.com/online-booking
- GlossGenius overview (deposits, forms) : https://glossgenius.com/glossgenius-overview
- GlossGenius expenses : https://glossgenius.com/blog/tracking-your-expenses-easier-with-glossgenius
- GlossGenius reports : https://glossgenius.com/blog/small-business-reports
- GlossGenius for team members : https://glossgenius.com/for-team-members
- GlossGenius sur Square pricing (concurrent) : https://glossgenius.com/blog/square-appointments-pricing
- Vagaro pricing : https://www.vagaro.com/pro/pricing
- Vagaro plans, pricing, premium features (support) : https://support.vagaro.com/hc/en-us/articles/22781768988187-Vagaro-Plans-Pricing-and-Premium-Features
- Vagaro deposit online booking : https://support.vagaro.com/hc/en-us/articles/17733255383707-Require-a-Customer-Deposit-for-Online-Booking
- Vagaro cancellation / no-show fee : https://support.vagaro.com/hc/en-us/articles/17733260320539-Automatically-Charge-a-Cancellation-or-No-Show-Fee
- Vagaro book multiple services : https://support.vagaro.com/hc/en-us/articles/360007887174-Book-Multiple-Services-for-Customers-of-a-Vagaro-Business
- Vagaro service bundle : https://support.vagaro.com/hc/en-us/articles/204348090-Create-a-Service-Bundle
- Vagaro commissions services : https://support.vagaro.com/hc/en-us/articles/21475957047323-Set-Up-Commissions-for-Services
- Vagaro Fill My Books (frais 20 % / 5 %) : https://support.vagaro.com/hc/en-us/articles/18977275777947-Get-Featured-on-the-Vagaro-Marketplace
- Vagaro Tap to Phone US : https://support.vagaro.com/hc/en-us/articles/26878452778139-Tap-to-Phone-on-iPhone-United-States
- Vagaro card processing : https://www.vagaro.com/pro/card-processing
- Vagaro Sales Summary (Business Cost) : https://support.vagaro.com/hc/en-us/articles/360000348493-Sales-Summary-Report
- Vagaro payroll (Gusto) : https://www.vagaro.com/learn/6-ways-gusto-and-vagaro-make-payroll-processing-easier
- Vagaro rachète Schedulicity (Business Wire, 2025-01-13) : https://www.businesswire.com/news/home/20250113173168/en/Vagaro-Acquires-Schedulicity-to-Expand-Service-to-Industry
- Schedulicity pricing (redirige vers Vagaro) : https://www.schedulicity.com/pricing
- Fresha pricing : https://www.fresha.com/pricing
- Fresha commissions : https://www.fresha.com/help-center/knowledge-base/team/98-set-up-commissions-for-team-members
- Fresha pay run : https://www.fresha.com/help-center/knowledge-base/team/300-complete-a-pay-run
- Fresha commissions update (scission multi-membres) : https://www.fresha.com/blog/fresha-commissions-update
- Fresha no-show / cancellation fees : https://www.fresha.com/help-center/knowledge-base/payments/617-charge-no-show-and-cancellation-fees
- Fresha payment policies : https://www.fresha.com/help-center/knowledge-base/payments/101660-set-up-payment-policies
- Fresha any professional (create appointments) : https://www.fresha.com/help-center/knowledge-base/calendar/25-create-appointments-1
- Mangomint pricing : https://www.mangomint.com/pricing/
- Mangomint price changes 2026 : https://www.mangomint.com/learn/price-changes-2026/
- Mangomint Express Booking : https://www.mangomint.com/features/express-booking/
- Mangomint service customizations : https://www.mangomint.com/learn/set-up-service-customizations/
- Mangomint service customizations enhancements : https://www.mangomint.com/blog/announcing-exciting-new-service-customizations-enhancements/
- Mangomint staff selection : https://www.mangomint.com/learn/adjusting-staff-selection-options-in-online-booking/
- Mangomint appointment multi-services / staff : https://www.mangomint.com/learn/creating-an-appointment-with-multiple-services-staff-members/
- Mangomint scheduling options (two staff, gaps) : https://www.mangomint.com/learn/scheduling-options/
- Mangomint group bookings FAQ : https://www.mangomint.com/learn/faq-group-booking/
- Boulevard pricing : https://www.joinblvd.com/pricing
- Boulevard AI scheduling (Precision Scheduling) : https://www.joinblvd.com/blog/ai-powered-scheduling
- Boulevard commission structure : https://www.joinblvd.com/blog/sales-commission-structure
- Boulevard mobile booking / deposits : https://www.joinblvd.com/blog/mobile-appointment-booking-salon-industry
- Zenoti pricing : https://www.zenoti.com/pricing
- Mindbody pricing : https://www.mindbodyonline.com/pricing
- Phorest pricing US : https://www.phorest.com/us/pricing/
- Goldie pricing : https://heygoldie.com/pricing
- Setmore pricing : https://www.setmore.com/pricing

### Avis et communautés
- Booksy Trustpilot : https://www.trustpilot.com/review/booksy.com
- Booksy Capterra : https://www.capterra.com/p/142741/Booksy/reviews/
- StyleSeat Trustpilot : https://www.trustpilot.com/review/styleseat.com
- StyleSeat Capterra : https://capterra.com/p/176521/StyleSeat/reviews/
- Acuity Capterra : https://capterra.com/p/191978/Acuity-Scheduling/reviews/
- Acuity G2 : https://g2.com/products/acuity-scheduling/reviews
- Square Appointments Capterra : https://capterra.com/p/170263/Square-Appointments/reviews/
- GlossGenius Capterra : https://capterra.com/p/174830/GlossGenius/reviews/
- Vagaro Capterra : https://www.capterra.com/p/153752/Vagaro/reviews/
- Vagaro Trustpilot : https://fr.trustpilot.com/review/vagaro.com
- Fresha Capterra : https://capterra.com/p/142138/Shedul-com/reviews/
- Fresha Trustpilot : https://fi.trustpilot.com/review/fresha.com
- Mangomint Capterra : https://capterra.com/p/187593/Mangomint/reviews/
- Mangomint G2 : https://g2.com/products/mangomint/reviews
- Boulevard Capterra : https://www.capterra.com/p/180087/Boulevard/reviews/
- Boulevard G2 : https://g2.com/products/boulevard-labs-inc-boulevard/reviews
- Zenoti G2 : https://www.g2.com/products/zenoti/reviews_and_filters
- Phorest Capterra : https://capterra.com/p/113530/Phorest-Salon-Software/reviews/
- Booker (Mindbody) Capterra : https://capterra.com/p/90708/Booker/reviews/
- Goldie Capterra : https://www.capterra.com/p/268055/Goldie/reviews/
- Setmore Capterra : https://www.capterra.com/p/122035/SetMore/reviews/

### Sources tierces (prix et analyses, à confirmer)
- DoTheBeauty, Square Appointments pricing (2026-06-21) : https://www.dothebeauty.com/blog/square-appointments-pricing-salon-cost-breakdown
- SquareFeeCalculator, Square fees 2026 : https://www.squarefeecalculator.com/2026/10/square-fees-in-2026-rates-plans-and.html
- Koalendar, Square Appointments pricing : https://koalendar.com/blog/square-appointments-pricing
- Koalendar, GlossGenius pricing : https://koalendar.com/blog/gloss-genius-pricing
- Koalendar, Vagaro pricing : https://koalendar.com/blog/vagaro-pricing
- Pabau, StyleSeat review : https://pabau.com/blog/styleseat-review/
- Pabau, Fresha pricing : https://pabau.com/blog/fresha-pricing/
- Pabau, Boulevard pricing : https://pabau.com/blog/boulevard-pricing/
- Pabau, Zenoti pricing : https://pabau.com/blog/zenoti-pricing/
- Pabau, Phorest pricing : https://pabau.com/blog/phorest-pricing/
- SchedulingKit, Zenoti pricing : https://schedulingkit.com/pricing-guides/zenoti-pricing
- SchedulingKit, Mindbody pricing : https://www.schedulingkit.com/pricing-guides/mindbody-pricing
- SchedulingKit, Setmore pricing : https://schedulingkit.com/pricing-guides/setmore-pricing
- CostBench, Schedulicity : https://costbench.com/software/gym-management/schedulicity/
- CostBench, Mindbody : https://costbench.com/software/salon-spa/booker-mindbody/hidden-costs/
- Setora (concurrent UK), Booksy Boost expliqué : https://www.setora.co.uk/blog/booksy-boost-commission-explained
- bookyour.hair (concurrent), StyleSeat alternative : https://bookyour.hair/styleseat-alternative
- Contrary Research, Boulevard : https://research.contrary.com/company/boulevard
- Dupple, Boulevard review (juillet 2026) : https://dupple.com/reviews/boulevard
- Zenoti « The Check-In », best booking apps 2026 (concurrent) : https://www.zenoti.com/thecheckin/best-booking-apps-beauty-professionals-2026
- Goldie, best scheduling apps for salons (concurrent) : https://heygoldie.com/blog/best-scheduling-apps-for-salons
- Primzy Beauty, booking software lash artists (calcul frais d'acompte) : https://www.primzybeauty.com/blog/best-booking-software-lash-artists
- Checkthat.ai, Vagaro reviews roundup 2026 : https://checkthat.ai/brands/vagaro/reviews
- Substack « Hairstylists aren't beating the unprofessional » (mèches annoncées après acompte) : https://beautybullsh1t.substack.com/p/hairstylists-arent-beating-the-unprofessional
- Airbnb Services, listings de tresseuses (« bring 1 pack of pre-stretched hair ») : https://www.airbnb.com/services/6907093 et https://www.airbnb.com/services/6876192

### Sources internes
- Transcription et exigences terrain : [BOOKING_V2_REQUIREMENTS.md](BOOKING_V2_REQUIREMENTS.md)
- Catalogue Acuity d'Adorable Braids : [acuity_catalog_adorable_braids.csv](acuity_catalog_adorable_braids.csv)
