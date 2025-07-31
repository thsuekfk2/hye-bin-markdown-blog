const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 환경변수 수동 로드
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const CONTENTS_DIR = path.join(process.cwd(), 'contents');

async function syncNotionImagesWithS3() {
  try {
    console.log('🔄 Notion 페이지들의 이미지를 S3 URL로 동기화 중...');
    
    // 모든 MDX 파일에서 S3 이미지 매핑 정보 수집
    const imageMapping = await collectS3ImageMappings();
    
    if (Object.keys(imageMapping).length === 0) {
      console.log('❌ S3 이미지 매핑 정보를 찾을 수 없습니다.');
      return;
    }
    
    console.log(`📊 총 ${Object.keys(imageMapping).length}개의 이미지 매핑 정보를 찾았습니다.`);
    
    // 모든 Notion 페이지 가져오기
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
    });
    
    console.log(`📄 총 ${response.results.length}개의 Notion 페이지를 확인합니다.`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const page of response.results) {
      const title = page.properties['이름']?.title?.[0]?.text?.content || 'Unknown';
      const slug = page.properties['Slug']?.rich_text?.[0]?.text?.content;
      
      if (!slug) {
        console.log(`⚠️  슬러그가 없어서 건너뜀: ${title}`);
        continue;
      }
      
      console.log(`\n🔍 처리 중: ${title} (${slug})`);
      
      try {
        // 해당 슬러그의 이미지 매핑이 있는지 확인
        if (!imageMapping[slug]) {
          console.log(`   📝 이미지 매핑 정보 없음 - 건너뜀`);
          continue;
        }
        
        const updated = await updatePageImages(page.id, imageMapping[slug], title);
        if (updated) {
          updatedCount++;
          console.log(`   ✅ 이미지 업데이트 완료`);
        } else {
          console.log(`   📝 업데이트할 이미지 없음`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`   ❌ 업데이트 실패: ${error.message}`);
      }
    }
    
    console.log(`\n✅ 동기화 완료: 업데이트 ${updatedCount}개, 오류 ${errorCount}개`);
    
  } catch (error) {
    console.error('❌ 동기화 중 오류 발생:', error);
  }
}

async function collectS3ImageMappings() {
  const imageMapping = {};
  
  // post 폴더의 MDX 파일들
  const postDir = path.join(CONTENTS_DIR, 'post');
  if (fs.existsSync(postDir)) {
    const postFiles = fs.readdirSync(postDir).filter(file => file.endsWith('.mdx'));
    for (const file of postFiles) {
      const slug = file.replace('.mdx', '');
      const filePath = path.join(postDir, file);
      const images = extractImagesFromMDX(filePath);
      if (images.length > 0) {
        imageMapping[slug] = images;
      }
    }
  }
  
  // log 폴더의 MDX 파일들
  const logDir = path.join(CONTENTS_DIR, 'log');
  if (fs.existsSync(logDir)) {
    const logFolders = fs.readdirSync(logDir);
    for (const folder of logFolders) {
      const folderPath = path.join(logDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const logFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.mdx'));
        for (const file of logFiles) {
          const slug = file.replace('.mdx', '');
          const filePath = path.join(folderPath, file);
          const images = extractImagesFromMDX(filePath);
          if (images.length > 0) {
            imageMapping[slug] = images;
          }
        }
      }
    }
  }
  
  return imageMapping;
}

function extractImagesFromMDX(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content: body } = matter(content);
  const images = [];
  
  // thumbnail 이미지
  if (frontmatter.thumbnail && frontmatter.thumbnail.includes('s3.ap-northeast-2.amazonaws.com')) {
    images.push({
      type: 'thumbnail',
      url: frontmatter.thumbnail
    });
  }
  
  // 본문의 이미지들
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = imageRegex.exec(body)) !== null) {
    const alt = match[1];
    const src = match[2];
    // S3 URL이거나 상대 경로(/로 시작하는) 이미지 모두 포함
    if (src.includes('s3.ap-northeast-2.amazonaws.com') || src.startsWith('/')) {
      images.push({
        type: 'content',
        alt: alt,
        url: src.startsWith('/') ? `https://www.hyebin.me${src}` : src,
        originalSrc: src
      });
    }
  }
  
  return images;
}

async function updatePageImages(pageId, images, title) {
  let hasUpdates = false;
  
  // 썸네일 업데이트
  const thumbnailImage = images.find(img => img.type === 'thumbnail');
  if (thumbnailImage) {
    try {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          'Thumbnail': {
            files: [{
              name: 'thumbnail',
              external: {
                url: thumbnailImage.url
              }
            }]
          }
        }
      });
      console.log(`   🖼️  썸네일 업데이트: ${thumbnailImage.url}`);
      hasUpdates = true;
    } catch (error) {
      console.error(`   ❌ 썸네일 업데이트 실패: ${error.message}`);
    }
  }
  
  // 페이지 콘텐츠의 이미지 블록들 업데이트
  const contentImages = images.filter(img => img.type === 'content');
  if (contentImages.length > 0) {
    try {
      const blocks = await notion.blocks.children.list({
        block_id: pageId,
      });
      
      const imageBlocks = blocks.results.filter(block => block.type === 'image');
      
      for (let i = 0; i < Math.min(imageBlocks.length, contentImages.length); i++) {
        const block = imageBlocks[i];
        const newImage = contentImages[i];
        
        try {
          await notion.blocks.update({
            block_id: block.id,
            image: {
              external: {
                url: newImage.url
              },
              caption: newImage.alt ? [{
                type: 'text',
                text: {
                  content: newImage.alt
                }
              }] : []
            }
          });
          console.log(`   🖼️  이미지 블록 업데이트: ${newImage.url}`);
          hasUpdates = true;
        } catch (error) {
          console.error(`   ❌ 이미지 블록 업데이트 실패: ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`   ❌ 페이지 블록 조회 실패: ${error.message}`);
    }
  }
  
  return hasUpdates;
}

// 스크립트 실행
if (require.main === module) {
  syncNotionImagesWithS3();
}

module.exports = { syncNotionImagesWithS3 };