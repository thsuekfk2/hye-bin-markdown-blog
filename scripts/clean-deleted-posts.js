const fs = require("fs");
const path = require("path");

// slug로 파일 찾기
function findFileBySlug(slug) {
  const contentsDir = path.join(process.cwd(), "contents");

  // post 디렉토리에서 찾기
  const postFile = path.join(contentsDir, "post", `${slug}.mdx`);
  if (fs.existsSync(postFile)) {
    return { path: `post/${slug}.mdx`, fullPath: postFile };
  }

  // 디렉토리에서 찾기 (날짜 형식인 경우)
  if (slug.match(/^\d{6}$/)) {
    // YYMMDD 형식
    const year = slug.substring(0, 2);
    const month = slug.substring(2, 4);
    const yearMonth = year + month;

    const logFile = path.join(contentsDir, "log", yearMonth, `${slug}.mdx`);
    if (fs.existsSync(logFile)) {
      return { path: `log/${yearMonth}/${slug}.mdx`, fullPath: logFile };
    }
  }

  return null;
}

// 캐시에서 항목 제거
function cleanCacheEntry(fullPath) {
  const cacheFile = path.join(process.cwd(), ".sync-cache.json");

  if (!fs.existsSync(cacheFile)) {
    return;
  }

  try {
    const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
    if (cache[fullPath]) {
      delete cache[fullPath];
      fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
      console.log("🗑️  캐시에서도 제거됨");
    }
  } catch (error) {
    console.error("캐시 정리 중 오류:", error);
  }
}

// slug로 포스트 삭제
function deletePostBySlug(slug) {
  console.log(`🔍 "${slug}" slug를 가진 파일을 찾는 중...`);

  const fileInfo = findFileBySlug(slug);

  if (!fileInfo) {
    console.log(`❌ "${slug}" slug를 가진 파일을 찾을 수 없습니다.`);
    return false;
  }

  console.log(`📁 파일 발견: ${fileInfo.path}`);

  try {
    fs.unlinkSync(fileInfo.fullPath);
    console.log(`🗑️  삭제됨: ${fileInfo.path}`);

    // 캐시에서도 제거
    cleanCacheEntry(fileInfo.fullPath);

    return true;
  } catch (error) {
    console.error(`❌ 삭제 실패: ${error.message}`);
    return false;
  }
}

// 메인 함수
function main() {
  const slug = process.argv[2];

  if (!slug) {
    console.log("❗ 삭제할 포스트의 slug를 입력해주세요.");
    process.exit(1);
  }

  const success = deletePostBySlug(slug);

  if (success) {
    console.log("✅ 포스트가 성공적으로 삭제되었습니다!");
  } else {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { deletePostBySlug };
