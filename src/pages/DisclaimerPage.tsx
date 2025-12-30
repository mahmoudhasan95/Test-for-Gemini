import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

export function DisclaimerPage() {
  const { lang, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'lang-ar' : 'lang-en'}`}>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('disclaimerTitle', lang)}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'General Information' : 'معلومات عامة'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('disclaimerIntro', lang)}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Content Accuracy' : 'دقة المحتوى'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lang === 'en'
                ? 'While we strive to ensure the accuracy and authenticity of all audio recordings and associated metadata in our archive, we cannot guarantee the completeness or accuracy of all information. Users should independently verify any information before relying on it for research or other purposes.'
                : 'بينما نسعى جاهدين لضمان دقة وصحة جميع التسجيلات الصوتية والبيانات الوصفية المرتبطة بها في أرشيفنا، لا يمكننا ضمان اكتمال أو دقة جميع المعلومات. يجب على المستخدمين التحقق من أي معلومات بشكل مستقل قبل الاعتماد عليها في البحث أو لأغراض أخرى.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Copyright and Licensing' : 'حقوق النشر والترخيص'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lang === 'en'
                ? 'All audio recordings in our archive are clearly marked with their respective licensing information. Users are responsible for complying with the terms of each license. Unauthorized use of copyrighted materials may result in legal consequences.'
                : 'جميع التسجيلات الصوتية في أرشيفنا مُعلّمة بوضوح بمعلومات الترخيص الخاصة بها. المستخدمون مسؤولون عن الامتثال لشروط كل ترخيص. قد يؤدي الاستخدام غير المصرح به للمواد المحمية بحقوق النشر إلى عواقب قانونية.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Cultural Sensitivity' : 'الحساسية الثقافية'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lang === 'en'
                ? 'Some recordings in our archive may contain culturally sensitive content or material that reflects historical attitudes and practices. We preserve these recordings for their anthropological and historical value. The inclusion of such material does not imply endorsement of any particular views or practices.'
                : 'قد تحتوي بعض التسجيلات في أرشيفنا على محتوى حساس ثقافيًا أو مواد تعكس مواقف وممارسات تاريخية. نحافظ على هذه التسجيلات لقيمتها الأنثروبولوجية والتاريخية. لا يعني تضمين هذه المواد تأييدًا لأي آراء أو ممارسات معينة.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'External Links' : 'الروابط الخارجية'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lang === 'en'
                ? 'Our platform may contain links to external websites. We are not responsible for the content, accuracy, or practices of these external sites. The inclusion of any links does not imply endorsement.'
                : 'قد تحتوي منصتنا على روابط لمواقع ويب خارجية. نحن لسنا مسؤولين عن محتوى أو دقة أو ممارسات هذه المواقع الخارجية. لا يعني تضمين أي روابط التأييد.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Limitation of Liability' : 'حدود المسؤولية'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lang === 'en'
                ? 'Masmaa and its operators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the platform or reliance on any content provided herein.'
                : 'لن يكون مَسْمَع ومشغلوه مسؤولين عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو تبعية أو عقابية ناشئة عن استخدامك للمنصة أو الاعتماد على أي محتوى مقدم هنا.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Changes to This Disclaimer' : 'التغييرات على هذا الإخلاء'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lang === 'en'
                ? 'We reserve the right to modify this disclaimer at any time. Any changes will be effective immediately upon posting to this page.'
                : 'نحتفظ بالحق في تعديل هذا الإخلاء في أي وقت. ستكون أي تغييرات سارية فور نشرها على هذه الصفحة.'
              }
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
