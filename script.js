/**
 * script.js – CV Ndeye Asta Ngom
 *
 * Ce fichier gère :
 *  1. La génération dynamique des barres de compétences
 *  2. L'animation au défilement (IntersectionObserver)
 *  3. L'animation différée des barres de compétences
 *  4. Les interactions clavier sur les cartes projet
 *  5. Le tooltip au survol des tags de compétences
 *  6. L'effet ripple (ondulation) sur les cartes projet
 */

/* ══════════════════════════════════════════════════════════
   1. DONNÉES – Compétences avec nom et pourcentage
   Modifier ces données pour mettre à jour les barres
══════════════════════════════════════════════════════════ */
const competences = [
  { nom: "HTML / CSS",           niveau: 80 },
  { nom: "JavaScript",           niveau: 65 },
  { nom: "Langage C",            niveau: 70 },
  { nom: "Python / Pandas",      niveau: 60 },
  { nom: "MySQL / SQLite",       niveau: 65 },
  { nom: "Linux / Systèmes",     niveau: 55 },
  { nom: "Merise",               niveau: 60 },
  { nom: "Algorithmique",        niveau: 75 },
];

/* ══════════════════════════════════════════════════════════
   2. GÉNÉRATION DES BARRES DE COMPÉTENCES
   Injecte le HTML des barres dans #skills-list
══════════════════════════════════════════════════════════ */

/**
 * Crée un élément HTML <div class="skill-item"> pour chaque compétence.
 * La largeur de .skill-fill démarre à 0% et sera animée plus tard (§4).
 *
 * @param {Object} competence - { nom: string, niveau: number (0-100) }
 * @returns {HTMLElement} L'élément DOM créé
 */
function creerBarreCompetence(competence) {
  // Conteneur principal
  const item = document.createElement("div");
  item.classList.add("skill-item");

  // Ligne nom + pourcentage
  const nomEl = document.createElement("div");
  nomEl.classList.add("skill-name");
  nomEl.innerHTML = `${competence.nom} <span>${competence.niveau}%</span>`;

  // Fond de la barre
  const barFond = document.createElement("div");
  barFond.classList.add("skill-bar");

  // Remplissage (commence à 0 – animé par animerBarres)
  const barRemplissage = document.createElement("div");
  barRemplissage.classList.add("skill-fill");
  barRemplissage.style.width = "0%";

  // Accessibilité : rôle progressbar
  barFond.setAttribute("role", "progressbar");
  barFond.setAttribute("aria-valuenow", competence.niveau);
  barFond.setAttribute("aria-valuemin", 0);
  barFond.setAttribute("aria-valuemax", 100);
  barFond.setAttribute("aria-label", `Niveau en ${competence.nom}`);

  // Assemblage
  barFond.appendChild(barRemplissage);
  item.appendChild(nomEl);
  item.appendChild(barFond);

  return item;
}

/**
 * Insère toutes les barres générées dans le conteneur DOM.
 */
function initialiserCompetences() {
  const conteneur = document.getElementById("skills-list");
  if (!conteneur) return; // Sécurité si l'élément n'existe pas

  // Vide le conteneur avant d'insérer (évite les doublons)
  conteneur.innerHTML = "";

  competences.forEach((comp) => {
    const barreEl = creerBarreCompetence(comp);
    conteneur.appendChild(barreEl);
  });
}

/* ══════════════════════════════════════════════════════════
   3. ANIMATION DES BARRES (déclenché par IntersectionObserver)
══════════════════════════════════════════════════════════ */

/**
 * Lance l'animation de remplissage de chaque barre.
 * Chaque barre a un léger délai décroissant pour un effet "cascade".
 */
function animerBarres() {
  const remplissages = document.querySelectorAll(".skill-fill");

  remplissages.forEach((fill, index) => {
    // Récupère le niveau depuis le data de la barre (via le texte de l'aria)
    const barFond = fill.parentElement;
    const niveau = barFond.getAttribute("aria-valuenow");

    // Délai progressif pour effet cascade
    const delai = index * 100; // 100ms entre chaque barre

    setTimeout(() => {
      fill.style.width = `${niveau}%`;
    }, delai);
  });
}

/* ══════════════════════════════════════════════════════════
   4. REVEAL AU SCROLL – IntersectionObserver
   Déclenche l'apparition des sections quand elles deviennent visibles
══════════════════════════════════════════════════════════ */

/**
 * Observe chaque élément .reveal-section.
 * Quand l'élément entre dans le viewport, on ajoute .visible
 * qui déclenche la transition CSS (opacity + translateY).
 */
function initRevealAuScroll() {
  // Options de l'observer
  const options = {
    root: null,         // Observe par rapport au viewport
    threshold: 0.12,    // Déclenche quand 12% de l'élément est visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Ajoute la classe qui déclenche l'animation CSS
        entry.target.classList.add("visible");

        // Si c'est la section compétences (sidebar), on anime les barres
        if (entry.target.id === "sidebar-skills-trigger") {
          animerBarres();
        }

        // Une fois visible, plus besoin d'observer cet élément
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Observe toutes les sections marquées .reveal-section
  const sections = document.querySelectorAll(".reveal-section");
  sections.forEach((section) => observer.observe(section));

  // Observe aussi la sidebar pour déclencher l'animation des barres
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.id = "sidebar-skills-trigger"; // Identifiant pour la condition ci-dessus
    observer.observe(sidebar);
  }
}

/* ══════════════════════════════════════════════════════════
   5. INTERACTIONS CLAVIER SUR LES CARTES PROJET
   Accessibilité : Entrée et Espace ouvrent le détail
══════════════════════════════════════════════════════════ */

/**
 * Permet d'activer une carte projet via le clavier (Entrée / Espace).
 * Affiche un message de retour utilisateur (toast temporaire).
 */
function initCartesProjet() {
  const cartes = document.querySelectorAll(".project-card");

  cartes.forEach((carte) => {
    // Gestion clavier
    carte.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        // Effet visuel de clic
        carte.style.transform = "scale(0.97)";
        setTimeout(() => {
          carte.style.transform = "";
        }, 150);
      }
    });

    // Effet d'ondulation (ripple) au clic souris
    carte.addEventListener("click", (e) => creerRipple(e, carte));
  });
}

/* ══════════════════════════════════════════════════════════
   6. EFFET RIPPLE (ondulation) sur les cartes projet
══════════════════════════════════════════════════════════ */

/**
 * Crée un cercle d'ondulation animé à l'endroit du clic.
 *
 * @param {MouseEvent} event   - L'événement clic
 * @param {HTMLElement} parent - L'élément sur lequel l'ondulation s'affiche
 */
function creerRipple(event, parent) {
  // Supprime l'ancienne ondulation si elle existe encore
  const ancienRipple = parent.querySelector(".ripple");
  if (ancienRipple) ancienRipple.remove();

  // Calcule la position relative au clic dans la carte
  const rect = parent.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const rayon = Math.max(rect.width, rect.height);

  // Crée le cercle
  const ripple = document.createElement("span");
  ripple.classList.add("ripple");

  // Styles inline pour l'ondulation
  Object.assign(ripple.style, {
    position:      "absolute",
    borderRadius:  "50%",
    background:    "rgba(201, 168, 76, .25)",
    width:         `${rayon * 2}px`,
    height:        `${rayon * 2}px`,
    left:          `${x - rayon}px`,
    top:           `${y - rayon}px`,
    transform:     "scale(0)",
    animation:     "rippleExpand .5s ease-out forwards",
    pointerEvents: "none",
  });

  // Nécessite position:relative sur le parent (déjà en CSS)
  parent.style.position = "relative";
  parent.style.overflow = "hidden";
  parent.appendChild(ripple);

  // Nettoyage après animation
  ripple.addEventListener("animationend", () => ripple.remove());
}

/* Injection dynamique du keyframe ripple dans le <head>
   (évite d'avoir un keyframe statique inutile en CSS) */
(function injecterKeyframeRipple() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes rippleExpand {
      to { transform: scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

/* ══════════════════════════════════════════════════════════
   7. TOOLTIP SUR LES TAGS TECHNOLOGIQUES
   Affiche une description courte au survol
══════════════════════════════════════════════════════════ */

/** Dictionnaire des descriptions courtes par technologie */
const descriptionTech = {
  "HTML":         "Langage de structure des pages web",
  "CSS":          "Feuilles de style pour la mise en forme",
  "JavaScript":   "Langage de script côté client",
  "Python":       "Langage polyvalent, utilisé pour la data",
  "Pandas":       "Bibliothèque Python d'analyse de données",
  "SQLite":       "Base de données légère, sans serveur",
  "MySQL":        "Système de gestion de base de données",
  "Google Colab": "Environnement Python en ligne (Google)",
  "Merise":       "Méthode de modélisation de bases de données",
  "Langage C":    "Langage bas niveau, proche du système",
  "Comptabilité": "Suivi et gestion des finances",
  "Gestion":      "Organisation et pilotage d'activités",
  "Excel":        "Tableur Microsoft pour l'analyse de données",
  "Caisse":       "Gestion des encaissements en magasin",
  "Pédagogie":    "Art de transmettre des connaissances",
  "Encadrement":  "Accompagnement et suivi d'apprenants",
  "Service client":"Relation et accueil du public",
};

/**
 * Crée et positionne dynamiquement un tooltip au survol d'un tag.
 */
function initTooltipsTech() {
  const tags = document.querySelectorAll(".tech-tag");

  // Création d'un seul élément tooltip réutilisé
  const tooltip = document.createElement("div");
  tooltip.id = "tooltip-tech";

  // Styles de base pour le tooltip
  Object.assign(tooltip.style, {
    position:       "fixed",
    background:     "#0d1b2a",
    color:          "#e8c96a",
    fontSize:       ".72rem",
    padding:        "5px 10px",
    borderRadius:   "4px",
    pointerEvents:  "none",
    opacity:        "0",
    transition:     "opacity .2s ease",
    zIndex:         "9999",
    maxWidth:       "200px",
    lineHeight:     "1.4",
    boxShadow:      "0 4px 12px rgba(0,0,0,.3)",
    whiteSpace:     "nowrap",
  });

  document.body.appendChild(tooltip);

  tags.forEach((tag) => {
    const texte = tag.textContent.trim();
    const description = descriptionTech[texte];
    if (!description) return; // Pas de tooltip si pas de description

    // Survol entrant → afficher le tooltip
    tag.addEventListener("mouseenter", (e) => {
      tooltip.textContent = description;
      tooltip.style.opacity = "1";
      positionnerTooltip(e);
    });

    // Mouvement souris → repositionner
    tag.addEventListener("mousemove", positionnerTooltip);

    // Survol sortant → masquer
    tag.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });
  });

  /**
   * Positionne le tooltip près du curseur.
   * @param {MouseEvent} e
   */
  function positionnerTooltip(e) {
    const decalX = 12;
    const decalY = -32;
    tooltip.style.left = `${e.clientX + decalX}px`;
    tooltip.style.top  = `${e.clientY + decalY}px`;
  }
}

/* ══════════════════════════════════════════════════════════
   8. INITIALISATION – Point d'entrée principal
   Appelé une fois le DOM entièrement chargé
══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  // Étape 1 : Génère les barres de compétences dans le DOM
  initialiserCompetences();

  // Étape 2 : Lance les révélations au scroll (et l'animation des barres)
  initRevealAuScroll();

  // Étape 3 : Active les interactions sur les cartes projet
  initCartesProjet();

  // Étape 4 : Active les tooltips sur les tags technologiques
  initTooltipsTech();

  // Étape 5 : Déclenche manuellement l'animation des barres
  //           pour les utilisateurs qui ne scrollent pas (CV visible dès le chargement)
  setTimeout(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      const isVisible = sidebar.getBoundingClientRect().top < window.innerHeight;
      if (isVisible) animerBarres();
    }
  }, 600); // Délai pour laisser l'animation fadeUp se terminer d'abord
});
