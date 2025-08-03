#!/bin/bash

# Chrome Extension CRX Builder Script
# 用于打包Chrome扩展为crx文件的脚本

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
EXTENSION_NAME="chrome-inspect-ai"
VERSION=$(node -p "require('./package.json').version")
DIST_DIR="dist"
CRX_DIR="crx"
TEMP_DIR="temp_extension"

echo -e "${BLUE}🚀 开始构建 Chrome 扩展 CRX 文件...${NC}"
echo -e "${YELLOW}扩展名称: ${EXTENSION_NAME}${NC}"
echo -e "${YELLOW}版本: ${VERSION}${NC}"

# 1. 清理旧文件
echo -e "\n${BLUE}📁 清理旧文件...${NC}"
rm -rf "$CRX_DIR"
rm -rf "$TEMP_DIR"
mkdir -p "$CRX_DIR"

# 2. 构建扩展
echo -e "\n${BLUE}🔨 构建扩展...${NC}"
npm run build:chrome

# 检查构建是否成功
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}❌ 构建失败: $DIST_DIR 目录不存在${NC}"
    exit 1
fi

# 3. 创建临时目录并复制文件
echo -e "\n${BLUE}📦 准备打包文件...${NC}"
cp -r "$DIST_DIR" "$TEMP_DIR"

# 4. 验证必要文件
echo -e "\n${BLUE}✅ 验证必要文件...${NC}"
required_files=("manifest.json" "icons/icon16.png" "icons/icon48.png" "icons/icon128.png")
for file in "${required_files[@]}"; do
    if [ ! -f "$TEMP_DIR/$file" ]; then
        echo -e "${RED}❌ 缺少必要文件: $file${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ $file${NC}"
done

# 5. 生成私钥（如果不存在）
PRIVATE_KEY="$CRX_DIR/${EXTENSION_NAME}.pem"
if [ ! -f "$PRIVATE_KEY" ]; then
    echo -e "\n${BLUE}🔑 生成私钥...${NC}"
    openssl genrsa -out "$PRIVATE_KEY" 2048
    echo -e "${GREEN}✓ 私钥已生成: $PRIVATE_KEY${NC}"
else
    echo -e "\n${YELLOW}🔑 使用现有私钥: $PRIVATE_KEY${NC}"
fi

# 6. 使用Chrome打包扩展
echo -e "\n${BLUE}📦 打包 CRX 文件...${NC}"

# 检查Chrome路径
CHROME_PATH=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CHROME_PATHS=(
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        "/Applications/Chromium.app/Contents/MacOS/Chromium"
    )
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CHROME_PATHS=(
        "/usr/bin/google-chrome"
        "/usr/bin/chromium-browser"
        "/usr/bin/chromium"
    )
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    CHROME_PATHS=(
        "/c/Program Files/Google/Chrome/Application/chrome.exe"
        "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
    )
fi

for path in "${CHROME_PATHS[@]}"; do
    if [ -f "$path" ]; then
        CHROME_PATH="$path"
        break
    fi
done

if [ -z "$CHROME_PATH" ]; then
    echo -e "${RED}❌ 未找到Chrome浏览器，请手动设置CHROME_PATH环境变量${NC}"
    echo -e "${YELLOW}或者使用以下命令手动打包:${NC}"
    echo "chrome --pack-extension=$TEMP_DIR --pack-extension-key=$PRIVATE_KEY"
    exit 1
fi

echo -e "${GREEN}✓ 找到Chrome: $CHROME_PATH${NC}"

# 使用Chrome打包
CRX_OUTPUT="$CRX_DIR/${EXTENSION_NAME}-${VERSION}.crx"
"$CHROME_PATH" --pack-extension="$(pwd)/$TEMP_DIR" --pack-extension-key="$(pwd)/$PRIVATE_KEY" --no-message-box 2>/dev/null || true

# 查找生成的crx文件
GENERATED_CRX=$(find . -name "${TEMP_DIR}.crx" -type f 2>/dev/null | head -1)
if [ -f "$GENERATED_CRX" ]; then
    mv "$GENERATED_CRX" "$CRX_OUTPUT"
    echo -e "${GREEN}✓ CRX文件已生成: $CRX_OUTPUT${NC}"
else
    echo -e "${RED}❌ CRX文件生成失败${NC}"
    exit 1
fi

# 7. 生成公钥
echo -e "\n${BLUE}🔐 生成公钥...${NC}"
PUBLIC_KEY="$CRX_DIR/${EXTENSION_NAME}.pub"
openssl rsa -in "$PRIVATE_KEY" -pubout -out "$PUBLIC_KEY"
echo -e "${GREEN}✓ 公钥已生成: $PUBLIC_KEY${NC}"

# 8. 计算文件哈希
echo -e "\n${BLUE}🔍 计算文件哈希...${NC}"
HASH_FILE="$CRX_DIR/${EXTENSION_NAME}-${VERSION}.sha256"
if command -v shasum &> /dev/null; then
    shasum -a 256 "$CRX_OUTPUT" > "$HASH_FILE"
elif command -v sha256sum &> /dev/null; then
    sha256sum "$CRX_OUTPUT" > "$HASH_FILE"
fi
echo -e "${GREEN}✓ 哈希文件已生成: $HASH_FILE${NC}"

# 9. 清理临时文件
echo -e "\n${BLUE}🧹 清理临时文件...${NC}"
rm -rf "$TEMP_DIR"

# 10. 显示结果
echo -e "\n${GREEN}🎉 打包完成！${NC}"
echo -e "\n${BLUE}生成的文件:${NC}"
echo -e "${GREEN}  📦 CRX文件: $CRX_OUTPUT${NC}"
echo -e "${GREEN}  🔑 私钥: $PRIVATE_KEY${NC}"
echo -e "${GREEN}  🔐 公钥: $PUBLIC_KEY${NC}"
if [ -f "$HASH_FILE" ]; then
    echo -e "${GREEN}  🔍 哈希: $HASH_FILE${NC}"
fi

# 显示文件大小
CRX_SIZE=$(du -h "$CRX_OUTPUT" | cut -f1)
echo -e "\n${YELLOW}📊 CRX文件大小: $CRX_SIZE${NC}"

echo -e "\n${BLUE}💡 使用说明:${NC}"
echo -e "  1. 将 $CRX_OUTPUT 文件分发给用户"
echo -e "  2. 用户可以直接拖拽到Chrome浏览器安装"
echo -e "  3. 保管好 $PRIVATE_KEY 文件用于后续更新"

echo -e "\n${GREEN}✨ 构建完成！${NC}"
