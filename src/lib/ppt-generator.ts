import PptxGenJS from 'pptxgenjs';

// PPT模板配置
interface PPTConfig {
  title: string;
  subtitle?: string;
  slides: PPTSlide[];
}

interface PPTSlide {
  title: string;
  content: string[];
  notes?: string;
}

// 生成PPT（优化版）
export async function generatePPTX(config: PPTConfig): Promise<Buffer> {
  const pptx = new PptxGenJS();
  
  // 设置默认样式
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = '职场AI提效工具';
  pptx.company = 'AI时代求职训练平台';
  pptx.subject = config.title;
  
  // 专业配色方案
  const colors = {
    primary: '1a73e8',    // 主色
    secondary: '34a853',  // 辅助色
    accent: 'fbbc04',     // 强调色
    dark: '202124',       // 深色
    light: 'f8f9fa',      // 浅色
    white: 'ffffff',      // 白色
  };
  
  // 封面页（优化设计）
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: colors.primary };
  
  // 添加装饰线
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: '10%', y: '25%', w: '80%', h: '2%',
    fill: { color: colors.accent },
  });
  
  coverSlide.addText(config.title, {
    x: '10%', y: '30%', w: '80%', h: '20%',
    fontSize: 36, color: colors.white, bold: true, align: 'center',
  });
  
  if (config.subtitle) {
    coverSlide.addText(config.subtitle, {
      x: '10%', y: '50%', w: '80%', h: '10%',
      fontSize: 18, color: colors.white, align: 'center',
    });
  }
  
  coverSlide.addText(new Date().toLocaleDateString('zh-CN'), {
    x: '10%', y: '70%', w: '80%', h: '10%',
    fontSize: 14, color: colors.white, align: 'center',
  });
  
  // 目录页
  const tocSlide = pptx.addSlide();
  tocSlide.background = { color: colors.light };
  tocSlide.addText('目录', {
    x: '10%', y: '10%', w: '80%', h: '15%',
    fontSize: 28, color: colors.primary, bold: true,
  });
  
  config.slides.forEach((slide, index) => {
    tocSlide.addText(`${index + 1}. ${slide.title}`, {
      x: '15%', y: `${30 + index * 8}%`, w: '70%', h: '8%',
      fontSize: 16, color: colors.dark,
    });
  });
  
  // 内容页（优化设计）
  config.slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: colors.white };
    
    // 标题栏
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: '15%',
      fill: { color: colors.primary },
    });
    
    slide.addText(slideData.title, {
      x: '5%', y: '3%', w: '90%', h: '10%',
      fontSize: 24, color: colors.white, bold: true,
    });
    
    // 内容
    const contentText = slideData.content.map(item => `• ${item}`).join('\n');
    slide.addText(contentText, {
      x: '5%', y: '20%', w: '90%', h: '65%',
      fontSize: 14, color: colors.dark, lineSpacingMultiple: 1.5,
    });
    
    // 页码
    slide.addText(`${index + 2}`, {
      x: '90%', y: '90%', w: '10%', h: '10%',
      fontSize: 12, color: colors.primary, align: 'center',
    });
    
    // 备注
    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }
  });
  
  // 结束页
  const endSlide = pptx.addSlide();
  endSlide.background = { color: colors.primary };
  endSlide.addText('谢谢观看', {
    x: '10%', y: '40%', w: '80%', h: '20%',
    fontSize: 36, color: colors.white, bold: true, align: 'center',
  });
  endSlide.addText('由职场AI提效工具生成', {
    x: '10%', y: '60%', w: '80%', h: '10%',
    fontSize: 14, color: colors.white, align: 'center',
  });
  
  // 生成Buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer as Buffer;
}

// 从AI生成的内容中提取PPT结构
export function parseAIContentToPPT(title: string, aiContent: string): PPTConfig {
  const lines = aiContent.split('\n').filter(line => line.trim());
  const slides: PPTSlide[] = [];
  let currentSlide: PPTSlide | null = null;
  
  for (const line of lines) {
    // 检测标题（## 开头）
    if (line.startsWith('## ')) {
      if (currentSlide) {
        slides.push(currentSlide);
      }
      currentSlide = {
        title: line.replace('## ', '').trim(),
        content: [],
      };
    } else if (currentSlide && line.startsWith('• ')) {
      currentSlide.content.push(line.replace('• ', '').trim());
    } else if (currentSlide && line.startsWith('- ')) {
      currentSlide.content.push(line.replace('- ', '').trim());
    } else if (currentSlide && line.trim()) {
      // 普通文本也添加到内容
      if (!line.startsWith('【') && !line.startsWith('---')) {
        currentSlide.content.push(line.trim());
      }
    }
  }
  
  // 添加最后一个slide
  if (currentSlide) {
    slides.push(currentSlide);
  }
  
  // 如果没有检测到slides，创建默认结构
  if (slides.length === 0) {
    slides.push({
      title: '核心内容',
      content: lines.slice(0, 5),
    });
  }
  
  return {
    title,
    subtitle: 'AI自动生成',
    slides: slides.slice(0, 10), // 最多10页
  };
}
