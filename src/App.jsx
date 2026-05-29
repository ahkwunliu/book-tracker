import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const STATUS_COLOR = {
  "想读": { bg: "#EEEDFE", color: "#534AB7" },
  "在读": { bg: "#E1F5EE", color: "#0F6E56" },
  "读完": { bg: "#EAF3DE", color: "#3B6D11" },
}

const s = {
  wrap: { maxWidth: 600, margin: '0 auto', minHeight: '100vh', background: '#fff' },
  header: { padding: '16px 20px 0', borderBottom: '1px solid #eee' },
  logo: { fontSize: 18, fontWeight: 600, color: '#3B6D11', marginBottom: 12 },
  tabs: { display: 'flex' },
  tab: (a) => ({ padding: '8px 16px', fontSize: 14, border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: a ? '2px solid #3B6D11' : '2px solid transparent', color: a ? '#3B6D11' : '#888', fontWeight: a ? 500 : 400 }),
  page: { padding: 20 },
  card: { background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '12px 14px', marginBottom: 10 },
  row: { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' },
  input: { flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 7, fontSize: 13, outline: 'none' },
  btn: (color) => ({ padding: '8px 16px', background: color || '#3B6D11', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, cursor: 'pointer' }),
  btnOutline: { padding: '8px 16px', background: 'transparent', color: '#3B6D11', border: '1px solid #3B6D11', borderRadius: 7, fontSize: 13, cursor: 'pointer' },
  badge: (st) => ({ display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 5, background: STATUS_COLOR[st]?.bg || '#f0f0f0', color: STATUS_COLOR[st]?.color || '#666' }),
  label: { fontSize: 13, fontWeight: 500, color: '#555', margin: '16px 0 8px', display: 'block' },
  textarea: { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 7, fontSize: 13, resize: 'vertical', minHeight: 80, outline: 'none' },
  select: { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 7, fontSize: 13, background: '#fff' },
  del: { border: 'none', background: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16, padding: '0 4px' },
  metric: { textAlign: 'center', flex: 1 },
  metricVal: { fontSize: 26, fontWeight: 600, color: '#3B6D11' },
  metricLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  empty: { color: '#bbb', fontSize: 13, textAlign: 'center', padding: '30px 0' },
  authWrap: { maxWidth: 360, margin: '80px auto', padding: 24, background: '#fff', borderRadius: 12, border: '1px solid #eee' },
  authTitle: { fontSize: 22, fontWeight: 600, color: '#3B6D11', textAlign: 'center', marginBottom: 24 },
  authInput: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 12, outline: 'none' },
  authBtn: { width: '100%', padding: 12, background: '#3B6D11', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', marginBottom: 8 },
  authSwitch: { textAlign: 'center', fontSize: 13, color: '#888', marginTop: 8 },
  authLink: { color: '#3B6D11', cursor: 'pointer', textDecoration: 'underline' },
  error: { color: '#c0392b', fontSize: 13, marginBottom: 10, textAlign: 'center' },
}

// ── Auth ──────────────────────────────────────────────
function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setErr(''); setLoading(true)
    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setErr(error.message)
      else onLogin(data.user)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setErr(error.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, username })
        onLogin(data.user)
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#f7f6f2', minHeight: '100vh' }}>
      <div style={s.authWrap}>
        <div style={s.authTitle}>📚 书巢</div>
        {err && <div style={s.error}>{err}</div>}
        {mode === 'register' && (
          <input style={s.authInput} placeholder="用户名" value={username} onChange={e => setUsername(e.target.value)} />
        )}
        <input style={s.authInput} placeholder="邮箱" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={s.authInput} placeholder="密码" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={s.authBtn} onClick={handle} disabled={loading}>
          {loading ? '请稍候…' : mode === 'login' ? '登录' : '注册'}
        </button>
        <div style={s.authSwitch}>
          {mode === 'login' ? <>还没有账号？<span style={s.authLink} onClick={() => setMode('register')}>注册</span></> : <>已有账号？<span style={s.authLink} onClick={() => setMode('login')}>登录</span></>}
        </div>
      </div>
    </div>
  )
}

// ── Shelf ─────────────────────────────────────────────
function Shelf({ userId }) {
  const [books, setBooks] = useState([])
  const [form, setForm] = useState({ title: '', author: '', status: '想读' })

  useEffect(() => {
    supabase.from('books').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then(({ data }) => data && setBooks(data))
  }, [userId])

  const add = async () => {
    if (!form.title.trim()) return
    const { data } = await supabase.from('books').insert({ ...form, user_id: userId }).select().single()
    if (data) setBooks([data, ...books])
    setForm({ title: '', author: '', status: '想读' })
  }

  const del = async (id) => {
    await supabase.from('books').delete().eq('id', id)
    setBooks(books.filter(b => b.id !== id))
  }

  const changeStatus = async (id, status) => {
    await supabase.from('books').update({ status }).eq('id', id)
    setBooks(books.map(b => b.id === id ? { ...b, status } : b))
  }

  return (
    <div style={s.page}>
      <span style={s.label}>添加书籍</span>
      <div style={s.card}>
        <div style={s.row}>
          <input style={s.input} placeholder="书名" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input style={{ ...s.input, flex: '0 0 90px' }} placeholder="作者" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
        </div>
        <div style={s.row}>
          <select style={s.select} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['想读', '在读', '读完'].map(v => <option key={v}>{v}</option>)}
          </select>
          <button style={s.btn()} onClick={add}>添加</button>
        </div>
      </div>

      <span style={s.label}>我的书架（{books.length} 本）</span>
      {books.length === 0 && <div style={s.empty}>书架空空如也，快去添加吧</div>}
      {books.map(b => (
        <div key={b.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{b.title}</div>
            {b.author && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{b.author}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <select style={{ ...s.select, fontSize: 11, padding: '3px 6px' }} value={b.status} onChange={e => changeStatus(b.id, e.target.value)}>
              {['想读', '在读', '读完'].map(v => <option key={v}>{v}</option>)}
            </select>
            <button style={s.del} onClick={() => del(b.id)}>×</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Notes ─────────────────────────────────────────────
function Notes({ userId }) {
  const [notes, setNotes] = useState([])
  const [form, setForm] = useState({ book_title: '', content: '', is_public: false })

  useEffect(() => {
    supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then(({ data }) => data && setNotes(data))
  }, [userId])

  const add = async () => {
    if (!form.content.trim()) return
    const { data } = await supabase.from('notes').insert({ ...form, user_id: userId }).select().single()
    if (data) setNotes([data, ...notes])
    setForm({ book_title: '', content: '', is_public: false })
  }

  const del = async (id) => {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(notes.filter(n => n.id !== id))
  }

  return (
    <div style={s.page}>
      <span style={s.label}>写笔记</span>
      <div style={s.card}>
        <div style={{ marginBottom: 8 }}>
          <input style={{ ...s.input, width: '100%' }} placeholder="书名（选填）" value={form.book_title} onChange={e => setForm({ ...form, book_title: e.target.value })} />
        </div>
        <textarea style={s.textarea} placeholder="写下你的读书感想…" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <label style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} />
            公开到探索页
          </label>
          <button style={s.btn()} onClick={add}>保存</button>
        </div>
      </div>

      <span style={s.label}>我的笔记（{notes.length} 条）</span>
      {notes.length === 0 && <div style={s.empty}>还没有笔记</div>}
      {notes.map(n => (
        <div key={n.id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {n.book_title && <div style={{ fontSize: 12, color: '#185FA5', marginBottom: 5 }}>《{n.book_title}》</div>}
              <div style={{ fontSize: 13, color: '#444', lineHeight: 1.7 }}>{n.content}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11, color: '#bbb' }}>
                <span>{new Date(n.created_at).toLocaleDateString('zh-CN')}</span>
                {n.is_public && <span style={{ color: '#3B6D11' }}>● 已公开</span>}
              </div>
            </div>
            <button style={s.del} onClick={() => del(n.id)}>×</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Checkin ───────────────────────────────────────────
function Checkin({ userId }) {
  const [checkins, setCheckins] = useState([])
  const [form, setForm] = useState({ book_title: '', pages: '' })

  useEffect(() => {
    supabase.from('checkins').select('*').eq('user_id', userId).order('created_at', { ascending: false }).then(({ data }) => data && setCheckins(data))
  }, [userId])

  const add = async () => {
    if (!form.pages) return
    const { data } = await supabase.from('checkins').insert({ ...form, pages: Number(form.pages), user_id: userId }).select().single()
    if (data) setCheckins([data, ...checkins])
    setForm({ book_title: '', pages: '' })
  }

  const del = async (id) => {
    await supabase.from('checkins').delete().eq('id', id)
    setCheckins(checkins.filter(c => c.id !== id))
  }

  const totalPages = checkins.reduce((s, c) => s + c.pages, 0)

  return (
    <div style={s.page}>
      <div style={{ ...s.card, display: 'flex', marginBottom: 20 }}>
        <div style={s.metric}><div style={s.metricVal}>{checkins.length}</div><div style={s.metricLabel}>累计打卡天数</div></div>
        <div style={{ width: 1, background: '#eee' }} />
        <div style={s.metric}><div style={s.metricVal}>{totalPages}</div><div style={s.metricLabel}>累计阅读页数</div></div>
      </div>

      <span style={s.label}>今日打卡</span>
      <div style={s.card}>
        <div style={s.row}>
          <input style={s.input} placeholder="读的书（选填）" value={form.book_title} onChange={e => setForm({ ...form, book_title: e.target.value })} />
          <input style={{ ...s.input, flex: '0 0 80px' }} type="number" placeholder="页数" min="1" value={form.pages} onChange={e => setForm({ ...form, pages: e.target.value })} />
          <button style={s.btn()} onClick={add}>打卡</button>
        </div>
      </div>

      <span style={s.label}>打卡记录</span>
      {checkins.length === 0 && <div style={s.empty}>还没有打卡记录</div>}
      {checkins.map(c => (
        <div key={c.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13 }}>{c.book_title || '阅读'} · <span style={{ color: '#3B6D11', fontWeight: 500 }}>{c.pages} 页</span></div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{new Date(c.created_at).toLocaleDateString('zh-CN')}</div>
          </div>
          <button style={s.del} onClick={() => del(c.id)}>×</button>
        </div>
      ))}
    </div>
  )
}

// ── Explore ───────────────────────────────────────────
function Explore() {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    supabase.from('notes').select('*, profiles(username)').eq('is_public', true).order('created_at', { ascending: false }).limit(30).then(({ data }) => data && setNotes(data))
  }, [])

  return (
    <div style={s.page}>
      <span style={s.label}>大家的公开笔记</span>
      {notes.length === 0 && <div style={s.empty}>还没有公开笔记，成为第一个分享的人吧</div>}
      {notes.map(n => (
        <div key={n.id} style={s.card}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#0F6E56' }}>
              {(n.profiles?.username || '匿')[0]}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{n.profiles?.username || '匿名'}</span>
            <span style={{ fontSize: 11, color: '#bbb', marginLeft: 'auto' }}>{new Date(n.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
          {n.book_title && <div style={{ fontSize: 12, color: '#185FA5', marginBottom: 5 }}>《{n.book_title}》</div>}
          <div style={{ fontSize: 13, color: '#444', lineHeight: 1.7 }}>{n.content}</div>
        </div>
      ))}
    </div>
  )
}

// ── App ───────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('书架')
  const TABS = ['书架', '笔记', '打卡', '探索']

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && setUser(data.session.user))
    supabase.auth.onAuthStateChange((_, session) => setUser(session?.user || null))
  }, [])

  const logout = async () => { await supabase.auth.signOut(); setUser(null) }

  if (!user) return <Auth onLogin={setUser} />

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={s.logo}>📚 书巢</div>
          <button style={{ ...s.btnOutline, padding: '5px 12px', fontSize: 12 }} onClick={logout}>退出</button>
        </div>
        <div style={s.tabs}>
          {TABS.map(t => <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>)}
        </div>
      </div>
      {tab === '书架' && <Shelf userId={user.id} />}
      {tab === '笔记' && <Notes userId={user.id} />}
      {tab === '打卡' && <Checkin userId={user.id} />}
      {tab === '探索' && <Explore />}
    </div>
  )
}
