import { useLibrary } from '../hooks/useLibrary'
import type { Suggestion } from '../types'

export function FavouriteButton({ place }: { place: Suggestion }) {
  const { get, toggleFavourite } = useLibrary()
  const favourite = get(place.id)?.favourite ?? false
  return (
    <button
      type="button"
      className={`fav-btn ${favourite ? 'active' : ''}`}
      onClick={() => toggleFavourite(place)}
      aria-pressed={favourite}
      aria-label={favourite ? `Remove ${place.name} from favourites` : `Add ${place.name} to favourites`}
      title={favourite ? 'Favourite' : 'Add to favourites'}
    >
      {favourite ? '♥' : '♡'}
    </button>
  )
}
