import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { TYPES_CONGES } from '../../services/congesService'
import { FILIALES } from '../../config/filiales'

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export default function PlanningCalendar({ demandes = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)) // Novembre 2026 par défaut
  const [filialeFiltre, setFilialeFiltre] = useState('all')

  const annee = currentDate.getFullYear()
  const mois = currentDate.getMonth()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(annee, mois - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(annee, mois + 1, 1))
  }

  const handleToday = () => {
    const now = new Date()
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  // Filtrer les demandes validées ou en attente
  const activeDemandes = useMemo(() => {
    return demandes.filter(d => {
      if (d.statut !== 'valide' && d.statut !== 'en_attente') return false
      if (filialeFiltre !== 'all' && d.filiale !== filialeFiltre) return false
      return true
    })
  }, [demandes, filialeFiltre])

  // Générer les jours du mois
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(annee, mois, 1)
    const lastDayOfMonth = new Date(annee, mois + 1, 0)

    // Jour de la semaine du premier jour (0 = Dimanche -> converti en 0 = Lundi)
    let startDay = firstDayOfMonth.getDay() - 1
    if (startDay === -1) startDay = 6 // Dimanche devient 6

    const totalDays = lastDayOfMonth.getDate()
    const days = []

    // Jours du mois précédent pour combler
    const prevMonthLastDay = new Date(annee, mois, 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(annee, mois - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }

    // Jours du mois courant
    for (let d = 1; d <= totalDays; d++) {
      days.push({
        date: new Date(annee, mois, d),
        isCurrentMonth: true,
      })
    }

    // Jours du mois suivant pour compléter les 35 ou 42 cases
    const remaining = 35 - days.length
    const extra = remaining > 0 ? remaining : 42 - days.length
    for (let d = 1; d <= extra; d++) {
      days.push({
        date: new Date(annee, mois + 1, d),
        isCurrentMonth: false,
      })
    }

    return days
  }, [annee, mois])

  // Associer les absences par date
  const getAbsencesForDate = (dateObj) => {
    const y = dateObj.getFullYear()
    const m = String(dateObj.getMonth() + 1).padStart(2, '0')
    const d = String(dateObj.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    return activeDemandes.filter(dem => {
      return dateStr >= dem.dateDebut && dateStr <= dem.dateFin
    })
  }

  const getType = (typeId) => TYPES_CONGES.find(t => t.id === typeId) || TYPES_CONGES[0]

  return (
    <div style={{
      background: 'white', borderRadius: 18, border: '1px solid #e7e5e4',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Barre d'outils du calendrier */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #f5f5f4',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        {/* Navigation mois */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1c1917', margin: 0, minWidth: 170 }}>
            {MOIS_NOMS[mois]} {annee}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fafaf9', padding: 3, borderRadius: 10, border: '1px solid #e7e5e4' }}>
            <button
              onClick={handlePrevMonth}
              style={{
                width: 28, height: 28, borderRadius: 7, border: 'none',
                background: 'white', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#57534e',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
              title="Mois précédent"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleToday}
              style={{
                padding: '4px 10px', borderRadius: 7, border: 'none',
                background: 'transparent', cursor: 'pointer', fontSize: 12,
                fontWeight: 600, color: '#007FE1',
              }}
            >
              Aujourd'hui
            </button>
            <button
              onClick={handleNextMonth}
              style={{
                width: 28, height: 28, borderRadius: 7, border: 'none',
                background: 'white', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#57534e',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
              title="Mois suivant"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Filtre filiale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} style={{ color: '#a8a29e' }} />
          <select
            value={filialeFiltre}
            onChange={(e) => setFilialeFiltre(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 10, border: '1px solid #e7e5e4',
              background: '#fafaf9', fontSize: 12, fontWeight: 600, color: '#1c1917',
              outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="all">Toutes les filiales</option>
            {FILIALES.map(f => (
              <option key={f.id} value={f.nom}>{f.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille des jours de la semaine */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        background: '#fafaf9', borderBottom: '1px solid #f5f5f4',
      }}>
        {JOURS_SEMAINE.map((jour, i) => (
          <div
            key={jour}
            style={{
              padding: '10px 8px', textAlign: 'center', fontSize: 11,
              fontWeight: 700, color: i >= 5 ? '#a8a29e' : '#57534e',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            {jour}
          </div>
        ))}
      </div>

      {/* Cases des jours */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        background: '#f5f5f4', gap: 1,
      }}>
        {calendarDays.map((item, index) => {
          const isWeekend = item.date.getDay() === 0 || item.date.getDay() === 6
          const absences = getAbsencesForDate(item.date)
          const isCurrentDay = item.date.toDateString() === new Date().toDateString()

          return (
            <div
              key={index}
              style={{
                minHeight: 90, padding: 8,
                background: item.isCurrentMonth
                  ? (isWeekend ? '#fafaf9' : 'white')
                  : '#fbfbfb',
                opacity: item.isCurrentMonth ? 1 : 0.45,
                display: 'flex', flexDirection: 'column', gap: 4,
              }}
            >
              {/* Numéro du jour */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 12, fontWeight: isCurrentDay ? 800 : 600,
                  width: 22, height: 22, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCurrentDay ? '#007FE1' : 'transparent',
                  color: isCurrentDay ? 'white' : (isWeekend ? '#a8a29e' : '#1c1917'),
                }}>
                  {item.date.getDate()}
                </span>
                {absences.length > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#78716c' }}>
                    {absences.length} abs.
                  </span>
                )}
              </div>

              {/* Badges d'absences */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'hidden' }}>
                {absences.slice(0, 3).map((abs) => {
                  const type = getType(abs.typeId)
                  return (
                    <div
                      key={abs.id}
                      title={`${abs.employeNom} - ${type.label} (${abs.filiale})`}
                      style={{
                        padding: '2px 5px', borderRadius: 5,
                        background: type.bg, borderLeft: `2.5px solid ${type.color}`,
                        fontSize: 10, fontWeight: 600, color: type.color,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}
                    >
                      <span>{abs.employeNom.split(' ')[0]}</span>
                      <span style={{ opacity: 0.7, fontSize: 9 }}>({type.code})</span>
                    </div>
                  )
                })}
                {absences.length > 3 && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#78716c', paddingLeft: 4 }}>
                    +{absences.length - 3} autre(s)
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div style={{
        padding: '12px 20px', borderTop: '1px solid #f5f5f4',
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14,
        background: '#fafaf9', fontSize: 11,
      }}>
        <span style={{ fontWeight: 700, color: '#78716c' }}>Légende :</span>
        {TYPES_CONGES.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: t.color }} />
            <span style={{ color: '#57534e', fontWeight: 600 }}>{t.label} ({t.code})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
