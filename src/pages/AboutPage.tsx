import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

export function AboutPage() {
  const { lang, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'lang-ar' : 'lang-en'}`}>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('aboutTitle', lang)}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {lang === 'en'
              ? 'Preserving the sonic heritage of communities around the world'
              : 'الحفاظ على التراث الصوتي للمجتمعات حول العالم'
            }
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <section className="bg-white border border-gray-200">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-200">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <div className="space-y-6">
                  <div className="w-48 h-48 mx-auto mb-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent opacity-50 rounded-full"></div>
                    <img
                      src="https://pub-3e08516451404e48a1ea337744a2f45c.r2.dev/blog/authors/1767010436377-img_9300.png"
                      alt={lang === 'en' ? 'Mahmoud Hasan' : 'محمود حسن'}
                      className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                    />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className={`text-2xl font-light tracking-wide ${isRTL ? 'font-arabic' : ''}`}>
                      {lang === 'en' ? 'Mahmoud Hasan' : 'محمود حسن'}
                    </h3>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px w-8 bg-gray-300"></div>
                      <p className={`text-sm text-gray-600 uppercase tracking-wider ${isRTL ? 'font-arabic normal-case' : ''}`}>
                        {lang === 'en' ? 'Founder & Project Initiator' : 'مُبادِر ومؤسّس المشروع'}
                      </p>
                      <div className="h-px w-8 bg-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative p-12 flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <div className="space-y-6">
                  <div className="w-48 h-48 mx-auto mb-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent opacity-50 rounded-full"></div>
                    <img
                      src="https://pub-3e08516451404e48a1ea337744a2f45c.r2.dev/blog/authors/1767010438342-img_9304.png"
                      alt={lang === 'en' ? 'Iman Badawi' : 'إيمان بديوي'}
                      className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                    />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className={`text-2xl font-light tracking-wide ${isRTL ? 'font-arabic' : ''}`}>
                      {lang === 'en' ? 'Iman Badawi' : 'إيمان بديوي'}
                    </h3>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px w-8 bg-gray-300"></div>
                      <p className={`text-sm text-gray-600 uppercase tracking-wider ${isRTL ? 'font-arabic normal-case' : ''}`}>
                        {lang === 'en' ? 'Co-Founder' : 'شريكة مؤسِّسة'}
                      </p>
                      <div className="h-px w-8 bg-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-24 bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
              <div className="flex gap-1">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-gray-300 opacity-30"
                    style={{ height: `${Math.sin(i * 0.5) * 16 + 24}px` }}
                  ></div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('aboutMission', lang)}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('aboutMissionText', lang)}
            </p>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('aboutVision', lang)}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('aboutVisionText', lang)}
            </p>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'What We Do' : 'ما نقوم به'}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {lang === 'en' ? 'Collecting & Preserving' : 'الجمع والحفظ'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {lang === 'en'
                    ? 'We work with communities to document and preserve their unique soundscapes, from traditional music to everyday sounds that tell important cultural stories.'
                    : 'نعمل مع المجتمعات لتوثيق وحفظ مناظرها الصوتية الفريدة، من الموسيقى التقليدية إلى الأصوات اليومية التي تروي قصصًا ثقافية مهمة.'
                  }
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {lang === 'en' ? 'Sharing & Education' : 'المشاركة والتعليم'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {lang === 'en'
                    ? 'Our digital archive makes these sounds accessible to researchers, educators, and anyone interested in exploring the world through an auditory lens.'
                    : 'يجعل أرشيفنا الرقمي هذه الأصوات متاحة للباحثين والمعلمين وأي شخص مهتم باستكشاف العالم من خلال عدسة سمعية.'
                  }
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {lang === 'en' ? 'Research & Analysis' : 'البحث والتحليل'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {lang === 'en'
                    ? 'We support anthropological research that uses sound as a primary source for understanding human culture, history, and social dynamics.'
                    : 'ندعم البحوث الأنثروبولوجية التي تستخدم الصوت كمصدر أساسي لفهم الثقافة الإنسانية والتاريخ والديناميكيات الاجتماعية.'
                  }
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
