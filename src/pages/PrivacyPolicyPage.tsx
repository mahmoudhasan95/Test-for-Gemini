import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

export function PrivacyPolicyPage() {
  const { lang, isRTL } = useLanguage();
  const lastUpdated = 'December 27, 2024';
  const lastUpdatedAr = '27 ديسمبر 2024';

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'lang-ar' : 'lang-en'}`}>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('privacyTitle', lang)}
          </h1>
          <p className="text-gray-600">
            {t('privacyLastUpdated', lang)}: {lang === 'en' ? lastUpdated : lastUpdatedAr}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Introduction' : 'مقدمة'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('privacyIntro', lang)}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Information We Collect' : 'المعلومات التي نجمعها'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {lang === 'en'
                ? 'We collect information that you provide directly to us, including:'
                : 'نجمع المعلومات التي تقدمها لنا مباشرة، بما في ذلك:'
              }
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                {lang === 'en'
                  ? 'Contact information (name, email address) when you submit a contact form'
                  : 'معلومات الاتصال (الاسم، عنوان البريد الإلكتروني) عند إرسال نموذج اتصال'
                }
              </li>
              <li>
                {lang === 'en'
                  ? 'Usage data and analytics to improve our services'
                  : 'بيانات الاستخدام والتحليلات لتحسين خدماتنا'
                }
              </li>
              <li>
                {lang === 'en'
                  ? 'Technical information such as browser type and IP address'
                  : 'المعلومات التقنية مثل نوع المتصفح وعنوان IP'
                }
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'How We Use Your Information' : 'كيف نستخدم معلوماتك'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {lang === 'en'
                ? 'We use the information we collect to:'
                : 'نستخدم المعلومات التي نجمعها من أجل:'
              }
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                {lang === 'en'
                  ? 'Respond to your inquiries and requests'
                  : 'الرد على استفساراتك وطلباتك'
                }
              </li>
              <li>
                {lang === 'en'
                  ? 'Improve and maintain our platform'
                  : 'تحسين وصيانة منصتنا'
                }
              </li>
              <li>
                {lang === 'en'
                  ? 'Send important updates about our services'
                  : 'إرسال تحديثات مهمة حول خدماتنا'
                }
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Data Security' : 'أمن البيانات'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lang === 'en'
                ? 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
                : 'نطبق التدابير التقنية والتنظيمية المناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو الإتلاف.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Your Rights' : 'حقوقك'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lang === 'en'
                ? 'You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us using the information provided on our contact page.'
                : 'لديك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها. لممارسة هذه الحقوق، يرجى الاتصال بنا باستخدام المعلومات المقدمة في صفحة الاتصال الخاصة بنا.'
              }
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {lang === 'en' ? 'Changes to This Policy' : 'التغييرات على هذه السياسة'}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lang === 'en'
                ? 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.'
                : 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات عن طريق نشر سياسة الخصوصية الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث".'
              }
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
