import React from 'react';

interface PageTranslation {
  title: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

interface PageDetail {
  id: string;
  slug: string;
  isActive: boolean;
  translations: PageTranslation[];
}

async function getPageBySlug(slug: string, locale: string): Promise<PageDetail> {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/cms/pages/${slug}?lang=${locale}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data;
  } catch {
    // Fallback static page details
    const titles: Record<string, string> = {
      'about': 'من نحن — قصة نوفا وود',
      'faq': 'الأسئلة الشائعة',
      'privacy': 'سياسة الخصوصية',
      'terms': 'الشروط والأحكام',
    };
    const contents: Record<string, string> = {
      'about': 'تأسست نوفا وود بهدف تقديم أفضل قطع الأثاث الخشبي اليدوي في مصر. نجمع في تصميماتنا بين الأصالة والكلاسيكية لتناسب مساحة منزلك ومكتبك بتفاصيل فاخرة.',
      'faq': 'س: هل يتوفر تفصيل بمقاسات خاصة؟ ج: نعم، يمكنك التواصل معنا عبر واتساب لطلب تفصيل أي قطعة بمقاسات ونوع خشب مخصص.',
      'privacy': 'نحن نلتزم بحماية بياناتك الشخصية وسريتها بالكامل عند إتمام عمليات الشراء والتصفح على موقعنا الإلكتروني.',
      'terms': 'جميع منتجاتنا تتمتع بضمان لمدة 5 سنوات ضد عيوب الصناعة. يتم التوصيل والتركيب بأيدي فنيين متخصصين.',
    };

    return {
      id: 'page1',
      slug,
      isActive: true,
      translations: [
        {
          title: titles[slug] || 'صفحة محتوى',
          content: contents[slug] || 'المحتوى غير متوفر حالياً باللغة المطلوبة.',
        }
      ]
    };
  }
}

export default async function CMSPage({
  params,
}: {
  params: { slug: string };
}) {
  const locale = 'ar';
  const page = await getPageBySlug(params.slug, locale);
  const tInfo = page.translations[0] || { title: 'Nova Wood', content: '' };

  return (
    <div className="container cms-page" style={{ padding: '64px 24px', maxWidth: '800px' }}>
      <h1 className="section-title" style={{ fontSize: '36px', fontWeight: '800', marginBottom: '32px', textAlign: 'center', color: 'var(--primary-color)' }}>
        {tInfo.title}
      </h1>
      <article
        className="cms-content text-muted"
        style={{ fontSize: '18px', lineHeight: '2', whiteSpace: 'pre-line', textAlign: 'justify' }}
      >
        {tInfo.content}
      </article>
    </div>
  );
}
