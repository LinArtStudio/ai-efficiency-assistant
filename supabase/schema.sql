-- AI效率工具箱数据库Schema
-- 在Supabase SQL编辑器中运行此脚本

-- 1. 用户表（Supabase Auth自动创建，这里添加额外字段）
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 使用记录表
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'meeting', 'email', 'polish', 'translate')),
  content_length INTEGER NOT NULL,
  template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON public.usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_records_type ON public.usage_records(type);

-- 4. 启用RLS（Row Level Security）
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- 5. 创建RLS策略
-- 用户只能查看自己的profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 用户只能更新自己的profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 用户只能查看自己的使用记录
CREATE POLICY "Users can view own usage" ON public.usage_records
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的使用记录
CREATE POLICY "Users can insert own usage" ON public.usage_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. 创建函数：自动创建用户profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建触发器：新用户注册时自动创建profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. 创建函数：获取用户今日使用次数
CREATE OR REPLACE FUNCTION public.get_today_usage(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.usage_records
    WHERE user_id = user_uuid
    AND created_at >= CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 创建函数：检查用户是否为Pro
CREATE OR REPLACE FUNCTION public.is_user_pro(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = user_uuid
    AND plan = 'pro'
    AND (plan_expires_at IS NULL OR plan_expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
