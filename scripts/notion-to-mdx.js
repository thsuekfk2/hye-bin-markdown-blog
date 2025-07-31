const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// 환경변수 로드
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

const s3Client = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const S3_BUCKET = 'hyebin-markdown-blog';
const S3_BASE_URL = `https://${S3_BUCKET}.s3.ap-northeast-2.amazonaws.com`;
const CONTENTS_DIR = path.join(process.cwd(), 'contents');

async function notionToMDX() {
  try {
    console.log('🔄 Notion에서 블로그 글을 가져오는 중...');
    
    // Notion 데이터베이스에서 발행된 글들 가져오기
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Status',
        select: {
          equals: '발행',
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    console.log(`📄 총 ${response.results.length}개의 글을 찾았습니다.`);

    let successCount = 0;
    let errorCount = 0;
    const failedPages = [];

    for (const page of response.results) {
      try {
        await processNotionPage(page);
        successCount++;
      } catch (error) {
        errorCount++;
        const title = page.properties['이름']?.title[0]?.text?.content || 'Unknown';
        failedPages.push({ title, error: error.message });
        console.error(`❌ "${title}" 처리 실패:`, error.message);
      }
    }

    console.log(`✅ 처리 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);

    if (failedPages.length > 0) {
      console.log('\n❌ 실패한 페이지들:');
      failedPages.forEach(({ title, error }) => {
        console.log(`   - ${title}: ${error}`);
      });
    }

  } catch (error) {
    console.error('❌ Notion 동기화 중 오류 발생:', error);
  }
}

async function processNotionPage(page) {
  // 페이지 정보 추출
  const title = page.properties['이름']?.title[0]?.text?.content || '';
  const slug = page.properties['Slug']?.rich_text[0]?.text?.content || '';
  const category = page.properties['Category']?.select?.name || 'post';
  const date = page.properties['Date']?.date?.start || new Date().toISOString().split('T')[0];
  const description = page.properties['Description']?.rich_text[0]?.text?.content || '';
  const tags = page.properties['Tags']?.multi_select?.map(tag => tag.name) || [];
  
  console.log(`📝 처리 중: "${title}" (${category})`);

  // 페이지 블록들 가져오기
  const blocks = await getAllBlocks(page.id);
  
  // 이미지 처리 및 MDX 변환
  const { mdxContent, thumbnailUrl } = await processBlocksToMDX(blocks, slug, category);

  // frontmatter 생성
  const frontmatter = {
    title,
    slug,
    date,
    description,
    thumbnail: thumbnailUrl || '',
    tags
  };

  // MDX 파일 생성
  const mdxFile = createMDXFile(frontmatter, mdxContent);

  // 파일 저장
  await saveMDXFile(mdxFile, slug, category, date);

  console.log(`✅ "${title}" 처리 완료`);
}

async function getAllBlocks(blockId) {
  let blocks = [];
  let cursor = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    });
    blocks.push(...response.results);
    cursor = response.next_cursor;
  } while (cursor);

  return blocks;
}

async function processBlocksToMDX(blocks, slug, category) {
  let mdxContent = '';
  let thumbnailUrl = '';
  let imageCounter = 1;

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        const paragraphText = await processRichText(block.paragraph.rich_text, slug, category, imageCounter);
        if (paragraphText.content) {
          mdxContent += paragraphText.content + '\n\n';
          imageCounter = paragraphText.imageCounter;
        }
        break;

      case 'heading_1':
        const h1Text = await processRichText(block.heading_1.rich_text, slug, category, imageCounter);
        mdxContent += `# ${h1Text.content}\n\n`;
        imageCounter = h1Text.imageCounter;
        break;

      case 'heading_2':
        const h2Text = await processRichText(block.heading_2.rich_text, slug, category, imageCounter);
        mdxContent += `## ${h2Text.content}\n\n`;
        imageCounter = h2Text.imageCounter;
        break;

      case 'heading_3':
        const h3Text = await processRichText(block.heading_3.rich_text, slug, category, imageCounter);
        mdxContent += `### ${h3Text.content}\n\n`;
        imageCounter = h3Text.imageCounter;
        break;

      case 'bulleted_list_item':
        const bulletText = await processRichText(block.bulleted_list_item.rich_text, slug, category, imageCounter);
        mdxContent += `- ${bulletText.content}\n`;
        imageCounter = bulletText.imageCounter;
        break;

      case 'numbered_list_item':
        const numberedText = await processRichText(block.numbered_list_item.rich_text, slug, category, imageCounter);
        mdxContent += `1. ${numberedText.content}\n`;
        imageCounter = numberedText.imageCounter;
        break;

      case 'code':
        const codeText = block.code.rich_text.map(text => text.text.content).join('');
        const language = block.code.language || 'text';
        mdxContent += `\`\`\`${language}\n${codeText}\n\`\`\`\n\n`;
        break;

      case 'image':
        const imageUrl = await processImage(block.image, slug, category, imageCounter);
        if (imageUrl) {
          const caption = block.image.caption?.map(text => text.text.content).join('') || '';
          mdxContent += `![${caption}](${imageUrl})\n\n`;
          
          // 첫 번째 이미지를 썸네일로 사용
          if (!thumbnailUrl) {
            thumbnailUrl = imageUrl;
          }
          imageCounter++;
        }
        break;

      default:
        console.log(`⚠️  지원하지 않는 블록 타입: ${block.type}`);
        break;
    }
  }

  return { mdxContent, thumbnailUrl };
}

async function processRichText(richTextArray, slug, category, imageCounter) {
  let content = '';
  let currentImageCounter = imageCounter;

  for (const richText of richTextArray) {
    if (richText.type === 'text') {
      let text = richText.text.content;
      
      // 스타일 적용
      if (richText.annotations.bold) text = `**${text}**`;
      if (richText.annotations.italic) text = `*${text}*`;
      if (richText.annotations.code) text = `\`${text}\``;
      
      content += text;
    }
  }

  return { content, imageCounter: currentImageCounter };
}

async function processImage(imageBlock, slug, category, imageCounter) {
  try {
    let imageUrl = '';
    
    if (imageBlock.type === 'external') {
      imageUrl = imageBlock.external.url;
    } else if (imageBlock.type === 'file') {
      imageUrl = imageBlock.file.url;
    }

    if (!imageUrl) return null;

    console.log(`   📸 이미지 처리 중: ${imageCounter}.jpg`);
    
    // 이미지 다운로드
    const imageBuffer = await downloadImage(imageUrl);
    
    // S3에 업로드
    const s3Key = `${category}/${slug}/${imageCounter}.jpg`;
    await uploadToS3(imageBuffer, s3Key);
    
    const s3Url = `${S3_BASE_URL}/${s3Key}`;
    console.log(`   ✅ S3 업로드 완료: ${s3Url}`);
    
    return s3Url;
  } catch (error) {
    console.error(`   ❌ 이미지 처리 실패:`, error.message);
    return null;
  }
}

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      response.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      response.on('error', (error) => {
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function uploadToS3(buffer, key) {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
  });

  await s3Client.send(command);
}

function createMDXFile(frontmatter, content) {
  const yamlFrontmatter = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
      }
      return `${key}: "${value}"`;
    })
    .join('\n');

  return `---\n${yamlFrontmatter}\n---\n\n${content}`;
}

async function saveMDXFile(content, slug, category, date) {
  let filePath;
  
  if (category === 'log') {
    // log의 경우 날짜별 폴더 구조
    const dateFolder = date.slice(2, 4) + date.slice(5, 7); // 2024-03-14 -> 2403
    const fileName = date.slice(2).replace(/-/g, '') + '.mdx'; // 2024-03-14 -> 240314.mdx
    
    const logDir = path.join(CONTENTS_DIR, 'log', dateFolder);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    filePath = path.join(logDir, fileName);
  } else {
    // post의 경우 slug 기반
    const postDir = path.join(CONTENTS_DIR, 'post');
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    
    filePath = path.join(postDir, `${slug}.mdx`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`   💾 파일 저장: ${filePath}`);
}

// 스크립트 실행
if (require.main === module) {
  notionToMDX();
}

module.exports = { notionToMDX };