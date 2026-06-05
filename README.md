================================================================
KITCHENPULSE — PHASE 2 : FICHIERS CLIENT-UI
================================================================

FICHIERS FOURNIS
----------------
frontend/src/
├── theme.js                        ← NOUVEAU (partagé par tout le projet)
├── components/
│   ├── DishCard.jsx                ← NOUVEAU
│   └── OrderCard.jsx               ← NOUVEAU
├── pages/
│   ├── Register.jsx                ← NOUVEAU (complète Login.jsx)
│   └── client/
│       ├── Menu.jsx                ← NOUVEAU (GET /api/dishes)
│       ├── Panier.jsx              ← NOUVEAU (POST /api/orders)
│       ├── Paiement.jsx            ← NOUVEAU (POST /api/payments)
│       └── SuiviCommande.jsx       ← NOUVEAU (GET /api/orders/:id, polling 3s)


OÙ METTRE LES FICHIERS DÉJÀ CRÉÉS PAR L'AUTRE SESSION
-------------------------------------------------------
axiosConfig.js    → frontend/src/api/axiosConfig.js
AuthContext.jsx   → frontend/src/context/AuthContext.jsx
useSocket.js      → frontend/src/hooks/useSocket.js
Login.jsx         → frontend/src/pages/Login.jsx


MODIFICATIONS NÉCESSAIRES DANS App.jsx
---------------------------------------
Ajouter 2 états au niveau App pour connecter les pages :

  const [orderId, setOrderId]   = useState(null);
  const [totalTTC, setTotalTTC] = useState(0);

Mettre à jour renderPage() pour passer les bons props :

  menu:   <Menu panier={panier} setPanier={setPanier} />
  panier: <Panier panier={panier} setPanier={setPanier} setPage={setPage}
                  setOrderId={setOrderId} />
  suivi:  <SuiviCommande orderId={orderId} totalTTC={totalTTC}
                         setPage={setPage} setOrderId={setOrderId} />
  paiement: <Paiement orderId={orderId} total={totalTTC} setPage={setPage} />

Ajouter aussi "paiement" dans NAVS.client si vous voulez un onglet dédié,
sinon c'est accessible uniquement depuis SuiviCommande (recommandé).


MISE À JOUR DU LOGIN EXISTANT
------------------------------
Vérifier que Login.jsx appelle bien login() du AuthContext après succès :

  const { login } = useContext(AuthContext);
  // ...
  const { data } = await api.post('/auth/login', { email, password });
  login(data.token, data.user);

Et Register.jsx fait la même chose automatiquement.


RÉPONSES API ATTENDUES PAR LES PAGES
--------------------------------------
GET /api/dishes → tableau de :
  { id, nom, prix, is_available, category_name,
    note_moyenne, calories, allergenes[], image_url }

GET /api/tables → tableau de :
  { id, numero, statut }

POST /api/orders → body: { table_id, notes, items[] }
  → réponse: { commande_id, order_number, ... }

GET /api/orders/:id →
  { id, order_number, status, payment_status, table_numero,
    total_amount, items[{quantity, plat_nom, subtotal}] }

POST /api/payments → body: { commande_id, method, amount }


NOTES SUR theme.js
------------------
Importer dans chaque fichier :  import { G } from '../../theme';
(adapter le chemin relatif selon la profondeur du fichier)

Login.jsx et Register.jsx qui sont dans src/pages/ :
  import { G } from '../theme';

Menu/Panier/etc. qui sont dans src/pages/client/ :
  import { G } from '../../theme';

Composants dans src/components/ :
  import { G } from '../theme';


PROCHAINES ÉTAPES
-----------------
Phase 3 : feat/cuisinier → FileCommandes.jsx + GestionPlats.jsx
Phase 4 : feat/serveur-admin → pages serveur + admin
Phase 5 : feat/socket → socketHandlers.js + useSocket.js

================================================================