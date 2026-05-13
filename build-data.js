const { Client } = require('@notionhq/client');
const fs = require('fs');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Database IDs for Resume
const SETTINGS_DB_ID = '64158dfefe6244e4801148e73460ac9b'; // Resume Settings
const CONTENT_DB_ID = '19362f03bcdb427586c4e470d9ac9e90';  // Resume Content

async function fetchSettings() {
  try {
    const response = await notion.databases.query({
      database_id: SETTINGS_DB_ID,
      page_size: 1,
    });

    if (response.results.length === 0) {
      console.log('⚠️ No settings found');
      return {};
    }

    const page = response.results[0];
    const rt = (prop) => page.properties[prop]?.rich_text[0]?.plain_text || '';

    const settings = {
      name: page.properties['Name']?.title[0]?.plain_text || '',
      subtitle: rt('Subtitle'),
      profilePhotoUrl: page.properties['Profile Photo URL']?.url || '',
      blurIntensity: page.properties['Blur Intensity']?.number ?? 35,

      // Colors
      sectionHeaderColor: rt('Section Header Color'),
      jobTitleColor: rt('Job Title Color'),
      heroStatsColor: rt('Hero Stats Color'),
      borderColor: rt('Border Color'),
      dividerColor: rt('Divider Color'),

      // Section Headers
      impactSectionHeader: rt('Impact Section Header') || 'Impact',
      impactSectionSubheader: rt('Impact Section Subheader'),
      profileSectionHeader: rt('Profile Section Header') || 'Career Profile',
      profileSectionSubheader: rt('Profile Section Subheader'),
      experienceSectionHeader: rt('Experience Section Header') || 'Professional Experience',
      experienceSectionSubheader: rt('Experience Section Subheader'),
      educationSectionHeader: rt('Education Section Header') || 'Education',
      educationSectionSubheader: rt('Education Section Subheader'),
      socialSectionHeader: rt('Social Section Header') || 'Social Responsibility',
      socialSectionSubheader: rt('Social Section Subheader'),
      projectsSectionHeader: rt('Projects Section Header') || 'Case Studies & Projects',
      projectsSectionSubheader: rt('Projects Section Subheader'),

      // Left nav link labels (leave blank in Notion to use defaults)
      navLabelOverview:   rt('Nav Label: Overview'),
      navLabelProfile:    rt('Nav Label: Profile'),
      navLabelExperience: rt('Nav Label: Experience'),
      navLabelEducation:  rt('Nav Label: Education'),
      navLabelSocial:     rt('Nav Label: Social'),
      navLabelProjects:   rt('Nav Label: Projects'),
    };

    console.log('✅ Settings extracted');
    return settings;
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    return {};
  }
}

async function fetchContent() {
  try {
    const response = await notion.databases.query({
      database_id: CONTENT_DB_ID,
      filter: {
        property: 'Status',
        select: { equals: 'Published' }
      },
      sorts: [{ property: 'Order', direction: 'ascending' }]
    });

    console.log(`📦 Found ${response.results.length} published items`);

    const content = response.results.map(page => ({
      name: page.properties['Name']?.title[0]?.plain_text || '',
      sectionType: page.properties['Section Type']?.select?.name || '',
      title: page.properties['Title']?.rich_text[0]?.plain_text || '',
      dateRange: page.properties['Date Range']?.rich_text[0]?.plain_text || '',
      description: page.properties['Description']?.rich_text[0]?.plain_text || '',
      bullets: page.properties['Bullets']?.rich_text[0]?.plain_text || '',
      imageUrl: page.properties['Image URL']?.url || '',
      order: page.properties['Order']?.number || 0,
    }));

    return content;
  } catch (error) {
    console.error('❌ Error fetching content:', error);
    return [];
  }
}

async function main() {
  console.log('🚀 Fetching resume data from Notion...\n');

  const settings = await fetchSettings();
  const content = await fetchContent();

  const data = { settings, content, lastUpdated: new Date().toISOString() };

  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

  console.log('\n✅ Data saved to data.json');
  console.log(`   - Settings: ${Object.keys(settings).length} fields`);
  console.log(`   - Content: ${content.length} items`);
}

main();
