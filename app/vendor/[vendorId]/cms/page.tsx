'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, Loader2, Plus, Trash2, Globe, Languages, CheckCircle } from 'lucide-react';
import AxiosAPI from '@/lib/axios';

type PageType = 'home' | 'navbar' | 'footer' | 'about' | 'contact' | 'shopping';
type LangType = 'en' | 'es';

const PAGES: PageType[] = ['home', 'navbar', 'footer', 'about', 'contact', 'shopping'];

const PAGE_LABELS: Record<PageType, string> = {
  home: 'Home Page', navbar: 'Navbar', footer: 'Footer',
  about: 'About Us', contact: 'Contact', shopping: 'Promotions',
};

function Field({ label, value, onChange, textarea, mono }: any) {
  const cls = `w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 ${mono ? 'font-mono' : ''}`;
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
      {textarea
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} className={cls} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

export default function CmsManagementPage() {
  const [page, setPage] = useState<PageType>('home');
  const [lang, setLang] = useState<LangType>('en');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [data, setData] = useState<any>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await AxiosAPI.get(`/v1/cms/${page}?lang=${lang}`);
      const raw = res.data?.content;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
      setData(parsed);
    } catch { setData({}); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, lang]);

  const set = (key: string, val: any) => setData((d: any) => ({ ...d, [key]: val }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await AxiosAPI.post('/v1/cms', {
        page_content_type: page, language: lang,
        title: `${PAGE_LABELS[page]} (${lang.toUpperCase()})`,
        content: JSON.stringify(data), seo_meta: {},
      });
      localStorage.removeItem(`soundsphere_cms_${page}_${lang}`);
      setMsg({ text: 'Saved successfully!', ok: true });
    } catch { setMsg({ text: 'Save failed. Try again.', ok: false }); }
    finally { setSaving(false); }
  };

  const addItem = (key: string, template: any) =>
    setData((d: any) => ({ ...d, [key]: [...(d[key] || []), { id: Date.now(), ...template }] }));

  const removeItem = (key: string, id: any) =>
    setData((d: any) => ({ ...d, [key]: (d[key] || []).filter((i: any) => i.id !== id) }));

  const updateItem = (key: string, id: any, field: string, val: string) =>
    setData((d: any) => ({ ...d, [key]: (d[key] || []).map((i: any) => i.id === id ? { ...i, [field]: val } : i) }));

  return (
    <div className="flex-1 bg-gray-50 p-6 lg:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Storefront CMS Manager</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Manage all storefront content dynamically</p>
        </div>
        <button onClick={save} disabled={saving || loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tab + Lang selectors */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-8 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Page / Section</p>
          <div className="flex flex-wrap gap-1.5">
            {PAGES.map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ${page === p ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300'}`}>
                {PAGE_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Language</p>
          <div className="flex gap-1.5">
            {(['en', 'es'] as LangType[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ${lang === l ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {l === 'en' ? <><Globe size={12} /> English</> : <><Languages size={12} /> Español</>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 p-4 rounded-xl mb-6 border text-sm font-semibold ${msg.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          <CheckCircle size={18} /> {msg.text}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border p-20 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-purple-600" />
        </div>
      ) : (
        <form onSubmit={save} className="space-y-6">

          {/* HOME */}
          {page === 'home' && (
            <>
              <Section title="Hero Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Subtitle" value={data.hero_subtitle || ''} onChange={(v: string) => set('hero_subtitle', v)} />
                  <Field label="Button Text" value={data.hero_btn_text || ''} onChange={(v: string) => set('hero_btn_text', v)} />
                  <div className="md:col-span-2"><Field label="Title" value={data.hero_title || ''} onChange={(v: string) => set('hero_title', v)} /></div>
                  <div className="md:col-span-2"><Field label="Description" value={data.hero_desc || ''} onChange={(v: string) => set('hero_desc', v)} textarea /></div>
                  <div className="md:col-span-2"><Field label="Hero Image URL" value={data.hero_image_url || ''} onChange={(v: string) => set('hero_image_url', v)} mono /></div>
                </div>
              </Section>
              <Section title="Middle Promo Banner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Subtitle" value={data.middle_banner_subtitle || ''} onChange={(v: string) => set('middle_banner_subtitle', v)} />
                  <Field label="Button Text" value={data.middle_banner_btn_text || ''} onChange={(v: string) => set('middle_banner_btn_text', v)} />
                  <div className="md:col-span-2"><Field label="Title" value={data.middle_banner_title || ''} onChange={(v: string) => set('middle_banner_title', v)} /></div>
                  <div className="md:col-span-2"><Field label="Description" value={data.middle_banner_desc || ''} onChange={(v: string) => set('middle_banner_desc', v)} textarea /></div>
                  <div className="md:col-span-2"><Field label="Image URL" value={data.middle_banner_image_url || ''} onChange={(v: string) => set('middle_banner_image_url', v)} mono /></div>
                </div>
              </Section>
              <Section title="New Arrivals — Left Card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Subtitle" value={data.new_arrivals_left_subtitle || ''} onChange={(v: string) => set('new_arrivals_left_subtitle', v)} />
                  <Field label="Button Text" value={data.new_arrivals_left_btn_text || ''} onChange={(v: string) => set('new_arrivals_left_btn_text', v)} />
                  <div className="md:col-span-2"><Field label="Title" value={data.new_arrivals_left_title || ''} onChange={(v: string) => set('new_arrivals_left_title', v)} /></div>
                  <div className="md:col-span-2"><Field label="Description" value={data.new_arrivals_left_desc || ''} onChange={(v: string) => set('new_arrivals_left_desc', v)} /></div>
                  <div className="md:col-span-2"><Field label="Image URL" value={data.new_arrivals_left_image_url || ''} onChange={(v: string) => set('new_arrivals_left_image_url', v)} mono /></div>
                </div>
              </Section>
              <Section title="New Arrivals — Right Cards">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Top Card Title" value={data.new_arrivals_right_top_title || ''} onChange={(v: string) => set('new_arrivals_right_top_title', v)} />
                  <Field label="Top Card Image URL" value={data.new_arrivals_right_top_image_url || ''} onChange={(v: string) => set('new_arrivals_right_top_image_url', v)} mono />
                  <Field label="Bottom Card Title" value={data.new_arrivals_right_bottom_title || ''} onChange={(v: string) => set('new_arrivals_right_bottom_title', v)} />
                  <Field label="Bottom Card Image URL" value={data.new_arrivals_right_bottom_image_url || ''} onChange={(v: string) => set('new_arrivals_right_bottom_image_url', v)} mono />
                </div>
              </Section>
              <Section title="Newsletter Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Title" value={data.newsletter_title || ''} onChange={(v: string) => set('newsletter_title', v)} />
                  <Field label="Button Text" value={data.newsletter_btn_text || ''} onChange={(v: string) => set('newsletter_btn_text', v)} />
                  <div className="md:col-span-2"><Field label="Description" value={data.newsletter_desc || ''} onChange={(v: string) => set('newsletter_desc', v)} /></div>
                </div>
              </Section>
            </>
          )}

          {/* NAVBAR */}
          {page === 'navbar' && (
            <Section title="Navigation Links"
              action={<AddBtn onClick={() => addItem('links', { label: '', href: '' })} label="Add Link" />}>
              {(data.links || []).map((link: any) => (
                <div key={link.id} className="flex gap-3 items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Field label="Label" value={link.label} onChange={(v: string) => updateItem('links', link.id, 'label', v)} />
                    <Field label="URL Path" value={link.href} onChange={(v: string) => updateItem('links', link.id, 'href', v)} mono />
                  </div>
                  <button type="button" onClick={() => removeItem('links', link.id)} className="text-red-400 hover:text-red-600 p-2 mb-1"><Trash2 size={15} /></button>
                </div>
              ))}
              {!(data.links || []).length && <p className="text-center text-gray-400 text-sm py-8">No links yet. Click Add Link.</p>}
            </Section>
          )}

          {/* FOOTER */}
          {page === 'footer' && (
            <>
              <Section title="Copyright / Bottom Text">
                <Field label="Bottom Text" value={data.bottom_text || ''} onChange={(v: string) => set('bottom_text', v)} />
              </Section>
              <Section title="Footer Columns"
                action={<AddBtn onClick={() => addItem('content', { header: '', links: [] })} label="Add Column" />}>
                {(data.content || []).map((col: any, ci: number) => (
                  <div key={col.id || ci} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1">
                        <Field label="Column Header" value={col.header}
                          onChange={(v: string) => setData((d: any) => ({ ...d, content: d.content.map((c: any, i: number) => i === ci ? { ...c, header: v } : c) }))} />
                      </div>
                      <div className="flex gap-2 self-end mb-0.5">
                        <button type="button" onClick={() => setData((d: any) => ({ ...d, content: d.content.map((c: any, i: number) => i === ci ? { ...c, links: [...(c.links || []), { id: Date.now(), title: '', url: '' }] } : c) }))}
                          className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"><Plus size={12} /> Link</button>
                        <button type="button" onClick={() => setData((d: any) => ({ ...d, content: d.content.filter((_: any, i: number) => i !== ci) }))}
                          className="text-red-400 hover:text-red-600 p-1.5 border border-red-200 rounded-lg"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <div className="space-y-2 pl-3 border-l-2 border-purple-100">
                      {(col.links || []).map((lnk: any, li: number) => (
                        <div key={lnk.id || li} className="flex gap-3 items-end bg-white border border-gray-100 p-2.5 rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input placeholder="Label" value={lnk.title} onChange={e => setData((d: any) => ({ ...d, content: d.content.map((c: any, i: number) => i === ci ? { ...c, links: c.links.map((l: any, j: number) => j === li ? { ...l, title: e.target.value } : l) } : c) }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs" />
                            <input placeholder="/path" value={lnk.url} onChange={e => setData((d: any) => ({ ...d, content: d.content.map((c: any, i: number) => i === ci ? { ...c, links: c.links.map((l: any, j: number) => j === li ? { ...l, url: e.target.value } : l) } : c) }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono" />
                          </div>
                          <button type="button" onClick={() => setData((d: any) => ({ ...d, content: d.content.map((c: any, i: number) => i === ci ? { ...c, links: c.links.filter((_: any, j: number) => j !== li) } : c) }))}
                            className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Section>
            </>
          )}

          {/* ABOUT */}
          {page === 'about' && (
            <>
              <Section title="Hero Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Hero Title" value={data.heroTitle || ''} onChange={(v: string) => set('heroTitle', v)} />
                  <Field label="Hero Subtitle" value={data.heroDesc || ''} onChange={(v: string) => set('heroDesc', v)} />
                  <div className="md:col-span-2"><Field label="Hero Background Image URL" value={data.heroImg || ''} onChange={(v: string) => set('heroImg', v)} mono /></div>
                </div>
              </Section>
              <Section title="Thoughts & Founder">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Section Title" value={data.ownThoughtsTitle || ''} onChange={(v: string) => set('ownThoughtsTitle', v)} />
                  <Field label="Section Image URL" value={data.ownThoughtsImg || ''} onChange={(v: string) => set('ownThoughtsImg', v)} mono />
                  <div className="md:col-span-2"><Field label="Description" value={data.ownThoughtsDesc || ''} onChange={(v: string) => set('ownThoughtsDesc', v)} textarea /></div>
                  <Field label="Founder Name" value={data.founderName || ''} onChange={(v: string) => set('founderName', v)} />
                  <Field label="Founder Title / Role" value={data.founderTitle || ''} onChange={(v: string) => set('founderTitle', v)} />
                  <div className="md:col-span-2"><Field label="Founder Image URL" value={data.founderImg || ''} onChange={(v: string) => set('founderImg', v)} mono /></div>
                </div>
              </Section>
              <Section title="Core Values Banner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Section Title" value={data.coreValuesTitle || ''} onChange={(v: string) => set('coreValuesTitle', v)} />
                  <Field label="Background Image URL" value={data.coreValuesImg || ''} onChange={(v: string) => set('coreValuesImg', v)} mono />
                  <div className="md:col-span-2"><Field label="Description" value={data.coreValuesDesc || ''} onChange={(v: string) => set('coreValuesDesc', v)} /></div>
                </div>
              </Section>
              <Section title="Core Values List"
                action={<AddBtn onClick={() => addItem('coreValues', { title: '', tagline: '', description: '' })} label="Add Value" />}>
                {(data.coreValues || []).map((v: any) => (
                  <ListCard key={v.id} onRemove={() => removeItem('coreValues', v.id)}>
                    <Field label="Title" value={v.title} onChange={(val: string) => updateItem('coreValues', v.id, 'title', val)} />
                    <Field label="Tagline" value={v.tagline} onChange={(val: string) => updateItem('coreValues', v.id, 'tagline', val)} />
                    <div className="md:col-span-2"><Field label="Description" value={v.description} onChange={(val: string) => updateItem('coreValues', v.id, 'description', val)} /></div>
                  </ListCard>
                ))}
              </Section>
              <Section title="Mission Section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Mission Title" value={data.missionTitle || ''} onChange={(v: string) => set('missionTitle', v)} />
                  <Field label="Mission Image URL" value={data.missionImg || ''} onChange={(v: string) => set('missionImg', v)} mono />
                  <div className="md:col-span-2"><Field label="Mission Statement" value={data.missionDesc || ''} onChange={(v: string) => set('missionDesc', v)} textarea /></div>
                </div>
              </Section>
              <Section title="Mission Deliverables"
                action={<AddBtn onClick={() => addItem('missionToDeliver', { title: '', tagline: '', description: '' })} label="Add Card" />}>
                {(data.missionToDeliver || []).map((m: any) => (
                  <ListCard key={m.id} onRemove={() => removeItem('missionToDeliver', m.id)}>
                    <Field label="Title" value={m.title} onChange={(val: string) => updateItem('missionToDeliver', m.id, 'title', val)} />
                    <Field label="Tagline" value={m.tagline} onChange={(val: string) => updateItem('missionToDeliver', m.id, 'tagline', val)} />
                    <div className="md:col-span-2"><Field label="Description" value={m.description} onChange={(val: string) => updateItem('missionToDeliver', m.id, 'description', val)} /></div>
                  </ListCard>
                ))}
              </Section>
            </>
          )}

          {/* CONTACT */}
          {page === 'contact' && (
            <>
              <Section title="Hero Block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Hero Title" value={data.hero?.heroTitle || ''} onChange={(v: string) => set('hero', { ...data.hero, heroTitle: v })} />
                  <Field label="Hero Subtitle" value={data.hero?.heroDesc || ''} onChange={(v: string) => set('hero', { ...data.hero, heroDesc: v })} />
                  <div className="md:col-span-2"><Field label="Background Image URL" value={data.hero?.heroImg || ''} onChange={(v: string) => set('hero', { ...data.hero, heroImg: v })} mono /></div>
                </div>
              </Section>
              <Section title="Contact Methods"
                action={<AddBtn onClick={() => addItem('list', { type: 'phone', title: '', description: '', icon: 'phone' })} label="Add Method" />}>
                {(data.list || []).map((c: any) => (
                  <ListCard key={c.id} onRemove={() => removeItem('list', c.id)}>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5">Type</label>
                      <select value={c.type} onChange={e => updateItem('list', c.id, 'type', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="address">Address</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <Field label="Title" value={c.title} onChange={(v: string) => updateItem('list', c.id, 'title', v)} />
                    <Field label="Icon (Lucide name)" value={c.icon} onChange={(v: string) => updateItem('list', c.id, 'icon', v)} mono />
                    <Field label="Details / Value" value={c.description} onChange={(v: string) => updateItem('list', c.id, 'description', v)} />
                  </ListCard>
                ))}
              </Section>
            </>
          )}

          {/* SHOPPING */}
          {page === 'shopping' && (
            <Section title="Shopping Page Promotional Banner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Banner Title" value={data.promo_banner_title || ''} onChange={(v: string) => set('promo_banner_title', v)} />
                <Field label="Banner Action Link (URL)" value={data.promo_banner_link || ''} onChange={(v: string) => set('promo_banner_link', v)} mono />
                <div className="md:col-span-2"><Field label="Banner Description" value={data.promo_banner_desc || ''} onChange={(v: string) => set('promo_banner_desc', v)} textarea /></div>
                <div className="md:col-span-2"><Field label="Background Image URL" value={data.promo_banner_image_url || ''} onChange={(v: string) => set('promo_banner_image_url', v)} mono /></div>
              </div>
            </Section>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <button type="button" onClick={load}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-xl transition-all">
              Reset
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase rounded-xl shadow-md disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 text-xs font-bold rounded-lg border border-purple-200">
      <Plus size={12} /> {label}
    </button>
  );
}

function ListCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative">
      <button type="button" onClick={onRemove}
        className="absolute right-3 top-3 text-red-400 hover:text-red-600 p-1">
        <Trash2 size={14} />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">{children}</div>
    </div>
  );
}
