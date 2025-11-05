import { FaSearch } from 'react-icons/fa'

export default function SearchButton({ onClick }) {
  return (
    <button className="fab" onClick={onClick} title="Поиск">
      <FaSearch />
    </button>
  )
}
