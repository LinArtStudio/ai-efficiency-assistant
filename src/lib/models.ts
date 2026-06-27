// 模型配置
export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  baseURL: string;
  model: string;
  description: string;
}

// 支持的模型列表
export const SUPPORTED_MODELS: ModelConfig[] = [
  {
    id: 'zhipu',
    name: '智谱GLM-4',
    provider: 'zhipu',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    description: '智谱AI旗舰模型，永久免费，中文能力强'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    description: 'DeepSeek旗舰模型，性价比高'
  },
  {
    id: 'mimo',
    name: '小米MiMo',
    provider: 'mimo',
    baseURL: 'https://api.xiaomimimo.com/v1',
    model: 'MiMo-V2.5-Pro',
    description: '小米自研模型，免费额度'
  },
  {
    id: 'baidu',
    name: '百度ERNIE',
    provider: 'baidu',
    baseURL: 'https://qianfan.baidubce.com/v2',
    model: 'ERNIE-3.5-8K',
    description: '百度千帆，永久免费不限量'
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    provider: 'siliconflow',
    baseURL: 'https://api.siliconflow.cn/v1',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    description: '硅基流动，多模型聚合，新用户2000万Token'
  },
  {
    id: 'tencent',
    name: '腾讯混元',
    provider: 'tencent',
    baseURL: 'https://hunyuan.tencentcloudapi.com',
    model: 'hunyuan-lite',
    description: '腾讯云混元，永久免费'
  }
];

// 获取默认模型
export function getDefaultModel(): ModelConfig {
  return SUPPORTED_MODELS[0]; // 默认使用智谱
}

// 根据ID获取模型
export function getModelById(id: string): ModelConfig | undefined {
  return SUPPORTED_MODELS.find(m => m.id === id);
}

// 从localStorage获取用户选择的模型
export function getSelectedModel(): ModelConfig {
  if (typeof window === 'undefined') {
    return getDefaultModel();
  }
  
  try {
    const saved = localStorage.getItem('selected-model');
    if (saved) {
      const model = getModelById(saved);
      if (model) return model;
    }
  } catch {}
  
  return getDefaultModel();
}

// 保存用户选择的模型到localStorage
export function saveSelectedModel(modelId: string): void {
  try {
    localStorage.setItem('selected-model', modelId);
  } catch {}
}
