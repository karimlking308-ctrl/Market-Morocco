import React, { useState } from 'react';
import { Send, AlertTriangle, ShieldCheck, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../db/translations';
import { Complaint, UserProfile } from '../types';

interface ComplaintsViewProps {
  language: 'ar' | 'fr';
  complaints: Complaint[];
  currentUser: UserProfile;
  onAddComplaint: (subject: string, message: string) => void;
}

export default function ComplaintsView({
  language,
  complaints,
  currentUser,
  onAddComplaint
}: ComplaintsViewProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [subject, setSubject] = useState('');
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const myComplaints = complaints.filter(c => c.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !msg) return;
    onAddComplaint(subject, msg);
    setSubject('');
    setMsg('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="complaints-view-container">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-morocco-red animate-pulse" />
        {t.fileComplaint}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form filing ticket - left 5 columns */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-2 flex items-center gap-1.5">
            <HelpCircle className="h-4.5 w-4.5 text-morocco-red" />
            {t.fileComplaint}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{language === 'ar' ? 'موضوع التبليغ أو المشكلة' : 'Sujet du litige'}</label>
              <input
                type="text"
                required
                placeholder="مثال: تبليغ عن منتج مقلد أو تأخر الطلبية"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-morocco-red"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{language === 'ar' ? 'تفاصيل الشكوى' : 'Description détaillée'}</label>
              <textarea
                required
                rows={4}
                placeholder="اكتب بالتفصيل المشكلة أو رقم الطلب أو اسم السلعة لنراجعها فوراً..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-morocco-red hover:bg-morocco-red/95 text-white font-black text-xs transition shadow flex items-center justify-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{t.submitComplaint}</span>
            </button>
          </form>

          {success && (
            <div className="p-3.5 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-bold text-center animate-bounce">
              🎉 تم إرسال بلاغكم بنجاح وسنرد عليكم خلال 24 ساعة!
            </div>
          )}
        </div>

        {/* List of my past complaints tickets - right 7 columns */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-gray-150 dark:border-gray-800 pb-2">
            <FileText className="h-4.5 w-4.5 text-morocco-green" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              {language === 'ar' ? 'بلاغاتي المرفوعة سابقاً' : 'Historique de mes plaintes'} ({myComplaints.length})
            </h3>
          </div>

          {myComplaints.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-850">
              <ShieldCheck className="h-10 w-10 text-morocco-green mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-bold">{language === 'ar' ? 'أنت لم تقم برفع أي شكوى سابقاً. حسابك سليم وآمن!' : 'Aucun litige soumis. Votre profil est en sécurité !'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myComplaints.map((c) => (
                <div key={c.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-[10px] font-mono text-gray-400 font-bold">Ticket: {c.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{c.subject}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{c.message}</p>
                  </div>

                  {c.reply && (
                    <div className="p-3 bg-gray-50 dark:bg-slate-850 rounded-xl text-xs space-y-1 border border-gray-150/50">
                      <span className="font-extrabold text-morocco-green block">✅ رد مراجع المنصة:</span>
                      <p className="text-slate-600 dark:text-gray-300 font-medium leading-relaxed">{c.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
