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

async function mdxToNotion() {
  try {
    console.log('📚 기존 MDX 파일들을 노션으로 이전 중...');
    
    // 모든 MDX 파일 찾기
    const mdxFiles = [];
    
    // post 폴더의 MDX 파일들
    const postDir = path.join(CONTENTS_DIR, 'post');
    if (fs.existsSync(postDir)) {
      const postFiles = fs.readdirSync(postDir)
        .filter(file => file.endsWith('.mdx'))
        .map(file => ({
          filePath: path.join(postDir, file),
          category: 'post',
          fileName: file
        }));
      mdxFiles.push(...postFiles);
    }
    
    // log 폴더의 MDX 파일들
    const logDir = path.join(CONTENTS_DIR, 'log');
    if (fs.existsSync(logDir)) {
      const logFolders = fs.readdirSync(logDir);
      for (const folder of logFolders) {
        const folderPath = path.join(logDir, folder);
        if (fs.statSync(folderPath).isDirectory()) {
          const logFiles = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.mdx'))
            .map(file => ({
              filePath: path.join(folderPath, file),
              category: 'log',
              fileName: file
            }));
          mdxFiles.push(...logFiles);
        }
      }
    }
    
    console.log(`📄 총 ${mdxFiles.length}개의 MDX 파일을 찾았습니다.`);
    
    let successCount = 0;
    let errorCount = 0;
    const failedFiles = [];
    
    for (const fileInfo of mdxFiles) {
      const result = await processMDXFile(fileInfo);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        failedFiles.push({ file: fileInfo.fileName, error: result.error });
      }
    }
    
    console.log(`✅ 처리 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
    
    if (failedFiles.length > 0) {
      console.log('\n❌ 실패한 파일들:');
      failedFiles.forEach(({ file, error }) => {
        console.log(`   - ${file}: ${error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 이전 중 오류가 발생했습니다:', error);
  }
}

async function processMDXFile({ filePath, category, fileName }) {
  try {
    console.log(`📝 처리 중: ${fileName}`);
    
    // MDX 파일 읽기
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // frontmatter에서 정보 추출
    const title = frontmatter.title || fileName.replace('.mdx', '');
    const slug = frontmatter.slug || fileName.replace('.mdx', '');
    const date = frontmatter.date || new Date().toISOString().split('T')[0];
    const description = frontmatter.description || '';
    const tags = frontmatter.tags || [];
    const thumbnail = frontmatter.thumbnail || '';
    
    console.log(`   - 제목: ${title}`);
    console.log(`   - 슬러그: ${slug}`);
    console.log(`   - 카테고리: ${category}`);
    
    // 노션에 이미 존재하는지 확인
    const existing = await checkExistingPage(slug);
    if (existing) {
      console.log(`   🔄 이미 존재함: "${title}" - 건너뛰기`);
      return { success: true };
    }
    
    // 마크다운을 노션 블록으로 변환
    const blocks = await convertMarkdownToBlocks(content);
    
    console.log(`   - 생성된 블록 수: ${blocks.length}`);
    
    // 노션의 100블록 제한 처리
    let initialBlocks = blocks.slice(0, 100);
    let remainingBlocks = blocks.slice(100);
    
    if (blocks.length > 100) {
      console.log(`   ⚠️  블록 수 초과 (${blocks.length}개), 첫 100개만 생성 후 나머지 추가`);
    }
    
    // 노션 페이지 생성
    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID,
      },
      properties: {
        '이름': {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        'Slug': {
          rich_text: [
            {
              text: {
                content: slug,
              },
            },
          ],
        },
        'Category': {
          select: {
            name: category,
          },
        },
        'Status': {
          select: {
            name: '발행',
          },
        },
        'Date': {
          date: {
            start: date,
          },
        },
        'Description': {
          rich_text: [
            {
              text: {
                content: description,
              },
            },
          ],
        },
        'Tags': {
          multi_select: tags.map(tag => ({ name: tag })),
        },
        'Thumbnail': {
          files: thumbnail && !thumbnail.includes('notion.so') && !thumbnail.includes('prod-files-secure.s3.us-west-2.amazonaws.com') ? [
            {
              name: 'thumbnail',
              external: {
                url: thumbnail.startsWith('http') ? thumbnail : `https://www.hyebin.me${thumbnail}`
              }
            }
          ] : []
        },
      },
      children: initialBlocks,
    });
    
    console.log(`   ✅ 노션에 생성됨: ${response.id}`);
    
    // 남은 블록들을 추가
    if (remainingBlocks.length > 0) {
      console.log(`   📝 추가 블록 ${remainingBlocks.length}개 업로드 중...`);
      
      // 100개씩 나누어서 추가
      for (let i = 0; i < remainingBlocks.length; i += 100) {
        const chunk = remainingBlocks.slice(i, i + 100);
        await notion.blocks.children.append({
          block_id: response.id,
          children: chunk,
        });
        console.log(`   📝 ${i + chunk.length}/${remainingBlocks.length} 블록 추가됨`);
      }
    }
    
    return { success: true };
    
  } catch (error) {
    console.error(`   ❌ 처리 실패 (${fileName}):`, error.message);
    const errorMsg = error.body?.message || error.message;
    if (error.body && error.body.message) {
      console.error(`   세부 오류: ${error.body.message}`);
    }
    return { success: false, error: errorMsg };
  }
}

async function checkExistingPage(slug) {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Slug',
        rich_text: {
          equals: slug,
        },
      },
    });
    
    return response.results.length > 0 ? response.results[0] : null;
  } catch (error) {
    console.warn(`슬러그 확인 중 오류: ${error.message}`);
    return false;
  }
}

async function convertMarkdownToBlocks(content) {
  const blocks = [];
  const lines = content.split('\n');
  
  let currentBlock = null;
  let codeBlock = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 코드 블록 처리
    if (line.startsWith('```')) {
      if (codeBlock) {
        // 코드 블록 종료 - 노션의 2000자 제한 처리
        let content = codeBlock.content.trim();
        if (content.length > 1900) {
          // 큰 코드 블록을 여러 개로 분할
          const chunks = [];
          while (content.length > 0) {
            chunks.push(content.slice(0, 1900));
            content = content.slice(1900);
          }
          
          chunks.forEach((chunk, index) => {
            blocks.push({
              object: 'block',
              type: 'code',
              code: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: chunk,
                    },
                  },
                ],
                language: codeBlock.language || 'plain text',
              },
            });
            
            if (index < chunks.length - 1) {
              // 분할된 블록 사이에 구분선 추가
              blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [
                    {
                      type: 'text',
                      text: { content: '--- (continued) ---' },
                    },
                  ],
                },
              });
            }
          });
        } else {
          blocks.push({
            object: 'block',
            type: 'code',
            code: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: content,
                  },
                },
              ],
              language: codeBlock.language || 'plain text',
            },
          });
        }
        codeBlock = null;
      } else {
        // 코드 블록 시작
        const rawLanguage = line.slice(3).trim() || 'plain text';
        // 노션에서 지원하지 않는 언어들을 매핑
        const languageMap = {
          'jsx': 'javascript',
          'tsx': 'typescript',
          'js': 'javascript',
          'ts': 'typescript',
          'vue': 'javascript',
          'svelte': 'javascript',
          'astro': 'javascript'
        };
        const language = languageMap[rawLanguage] || rawLanguage;
        codeBlock = {
          language: language,
          content: '',
        };
      }
      continue;
    }
    
    if (codeBlock) {
      codeBlock.content += line + '\n';
      continue;
    }
    
    // 제목 처리
    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: line.slice(2).trim(),
              },
            },
          ],
        },
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: line.slice(3).trim(),
              },
            },
          ],
        },
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: line.slice(4).trim(),
              },
            },
          ],
        },
      });
    }
    // 콜아웃 처리
    else if (line.startsWith('> ')) {
      const content = line.slice(2).trim();
      let emoji = '💡';
      let text = content;
      
      // 이모지 감지
      const emojiMatch = content.match(/^(\p{Emoji})\s+(.+)$/u);
      if (emojiMatch) {
        emoji = emojiMatch[1];
        text = emojiMatch[2];
      }
      
      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: text,
              },
            },
          ],
          icon: {
            emoji: emoji,
          },
        },
      });
    }
    // 리스트 처리
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: line.slice(2).trim(),
              },
            },
          ],
        },
      });
    }
    // 번호 리스트 처리  
    else if (/^\d+\.\s/.test(line)) {
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: line.replace(/^\d+\.\s/, ''),
              },
            },
          ],
        },
      });
    }
    // 이미지 처리
    else if (line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)) {
      const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      const alt = match[1];
      let src = match[2];
      
      // GitHub 이미지 URL을 S3 URL로 변환 (노션 호환성을 위해)
      if (src.includes('github.com') && src.includes('/assets/')) {
        try {
          // GitHub assets URL 패턴: https://github.com/user/repo/assets/userid/assetid-hash.ext
          const assetMatch = src.match(/\/assets\/(\d+)\/([a-f0-9\-]+)/);
          if (assetMatch) {
            const userId = assetMatch[1];
            const assetHash = assetMatch[2];
            // S3 URL로 변환
            src = `https://github-production-user-asset-6210df.s3.amazonaws.com/${userId}/${assetHash}.png`;
          }
        } catch (error) {
          console.log(`이미지 URL 변환 실패: ${src}`);
        }
      }
      
      // 상대 경로를 절대 URL로 변환
      const imageUrl = src.startsWith('http') ? src : `https://www.hyebin.me${src}`;
      
      // 노션에서 지원하지 않는 이미지 URL은 텍스트로 대체
      if (imageUrl.includes('github.com') && !imageUrl.includes('s3.amazonaws.com')) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `[이미지: ${alt || 'image'}] - ${imageUrl}`,
                },
                annotations: {
                  italic: true,
                  color: 'gray',
                },
              },
            ],
          },
        });
      } else {
        blocks.push({
          object: 'block',
          type: 'image',
          image: {
            type: 'external',
            external: {
              url: imageUrl,
            },
            caption: alt ? [
              {
                type: 'text',
                text: {
                  content: alt,
                },
              },
            ] : [],
          },
        });
      }
    }
    // 빈 줄 처리
    else if (line.trim() === '') {
      // 빈 줄은 건너뛰기
      continue;
    }
    // 일반 텍스트 처리
    else if (line.trim()) {
      // 굵은 글씨, 기울임 등을 포함한 리치텍스트 파싱
      const richText = parseRichText(line);
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: richText,
        },
      });
    }
  }
  
  return blocks;
}

function parseRichText(text) {
  // 간단한 마크다운 파싱 (굵은 글씨, 기울임, 코드)
  const richText = [];
  let currentText = text;
  
  // **굵은 글씨** 처리
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // 굵은 글씨 앞의 일반 텍스트
    if (match.index > lastIndex) {
      const normalText = text.slice(lastIndex, match.index);
      if (normalText) {
        richText.push({
          type: 'text',
          text: { content: normalText },
        });
      }
    }
    
    // 굵은 글씨
    richText.push({
      type: 'text',
      text: { content: match[1] },
      annotations: { bold: true },
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // 남은 텍스트
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      richText.push({
        type: 'text',
        text: { content: remainingText },
      });
    }
  }
  
  // 아무 스타일링이 없는 경우
  if (richText.length === 0) {
    richText.push({
      type: 'text',
      text: { content: text },
    });
  }
  
  return richText;
}

// 스크립트 실행
if (require.main === module) {
  mdxToNotion();
}

module.exports = { mdxToNotion, processMDXFile };