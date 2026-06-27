import { NextResponse } from 'next/server';
import { generatePPT } from '@/lib/ai';
import { generatePPTX, parseAIContentToPPT } from '@/lib/ppt-generator';

export async function POST(request: Request) {
  try {
    const { content, template } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '请输入PPT主题或内容' },
        { status: 400 }
      );
    }

    // 1. 使用AI生成PPT内容
    const aiContent = await generatePPT(content, template || 'business');

    // 2. 解析AI内容为PPT结构
    const pptConfig = parseAIContentToPPT(content, aiContent);

    // 3. 生成PPTX文件
    const buffer = await generatePPTX(pptConfig);

    // 4. 返回文件
    const uint8Array = new Uint8Array(buffer);
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(content)}.pptx"`,
      },
    });
  } catch (error: unknown) {
    console.error('PPT生成失败:', error);
    const errorMessage = error instanceof Error ? error.message : 'PPT生成失败，请稍后重试';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
