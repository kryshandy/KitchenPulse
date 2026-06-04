export const DISHES = [
  { id: 1, nom: "Ndolé Royal",      prix: 4500, cal: 620, cat: "Plat",    note: 4.8, img: "🥘", disponible: true,  allergenes: ["arachides"] },
  { id: 2, nom: "Poulet DG",        prix: 5200, cal: 710, cat: "Plat",    note: 4.9, img: "🍗", disponible: true,  allergenes: [] },
  { id: 3, nom: "Tilapia Grillé",   prix: 3800, cal: 480, cat: "Poisson", note: 4.6, img: "🐟", disponible: true,  allergenes: ["poisson"] },
  { id: 4, nom: "Plantain Sucré",   prix: 1200, cal: 290, cat: "Entrée",  note: 4.4, img: "🍌", disponible: true,  allergenes: [] },
  { id: 5, nom: "Jus de Gingembre", prix: 800,  cal: 120, cat: "Boisson", note: 4.7, img: "🍹", disponible: true,  allergenes: [] },
  { id: 6, nom: "Brochettes Mixtes",prix: 3200, cal: 540, cat: "Entrée",  note: 4.5, img: "🍢", disponible: false, allergenes: [] },
];

export const ORDERS = [
  { id: 1042, table: 4, statut: "RECUE",          plats: ["Ndolé Royal", "Jus de Gingembre"], total: 5300, temps: "18:42", client: "Marie K." },
  { id: 1041, table: 7, statut: "EN_PREPARATION", plats: ["Poulet DG", "Plantain Sucré"],     total: 6400, temps: "18:38", client: "Jean P."  },
  { id: 1040, table: 2, statut: "PRETE",          plats: ["Tilapia Grillé"],                  total: 3800, temps: "18:31", client: "Sophie M." },
  { id: 1039, table: 9, statut: "SERVIE",         plats: ["Brochettes Mixtes", "Jus de Gingembre"], total: 4000, temps: "18:20", client: "Paul N." },
];