import React from 'react';

const categoryColors = {
  'Entrée':  'bg-green-100 text-green-700',
  'Plat':    'bg-orange-100 text-orange-700',
  'Dessert': 'bg-pink-100 text-pink-700',
  'Boisson': 'bg-blue-100 text-blue-700',
};

const DishCard = ({ dish, onEdit, onDelete, onToggle, showActions = true }) => {
  const categoryStyle = categoryColors[dish.categorie] || 'bg-gray-100 text-gray-700';

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-200 
      ${dish.disponible ? 'border-transparent hover:border-orange-300' : 'border-red-200 opacity-70'}`}>
      
      {/* Image */}
      <div className="relative h-40 bg-gray-100">
        {dish.photo ? (
          <img
            src={dish.photo}
            alt={dish.nom}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/placeholder-dish.png'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-50 to-red-50">
            🍽️
          </div>
        )}

        {/* Badge disponibilité */}
        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full
          ${dish.disponible ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {dish.disponible ? 'Disponible' : 'Indispo'}
        </span>

        {/* Badge catégorie */}
        <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${categoryStyle}`}>
          {dish.categorie}
        </span>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-base truncate">{dish.nom}</h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2 h-10">{dish.description || 'Aucune description'}</p>

        <div className="flex justify-between items-center mt-3">
          <span className="text-orange-600 font-bold text-lg">{Number(dish.prix).toFixed(2)} €</span>
          <span className="text-gray-400 text-xs flex items-center gap-1">
            🔥 {dish.calories} kcal
          </span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-4">
            {onToggle && (
              <button
                onClick={() => onToggle(dish)}
                className={`flex-1 text-xs py-2 rounded-lg font-semibold transition-colors
                  ${dish.disponible
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
              >
                {dish.disponible ? '⛔ Désactiver' : '✅ Activer'}
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(dish)}
                className="flex-1 text-xs py-2 rounded-lg font-semibold bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              >
                ✏️ Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(dish)}
                className="text-xs py-2 px-3 rounded-lg font-semibold bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DishCard;