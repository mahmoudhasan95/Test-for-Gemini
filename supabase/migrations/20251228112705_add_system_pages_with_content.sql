/*
  # Add System Pages with Default Content

  1. System Pages Created
    - Home page (slug: 'home')
    - About page (slug: 'about')
    - Contact page (slug: 'contact')
    
  2. Default Content
    - Each page marked as system page (is_system_page = true)
    - Pages are published by default
    - Initial default blocks added for each page
    
  3. Important Notes
    - System pages cannot be deleted through admin interface
    - Pages can be edited and customized after creation
    - Default blocks provide starting content that can be modified
*/

DO $$
DECLARE
  home_page_id uuid;
  about_page_id uuid;
  contact_page_id uuid;
BEGIN
  -- Insert Home Page if it doesn't exist
  INSERT INTO cms_pages (slug, title_en, title_ar, published, is_system_page, show_in_nav, nav_order, created_at, updated_at)
  VALUES ('home', 'Home', 'الرئيسية', true, true, true, 1, now(), now())
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO home_page_id;

  -- If home page was just created, add default blocks
  IF home_page_id IS NOT NULL THEN
    -- Hero section for home page
    INSERT INTO page_blocks (page_id, block_type, position, content_en, content_ar, settings)
    VALUES (
      home_page_id,
      'hero',
      0,
      '{"title": "مشمَع", "subtitle": "An anthropological platform for understanding life through sound", "buttonText": "Explore Archive", "buttonUrl": "/en/archive"}'::jsonb,
      '{"title": "مشمَع", "subtitle": "منصة أنثروبولوجية لفهم الحياة عبر الصوت", "buttonText": "استكشف الأرشيف", "buttonUrl": "/ar/archive"}'::jsonb,
      '{"padding": "6rem 2rem", "textAlign": "center", "backgroundColor": "#f9fafb"}'::jsonb
    );
  END IF;

  -- Insert About Page if it doesn't exist
  INSERT INTO cms_pages (slug, title_en, title_ar, published, is_system_page, show_in_nav, nav_order, created_at, updated_at)
  VALUES ('about', 'About Us', 'عن المنصة', true, true, true, 2, now(), now())
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO about_page_id;

  -- If about page was just created, add default blocks
  IF about_page_id IS NOT NULL THEN
    -- Mission heading
    INSERT INTO page_blocks (page_id, block_type, position, content_en, content_ar, settings)
    VALUES (
      about_page_id,
      'heading',
      0,
      '{"text": "Our Mission", "level": "h2"}'::jsonb,
      '{"text": "مهمتنا", "level": "h2"}'::jsonb,
      '{"padding": "2rem 0 1rem 0"}'::jsonb
    );

    -- Mission text
    INSERT INTO page_blocks (page_id, block_type, position, content_en, content_ar, settings)
    VALUES (
      about_page_id,
      'text',
      1,
      '{"html": "<p>We are dedicated to preserving the sonic heritage of communities around the world. Our mission is to collect, document, and share audio recordings that tell important cultural stories.</p>"}'::jsonb,
      '{"html": "<p>نحن ملتزمون بالحفاظ على التراث الصوتي للمجتمعات حول العالم. مهمتنا هي جمع وتوثيق ومشاركة التسجيلات الصوتية التي تروي قصصًا ثقافية مهمة.</p>"}'::jsonb,
      '{"padding": "0 0 2rem 0"}'::jsonb
    );
  END IF;

  -- Insert Contact Page if it doesn't exist
  INSERT INTO cms_pages (slug, title_en, title_ar, published, is_system_page, show_in_nav, nav_order, created_at, updated_at)
  VALUES ('contact', 'Contact Us', 'اتصل بنا', true, true, true, 3, now(), now())
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO contact_page_id;

  -- If contact page was just created, add default blocks
  IF contact_page_id IS NOT NULL THEN
    -- Contact intro text
    INSERT INTO page_blocks (page_id, block_type, position, content_en, content_ar, settings)
    VALUES (
      contact_page_id,
      'text',
      0,
      '{"html": "<p>We would love to hear from you. Please use the contact form below to get in touch with us.</p>"}'::jsonb,
      '{"html": "<p>نود أن نسمع منك. يرجى استخدام نموذج الاتصال أدناه للتواصل معنا.</p>"}'::jsonb,
      '{"padding": "1rem 0"}'::jsonb
    );
  END IF;

END $$;
