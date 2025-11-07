import { FaHospital } from 'react-icons/fa'

export default function HospitalButton({ onClick }) {
  return (
    <button className="fab" onClick={onClick} title="Мед. организации">
      <FaHospital className="fab-icon" />
    </button>
  )
}
