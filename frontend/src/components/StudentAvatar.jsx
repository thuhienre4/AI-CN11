const hairPaths = {
  short: <path d="M39 59c1-25 18-38 41-38 24 0 40 15 41 39-9-7-18-12-28-14-14-3-30 2-43 13l-11 0Z" />,
  side: <path d="M38 66c-2-26 14-45 41-45 25 0 42 16 42 42-13-2-22-12-25-25-12 17-30 25-58 28Z" />,
  curly: <path d="M38 61c-5-8 0-17 8-18-4-9 4-17 13-16 3-10 15-11 21-5 8-8 20-3 21 5 10-2 18 8 14 17 10 4 10 18 3 23-12-11-25-18-39-18-14 0-27 4-41 12Z" />,
  long: <path d="M36 66c0-29 17-45 44-45s44 17 44 46v51l-22-8V62c-8-8-15-18-18-28-8 17-23 27-48 32v52H16c15-17 20-34 20-52Z" />,
  spiky: <path d="m38 62 4-31 13 10 5-24 15 18 10-23 9 24 20-13-4 24 15 2-9 18c-15-15-29-22-43-20-12 1-24 6-35 15Z" />,
}

const glasses = {
  round: <g fill="none" stroke="#334155" strokeWidth="4"><circle cx="62" cy="74" r="12"/><circle cx="99" cy="74" r="12"/><path d="M74 74h13M48 71l-8-3M112 71l8-3"/></g>,
  square: <g fill="none" stroke="#334155" strokeWidth="4"><rect x="50" y="63" width="25" height="21" rx="5"/><rect x="87" y="63" width="25" height="21" rx="5"/><path d="M75 72h12M50 68l-10-3M112 68l9-3"/></g>,
}

export const DEFAULT_AVATAR = { theme: 'cartoon', team: 'vietnam', skin: '#F2B88D', hair: '#27364B', background: '#DBEAFE', outfit: '#2563EB', hairStyle: 'short', expression: 'smile', accessory: 'none' }

const teams = {
  vietnam: { primary: '#DA251D', secondary: '#FFEB3B', code: 'VN' },
  argentina: { primary: '#75AADB', secondary: '#FFFFFF', code: 'ARG' },
  brazil: { primary: '#F7D117', secondary: '#229E45', code: 'BRA' },
  france: { primary: '#153E7E', secondary: '#EF3340', code: 'FRA' },
  japan: { primary: '#FFFFFF', secondary: '#BC002D', code: 'JPN' },
}

export default function StudentAvatar({ avatar = DEFAULT_AVATAR, className = '', title = 'Avatar học sinh' }) {
  const value = { ...DEFAULT_AVATAR, ...avatar }
  const team = teams[value.team] || teams.vietnam
  const isAnime = value.theme === 'anime'
  const isWorldCup = value.theme === 'worldcup'
  return <svg viewBox="0 0 160 160" role="img" aria-label={title} className={className} xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="animeBg" x1="0" y1="0" x2="1" y2="1"><stop stopColor={value.background}/><stop offset="1" stopColor="#FBCFE8"/></linearGradient><pattern id="stripes" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="9" height="18" fill={team.primary}/><rect x="9" width="9" height="18" fill={team.secondary}/></pattern></defs>
    <rect width="160" height="160" rx="36" fill={isAnime ? 'url(#animeBg)' : value.background}/>
    {isAnime && <g fill="#fff" opacity=".7"><path d="m22 22 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/><path d="m137 42 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/></g>}
    {isWorldCup && <g opacity=".18" fill="#fff"><circle cx="25" cy="30" r="18"/><path d="m25 18 7 5-3 9h-8l-3-9Z" fill="#334155"/><circle cx="137" cy="51" r="24"/></g>}
    {!isAnime && !isWorldCup && <><circle cx="25" cy="28" r="11" fill="#fff" opacity=".35"/><circle cx="139" cy="48" r="7" fill="#fff" opacity=".3"/></>}
    <path d="M21 160c3-35 23-53 59-53s56 18 59 53H21Z" fill={isWorldCup ? 'url(#stripes)' : value.outfit}/><path d="M64 105h32v25l-16 12-16-12v-25Z" fill={value.skin}/><ellipse cx="80" cy="70" rx={isAnime ? 38 : 40} ry={isAnime ? 48 : 47} fill={value.skin}/>
    <g fill={value.hair}>{hairPaths[value.hairStyle] || hairPaths.short}</g>
    {isAnime ? <g><ellipse cx="63" cy="72" rx="7" ry="9" fill="#fff"/><ellipse cx="98" cy="72" rx="7" ry="9" fill="#fff"/><ellipse cx="63" cy="73" rx="4" ry="6" fill="#334155"/><ellipse cx="98" cy="73" rx="4" ry="6" fill="#334155"/><circle cx="61" cy="70" r="1.5" fill="#fff"/><circle cx="96" cy="70" r="1.5" fill="#fff"/><path d="M53 60c7-4 13-4 19 0M89 60c7-4 13-4 19 0" fill="none" stroke={value.hair} strokeWidth="3" strokeLinecap="round"/></g> : <g fill="#334155"><ellipse cx="64" cy="72" rx="3.5" ry="4.5"/><ellipse cx="97" cy="72" rx="3.5" ry="4.5"/></g>}
    {value.expression === 'smile' && <path d="M67 89c7 9 20 9 27 0" fill="none" stroke="#9F4F4F" strokeWidth="4" strokeLinecap="round"/>}{value.expression === 'happy' && <path d="M65 88c8 14 23 14 31 0Z" fill="#fff" stroke="#9F4F4F" strokeWidth="3"/>}{value.expression === 'calm' && <path d="M71 91h18" stroke="#9F4F4F" strokeWidth="4" strokeLinecap="round"/>}
    {glasses[value.accessory] || null}{value.accessory === 'headphones' && <g fill="none" stroke="#475569" strokeWidth="6"><path d="M46 72V61c0-22 15-36 34-36s34 14 34 36v11"/><rect x="39" y="67" width="13" height="25" rx="6" fill="#64748B"/><rect x="108" y="67" width="13" height="25" rx="6" fill="#64748B"/></g>}
    {isWorldCup ? <><path d="M67 118h26v42H67Z" fill={team.primary} opacity=".9"/><text x="80" y="148" textAnchor="middle" fill={team.secondary} fontSize="12" fontWeight="900">{team.code}</text><circle cx="109" cy="126" r="7" fill={team.secondary}/></> : <><path d="M55 126l25 18 25-18 9 34H46l9-34Z" fill="#fff" opacity=".92"/><path d="M75 143h10l3 17H72l3-17Z" fill={value.hair}/></>}
  </svg>
}
