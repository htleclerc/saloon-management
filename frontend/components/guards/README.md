# Utilisation du ReadOnlyGuard

## Vue d'ensemble

Le `ReadOnlyGuard` est un système de protection qui empêche toute action quand le super admin consulte un salon en mode lecture seule.

## Composant ReadOnlyGuard

### Usage basique

```tsx
import { ReadOnlyGuard } from '@/components/guards/ReadOnlyGuard';

function MyForm() {
    return (
        <ReadOnlyGuard>
            <form onSubmit={handleSubmit}>
                <input type="text" />
                <button type="submit">Enregistrer</button>
            </form>
        </ReadOnlyGuard>
    );
}
```

### Sans overlay (désactivation seulement)

```tsx
<ReadOnlyGuard showOverlay={false}>
    <button onClick={handleDelete}>Supprimer</button>
</ReadOnlyGuard>
```

## Hook useReadOnlyGuard

### Bloquer une action

```tsx
import { useReadOnlyGuard } from '@/components/guards/ReadOnlyGuard';

function MyComponent() {
    const { blockAction } = useReadOnlyGuard();
    
    const handleSave = () => {
        blockAction(() => {
            // Cette action ne s'exécutera que si pas en mode read-only
            saveData();
        });
    };
    
    return <button onClick={handleSave}>Enregistrer</button>;
}
```

### Props pour boutons

```tsx
function MyButton() {
    const { getButtonProps } = useReadOnlyGuard();
    
    return (
        <button 
            onClick={handleAction}
            {...getButtonProps()}
        >
            Action
        </button>
    );
}
```

### Rendu conditionnel

```tsx
function ActionButton() {
    const { isReadOnly } = useReadOnlyGuard();
    
    if (isReadOnly) {
        return null; // Cache complètement le bouton
    }
    
    return <button onClick={handleAction}>Action</button>;
}
```

## Où l'utiliser

### Formulaires
Envelopper tous les formulaires de création/modification:
- `/income/add`
- `/expenses/add`
- `/team/add`
- `/services/add`
- etc.

### Boutons d'action
- Boutons "Ajouter"
- Boutons "Modifier"
- Boutons "Supprimer"
- Boutons "Valider"
- Boutons "Affecter"

### Exemples complets

```tsx
// Page d'ajout de revenu
export default function AddIncomePage() {
    const { blockAction } = useReadOnlyGuard();
    
    const handleSubmit = (data) => {
        blockAction(() => {
            // Logique de soumission
        });
    };
    
    return (
        <ReadOnlyGuard>
            <form onSubmit={handleSubmit}>
                {/* Form fields */}
            </form>
        </ReadOnlyGuard>
    );
}
```

```tsx
// Liste avec boutons d'actions
export default function ExpensesList() {
    const { getButtonProps, blockAction } = useReadOnlyGuard();
    
    return (
        <div>
            {expenses.map(expense => (
                <div key={expense.id}>
                    <button 
                        onClick={() => blockAction(() => editExpense(expense.id))}
                        {...getButtonProps()}
                    >
                        Modifier
                    </button>
                    <button 
                        onClick={() => blockAction(() => deleteExpense(expense.id))}
                        {...getButtonProps()}
                    >
                        Supprimer
                    </button>
                </div>
            ))}
        </div>
    );
}
```

## Comportement

En mode read-only:
- ✅ Affichage d'une alerte explicative
- ✅ Blocage de tous les événements
- ✅ Overlay visuel sur les zones protégées
- ✅ Curseur "not-allowed"
- ✅ Opacité réduite pour indiquer l'état désactivé
