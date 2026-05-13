const { Client } = require('@notionhq/client');
const fs = require('fs');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Database IDs
const SETTINGS_DB_ID = '64158dfefe6244e4801148e73460ac9b'; // Resume Settings
const CONTENT_DB_ID = '19362f03bcdb427586c4e470d9ac9e90';  // Resume Content

async function fetchSettings() {
  try {
    const response = await notion.databases.query({
      database_id: SETTINGS_DB_ID,
      page_size: 1, // Only need one row
    });

    if (response.results.length === 0) {
      console.log('⚠️ No settings found');
      return {};
    }

    const page = response.results[0];
    console.log('📋 Raw settings from Notion:', JSON.stringify(page.properties, null, 2));

    // Extract all settings
    const settings = {
      name: page.properties['Name']?.title[0]?.plain_text || '',
      subtitle: page.properties['Subtitle']?.rich_text[0]?.plain_text || '',
      profilePhotoUrl: page.properties['Profile Photo URL']?.url || '',
      blurIntensity: page.properties['Blur Intensity']?.number || 35,
      
      // Colors
      sectionHeaderColor: page.properties['Section Header Color']?.rich_text[0]?.plain_text || '',
      jobTitleColor: page.properties['Job Title Color']?.rich_text[0]?.plain_text || '',
      heroStatsColor: page.properties['Hero Stats Color']?.rich_text[0]?.plain_text || '',
      borderColor: page.properties['Border Color']?.rich_text[0]?.plain_text || '',
      dividerColor: page.properties['Divider Color']?.rich_text[0]?.plain_text || '',
      
      // Section Headers
      impactSectionHeader: page.properties['Impact Section Header']?.rich_text[0]?.plain_text || 'Impact',
      profileSectionHeader: page.properties['Profile Section Header']?.rich_text[0]?.plain_text || 'Career Profile',
      experienceSectionHeader: page.properties['Experience Section Header']?.rich_text[0]?.plain_text || 'Professional Experience',
      educationSectionHeader: page.properties['Education Section Header']?.rich_text[0]?.plain_text || 'Education',
      socialSectionHeader: page.properties['Social Section Header']?.rich_text[0]?.plain_text || 'Social Responsibility',
      projectsSectionHeader: page.properties['Projects Section Header']?.rich_text[0]?.plain_text || 'Case Studies & Projects',
    };

    console.log('✅ Settings extracted:', settings);
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
        select: {
          equals: 'Published'
        }
      },
      sorts: [
        {
          property: 'Order',
          direction: 'ascending'
        }
      ]
    });

    console.log(`📦 Found ${response.results.length} published content items`);

    const content = response.results.map(page => {
      const item = {
        name: page.properties['Name']?.title[0]?.plain_text || '',
        sectionType: page.properties['Section Type']?.select?.name || '',
        title: page.properties['Title']?.rich_text[0]?.plain_text || '',
        dateRange: page.properties['Date Range']?.rich_text[0]?.plain_text || '',
        description: page.properties['Description']?.rich_text[0]?.plain_text || '',
        bullets: page.properties['Bullets']?.rich_text[0]?.plain_text || '',
        imageUrl: page.properties['Image URL']?.url || '',
        order: page.properties['Order']?.number || 0,
      };

      console.log(`  - ${item.sectionType}: ${item.name}`);
      return item;
    });

    return content;
  } catch (error) {
    console.error('❌ Error fetching content:', error);
    return [];
  }
}

async function main() {
  console.log('🚀 Fetching data from Notion...\n');

  const settings = await fetchSettings();
  const content = await fetchContent();

  const data = {
    settings,
    content,
    lastUpdated: new Date().toISOString(),
  };

  // Save to data.json
  fs.writeFileSync(
    'data.json',
    JSON.stringify(data, null, 2)
  );

  console.log('\n✅ Data fetched and saved to data.json');
  console.log(`   - Settings: ${Object.keys(settings).length} fields`);
  console.log(`   - Content: ${content.length} items`);
}

main();
