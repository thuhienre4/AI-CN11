import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store'
import StudentAvatar, { DEFAULT_AVATAR } from '../components/StudentAvatar'

const colors = { skin: ['#F8D0B0','#F2B88D','#D99568','#A96545','#70422F'], hair: ['#1F2937','#4A2C21','#8B5E3C','#D39B43','#2563EB'], background: ['#DBEAFE','#CFFAFE','#D1FAE5','#FEF3C7','#FCE7F3','#EDE9FE'], outfit: ['#2563EB','#0891B2','#059669','#EA580C','#7C3AED','#E11D48'] }
const pick = list => list[Math.floor(Math.random() * list.length)]
const randomAvatar = () => ({ theme: pick(['cartoon','anime','worldcup']), team: pick(['vietnam','argentina','brazil','france','japan']), skin: pick(colors.skin), hair: pick(colors.hair), background: pick(colors.background), outfit: pick(colors.outfit), hairStyle: pick(['short','side','curly','long','spiky']), expression: pick(['smile','happy','calm']), accessory: pick(['none','round','square','headphones']) })

function ColorPicker({ label, name, value, onChange }) {
  return <fieldset><legend className="mb-3 text-sm font-black text-slate-700">{label}</legend><div className="flex flex-wrap gap-2">{colors[name].map(color => <button key={color} type="button" aria-label={`${label} ${color}`} onClick={() => onChange(name, color)} className={`h-10 w-10 rounded-full border-4 shadow-sm transition hover:scale-110 ${value === color ? 'border-blue-600 ring-2 ring-blue-200' : 'border-white'}`} style={{ backgroundColor: color }}/>)}</div></fieldset>
}
function OptionPicker({ label, name, value, options, onChange }) {
  return <fieldset><legend className="mb-3 text-sm font-black text-slate-700">{label}</legend><div className="flex flex-wrap gap-2">{options.map(([key, text]) => <button key={key} type="button" onClick={() => onChange(name, key)} className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${value === key ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}>{text}</button>)}</div></fieldset>
}

export default function AvatarStudio() {
  const { user, updateAvatar } = useAuthStore()
  const initial = useMemo(() => ({ ...DEFAULT_AVATAR, ...(user?.avatar || {}) }), [user?.username])
  const [avatar, setAvatar] = useState(initial)
  const change = (name, value) => setAvatar(current => ({ ...current, [name]: value }))
  const save = () => { updateAvatar(avatar); toast.success('Đã lưu avatar của bạn!') }
  const download = () => {
    const svg = document.querySelector('#avatar-preview svg'); if (!svg) return
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }))
    const link = document.createElement('a'); link.href = url; link.download = `avatar-${user?.username || 'hoc-sinh'}.svg`; link.click(); URL.revokeObjectURL(url)
  }
  return <main className="page-container">
    <div className="mb-7"><p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">Góc sáng tạo</p><h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Xưởng tạo avatar</h1><p className="mt-2 max-w-2xl text-slate-600">Tạo một nhân vật mang phong cách của riêng bạn. Avatar chỉ được lưu trên tài khoản trong thiết bị này.</p></div>
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-xl lg:sticky lg:top-32 lg:self-start">
        <div id="avatar-preview" className="mx-auto max-w-[280px] overflow-hidden rounded-[38px] shadow-2xl ring-8 ring-white"><StudentAvatar avatar={avatar} className="block w-full" title={`Avatar của ${user?.full_name || 'học sinh'}`}/></div>
        <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => setAvatar(randomAvatar())} className="secondary-button">Ngẫu nhiên</button><button type="button" onClick={save} className="primary-button">Lưu avatar</button></div>
        <button type="button" onClick={download} className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-black text-blue-700 hover:bg-blue-50">Tải ảnh SVG</button>
      </section>
      <section className="space-y-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <OptionPicker label="Phong cách avatar" name="theme" value={avatar.theme} onChange={change} options={[["cartoon","🎨 Hoạt hình"],["anime","✨ Anime"],["worldcup","⚽ World Cup"]]}/>
        {avatar.theme === 'worldcup' && (
          <OptionPicker label="Đội tuyển yêu thích" name="team" value={avatar.team} onChange={change} options={[["vietnam","🇻🇳 Việt Nam"],["argentina","🇦🇷 Argentina"],["brazil","🇧🇷 Brazil"],["france","🇫🇷 Pháp"],["japan","🇯🇵 Nhật Bản"]]}/>
        )}
        <OptionPicker label="Kiểu tóc" name="hairStyle" value={avatar.hairStyle} onChange={change} options={[["short","Tóc ngắn"],["side","Mái lệch"],["curly","Tóc xoăn"],["long","Tóc dài"],["spiky","Cá tính"]]}/>
        <ColorPicker label="Màu tóc" name="hair" value={avatar.hair} onChange={change}/><ColorPicker label="Màu da" name="skin" value={avatar.skin} onChange={change}/>
        <OptionPicker label="Biểu cảm" name="expression" value={avatar.expression} onChange={change} options={[["smile","Mỉm cười"],["happy","Vui vẻ"],["calm","Điềm tĩnh"]]}/>
        <OptionPicker label="Phụ kiện" name="accessory" value={avatar.accessory} onChange={change} options={[["none","Không có"],["round","Kính tròn"],["square","Kính vuông"],["headphones","Tai nghe"]]}/>
        <ColorPicker label="Trang phục" name="outfit" value={avatar.outfit} onChange={change}/><ColorPicker label="Phông nền" name="background" value={avatar.background} onChange={change}/>
      </section>
    </div>
  </main>
}
